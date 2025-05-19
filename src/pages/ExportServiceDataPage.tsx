// src/pages/ExportServiceDataPage.tsx
import React, { useState, useRef } from 'react';
import type { AIServiceLifecycleImpact, LifecycleStageKey, ImpactConfig, ApproximationConfig, DynamicConfig } from '@/types/aiService';
import { STAGE_LABELS } from '@/constants/lifecycleStages'; // Assuming lifecycleStageKeys is exported
import  { lifecycleStageKeys } from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Download } from 'lucide-react';
import Papa from 'papaparse'; // For CSV generation
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CsvRow {
    serviceId: string;
    serviceName: string;
    serviceDescription: string;
    lifecycleStageKey: LifecycleStageKey;
    lifecycleStageLabel: string;
    impactCalculationMode: ImpactConfig['impactCalculationMode'];
    co2EqInKg?: number | string; // Can be number or string like "Dynamic (API)"
    httpApiUrl?: string;
    // Token is likely too sensitive for general CSV export, omitting by default
}

export function ExportServiceDataPage() {
  const [serviceData, setServiceData] = useState<AIServiceLifecycleImpact | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setServiceData(null);
    setFileName('');
    if (file) {
      try {
        const rawJson = await file.text();
        const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact;
        if (!parsedConfig.serviceId || !parsedConfig.name || !parsedConfig.cycleStages) {
            throw new Error("Invalid or incomplete service configuration file.");
        }
        setServiceData(parsedConfig);
        setFileName(`${parsedConfig.serviceId}_impact_export.csv`); // Default filename
      } catch (e: unknown) {
        console.error("Failed to load or parse config:", e);
        let errorMessage = "Invalid JSON format.";
        if (e instanceof Error) { errorMessage = e.message; }
        else if (typeof e === 'string') { errorMessage = e; }
        setError(`Failed to load configuration: ${errorMessage}`);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportToCsv = () => {
    if (!serviceData) {
      setError("No service data loaded to export.");
      return;
    }

    const csvData: CsvRow[] = [];

    lifecycleStageKeys.forEach(stageKey => {
        const config = serviceData.cycleStages[stageKey];
        if (config) { // Should always be true if serviceData is valid
            const row: CsvRow = {
                serviceId: serviceData.serviceId,
                serviceName: serviceData.name,
                serviceDescription: serviceData.description,
                lifecycleStageKey: stageKey,
                lifecycleStageLabel: STAGE_LABELS[stageKey] || stageKey,
                impactCalculationMode: config.impactCalculationMode,
            };

            if (config.impactCalculationMode === 'approximation') {
                row.co2EqInKg = (config as ApproximationConfig).co2EqInKg;
            } else if (config.impactCalculationMode === 'dynamic') {
                row.co2EqInKg = 'Dynamic (API)'; // Placeholder for CSV
                row.httpApiUrl = (config as DynamicConfig).httpApiUrl;
                // Not exporting token for security
            } else { // 'none'
                row.co2EqInKg = 0;
            }
            csvData.push(row);
        }
    });

    if (csvData.length === 0) {
        setError("No impact data found in the service to export.");
        return;
    }

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.trim() || 'ai_service_impact_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="container mx-auto py-12 px-4 space-y-10">
      <Card className="shadow-xl border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Export AI Service Impact Data</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-1">
            Upload an AI Service JSON configuration file to export its impact data as a CSV file for reporting and further analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              id="export-file-input"
            />
            <Button onClick={handleUploadClick} variant="outline" size="lg" className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Service JSON
            </Button>
            {error && (
              <Alert variant="destructive" className="w-full mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {serviceData && (
        <Card className="shadow-xl border-border/60">
          <CardHeader>
            <CardTitle>Export Options for: <span className="text-primary font-semibold">{serviceData.name}</span></CardTitle>
            <CardDescription>
              The data will be exported in CSV format. Each row will represent a lifecycle stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="csv-filename" className="text-base font-medium">CSV Filename</Label>
              <Input
                id="csv-filename"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="export_filename.csv"
                className="mt-1"
              />
            </div>
            <Button onClick={handleExportToCsv} size="lg" className="w-full sm:w-auto">
              <Download className="mr-2 h-5 w-5" /> Export to CSV
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}