// src/pages/VisualizeServicePage.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { AIServiceLifecycleImpact, LifecycleStageKey, ImpactConfig, ApproximationConfig } from '@/types/aiService';
import { lifecycleStageKeys } from '@/types/aiService';
import { STAGE_LABELS } from '@/constants/lifecycleStages';
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

// Helper for CO2 value extraction
const getCO2Value = (
    stageKey: LifecycleStageKey,
    config: ImpactConfig,
    currentDynamicValues: Partial<Record<LifecycleStageKey, number>>
): number => {
    if (config.impactCalculationMode === 'approximation') {
        return (config as ApproximationConfig).co2EqInKg;
    }
    if (config.impactCalculationMode === 'dynamic') {
        return currentDynamicValues[stageKey] || 0;
    }
    return 0;
};

// Define keys for operational and embodied emissions
const softwareCycleKeys: LifecycleStageKey[] = [
  'businessUseCaseGeneration', 'dataHandling', 'modelArchitectureExploration',
  'modelTraining', 'modelOperation', 'modelEndOfLife',
];
const hardwareCycleKeys: LifecycleStageKey[] = [
  'materialExtraction', 'hardwareManufacturing', 'hardwareTransport', 'AISystemInstallation',
];

export function VisualizeServicePage() {
  const [serviceData, setServiceData] = useState<AIServiceLifecycleImpact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [detailedStageData, setDetailedStageData] = useState<Array<{ stage: LifecycleStageKey; co2: number; fill: string }>>([]);
  const [detailedStageChartConfig, setDetailedStageChartConfig] = useState<ChartConfig>({});

  const [opVsEmbChartData, setOpVsEmbChartData] = useState<Array<{ name: string; value: number; fill: string }>>([]);
  const [opVsEmbChartConfig, setOpVsEmbChartConfig] = useState<ChartConfig>({});

  const [dynamicStageValues, setDynamicStageValues] = useState<Partial<Record<LifecycleStageKey, number>>>({});

  // Effect for simulating dynamic value updates
  useEffect(() => {
    if (!serviceData) {
      setDynamicStageValues({});
      return;
    }
    const initialValues: Partial<Record<LifecycleStageKey, number>> = {};
    let hasDynamicStages = false;
    lifecycleStageKeys.forEach(stageKey => {
      const config = serviceData.cycleStages[stageKey];
      if (config && config.impactCalculationMode === 'dynamic') {
        initialValues[stageKey] = Math.random() * 5 + 1;
        hasDynamicStages = true;
      }
    });
    setDynamicStageValues(initialValues);

    if (!hasDynamicStages) return;
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
    }, 5000);
    return () => clearInterval(intervalId);
  }, [serviceData]);

  // Effect for preparing all chart data
  useEffect(() => {
    if (!serviceData) {
      setDetailedStageData([]);
      setDetailedStageChartConfig({});
      setOpVsEmbChartData([]);
      setOpVsEmbChartConfig({});
      return;
    }

    // 1. Prepare data for Detailed CO2 by Stage (Cycling Colors)
    const newDetailedConfig: ChartConfig = { co2: { label: "CO₂ (kg)" } };
    const newDetailedData: Array<{ stage: LifecycleStageKey; co2: number; fill: string }> = [];
    let detailedChartColorIndex = 1; // For cycling through --chart-1 to --chart-10
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

    // 2. Prepare data for Operational vs. Embodied Emissions
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null); setServiceData(null);
    if (file) {
      try {
        const rawJson = await file.text();
        const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact;
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

  const totalCO2 = lifecycleStageKeys.reduce((sum, stageKey) => {
    if (serviceData?.cycleStages[stageKey]) {
      return sum + getCO2Value(stageKey, serviceData.cycleStages[stageKey], dynamicStageValues);
    }
    return sum;
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">AI Service CO₂ Dashboard</CardTitle>
          <CardDescription>Upload your AI Service JSON to visualize its CO₂ impact.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <Button onClick={handleUploadClick} size="lg" className="w-full sm:w-auto">
              <UploadCloud className="mr-2 h-5 w-5" /> Upload JSON file containing AI service impact data
            </Button>
            {error && ( <Alert variant="destructive" className="w-full"> <Info className="h-4 w-4" /> <AlertTitle>Error Loading File</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
          </div>
        </CardContent>
      </Card>

      {serviceData && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>CO₂ Impact Overview: <span className="font-semibold text-primary">{serviceData.name}</span></CardTitle>
            <CardDescription>Total Estimated CO₂ Emissions: <span className="font-bold">{totalCO2.toFixed(2)} kg CO₂e</span></CardDescription>
          </CardHeader>
        </Card>
      )}

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
            </Card>
          )}
        </div>
      )}

      {serviceData && detailedStageData.length === 0 && opVsEmbChartData.length === 0 && !error && (
        <Alert variant="default" className="mt-4 shadow-lg">
            <Info className="h-4 w-4" />
            <AlertTitle>No CO₂ Data to Display</AlertTitle>
            <AlertDescription>
                The uploaded configuration has no lifecycle stages with CO₂ impact greater than zero.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}