/**
 * @file src/pages/VisualizeServicePage.tsx
 * @description Implements the "Visual Impact of AI Service" core function of the CGASSEF prototype.
 * This page allows users to upload a completed AI service configuration JSON file and view
 * a dashboard of visualizations. It processes the impact data to generate charts that
 * break down CO₂ emissions by lifecycle stage and by category (operational vs. embodied).
 * @author Marwin Ahnfeldt
 */

import React, { useState, useEffect, useRef } from 'react';
import type { AIServiceLifecycleImpact, LifecycleStageKey, ImpactConfig, ApproximationConfig } from '@/types/aiService';
import { lifecycleStageKeys } from '@/types/aiService';
import { STAGE_LABELS, SOFTWARE_STAGE_DESCRIPTIONS, HARDWARE_STAGE_DESCRIPTIONS } from '@/constants/lifecycleStages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  type TooltipProps
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Helper Functions & Constants ---

/**
 * Extracts the CO₂ value from a stage's configuration, correctly handling different impact modes.
 * If the mode is 'dynamic', it uses the current simulated value from the component's state.
 * @param {LifecycleStageKey} stageKey - The key of the stage.
 * @param {ImpactConfig} config - The impact configuration for that stage.
 * @param {Partial<Record<LifecycleStageKey, number>>} currentDynamicValues - The current state of simulated dynamic values.
 * @returns {number} The CO₂ value in kg.
 */
const getCO2Value = (
    stageKey: LifecycleStageKey,
    config: ImpactConfig,
    currentDynamicValues: Partial<Record<LifecycleStageKey, number>>
): number => {
    if (config.impactCalculationMode === 'approximation') {
        return (config as ApproximationConfig).co2EqInKg;
    }
    if (config.impactCalculationMode === 'dynamic') {
      // Return the simulated value for dynamic stages.
        return currentDynamicValues[stageKey] || 0;
    }
    return 0;
};

/**
 * Defines the keys for categorizing emissions into 'Operational' (software) and 'Embodied' (hardware).
 * This is used for generating the "Operational vs. Embodied" pie chart.
 */
const softwareCycleKeys: LifecycleStageKey[] = [
  'businessUseCaseGeneration', 'dataHandling', 'modelArchitectureExploration',
  'modelTraining', 'modelOperation', 'modelEndOfLife',
];
const hardwareCycleKeys: LifecycleStageKey[] = [
  'materialExtraction', 'hardwareManufacturing', 'hardwareTransport', 'AISystemInstallation',
];

/**
 * The `VisualizeServicePage` component renders the main dashboard for impact data visualization.
 * It manages the entire lifecycle of this feature, from file upload to data processing and chart rendering.
 */
