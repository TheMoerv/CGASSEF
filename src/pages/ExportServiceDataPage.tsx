/**
 * @file src/pages/ExportServiceDataPage.tsx
 * @description Implements the fourth core function of the CGASSEF prototype: exporting AI service
 * impact data to a CSV file. This enables the reuse of the collected data in external
 * tools like spreadsheet programs or business intelligence solutions. The page facilitates uploading a JSON file and transforming it into a
 * structured, tabular CSV format.
 * @author Marwin Ahnfeldt
 */

import React, { useState, useRef } from 'react';
import type { AIServiceLifecycleImpact, LifecycleStageKey, ImpactConfig, ApproximationConfig, DynamicConfig } from '@/types/aiService';
import { STAGE_LABELS } from '@/constants/lifecycleStages'; 
import  { lifecycleStageKeys } from '@/types/aiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Download } from 'lucide-react';
import Papa from 'papaparse'; // For CSV generation
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Defines the structure of a single row in the output CSV file. This flattens the hierarchical JSON data into a tabular format, where each row
 * represents a single life cycle stage.
 *
 * @property {string} serviceId - The ID of the service
 * @property {string} serviceName - The name of the service
 * @property {string} serviceDescription - The description of the service
 * @property {LifecycleStageKey} lifecycleStageKey - The programmatic key of the stage
 * @property {string} lifecycleStageLabel - The human-readable label of the stage
 * @property {ImpactConfig['impactCalculationMode']} impactCalculationMode - The mode used for this stage
 * @property {number | string} [co2EqInKg] - The CO₂ value, or a placeholder string for dynamic mode
 * @property {string} [httpApiUrl] - The API URL, if applicable for dynamic mode
 */
interface CsvRow {
    serviceId: string;
    serviceName: string;
    serviceDescription: string;
    lifecycleStageKey: LifecycleStageKey;
    lifecycleStageLabel: string;
    impactCalculationMode: ImpactConfig['impactCalculationMode'];
    co2EqInKg?: number | string; 
    httpApiUrl?: string;
}

/**
 * The `ExportServiceDataPage` component handles the UI and logic for the CSV export feature.
 */
export function ExportServiceDataPage() {
  // State for the loaded and parsed service data from the JSON file
  const [serviceData, setServiceData] = useState<AIServiceLifecycleImpact | null>(null);
  // State for the user-configurable export filename
  const [fileName, setFileName] = useState<string>('');
  // State for storing and displaying any errors
  const [error, setError] = useState<string | null>(null);
  // Ref to programmatically trigger the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles the file selection event. Reads the file, parses it as JSON, validates it,
   * and updates the component's state with the data and a default filename.
   */
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
        // Set a sensible default filename based on the service ID.
        setFileName(`${parsedConfig.serviceId}_impact_export.csv`); 
      } catch (e: unknown) {
        console.error("Failed to load or parse config:", e);
        let errorMessage = "Invalid JSON format.";
        if (e instanceof Error) { errorMessage = e.message; }
        else if (typeof e === 'string') { errorMessage = e; }
        setError(`Failed to load configuration: ${errorMessage}`);
      }
    }
  };

  // Programmatically triggers the hidden file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handles the core export logic. This function transforms the hierarchical JSON data
   * into a flat array of `CsvRow` objects and then uses `papaparse` to convert this
   * array into a CSV string for download.
   */
  const handleExportToCsv = () => {
    if (!serviceData) {
      setError("No service data loaded to export.");
      return;
    }

    // Transform the hierarchical data into a flat array of objects
    const csvData: CsvRow[] = [];
    lifecycleStageKeys.forEach(stageKey => {
        const config = serviceData.cycleStages[stageKey];
        if (config) { 
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
                row.co2EqInKg = 'Dynamic (API)'; 
                row.httpApiUrl = (config as DynamicConfig).httpApiUrl;
            } else { 
                row.co2EqInKg = 0;
            }
            csvData.push(row);
        }
    });

    if (csvData.length === 0) {
        setError("No impact data found in the service to export.");
        return;
    }
    // Use papaparse to generate the CSV string from the array of objects
    const csvString = Papa.unparse(csvData);
    // Standard client-side download logic
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
       {/* --- Upload Card --- */}
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

      {/* --- Export Options Card (conditionally rendered) --- */}      
      {serviceData && (
        <Card className="shadow-xl border-border/60">
          <CardHeader>
            <CardTitle>Export Options for: <span className="text-primary font-semibold">{serviceData.name}</span></CardTitle>
            <CardDescription>
              The data will be exported in CSV format. Each row will represent the CO2 impact of a dedicated lifecycle stage of the AI service.
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