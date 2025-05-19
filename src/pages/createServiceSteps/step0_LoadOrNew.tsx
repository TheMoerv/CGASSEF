// src/pages/createServiceSteps/Step0_LoadOrNew.tsx
import React, { useRef } from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import type { AIServiceLifecycleImpact } from '@/types/aiService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


export function Step0_LoadOrNew() {
  const { dispatch } = useCreateServiceContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const rawJson = await file.text();
        const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact; // Add validation later
        dispatch({ type: 'LOAD_CONFIG', payload: parsedConfig });
        // Navigation to next step is handled by LOAD_CONFIG action
      } catch (error) {
        console.error("Failed to load or parse config:", error);
        // Add user-facing error (e.g., using Shadcn Toast)
        alert("Failed to load configuration. Please check the file format.");
      }
    }
  };

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
        <div>
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
        <Button
          onClick={() => {
            dispatch({ type: 'RESET_FORM' });
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
