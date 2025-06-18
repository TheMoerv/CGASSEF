/**
 * @file src/pages/createServiceSteps/Step0_LoadOrNew.tsx
 * @description Implements the initial step (Step 0) of the "Create/Edit" wizard.
 * This component presents the user with the fundamental choice to either load an existing
 * AI service configuration from a JSON file or to start creating a new configuration from scratch.
 * It acts as the entry gate for the entire `CreateServicePage` workflow.
 * @author Marwin Ahnfeldt
 */

import React, { useRef } from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage'; 
import { Button } from '@/components/ui/button';
import type { AIServiceLifecycleImpact } from '@/types/aiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

/**
 * The `Step0_LoadOrNew` component renders the UI for the first step of the service creation wizard.
 * It utilizes the `useCreateServiceContext` hook to dispatch actions to the parent state manager,
 * effectively telling the wizard / navigation dialog how to proceed based on the users choice.
 *
 * @returns {JSX.Element} A card component with two primary actions for the user.
 */
export function Step0_LoadOrNew() {
  const { dispatch } = useCreateServiceContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the file selection event from the hidden input. It reads the selected
   * file as text, parses it as JSON, and then dispatches the 'LOAD_CONFIG' action
   * with the parsed data.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const rawJson = await file.text();
        const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact; 

        // Dispatch the action to load the parsed data into the wizard's state
        // The reducer logic for 'LOAD_CONFIG' will automatically advance the wizard to Step 1
        dispatch({ type: 'LOAD_CONFIG', payload: parsedConfig });
      } catch (error) {
        console.error("Failed to load or parse config:", error);
        alert("Failed to load configuration. Please check the file format.");
      }
    }
  };

   /**
   *  Triggers a click on the hidden file input when the user clicks the "Load" button
   */
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>AI Service Configuration</CardTitle>
        <CardDescription>
            Decide whether to load an existing AI service configuration or start building a new one from scratch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section for loading an existing configuration */}
        <div>
          {/* This file input is not visible to the user; it's triggered by the button below. */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button onClick={handleLoadClick} className="w-full">
            Load Existing Configuration from JSON
          </Button>
        </div>
        {/* Visual separator between the two options */}
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or
                </span>
            </div>
        </div>
        {/* Section for starting a new configuration */}
        <Button
          onClick={() => {
            // First, reset the form to its initial state to clear any previous data
            dispatch({ type: 'RESET_FORM' });
            // Then, navigate the user to the metadata form (Step 1)
            dispatch({ type: 'SET_STEP', payload: 1 });
          }}
          variant="outline"
          className="w-full"
        >
          Start New Configuration
        </Button>
      </CardContent>
    </Card>
  );
}
