// src/pages/createServiceSteps/Step3_SoftwareStagesForm.tsx
import { useCreateServiceContext } from '@/pages/CreateServicePage'; // Adjust path
import { LifecycleStageInput } from '@/components/form/LifecycleStageInput'; // Adjust path
import type { LifecycleStageKey, ImpactConfig } from '@/types/aiService';
// Removed Card imports as we're just creating a section, the main card might be in CreateServicePage or not used here.

const softwareStageKeys: LifecycleStageKey[] = [
  'businessUseCaseGeneration',
  'dataHandling',
  'modelArchitectureExploration',
  'modelTraining',
  'modelOperation',
  'modelEndOfLife',
];

export function Step3_SoftwareStagesForm() {
  const { state, dispatch } = useCreateServiceContext();

  const handleStageConfigChange = (stageKey: LifecycleStageKey, newConfig: ImpactConfig) => {
    dispatch({
      type: 'UPDATE_CYCLE_STAGE',
      payload: { stageKey, config: newConfig },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Software Lifecycle Stages</h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Define the carbon & energy impact for each key software phase.
          Choose "None" to skip, "Approximation" for a manual CO₂ estimate, or "Dynamic" to pull live data via an API.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {softwareStageKeys.map((stageKey) => (
          <LifecycleStageInput
            key={stageKey}
            stageKey={stageKey}
            config={state.cycleStages[stageKey]} // Ensure state.cycleStages has all keys initialized
            onConfigChange={(newConfig) => handleStageConfigChange(stageKey, newConfig)}
          />
        ))}
      </div>
    </div>
  );
}