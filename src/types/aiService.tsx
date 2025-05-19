// src/types/aiService.ts

export type ImpactMode = 'none' | 'approximation' | 'dynamic';

export interface NoneConfig {
  impactCalculationMode: 'none';
}

export interface ApproximationConfig {
  impactCalculationMode: 'approximation';
  co2EqInKg: number;
}

export interface DynamicConfig {
  impactCalculationMode: 'dynamic';
  httpApiUrl: string;
  token: string;
}

export type ImpactConfig = NoneConfig | ApproximationConfig | DynamicConfig;

// These keys should exactly match the keys used in your cgsaem.schema.json
// and your Python model (ai_service_model.py) for cycleStages.
export const lifecycleStageKeys = [
  'businessUseCaseGeneration',
  'dataHandling',
  'modelArchitectureExploration',
  'modelTraining',
  'modelOperation',
  'modelEndOfLife',
  'materialExtraction',
  'hardwareManufacturing',
  'hardwareTransport',
  'AISystemInstallation',
] as const; // 'as const' makes it a tuple of string literals for stronger typing

export type LifecycleStageKey = typeof lifecycleStageKeys[number];

// Ensures that CycleStages will have all keys defined in lifecycleStageKeys
export type CycleStages = Record<LifecycleStageKey, ImpactConfig>;

export interface AIServiceLifecycleImpact {
  $schema: string; // Or make optional if it's not always present in your data
  serviceId: string;
  name: string;
  description: string;
  cycleStages: CycleStages;
}

// Helper function to create a default ImpactConfig based on the mode
export const createDefaultImpactConfig = (mode: ImpactMode = 'none'): ImpactConfig => {
  if (mode === 'approximation') {
    return { impactCalculationMode: 'approximation', co2EqInKg: 0 };
  }
  if (mode === 'dynamic') {
    return { impactCalculationMode: 'dynamic', httpApiUrl: '', token: '' };
  }
  // Default to 'none'
  return { impactCalculationMode: 'none' };
};

// Helper function to create a default CycleStages object
// with all stages initialized (e.g., to 'none' mode)
export const createDefaultCycleStages = (): CycleStages => {
  const stages = {} as CycleStages; // Type assertion
  for (const key of lifecycleStageKeys) {
    stages[key] = createDefaultImpactConfig('none'); // Initialize all stages to 'none' by default
  }
  return stages;
};