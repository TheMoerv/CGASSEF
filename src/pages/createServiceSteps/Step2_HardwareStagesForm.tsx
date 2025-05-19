// src/pages/createServiceSteps/Step2_HardwareStagesForm.tsx
import { useCreateServiceContext } from '@/pages/CreateServicePage'; // Adjust path
import { LifecycleStageInput } from '@/components/form/LifecycleStageInput'; // Adjust path
import type { LifecycleStageKey, ImpactConfig } from '@/types/aiService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const hardwareStageKeys: LifecycleStageKey[] = [
  'materialExtraction',
  'hardwareManufacturing',
  'hardwareTransport',
  'AISystemInstallation',
];

export function Step2_HardwareStagesForm() {
  const { state, dispatch } = useCreateServiceContext();

  if (!state.includeHardware) {
    // This case should ideally be handled by the wizard logic not even showing this step,
    // but as a fallback or if directly navigated.
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

  const handleStageConfigChange = (stageKey: LifecycleStageKey, newConfig: ImpactConfig) => {
    dispatch({
      type: 'UPDATE_CYCLE_STAGE',
      payload: { stageKey, config: newConfig },
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Hardware Lifecycle Stages</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                Define the carbon & energy impact for each hardware phase. Choose "None" to skip, "Approximation" for a manual CO₂ estimate, or "Dynamic" to pull live data via an API.
            </p>
        </div>
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