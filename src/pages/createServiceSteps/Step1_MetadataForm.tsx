/**
 * @file src/pages/createServiceSteps/Step1_MetadataForm.tsx
 * @description Implements the metadata collection form (Step 1) for the "Create/Edit" wizard. This component is responsible 
 * for gathering the fundamental identifying information of an AI service, such as its ID, name, and description. It also contains the critical
 * decision point for whether to include hardware-related lifecycle stages in the assessment,which controls the subsequent flow of the wizard.
 * @author Marwin Ahnfeldt
 */

import React from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


/**
 * The `Step1_MetadataForm` component renders a form for general service properties. It is a fully controlled component: its input values are derived directly from the
 * central state via `useCreateServiceContext`, and all user changes are dispatched back to the central reducer to update the state.
 *
 * @returns {JSX.Element} A card containing the metadata input form
 */
export function Step1_MetadataForm() {
  const { state, dispatch } = useCreateServiceContext();

  /**
   * A generic change handler for all text-based inputs (`Input`, `Textarea`).
   * It uses the input's `name` attribute to dynamically update the corresponding key in the state,
   * making the code reusable for multiple fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { [e.target.name]: e.target.value },
    });
  };

  /**
   * Handles changes in the radio group for hardware impact inclusion.
   * This function dispatches the `SET_INCLUDE_HARDWARE` action, which is crucial for
   * the wizard's conditional navigation logic (i.e., skipping Step 2 if 'no' is selected).
   * @param {string} value - The selected value from the RadioGroup ('yes' or 'no')
   */
  const handleHardwareChoiceChange = (value: string) => {
    dispatch({
      type: 'SET_INCLUDE_HARDWARE',
      payload: value === 'yes',
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>General Properties of AI Service</CardTitle>
        <CardDescription>
          Define the general properties of the AI service, such as its name and functional description.
          You can also specify if CO2 effects of the AI system's hardware should be considered.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section for core service metadata */}
        <div className="space-y-2">
          <Label htmlFor="serviceId">Service ID</Label>
          <Input
            id="serviceId"
            name="serviceId"
            value={state.serviceId}
            onChange={handleInputChange}
            placeholder="e.g., fraud-detection-v2"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={state.name}
            onChange={handleInputChange}
            placeholder="e.g., Customer Fraud Detection Service"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={state.description}
            onChange={handleInputChange}
            placeholder="Describe the function and purpose of this AI service..."
            className="min-h-[100px]"
          />
        </div>
         {/* Section for determining hardware lifecycle inclusion */}
        <div className="space-y-3">
          <Label>Are you currently building and installing hardware for your AI system, or should its impact be considered?</Label>
          <RadioGroup
            value={state.includeHardware === null ? '' : (state.includeHardware ? 'yes' : 'no')}
            onValueChange={handleHardwareChoiceChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="hw-yes" />
              <Label htmlFor="hw-yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="hw-no" />
              <Label htmlFor="hw-no">No</Label>
            </div>
          </RadioGroup>
          {/* Provides a helpful prompt to the user if they haven't made a selection yet. */}
          {state.includeHardware === null && (
            <p className="text-sm text-muted-foreground">Please make a selection.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}