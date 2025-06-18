/**
 * @file src/pages/createServiceSteps/Step4_ExportView.tsx
 * @description Implements the final review and export screen (Step 4) for the "Create/Edit" wizard.
 * This component consolidates all the data accumulated in the central state (`useCreateServiceContext`)
 * into a complete `AIServiceLifecycleImpact` object. It provides a preview of the resulting JSON
 * and allows the user to download it as a file, which can then be used in the other core functions of the CGASSEF tool.
 * @author Marwin Ahnfeldt
 */

import  { useState, useEffect } from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage'; 
import  type { AIServiceLifecycleImpact } from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';


/**
 * The `Step4_ExportView` component serves as the conclusion of the service creation/editing process.
 * It uses local state for UI concerns like the filename and the formatted JSON string,
 * while deriving the core data from the shared context.
 *
 * @returns {JSX.Element} A card displaying the final configuration and a download button
 */
export function Step4_ExportView() {
  const { state } = useCreateServiceContext();

  // Local state to manage the filename, initialized from the context's default
  const [fileName, setFileName] = useState(state.defaultFilename || 'ai_service_config');
  // Local state to hold the formatted JSON string for display and download
  const [jsonStringToExport, setJsonStringToExport] = useState('');

  /**
   * An effect that runs whenever the central state changes. It constructs the
   * final, complete 'AIServiceLifecycleImpact' object from the various pieces of
   * state collected throughout the wizard (metadata, cycle stages) and then
   * transforms it into a nicely formatted JSON string
   */
  useEffect(() => {
    // Assembly of the complete data structure for export, conforming to the defined schema.
    const exportData: AIServiceLifecycleImpact = {
      $schema: "https://example.com/schemas/cgassef.schema.json", // Or dynamically get from a constant
      serviceId: state.serviceId,
      name: state.name,
      description: state.description,
      cycleStages: state.cycleStages, // Already in the correct format
    };

    // Convert the complete object into a pretty-printed JSON string for display and downloa
    setJsonStringToExport(JSON.stringify(exportData, null, 2));
  }, [state]); // Re-generates the JSON string if any part of the parent state changes

  /**
   * An effect to synchronize the local `fileName` state with the `defaultFilename`
   * from the context. This handles cases where the user might navigate back and
   * forth, causing the default filename to be recalculated.
   */
  useEffect(() => {
    setFileName(state.defaultFilename || 'ai_service_config');
  }, [state.defaultFilename]);

  /**
   * Handles the file download logic. It creates a `Blob` from the JSON string,
   * generates a temporary URL, and programmatically triggers a download link.
   */
  const handleDownload = () => {
    const blob = new Blob([jsonStringToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.trim() || 'ai_service_config'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Export Configuration</CardTitle>
        <CardDescription>
          Review your complete AI service lifecycle impact configuration and download it as a JSON file for follow-up visualizations and AI Service comparisons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {/* Input for the user to customize the filename before downloading. */}
          <Label htmlFor="fileName">Filename</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="ai_service_config"
          />
        </div>
        {/* A scrollable, read-only preview of the final JSON output. */}
        <div>
          <Label>Configuration Preview (JSON)</Label>
          <ScrollArea className="h-72 w-full rounded-md border p-4 mt-2 bg-muted/30">
            <pre className="text-sm whitespace-pre-wrap break-all">
              {jsonStringToExport}
            </pre>
          </ScrollArea>
        </div>
        {/* The primary action button to trigger the download. */}
        <Button onClick={handleDownload} className="w-full" size="lg">
          Download JSON Configuration
        </Button>
      </CardContent>
    </Card>
  );
}