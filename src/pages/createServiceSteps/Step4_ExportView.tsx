// src/pages/createServiceSteps/Step4_ExportView.tsx
import  { useState, useEffect } from 'react';
import { useCreateServiceContext } from '@/pages/CreateServicePage'; 
import  type { AIServiceLifecycleImpact } from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area'; // For displaying JSON

export function Step4_ExportView() {
  const { state } = useCreateServiceContext();
  const [fileName, setFileName] = useState(state.defaultFilename || 'ai_service_config');
  const [jsonStringToExport, setJsonStringToExport] = useState('');

  useEffect(() => {
    // Construct the full AIServiceLifecycleImpact object for export
    // This ensures we include the schema link and all top-level properties
    const exportData: AIServiceLifecycleImpact = {
      $schema: "https://example.com/schemas/cgsaem.schema.json", // Or dynamically get from a constant
      serviceId: state.serviceId,
      name: state.name,
      description: state.description,
      cycleStages: state.cycleStages, // Already in the correct format
    };

    // Sanitize cycleStages: ensure all stages have at least 'none' if not configured
    // (though our createDefaultCycleStages should handle this, this is an extra safety)
    // This part might be redundant if createDefaultCycleStages initializes all keys.
    // lifecycleStageKeys.forEach(key => {
    //   if (!exportData.cycleStages[key]) {
    //     exportData.cycleStages[key] = { impactCalculationMode: 'none' };
    //   }
    // });

    setJsonStringToExport(JSON.stringify(exportData, null, 2)); // Pretty print with 2 spaces
  }, [state]); // Re-generate if any part of the state changes

  useEffect(() => {
    // Update local fileName if defaultFilename in context changes
    // (e.g., if user goes back and forth and it gets re-calculated)
    setFileName(state.defaultFilename || 'ai_service_config');
  }, [state.defaultFilename]);


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
          <Label htmlFor="fileName">Filename</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="ai_service_config"
          />
        </div>

        <div>
          <Label>Configuration Preview (JSON)</Label>
          <ScrollArea className="h-72 w-full rounded-md border p-4 mt-2 bg-muted/30">
            <pre className="text-sm whitespace-pre-wrap break-all">
              {jsonStringToExport}
            </pre>
          </ScrollArea>
        </div>

        <Button onClick={handleDownload} className="w-full" size="lg">
          Download JSON Configuration
        </Button>
      </CardContent>
    </Card>
  );
}