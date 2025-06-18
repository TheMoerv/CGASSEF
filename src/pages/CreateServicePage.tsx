/**
 * @file src/pages/CreateServicePage.tsx
 * @description This file implements the "Create/Edit AI-Related Impacts" core function of the
 * CGASSEF prototype. It provides a multi-step navigation interface for users to either
 * create a new AI service impact configuration or load and modify an existing one.
 *
 * It utilizes a combination of 'useReducer' and 'useContext' for robust state management
 * across the entire multi-step form process, centralizing all business logic and state
 * transitions for creating or editing an 'AIServiceLifecycleImpact' object.
 * @author Marwin Ahnfeldt
 */

import React, { createContext, useContext, useReducer} from 'react';
import type { ReactNode } from 'react';
import type { AIServiceLifecycleImpact, ImpactConfig, LifecycleStageKey } from '@/types/aiService';
import { createDefaultCycleStages} from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Import the components for each step of the wizard
import { Step0_LoadOrNew } from './createServiceSteps/step0_LoadOrNew';
import { Step1_MetadataForm } from './createServiceSteps/Step1_MetadataForm';
import { Step2_HardwareStagesForm } from './createServiceSteps/Step2_HardwareStagesForm';
import { Step3_SoftwareStagesForm } from './createServiceSteps/Step3_SoftwareStagesForm';
import { Step4_ExportView } from './createServiceSteps/Step4_ExportView';

// --- STATE MANAGEMENT (Reducer & Context) ---


/**
 * Defines the shape of the state for the entire creation/editing navigation structure
 *
 * @property {number} currentStep - The index of the currently active step in the navigation structure
 * @property {string} serviceId - The unique ID of the AI service
 * @property {string} name - The human-readable name of the AI service
 * @property {string} description - A detailed description of the service
 * @property {boolean | null} includeHardware - User's choice to include hardware lifecycle stages. `null` before selection
 * @property {AIServiceLifecycleImpact['cycleStages']} cycleStages - The core object holding impact data for all stages
 * @property {boolean} isEditing - A flag to indicate if the user is editing an existing record
 * @property {string} defaultFilename - A generated filename for the export view
 */
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

// Defines all possible actions that can be dispatched to update the state.
type Action =
  | { type: 'SET_STEP'; payload: number } // Navigates to a specific step
  | { type: 'LOAD_CONFIG'; payload: AIServiceLifecycleImpact } // Fills the form input dialog with data from a loaded file
  | { type: 'UPDATE_METADATA'; payload: { serviceId?: string; name?: string; description?: string } } // Updates service metadata
  | { type: 'SET_INCLUDE_HARDWARE'; payload: boolean } // Sets the user's choice on including hardware stage
  | { type: 'UPDATE_CYCLE_STAGE'; payload: { stageKey: LifecycleStageKey; config: ImpactConfig } } // Updates impact data for a life cycle stage
  | { type: 'RESET_FORM' } // Resets form to initial state
  | { type: 'SET_DEFAULT_FILENAME'; payload: string }; // Sets the default filename for the export step

// Sets initial state of navigation dialog structure
const initialState: State = {
  currentStep: 0,
  serviceId: '',
  name: '',
  description: '',
  includeHardware: null,
  cycleStages: createDefaultCycleStages(), 
  isEditing: false,
  defaultFilename: '',
};

/**
 * The reducer function that handles all state transitions in the navigation structure.
 * It takes the current state and an action, and returns the new state.
 * @param {State} state - The current state
 * @param {Action} action - The action to be processed
 * @returns {State} The new state after applying the action
 */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    // When a config is loaded, fill in all fields, mark as editing, and move to Step 1
    case 'LOAD_CONFIG':
      return {
        ...state,
        serviceId: action.payload.serviceId,
        name: action.payload.name,
        description: action.payload.description,
        cycleStages: action.payload.cycleStages,
        // Determines if hardware stages were included in loaded file
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
    // Reset all fields but re-initialize cycleStages to avoid deprecated references.
    case 'RESET_FORM':
        return {...initialState, cycleStages: createDefaultCycleStages()};
    case 'SET_DEFAULT_FILENAME':
        return { ...state, defaultFilename: action.payload };
    default:
      return state;
  }
}

const CreateServiceContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

/**
 * A custom helper function to easily access the navigation step state and dispatch function from any child component.
 * Throws an error if used outside of a 'CreateServiceProvider', ensuring proper usage.
 * @returns The context value: { state, dispatch }
 */
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

/**
 * The provider component that wraps the navigation structure dialog UI. It initializes the 'useReducer' hook
 * and makes the state and dispatch function available via the 'CreateServiceContext'.
 */
export const CreateServiceProvider: React.FC<CreateServiceProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <CreateServiceContext.Provider value={{ state, dispatch }}>
      {children}
    </CreateServiceContext.Provider>
  );
};

// --- UI COMPONENTS ---

/**
 * The main page component for the Create/Edit feature for wrap the navigation dialog UI with the state provider.
 */
export function CreateServicePage() {
  return (
    <CreateServiceProvider>
      <CreateServiceWizard />
    </CreateServiceProvider>
  );
}

/**
 * Renders the navigation dialogs (wizard) UI, including the current step's component and the navigation buttons.
 * It consumes the context to access state and control navigation logic.
 */
function CreateServiceWizard() {
    const { state, dispatch } = useCreateServiceContext();
     // Advances to the next step, intelligently skipping the hardware step if not applicable.
    const nextStep = () => {
        // Skip step 2 if includeHardware is false and we are currently on step 1
        if (state.currentStep === 1 && !state.includeHardware) {
            dispatch({ type: 'SET_STEP', payload: 3 }); // Skip to Software Stages
        } else {
            dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
        }
    };
    // Moves to the previous step, also skipping the hardware step if needed.
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
                <div className="flex flex-col items-center space-y-6">
                    <p className="max-w-xl text-center text-muted-foreground">
                        Begin by loading an existing AI service configuration file (provided as .json file format) to modify its details,
                        or start fresh to define a new service and its environmental impact profile from scratch.
                    </p>
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
                            Next: Save Impact Data
                        </Button>
                    )}
                    {/* No "Next" button on Step 4 (Export View) unless you add a "Finish" or "New" button there */}
                </div>
            )}
        </div>
    );
}