/**
 * @file src/pages/createServiceSteps/Step2_HardwareStagesForm.tsx
 * @description Implements the hardware impact assessment form (Step 2) for the "Create/Edit" wizard.
 * This component is conditionally rendered based on the user's choice in Step 1. It dynamically
 * generates input fields for each hardware-related life cycle stage by mapping over a predefined
 * set of keys and utilizing a reusable `LifecycleStageInput` component for each one.
 * @author Marwin Ahnfeldt
 */

import { useCreateServiceContext } from '@/pages/CreateServicePage'; 
import { LifecycleStageInput } from '@/components/form/LifecycleStageInput'; 
import type { LifecycleStageKey, ImpactConfig } from '@/types/aiService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * An  array containing only the life´cycle stage keys relevant to hardware.
 * This ensures the component is self-contained and only renders form fields for the
 * hardware portion of the AI service life cycle.
 */
const hardwareStageKeys: LifecycleStageKey[] = [
  'materialExtraction',
  'hardwareManufacturing',
  'hardwareTransport',
  'AISystemInstallation',
];


/**
 * The `Step2_HardwareStagesForm` component renders a form for defining the impact
 * of each hardware-related lifecycle stage.
 *
 * It acts as a container that iterates over the `hardwareStageKeys` and delegates
 * the rendering of each individual stage's form to the `LifecycleStageInput` component.
 *
 * @returns {JSX.Element} A form for hardware lifecycle stages, or a fallback message if hardware
 * inclusion was not selected
 */
export function Step2_HardwareStagesForm() {
  const { state, dispatch } = useCreateServiceContext();

   // A robust fallback mechanism. The parent wizard's navigation logic should prevent this
  // component from being rendered if `includeHardware` is false. This view serves as a
  // defensive measure against unexpected state or direct navigation.
  if (!state.includeHardware) {
    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Hardware Lifecycle Stages</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Hardware impact consideration was set to "No". Skipping this step.</p>
                <p className="text-sm mt-2">You can go back to Step 1 to change this selection.</p>
            </CardContent>
        </Card>
    );
  }

  /**
   * A callback function passed down as a prop to each `LifecycleStageInput` component.
   * When the configuration for a single stage is changed in the child component, this
   * function is invoked to dispatch the `UPDATE_CYCLE_STAGE` action to the central reducer.
   * @param {LifecycleStageKey} stageKey - The identifier of the stage that was updated
   * @param {ImpactConfig} newConfig - The new impact configuration object for that stage
   */
  const handleStageConfigChange = (stageKey: LifecycleStageKey, newConfig: ImpactConfig) => {
    dispatch({
      type: 'UPDATE_CYCLE_STAGE',
      payload: { stageKey, config: newConfig },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header section providing context and instructions to the user. */}
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Hardware Lifecycle Stages</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Define the carbon & energy impact for each hardware phase. Choose "None" to skip, "Approximation" for a manual CO₂ estimate, or "Dynamic" to pull live data via an API.
            </p>
        </div>
      {/* Grid container for displaying the lifecycle stage inputs. */}  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hardwareStageKeys.map((stageKey) => (
          <LifecycleStageInput
            key={stageKey}
            stageKey={stageKey}
            config={state.cycleStages[stageKey]}
            onConfigChange={(newConfig) => handleStageConfigChange(stageKey, newConfig)}
          />
        ))}
      </div>
    </div>
  );
}