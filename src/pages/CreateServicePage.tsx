import React, { createContext, useContext, useReducer} from 'react';
import type { ReactNode } from 'react';
import type { AIServiceLifecycleImpact, ImpactConfig, LifecycleStageKey } from '@/types/aiService';
import { createDefaultCycleStages} from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Step0_LoadOrNew } from './createServiceSteps/step0_LoadOrNew';
import { Step1_MetadataForm } from './createServiceSteps/Step1_MetadataForm';
import { Step2_HardwareStagesForm } from './createServiceSteps/Step2_HardwareStagesForm';
import { Step3_SoftwareStagesForm } from './createServiceSteps/Step3_SoftwareStagesForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Step4_ExportView } from './createServiceSteps/Step4_ExportView';
// Import step components once you create them
// import { Step0_LoadOrNew } from './steps/Step0_LoadOrNew';
// import { Step1_MetadataForm } from './steps/Step1_MetadataForm';
// ...

// The rest of your file remains the same:

type State = {
  currentStep: number;
  serviceId: string;
  name: string;
  description: string;
  includeHardware: boolean | null;
  cycleStages: AIServiceLifecycleImpact['cycleStages']; // This usage is fine
  isEditing: boolean;
  defaultFilename: string;
};

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'LOAD_CONFIG'; payload: AIServiceLifecycleImpact } // This usage is fine
  | { type: 'UPDATE_METADATA'; payload: { serviceId?: string; name?: string; description?: string } }
  | { type: 'SET_INCLUDE_HARDWARE'; payload: boolean }
  | { type: 'UPDATE_CYCLE_STAGE'; payload: { stageKey: LifecycleStageKey; config: ImpactConfig } } // Fine
  | { type: 'RESET_FORM' }
  | { type: 'SET_DEFAULT_FILENAME'; payload: string };


const initialState: State = {
  currentStep: 0,
  serviceId: '',
  name: '',
  description: '',
  includeHardware: null,
  cycleStages: createDefaultCycleStages(), // createDefaultCycleStages is a value, imported normally
  isEditing: false,
  defaultFilename: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'LOAD_CONFIG':
      return {
        ...state,
        serviceId: action.payload.serviceId,
        name: action.payload.name,
        description: action.payload.description,
        cycleStages: action.payload.cycleStages,
        includeHardware: Object.keys(action.payload.cycleStages).some(key =>
          ['materialExtraction', 'hardwareManufacturing', 'hardwareTransport', 'AISystemInstallation'].includes(key) &&
          action.payload.cycleStages[key as LifecycleStageKey]?.impactCalculationMode !== 'none'
        ),
        isEditing: true,
        currentStep: 1,
      };
    case 'UPDATE_METADATA':
      return { ...state, ...action.payload };
    case 'SET_INCLUDE_HARDWARE':
      return { ...state, includeHardware: action.payload };
    case 'UPDATE_CYCLE_STAGE':
      return {
        ...state,
        cycleStages: {
          ...state.cycleStages,
          [action.payload.stageKey]: action.payload.config,
        },
      };
    case 'RESET_FORM':
        return {...initialState, cycleStages: createDefaultCycleStages()};
    case 'SET_DEFAULT_FILENAME':
        return { ...state, defaultFilename: action.payload };
    default:
      // It's good practice to explicitly return state or throw an error for unhandled actions
      // if your action type is a discriminated union and all cases should be handled.
      // However, for this reducer, simply returning state is fine.
      return state;
  }
}

const CreateServiceContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const useCreateServiceContext = () => {
  const context = useContext(CreateServiceContext);
  if (!context) {
    throw new Error('useCreateServiceContext must be used within a CreateServiceProvider');
  }
  return context;
};

interface CreateServiceProviderProps {
  children: ReactNode; // ReactNode is used as a type here
}

export const CreateServiceProvider: React.FC<CreateServiceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <CreateServiceContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateServiceContext.Provider>
  );
};


export function CreateServicePage() {
  return (
    <CreateServiceProvider>
      <CreateServiceWizard />
    </CreateServiceProvider>
  );
}

function CreateServiceWizard() {
    const { state, dispatch } = useCreateServiceContext();

    const nextStep = () => {
        // Skip step 2 if includeHardware is false and we are currently on step 1
        if (state.currentStep === 1 && !state.includeHardware) {
            dispatch({ type: 'SET_STEP', payload: 3 }); // Skip to Software Stages
        } else {
            dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
        }
    };

    const prevStep = () => {
        // Skip step 2 if includeHardware is false and we are currently on step 3
        if (state.currentStep === 3 && !state.includeHardware) {
            dispatch({ type: 'SET_STEP', payload: 1 }); // Go back to Metadata
        } else {
            dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
        }
    };

    return (
        <div className="container mx-auto py-8"> {/* Added some basic container styling */}
            <h1 className="text-3xl font-bold mb-8 text-center"> {/* Centered title */}
                Create/Edit AI Service Configuration
            </h1>

            {/* Render Step 0: Load or New */}
            {state.currentStep === 0 && (
                <div className="flex justify-center"> {/* Centering the card */}
                    <Step0_LoadOrNew />
                </div>
            )}

            {/* Placeholder for Step 1: Metadata (will be a new component) */}
            {state.currentStep === 1 && (
                <div>                
                    <Step1_MetadataForm />
                </div>
            )}

            {/* Placeholder for Step 2: Hardware Stages (will be a new component) */}
            {state.currentStep === 2 && (
                 <div>
                    <Step2_HardwareStagesForm />
                  </div>
            )}       
            {state.currentStep === 2 && !state.includeHardware && (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>Hardware Lifecycle Stages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Hardware impact consideration was set to "No". This step is skipped.</p>
                        <p className="text-sm mt-2">Click "Next" to proceed to Software Stages, or "Back" to change the hardware selection.</p>
                    </CardContent>
                </Card>
            )}

            {/* Placeholder for Step 3: Software Stages (will be a new component) */}
            {state.currentStep === 3 && (
                  <Step3_SoftwareStagesForm /> 
            )}

            {/* Placeholder for Step 4: Export (will be a new component) */}
            {state.currentStep === 4 && (
                 <div>
                    <Step4_ExportView />
                 </div>
            )}

            {/* Navigation Buttons - Only show if not on Step 0 */}
            {state.currentStep > 0 && (
                <div className="mt-10 flex justify-between max-w-3xl mx-auto"> {/* Centered buttons */}
                    {state.currentStep > 1 && state.currentStep <= 4 && ( // "Back" from Step 2 onwards
                        <Button variant="outline" size="lg" onClick={prevStep}>
                            Back
                        </Button>
                    )}
                    {/* Spacer if only one button is visible to keep it on one side */}
                    {state.currentStep === 1 && <div />}


                    {state.currentStep < 3 && state.currentStep > 0 && ( // "Next" for steps 1, 2
                        <Button size="lg" onClick={nextStep}>
                            Next
                        </Button>
                    )}
                    {state.currentStep === 3 && ( // "Next: Export" for step 3
                        <Button
                            size="lg"
                            onClick={() => {
                                const now = new Date();
                                const filename = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}_ai_config`;
                                dispatch({ type: 'SET_DEFAULT_FILENAME', payload: filename });
                                dispatch({ type: 'SET_STEP', payload: 4 });
                            }}
                        >
                            Next: Export
                        </Button>
                    )}
                    {/* No "Next" button on Step 4 (Export View) unless you add a "Finish" or "New" button there */}
                </div>
            )}
        </div>
    );
}