/**
 * @file src/types/aiService.ts
 * @description Defines the core data structures and types for the CGASSEF application.
 * This file serves as the single source of truth for the shape of an AI service's impact data. 
 * The structures defined herein are the TypeScript representation of the `CGASSEF.schema.json` scheme.
 * @author Marwin Ahnfeldt
 */

/**
 * Defines the possible methods for calculating the environmental impact for a single lifecycle stage:
 * - 'none': The impact is not specified or is considered zero
 * - 'approximation': A manually entered, estimated CO2 value
 * - 'dynamic': A placeholder for future integration with a live data API
 */
export type ImpactMode = 'none' | 'approximation' | 'dynamic';


// Represents the configuration for a stage with no specified impact
export interface NoneConfig {
  impactCalculationMode: 'none';
}

/**
 * Represents the configuration for a stage where impact is provided as a manual approximation
 * @property {number} co2EqInKg - The estimated CO2 equivalent emissions in kilograms
 */
export interface ApproximationConfig {
  impactCalculationMode: 'approximation';
  co2EqInKg: number;
}

/**
 * Represents the configuration for a stage where impact would be fetched from an external API.
 * @property {string} httpApiUrl - The URL of the external API endpoint
 * @property {string} token - The authentication token for the API, if required
 */
export interface DynamicConfig {
  impactCalculationMode: 'dynamic';
  httpApiUrl: string;
  token: string;
}

/**
 * Type representing the impact configuration for a single lifecycle stage.
 * The `impactCalculationMode` property acts as the discriminant, ensuring type safety when accessing other properties.
 */
export type ImpactConfig = NoneConfig | ApproximationConfig | DynamicConfig;

/**
 * A constant array of all lifecycle stage keys. This establishes the "holistic life cycle logic" that the prototype 
 * and data structure is built upon. It includes both hardware and software stages.
 */
export const lifecycleStageKeys = [
  // Chosen software life cycle stages
  'businessUseCaseGeneration',
  'dataHandling',
  'modelArchitectureExploration',
  'modelTraining',
  'modelOperation',
  'modelEndOfLife',
  // Chose AI system hardware life cycle stages
  'materialExtraction',
  'hardwareManufacturing',
  'hardwareTransport',
  'AISystemInstallation',
] as const; // 'as const' makes it a tuple of string literals for stronger typing

/**
 * A type representing one of the valid lifecycle stage keys
 */
export type LifecycleStageKey = typeof lifecycleStageKeys[number];

/**
 * Defines the structure for the 'cycleStages' object. It uses a 'Record' type to enforce that an object of this type MUST contain
 * an 'ImpactConfig'for EVERY key defined in 'lifecycleStageKeys'. This is a critical feature for ensuring the completeness of the  life cycle assessment data.
 */
export type CycleStages = Record<LifecycleStageKey, ImpactConfig>;

/**
 * The top-level interface for a single AI service's lifecycle impact data. This structure corresponds directly to the format of the JSON files that users
 * upload and download within the application. It contains essential metadata and the detailed breakdown of impacts across all life cycle stages.
 *
 * @property {string} $schema - Optional link to the JSON schema for validation
 * @property {string} serviceId - A unique identifier for the AI service
 * @property {string} name - A human-readable name for the AI service or scenario
 * @property {string} description - A textual description of the service
 * @property {CycleStages} cycleStages - The object containing impact data for all life cycle phases
 */
export interface AIServiceLifecycleImpact {
  $schema: string; 
  serviceId: string;
  name: string;
  description: string;
  cycleStages: CycleStages;
}

// --- Helper Functions ---

/**
 * A utility function to create a default 'ImpactConfig' object based on a given mode. Useful for initializing form state or 
 * creating new lifecycle stage entries.
 * @param {ImpactMode} [mode='none'] - The desired impact mode for the new config
 * @returns {ImpactConfig} A new, default ImpactConfig object
 */
export const createDefaultImpactConfig = (mode: ImpactMode = 'none'): ImpactConfig => {
  if (mode === 'approximation') {
    return { impactCalculationMode: 'approximation', co2EqInKg: 0 };
  }
  if (mode === 'dynamic') {
    return { impactCalculationMode: 'dynamic', httpApiUrl: '', token: '' };
  }
  return { impactCalculationMode: 'none' };
};

/**
 * A utility function to create a complete 'CycleStages' object with all stages initialized to a default state (typically 'none'). 
 * This is essential for the "Create New Service" workflow, ensuring the data object conforms to the required structure from the start.
 * @returns {CycleStages} A complete CycleStages object with default values
 */
export const createDefaultCycleStages = (): CycleStages => {
  const stages = {} as CycleStages; 
  for (const key of lifecycleStageKeys) {
    stages[key] = createDefaultImpactConfig('none'); 
  }
  return stages;
};