export function VisualizeServicePage() {
  // State for the loaded and parsed service data from the JSON file
  const [serviceData, setServiceData] = useState<AIServiceLifecycleImpact | null>(null);
  // State for storing and displaying any errors that occur during file processing
  const [error, setError] = useState<string | null>(null);
  // Ref to programmatically trigger the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State for Chart Data and Configuration ---
  const [detailedStageData, setDetailedStageData] = useState<Array<{ stage: LifecycleStageKey; co2: number; fill: string }>>([]);
  const [detailedStageChartConfig, setDetailedStageChartConfig] = useState<ChartConfig>({});

  const [opVsEmbChartData, setOpVsEmbChartData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const [opVsEmbChartConfig, setOpVsEmbChartConfig] = useState<ChartConfig>({});
  // State to hold simulated values for stages with 'dynamic' impact mode
  const [dynamicStageValues, setDynamicStageValues] = useState<Partial<Record<LifecycleStageKey, number>>>({});

  /**
   * Effect to simulate live data updates for any stages marked as 'dynamic'.
   * This demonstrates the tool's capability to handle live data feeds, as envisioned in the conceptual framework.
   */
  useEffect(() => {
    if (!serviceData) {
      setDynamicStageValues({});
      return;
    }
    // Initialize dynamic values with a random starting point
    const initialValues: Partial<Record<LifecycleStageKey, number>> = {};
    let hasDynamicStages = false;
    lifecycleStageKeys.forEach(stageKey => {
      const config = serviceData.cycleStages[stageKey];
      if (config && config.impactCalculationMode === 'dynamic') {
        initialValues[stageKey] = Math.random() * 5 + 1; // Initial random value
        hasDynamicStages = true;
      }
    });
    setDynamicStageValues(initialValues);

    if (!hasDynamicStages) return; // Don't start interval if no dynamic stages exist
    // Set up an interval to periodically update the dynamic values, creating a "live" chart effect
    const intervalId = setInterval(() => {
      setDynamicStageValues(prev => {
        const newValues = { ...prev };
        lifecycleStageKeys.forEach(stageKey => {
          const config = serviceData.cycleStages[stageKey];
          if (config && config.impactCalculationMode === 'dynamic' && Object.prototype.hasOwnProperty.call(prev, stageKey)) {
            newValues[stageKey] = (prev[stageKey] || 0) + (Math.random() * 0.5 + 0.1);
          }
        });
        return newValues;
      });
    }, 5000); // Update every 5 second
    // Cleanup function to clear the interval when the component unmounts or serviceData changes
    return () => clearInterval(intervalId);
  }, [serviceData]);

  /**
   * The main data processing effect. It runs whenever the service data or dynamic values change,
   * recalculating and preparing all the necessary data structures for the charts.
   */
  useEffect(() => {
    if (!serviceData) {
      // Clear all chart data if no service data is loaded
      setDetailedStageData([]);
      setDetailedStageChartConfig({});
      setOpVsEmbChartData([]);
      setOpVsEmbChartConfig({});
      return;
    }

    /// 1. Prepare data for the "CO₂ by Stage" (Detailed) Pie and Bar Charts
    const newDetailedConfig: ChartConfig = { co2: { label: "CO₂ (kg)" } };
    const newDetailedData: Array<{ stage: LifecycleStageKey; co2: number; fill: string }> = [];
    let detailedChartColorIndex = 1; 
    const MAX_FIXED_CHART_COLORS = 10;

    lifecycleStageKeys.forEach(stageKey => {
      const config = serviceData.cycleStages[stageKey];
      if (config) {
        const co2Value = getCO2Value(stageKey, config, dynamicStageValues);
        if (co2Value > 0) {
          const colorVariable = `hsl(var(--chart-${detailedChartColorIndex}))`;
          newDetailedData.push({ stage: stageKey, co2: co2Value, fill: colorVariable });
          newDetailedConfig[stageKey] = { label: STAGE_LABELS[stageKey] || stageKey, color: colorVariable };
          detailedChartColorIndex = detailedChartColorIndex >= MAX_FIXED_CHART_COLORS ? 1 : detailedChartColorIndex + 1;
        } else {
           newDetailedConfig[stageKey] = { label: STAGE_LABELS[stageKey] || stageKey, color: 'hsl(var(--muted))' };
        }
      }
    });
    setDetailedStageData(newDetailedData);
    setDetailedStageChartConfig(newDetailedConfig);

    // 2. Prepare data for the "Operational vs. Embodied" Pie Chart
    let operationalEmissions = 0;
    softwareCycleKeys.forEach(stageKey => {
      const config = serviceData.cycleStages[stageKey];
      if (config) operationalEmissions += getCO2Value(stageKey, config, dynamicStageValues);
    });

    let embodiedEmissions = 0;
    hardwareCycleKeys.forEach(stageKey => {
      const config = serviceData.cycleStages[stageKey];
      if (config) embodiedEmissions += getCO2Value(stageKey, config, dynamicStageValues);
    });

    const newOpVsEmbData: Array<{ name: string; value: number; fill: string }> = [];
    const newOpVsEmbConfig: ChartConfig = { value: { label: "CO₂ (kg)" } };

    const opColor = 'hsl(var(--chart-1))'; // Fixed color for operational
    const embColor = 'hsl(var(--chart-2))'; // Fixed color for embodied

    if (operationalEmissions > 0 || embodiedEmissions === 0) {
      newOpVsEmbData.push({ name: "Operational Emissions", value: operationalEmissions, fill: opColor });
      newOpVsEmbConfig["Operational Emissions"] = { label: "Operational Emissions", color: opColor };
    }
    if (embodiedEmissions > 0 || operationalEmissions === 0) {
      newOpVsEmbData.push({ name: "Embodied Emissions", value: embodiedEmissions, fill: embColor });
      newOpVsEmbConfig["Embodied Emissions"] = { label: "Embodied Emissions", color: embColor };
    }
    setOpVsEmbChartData(newOpVsEmbData);
    setOpVsEmbChartConfig(newOpVsEmbConfig);

  }, [serviceData, dynamicStageValues]);

  /**
   * Handles the file selection event. Reads the file, parses it as JSON, performs basic
   * validation, and updates the component's state with the data or an error message.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null); setServiceData(null);
    if (file) {
      try {
        const rawJson = await file.text();
        const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact;
        // Basic validation to ensure the file is in the expected format
        if (!parsedConfig.serviceId || !parsedConfig.name || !parsedConfig.cycleStages) {
            throw new Error("Invalid or incomplete service configuration file.");
        }
        setServiceData(parsedConfig);
      } catch (e: unknown) {
        console.error("Failed to load or parse config:", e);
        let errorMessage = "Invalid JSON format.";
        if (e instanceof Error) { errorMessage = e.message; }
        else if (typeof e === 'string') { errorMessage = e;}
        setError(`Failed to load configuration: ${errorMessage}`);
      }
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  // A custom tooltip component for Recharts to ensure a consistent look and feel
  const CustomTooltipContent = (props: TooltipProps<number, string>) => {
    const { active, payload, label: nameKeyFromProps } = props;
    if (active && payload && payload.length) {
      const dataEntry = payload[0];
      const rawDataItem = dataEntry.payload as { name?: string, stage?: LifecycleStageKey, co2?: number, value?: number, fill?: string };
      const currentNameKey = nameKeyFromProps !== undefined ? nameKeyFromProps : (rawDataItem.stage || rawDataItem.name || '');
      const selectedChartConfig = detailedStageChartConfig[currentNameKey] ? detailedStageChartConfig : opVsEmbChartConfig;
      const configEntry = selectedChartConfig[currentNameKey];
      const itemLabel = configEntry?.label || STAGE_LABELS[currentNameKey as LifecycleStageKey] || currentNameKey;
      const itemValue = rawDataItem.co2 !== undefined ? rawDataItem.co2 : rawDataItem.value;
      const color = configEntry?.color || dataEntry.color || dataEntry.fill;

      if (itemValue === undefined) return null;
      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-sm text-sm">
          <div className="grid grid-cols-[auto,1fr] items-center gap-x-2.5 gap-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{itemLabel}</span>
            </div>
            <span className="font-semibold text-right tabular-nums">{itemValue.toFixed(2)} kg CO₂e</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculates the total CO₂ emissions on every render to ensure it's always current
  const totalCO2 = lifecycleStageKeys.reduce((sum, stageKey) => {
    if (serviceData?.cycleStages[stageKey]) {
      return sum + getCO2Value(stageKey, serviceData.cycleStages[stageKey], dynamicStageValues);
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
       {/* --- Upload Card --- */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">AI Service CO₂ Dashboard</CardTitle>
          <CardDescription>Upload your AI Service JSON file to see a visual breakdown of its estimated CO₂ emissions across different lifecycle phases.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Button onClick={handleUploadClick} size="lg" className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload Impact Data File
            </Button>
            {error && ( <Alert variant="destructive" className="w-full"> <Info className="h-4 w-4" /> <AlertTitle>Error Loading File</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
          </div>
        </CardContent>
      </Card>

       {/* --- Data Display Section (conditionally rendered after data is loaded) --- */}
      {serviceData && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>CO₂ Impact Overview: <span className="font-semibold text-primary">{serviceData.name}</span></CardTitle>
            <CardDescription>Total Estimated CO₂ Emissions: <span className="font-bold">{totalCO2.toFixed(2)} kg CO₂e</span></CardDescription>
            <p className="text-xs text-muted-foreground mt-1">This total represents the sum of CO₂ equivalents (kg CO₂e) from all active lifecycle stages defined in your configuration.</p>
          </CardHeader>
        </Card>
      )}
      
      {/* Charts Grid */}
      {serviceData && (detailedStageData.length > 0 || opVsEmbChartData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* CO2 BY STAGE (DETAILED) PIE CHART */}
          {detailedStageData.length > 0 && (
            <Card className="flex flex-col shadow-lg">
              <CardHeader className="items-center pb-2"> <CardTitle>CO₂ by Stage (Detailed)</CardTitle> </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center p-2 min-h-[300px] sm:min-h-[350px]">
                <ChartContainer config={detailedStageChartConfig} className="mx-auto aspect-square w-full max-w-xs sm:max-w-sm">
                  <PieChart>
                    <ChartTooltip content={<CustomTooltipContent />} />
                    <Pie data={detailedStageData} dataKey="co2" nameKey="stage" labelLine={false} outerRadius="80%">
                      {detailedStageData.map((entry) => ( <Cell key={`cell-pie-${entry.stage}`} fill={entry.fill} /> ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="stage" />}
                      className="mt-3 flex-wrap justify-center gap-x-3 gap-y-1 text-xs sm:text-sm" />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardDescription className="text-center text-xs sm:text-sm text-muted-foreground px-2 pb-2">
              This chart shows the percentage contribution of each lifecycle stage to the total CO₂ emissions. Stages with larger slices have a higher relative impact. Colors transition from green (lower impact) to red (higher impact).
            </CardDescription>
            </Card>
          )}

          {/* OPERATIONAL VS EMBODIED PIE CHART */}
          {opVsEmbChartData.length > 0 && (
            <Card className="flex flex-col shadow-lg">
              <CardHeader className="items-center pb-2"> <CardTitle>Operational vs. Embodied CO₂</CardTitle> </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center p-2 min-h-[300px] sm:min-h-[350px]">
                <ChartContainer config={opVsEmbChartConfig} className="mx-auto aspect-square w-full max-w-xs sm:max-w-sm">
                  <PieChart>
                    <ChartTooltip content={<CustomTooltipContent />} />
                    <Pie data={opVsEmbChartData} dataKey="value" nameKey="name" labelLine={false} outerRadius="80%">
                      {opVsEmbChartData.map((entry, index) => ( <Cell key={`cell-opvemb-${index}`} fill={entry.fill} /> ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />}
                      className="mt-3 flex-wrap justify-center gap-x-3 gap-y-1 text-xs sm:text-sm" />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardDescription className="text-center text-xs sm:text-sm text-muted-foreground px-2 pb-2">
              Compares the CO₂ impact from ongoing software operations versus the impact from the AI system's hardware (materials, manufacturing, transport, installation).
            </CardDescription>
            </Card>
          )}

          {/* BAR CHART - Uses detailedStageChartConfig (cycling colors from detailed pie) */}
          {detailedStageData.length > 0 && (
            <Card className="shadow-lg md:col-span-2">
              <CardHeader className="pb-2"> <CardTitle>CO₂ by Stage (Bars)</CardTitle> </CardHeader>
              <CardContent className="min-h-[300px] sm:min-h-[400px] p-1 pr-3 sm:p-2 sm:pr-4">
                <ChartContainer config={detailedStageChartConfig} className="w-full h-full">
                  <BarChart data={detailedStageData} layout="vertical" margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="co2" type="number" hide />
                    <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))"
                           tickMargin={10} width={180} interval={0}
                           tickFormatter={(valueFromDataKey: unknown) => {
                                                       const stageKey = valueFromDataKey as LifecycleStageKey;
                                                       // Use detailedStageChartConfig here
                                                       const chartLabel = detailedStageChartConfig[stageKey]?.label; // <--- CORRECTED
                                                       const constantLabel = STAGE_LABELS[stageKey];
                           
                                                       if (typeof constantLabel === 'string') {
                                                           return constantLabel;
                                                       }
                                                       if (typeof chartLabel === 'string') {
                                                           return chartLabel;
                                                       }
                                                       return String(stageKey);
                                                   }} />
                    <ChartTooltip cursor={false} content={<CustomTooltipContent />} />
                    <Bar dataKey="co2" layout="vertical" radius={5}>
                      {detailedStageData.map((entry) => ( <Cell key={`cell-bar-${entry.stage}`} fill={entry.fill} /> ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardDescription className="text-left text-xs sm:text-sm text-muted-foreground px-2 pb-2">
  This chart displays the absolute CO₂ emissions (in kg CO₂e) for each lifecycle stage. Longer bars indicate higher emissions for that specific stage. Colors correspond to the detailed pie chart.
</CardDescription>
            </Card>
          )}
        </div>
      )}

      {serviceData && ( /* Only show if data is loaded, so stage keys are relevant */
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Understanding Lifecycle Stages</CardTitle>
            <CardDescription>
              The AI service lifecycle is broken down into operational (software-related) and embodied (hardware-related) emission phases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="operational-emissions">
                <AccordionTrigger className="text-lg font-semibold text-primary">Operational Emissions (Software Lifecycle)</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-3">
                  {softwareCycleKeys.map((stageKey) => {
                    const label = STAGE_LABELS[stageKey];
                    const description = SOFTWARE_STAGE_DESCRIPTIONS[stageKey];
                    return (
                      <div key={stageKey}>
                        <h4 className="font-medium">{label || stageKey}</h4>
                        {description && <p className="text-sm text-muted-foreground pl-2">{description}</p>}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="embodied-emissions">
                <AccordionTrigger className="text-lg font-semibold text-primary">Embodied Emissions (Hardware Lifecycle)</AccordionTrigger>
                <AccordionContent className="space-y-3 pt-3">
                  {hardwareCycleKeys.map((stageKey) => {
                    const label = STAGE_LABELS[stageKey];
                    const description = HARDWARE_STAGE_DESCRIPTIONS[stageKey];
                    return (
                      <div key={stageKey}>
                        <h4 className="font-medium">{label || stageKey}</h4>
                        {description && <p className="text-sm text-muted-foreground pl-2">{description}</p>}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
