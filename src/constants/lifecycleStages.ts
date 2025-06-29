/**
 * @file src/constants/lifecycleStages.ts
 * @description This file provides human-readable labels and detailed descriptions for each stage defined
 * in 'src/types/aiService.ts'. This separation of concerns ensures that UI components remain clean and that text 
 * can be easily updated or localized in one place.
 * @author Marwin Ahnfeldt
 */

import type { LifecycleStageKey } from '@/types/aiService'; // Ensure path is correct


/**
* A mapping from 'LifecycleStageKey' identifiers to human-readable string labels.
* This record is used throughout the UI for displaying stage names in forms, charts, and tables,
* ensuring consistency across the application.
*/
export const STAGE_LABELS: Record<LifecycleStageKey, string> = {
  businessUseCaseGeneration: "Business Use Case Generation",
  dataHandling: "Data Handling",
  modelArchitectureExploration: "Model Architecture Exploration",
  modelTraining: "Model Training",
  modelOperation: "Model Operation (Inference)", // Matched your mapping.txt
  modelEndOfLife: "Model End-of-Life",
  materialExtraction: "Material Extraction",
  hardwareManufacturing: "Hardware Manufacturing",
  hardwareTransport: "Hardware Transport",
  AISystemInstallation: "AI System Installation",
};

/**
 * Provides detailed descriptions for each software-related lifecycle stage. These descriptions are displayed 
 * in the UI to help users understand what each stage contains and what kind of impacts to consider. 
 * The use of 'Partial<Record<...>>' makes this structure flexible if not all stages have a description.
 */
export const SOFTWARE_STAGE_DESCRIPTIONS: Partial<Record<LifecycleStageKey, string>> = {
    businessUseCaseGeneration: "CO₂ emissions from activties of clariying / detailing business requirements for promising AI services (e.g. Total emitted CO2 for video-conferencing meetings) ",
    dataHandling: "Emissions from data ingestion, cleaning, transformation, and storage operations.",
    modelArchitectureExploration: "CO₂ impact from running multiple experiments (pre-training run)s to compare and validate model architectures.",
    modelTraining: "Emissions due to GPU/CPU usage during full-scale training and periodic retraining.",
    modelOperation: "Associated emitted CO₂ from both idle and inference workloads during deployment, use and monitoring of an AI service.", // Note 'modelOperation' vs 'modelOperation (Inference)'
    modelEndOfLife: "Emissions from archiving, and decommissioning model infrastructure and resources."
};

/**
 * Provides detailed descriptions for each hardware-related lifecycle stage. Similar to the software descriptions, 
 * these are used to guide the user during the data entry process in the "Create/Edit" workflow.
 */
export const HARDWARE_STAGE_DESCRIPTIONS: Partial<Record<LifecycleStageKey, string>> = {
    materialExtraction: "CO₂ emissions from mining and refining ores into metals for AI hardware components.",
    hardwareManufacturing: "Impact of fabricating servers, chips, racks, and cooling infrastructure from raw or pre-processed materials.",
    hardwareTransport: "Emissions generated by shipping hardware and parts from factories to data centers or edge sites.",
    AISystemInstallation: "Energy and CO₂ from rack assembly, cabling, and initial power-up during hardware installation."
};


/**
 * A utility function to retrieve the description for a given lifecycle stage key.
 *
 * @param {LifecycleStageKey} stageKey - The identifier of the stage for which to find a description
 * @returns {string | undefined} The corresponding description string, or undefined if none exists
 */
export const getStageDescription = (stageKey: LifecycleStageKey): string | undefined => {
  return SOFTWARE_STAGE_DESCRIPTIONS[stageKey] || HARDWARE_STAGE_DESCRIPTIONS[stageKey];
};