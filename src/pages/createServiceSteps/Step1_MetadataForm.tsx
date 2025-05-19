// src/pages/createServiceSteps/Step1_MetadataForm.tsx
import React from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage'; // Adjust path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function Step1_MetadataForm() {
  const { state, dispatch } = useCreateServiceContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch({
      type: 'UPDATE_METADATA',
      payload: { [e.target.name]: e.target.value },
    });
  };

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
          {state.includeHardware === null && (
            <p className="text-sm text-muted-foreground">Please make a selection.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}