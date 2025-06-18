/**
 * @file src/components/form/LifecycleStageInput.tsx
 * @description Defines a reusable and self-contained form component for configuring the environmental impact of a single lifecycle stage. 
 * This component is the primary building block for both the hardware and software impact assessment forms (Step 2 and Step 3).
 * It encapsulates all the UI and logic for switching between impact modes ('none', 'approximation', 'dynamic') and capturing the relevant data 
 * for each mode.
 * @author Marwin Ahnfeldt
 */

import React from 'react';
import type { ImpactConfig, ImpactMode, LifecycleStageKey, ApproximationConfig, DynamicConfig } from '@/types/aiService';
import { STAGE_LABELS, getStageDescription } from '@/constants/lifecycleStages'; // Adjust path

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Defines the properties for the LifecycleStageInput component.
 *
 * @property {LifecycleStageKey} stageKey - The unique identifier for the lifecycle stage this component represents
 * @property {ImpactConfig} config - The current impact configuration object for this stage, received from the parent
 * @property {(newConfig: ImpactConfig) => void} onConfigChange - A callback function to notify the parent component of any changes to the configuration
 */
interface LifecycleStageInputProps {
  stageKey: LifecycleStageKey;
  config: ImpactConfig;
  onConfigChange: (newConfig: ImpactConfig) => void;
}

/**
 * The `LifecycleStageInput` component is a controlled component responsible for
 * a single lifecycle stage's impact configuration.
 *
 * It receives its state (`config`) via props and communicates changes back to its
 * parent component via the `onConfigChange` callback. This makes it highly reusable
 * and decoupled from the application's global state management.
 *
 * @param {LifecycleStageInputProps} props - The components properties
 * @returns {JSX.Element} A card-based form for a single lifecycle stage
 */
export function LifecycleStageInput({ stageKey, config, onConfigChange }: LifecycleStageInputProps) {
  // Retrieve the human-readable label and description from the centralized constants
  const label = STAGE_LABELS[stageKey] || stageKey;
  const description = getStageDescription(stageKey);

  /**
   * Handles changes to the impact calculation mode `Select` dropdown.
   * When a new mode is selected, it constructs a new `ImpactConfig` object of the
   * correct shape, preserving existing values where applicable, and calls `onConfigChange`.
   * @param {ImpactMode} newMode - The newly selected impact mode
   */
  const handleModeChange = (newMode: ImpactMode) => {
    if (newMode === 'none') {
      onConfigChange({ impactCalculationMode: 'none' });
    } else if (newMode === 'approximation') {
      // Preserve existing value if switching back and forth
      onConfigChange({
        impactCalculationMode: 'approximation',
        co2EqInKg: (config as ApproximationConfig)?.co2EqInKg || 0,
      });
    } else if (newMode === 'dynamic') {
      // Preserve existing values if switching back and forth
      onConfigChange({
        impactCalculationMode: 'dynamic',
        httpApiUrl: (config as DynamicConfig)?.httpApiUrl || '',
        token: (config as DynamicConfig)?.token || '',
      });
    }
  };

  /**
   * Handles changes to the CO₂ approximation input field.
   * This is only active when `impactCalculationMode` is 'approximation'.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleApproximationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      impactCalculationMode: 'approximation',
      co2EqInKg: parseFloat(e.target.value) || 0,
    });
  };

  /**
   * A generic handler for the 'dynamic' mode input fields (URL and token).
   * It preserves the existing dynamic configuration and updates only the field that changed,
   * identified by its `name` attribute.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event
   */
  const handleDynamicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      ...(config as DynamicConfig), // Keep existing dynamic fields
      impactCalculationMode: 'dynamic',
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main selector to switch between impact calculation modes */}
        <div>
          <Label htmlFor={`${stageKey}_mode`}>Impact Calculation Mode</Label>
          <Select
            value={config.impactCalculationMode}
            onValueChange={(value) => handleModeChange(value as ImpactMode)}
          >
            <SelectTrigger id={`${stageKey}_mode`}>
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Skip)</SelectItem>
              <SelectItem value="approximation">Approximation (Manual CO₂)</SelectItem>
              <SelectItem value="dynamic">Dynamic (API)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* --- Conditional Fields based on selected mode --- */}

        {/* Fields for 'approximation' mode */}
        {config.impactCalculationMode === 'approximation' && (
          <div className="space-y-2">
            <Label htmlFor={`${stageKey}_co2`}>CO₂ Equivalent (kg)</Label>
            <Input
              id={`${stageKey}_co2`}
              name="co2EqInKg"
              type="number"
              value={(config as ApproximationConfig).co2EqInKg}
              onChange={handleApproximationChange}
              min="0"
              step="any"
            />
          </div>
        )}

        {/* Fields for 'dynamic' mode */}
        {config.impactCalculationMode === 'dynamic' && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`${stageKey}_httpApiUrl`}>HTTP API URL</Label>
              <Input
                id={`${stageKey}_httpApiUrl`}
                name="httpApiUrl"
                type="url"
                value={(config as DynamicConfig).httpApiUrl}
                onChange={handleDynamicChange}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${stageKey}_token`}>Token (Optional)</Label>
              <Input
                id={`${stageKey}_token`}
                name="token"
                type="text" 
                value={(config as DynamicConfig).token}
                onChange={handleDynamicChange}
                placeholder="API access token"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}