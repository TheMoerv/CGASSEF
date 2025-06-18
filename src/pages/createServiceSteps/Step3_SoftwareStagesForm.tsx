/**
 * @file src/pages/createServiceSteps/Step3_SoftwareStagesForm.tsx
 * @description Implements the software impact assessment form (Step 3) for the "Create/Edit" wizard.
 * It dynamically generates input fields for each software-related life cycle stage.
 * @author Marwin Ahnfeldt
 */


import { useCreateServiceContext } from '@/pages/CreateServicePage'; 
import { LifecycleStageInput } from '@/components/form/LifecycleStageInput'; 
import type { LifecycleStageKey, ImpactConfig } from '@/types/aiService';


/**
 * An array containing only the lifecycle stage keys relevant to software.
 * This ensures the component is focused exclusively on the software portion of the
 * AI service lifecycle, promoting a clear separation of concerns.
 */
const softwareStageKeys: LifecycleStageKey[] = [
  'businessUseCaseGeneration',
  'dataHandling',
  'modelArchitectureExploration',
  'modelTraining',
  'modelOperation',
  'modelEndOfLife',
];


/**
 * The `Step3_SoftwareStagesForm` component renders a form for defining the impact
 * of each software-related lifecycle stage.
 *
 * It acts as a container that iterates over the `softwareStageKeys` and delegates
 * the rendering and logic for each individual stage's form to the reusable
 * `LifecycleStageInput` component. This component is always rendered as the software
 * lifecycle is a mandatory part of the assessment.
 *
 * @returns {JSX.Element} A form for software lifecycle stages
 */
export function Step3_SoftwareStagesForm() {
  const { state, dispatch } = useCreateServiceContext();

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
        <h2 className="text-2xl font-semibold">Software Lifecycle Stages</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Define the carbon & energy impact for each key software phase.
          Choose "None" to skip, "Approximation" for a manual CO₂ estimate, or "Dynamic" to pull live data via an API.
        </p>
      </div>
      {/* Grid container for displaying the lifecycle stage inputs. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {softwareStageKeys.map((stageKey) => (
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