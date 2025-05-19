// src/components/form/LifecycleStageInput.tsx
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

interface LifecycleStageInputProps {
  stageKey: LifecycleStageKey;
  config: ImpactConfig;
  onConfigChange: (newConfig: ImpactConfig) => void;
}

export function LifecycleStageInput({ stageKey, config, onConfigChange }: LifecycleStageInputProps) {
  const label = STAGE_LABELS[stageKey] || stageKey;
  const description = getStageDescription(stageKey);

  const handleModeChange = (newMode: ImpactMode) => {
    if (newMode === 'none') {
      onConfigChange({ impactCalculationMode: 'none' });
    } else if (newMode === 'approximation') {
      onConfigChange({
        impactCalculationMode: 'approximation',
        co2EqInKg: (config as ApproximationConfig)?.co2EqInKg || 0,
      });
    } else if (newMode === 'dynamic') {
      onConfigChange({
        impactCalculationMode: 'dynamic',
        httpApiUrl: (config as DynamicConfig)?.httpApiUrl || '',
        token: (config as DynamicConfig)?.token || '',
      });
    }
  };

  const handleApproximationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({
      impactCalculationMode: 'approximation',
      co2EqInKg: parseFloat(e.target.value) || 0,
    });
  };

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
                placeholder="https://api.example.com/co2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${stageKey}_token`}>Token (Optional)</Label>
              <Input
                id={`${stageKey}_token`}
                name="token"
                type="text" // Consider type="password" if it's sensitive and you want masking
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