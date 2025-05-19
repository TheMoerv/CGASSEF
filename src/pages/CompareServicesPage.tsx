// src/pages/CompareServicesPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { AIServiceLifecycleImpact, LifecycleStageKey } from '@/types/aiService';
// Assuming lifecycleStageKeys is still needed if calculateStaticCO2 or other helpers use it broadly.
// If not directly used in this file after refactoring, it can be removed from here.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, FileJson, Trash2, BarChartBig } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  type TooltipProps,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  // ChartLegend, // Not using legend for radar in this version
  // ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from '@/components/ui/chart';

// Define keys for different impact categories
const softwareCycleKeys: LifecycleStageKey[] = [
  'businessUseCaseGeneration', 'dataHandling', 'modelArchitectureExploration',
  'modelTraining', 'modelOperation', 'modelEndOfLife',
];
const hardwareCycleKeys: LifecycleStageKey[] = [
  'materialExtraction', 'hardwareManufacturing', 'hardwareTransport', 'AISystemInstallation',
];

interface ComparisonFormState {
  inferenceCounts: Record<string, number>;
}
const DEFAULT_INFERENCE_COUNT = 1000;

interface RadarDataPoint {
  dimension: string;
  [serviceId: string]: number | string; // serviceId will be the key, value is the metric
}

interface ServiceRadarMetrics {
    serviceId: string;
    name: string;
    color: string;
    inferenceCount: number;
    avgEmbodiedPerInference: number;
    avgOperationalPerInference: number;
    avgTotalPerInference: number;
    totalEmbodiedImpact: number;
    totalOperationalImpact: number;
    totalImpact: number;
}

const calculateStaticCO2 = (service: AIServiceLifecycleImpact, stageKey: LifecycleStageKey): number => {
  const config = service.cycleStages[stageKey];
  if (config && config.impactCalculationMode === 'approximation') {
    return Number(config.co2EqInKg) || 0;
  }
  return 0;
};

const radarDimensions = [
    { key: 'inferenceCount', label: 'Inference Count', unit: 'reqs' },
    { key: 'avgEmbodiedPerInference', label: 'Avg. Embodied / Inf.', unit: 'kg/req' },
    { key: 'avgOperationalPerInference', label: 'Avg. Operational / Inf.', unit: 'kg/req' },
    { key: 'avgTotalPerInference', label: 'Avg. Total / Inf.', unit: 'kg/req' },
    { key: 'totalEmbodiedImpact', label: 'Total Embodied', unit: 'kg' },
    { key: 'totalOperationalImpact', label: 'Total Operational', unit: 'kg' },
    { key: 'totalImpact', label: 'Total Impact', unit: 'kg' },
] as const;

type RadarDimensionKey = typeof radarDimensions[number]['key'];

export function CompareServicesPage() {
  const [uploadedServices, setUploadedServices] = useState<AIServiceLifecycleImpact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] = useState<ComparisonFormState>({ inferenceCounts: {} });

  // State for calculated metrics (updated by useEffect)
  const [calculatedPerServiceMetrics, setCalculatedPerServiceMetrics] = useState<ServiceRadarMetrics[]>([]);
  const [calculatedRadarChartData, setCalculatedRadarChartData] = useState<RadarDataPoint[]>([]);
  const [calculatedRadarChartConfig, setCalculatedRadarChartConfig] = useState<ChartConfig>({});

  // State for metrics to be displayed by the chart (updated by button click)
  const [displayPerServiceMetrics, setDisplayPerServiceMetrics] = useState<ServiceRadarMetrics[]>([]);
  const [displayRadarChartData, setDisplayRadarChartData] = useState<RadarDataPoint[]>([]);
  const [displayRadarChartConfig, setDisplayRadarChartConfig] = useState<ChartConfig>({});
  const [isChartGenerated, setIsChartGenerated] = useState(false);

  const handleFilesChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setError(null);
    setIsChartGenerated(false); // Reset chart display on new file selection

    if (files && files.length > 0) {
      const currentServicesMap = new Map(uploadedServices.map(s => [s.serviceId, s]));
      const updatedInferenceCounts = { ...formState.inferenceCounts };
      const errorsAccumulator: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const rawJson = await file.text();
          const parsedConfig = JSON.parse(rawJson) as AIServiceLifecycleImpact;
          if (!parsedConfig.serviceId || !parsedConfig.name || !parsedConfig.cycleStages) {
            throw new Error(`File ${file.name}: Invalid structure.`);
          }
          currentServicesMap.set(parsedConfig.serviceId, parsedConfig); // Add or replace
          if (!updatedInferenceCounts[parsedConfig.serviceId]) {
            updatedInferenceCounts[parsedConfig.serviceId] = DEFAULT_INFERENCE_COUNT;
          }
        } catch (e: unknown) {
          let msg = `Error processing ${file.name}: Invalid JSON.`;
          if (e instanceof Error) { msg = `Error processing ${file.name}: ${e.message}`; }
          else if (typeof e === 'string') { msg = `Error processing ${file.name}: ${e}`; }
          errorsAccumulator.push(msg);
        }
      }
      setUploadedServices(Array.from(currentServicesMap.values()));
      setFormState(prev => ({ ...prev, inferenceCounts: updatedInferenceCounts }));
      if (errorsAccumulator.length > 0) setError(errorsAccumulator.join('\n'));
      if (multiFileInputRef.current) multiFileInputRef.current.value = "";
    }
  };

  const handleRemoveService = (serviceIdToRemove: string) => {
    setUploadedServices(prev => prev.filter(s => s.serviceId !== serviceIdToRemove));
    setFormState(prev => {
      const newCounts = { ...prev.inferenceCounts };
      delete newCounts[serviceIdToRemove];
      return { ...prev, inferenceCounts: newCounts };
    });
    setIsChartGenerated(false);
  };

  const handleInferenceCountChange = (serviceId: string, value: string) => {
    const count = parseInt(value, 10);
    setFormState(prev => ({
      ...prev,
      inferenceCounts: { ...prev.inferenceCounts, [serviceId]: isNaN(count) || count < 1 ? 1 : count }
    }));
    setIsChartGenerated(false); // Require regeneration if counts change
  };

  useEffect(() => {
    if (uploadedServices.length === 0) {
      setCalculatedRadarChartData([]);
      setCalculatedRadarChartConfig({});
      setCalculatedPerServiceMetrics([]);
      // Also clear display states and hide chart
      setDisplayRadarChartData([]);
      setDisplayRadarChartConfig({});
      setDisplayPerServiceMetrics([]);
      setIsChartGenerated(false);
      return;
    }

    const newPerServiceMetrics: ServiceRadarMetrics[] = uploadedServices.map((service, index) => {
      const totalRequests = formState.inferenceCounts[service.serviceId] || DEFAULT_INFERENCE_COUNT;
      let embodiedImpact = 0;
      hardwareCycleKeys.forEach(key => embodiedImpact += calculateStaticCO2(service, key));
      let operationalImpact = 0;
      softwareCycleKeys.forEach(key => operationalImpact += calculateStaticCO2(service, key));
      const totalImpact = embodiedImpact + operationalImpact;
      return {
        serviceId: service.serviceId, name: service.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
        inferenceCount: totalRequests,
        avgEmbodiedPerInference: totalRequests > 0 ? embodiedImpact / totalRequests : 0,
        avgOperationalPerInference: totalRequests > 0 ? operationalImpact / totalRequests : 0,
        avgTotalPerInference: totalRequests > 0 ? totalImpact / totalRequests : 0,
        totalEmbodiedImpact: embodiedImpact, totalOperationalImpact: operationalImpact, totalImpact: totalImpact,
      };
    });
    setCalculatedPerServiceMetrics(newPerServiceMetrics);

    const maxValuesPerDimension: Partial<Record<RadarDimensionKey, number>> = {};
    radarDimensions.forEach(dim => {
      let maxVal = 0;
      newPerServiceMetrics.forEach(serviceMetrics => {
        const val = serviceMetrics[dim.key as RadarDimensionKey] as number;
        if (val > maxVal) maxVal = val;
      });
      maxValuesPerDimension[dim.key as RadarDimensionKey] = maxVal > 0 ? maxVal : 1;
    });

    const transformedData: RadarDataPoint[] = radarDimensions.map(dim => {
      const dataPoint: RadarDataPoint = { dimension: dim.label };
      const dimensionMax = maxValuesPerDimension[dim.key as RadarDimensionKey] || 1;
      newPerServiceMetrics.forEach(sm => {
        const rawValue = sm[dim.key as RadarDimensionKey] as number;
        dataPoint[sm.serviceId] = dimensionMax > 0 ? (rawValue / dimensionMax) * 100 : 0;
      });
      return dataPoint;
    });
    setCalculatedRadarChartData(transformedData);

    const newChartConfig: ChartConfig = {};
    newPerServiceMetrics.forEach(sm => { newChartConfig[sm.serviceId] = { label: sm.name, color: sm.color }; });
    setCalculatedRadarChartConfig(newChartConfig);

  }, [uploadedServices, formState.inferenceCounts]);

  const handleGenerateChart = () => {
    setDisplayPerServiceMetrics(calculatedPerServiceMetrics);
    setDisplayRadarChartData(calculatedRadarChartData);
    setDisplayRadarChartConfig(calculatedRadarChartConfig);
    setIsChartGenerated(true);
  };

  const RadarCustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label: dimensionLabelFromAxis } = props;
    if (active && payload && payload.length) {
      const currentDimensionInfo = radarDimensions.find(dim => dim.label === dimensionLabelFromAxis);
      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-sm text-sm">
          <div className="mb-1 font-semibold">{dimensionLabelFromAxis}</div>
          {payload.map((entry) => {
            const serviceId = entry.name || '';
            // Use displayPerServiceMetrics for tooltip if chart is generated and has data
            const sourceMetrics = (isChartGenerated && displayPerServiceMetrics.length > 0)
                ? displayPerServiceMetrics
                : calculatedPerServiceMetrics; // Fallback to calculated if display isn't ready
            
            const originalServiceMetrics = sourceMetrics.find(sm => sm.serviceId === serviceId);
            const serviceConfigEntry = (isChartGenerated && Object.keys(displayRadarChartConfig).length > 0)
                ? displayRadarChartConfig[serviceId]
                : calculatedRadarChartConfig[serviceId];


            let displayValue: string = 'N/A';
            const unit: string = currentDimensionInfo?.unit || '';

            if (originalServiceMetrics && currentDimensionInfo) {
              const originalValue = originalServiceMetrics[currentDimensionInfo.key];
              if (typeof originalValue === 'number') {
                displayValue = originalValue.toFixed(currentDimensionInfo.key.includes('PerInference') ? 3 : 2);
              }
            }
            return (
              <div key={serviceId} className="grid grid-cols-[auto,1fr] items-center gap-x-2 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: serviceConfigEntry?.color || entry.color }} />
                  <span className="text-muted-foreground text-xs">{serviceConfigEntry?.label || serviceId}:</span>
                </div>
                <span className="font-semibold text-right tabular-nums text-xs">{displayValue} {unit}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto py-12 px-4 space-y-10">
      <Card className="shadow-xl border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold tracking-tight text-center">Compare AI Services - Radar Chart</CardTitle>
          <CardDescription className="text-center text-muted-foreground pt-1">
            Upload multiple AI Service JSONs and adjust inference counts to compare them across key sustainability dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="border-b border-border/60 pb-6">
            <Label htmlFor="multi-file-input" className="text-lg font-semibold block mb-3 text-center sm:text-left">
              Upload Service JSON Files
            </Label>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4">
              <Button onClick={() => multiFileInputRef.current?.click()} variant="outline" size="lg">
                <UploadCloud className="mr-2 h-5 w-5" /> Select Files
              </Button>
              <input type="file" accept=".json" ref={multiFileInputRef} multiple onChange={handleFilesChange} className="hidden" id="multi-file-input"/>
            </div>
          </div>

          {uploadedServices.length > 0 && (
            <div className="space-y-3 pt-2 border-b border-border/60 pb-6">
              <h3 className="text-md font-medium text-muted-foreground">Uploaded Services ({uploadedServices.length}):</h3>
              <ul className="space-y-1.5">
                {uploadedServices.map(service => (
                  <li key={service.serviceId} className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <span className="flex items-center text-sm">
                      <FileJson className="h-4 w-4 mr-2.5 text-primary flex-shrink-0" />
                      <span className="font-medium">{service.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({service.serviceId})</span>
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveService(service.serviceId)} aria-label={`Remove ${service.name}`}>
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uploadedServices.length > 0 && (
            <div className="space-y-6 pt-2"> {/* Removed border-t as previous section now has border-b */}
              <h3 className="text-xl font-semibold">Configuration Parameters</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedServices.map(service => (
                  <div key={service.serviceId} className="space-y-1.5">
                    <Label htmlFor={`inference-${service.serviceId}`} className="text-sm font-medium">
                      Inference Requests for <span className="text-primary">{service.name}</span>
                    </Label>
                    <Input id={`inference-${service.serviceId}`} type="number" min="1"
                           value={formState.inferenceCounts[service.serviceId] || DEFAULT_INFERENCE_COUNT}
                           onChange={(e) => handleInferenceCountChange(service.serviceId, e.target.value)}
                           className="w-full"/>
                  </div>
                ))}
              </div>
              <Button onClick={handleGenerateChart} size="lg" className="w-full sm:w-auto mt-6" disabled={uploadedServices.length < 1}>
                <BarChartBig className="mr-2 h-5 w-5" /> Generate Comparison Chart
              </Button>
            </div>
          )}
          {error && ( <Alert variant="destructive" className="mt-6"> <Info className="h-4 w-4" /> <AlertTitle>Error Occurred</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
        </CardContent>
      </Card>

      {isChartGenerated && displayPerServiceMetrics.length > 0 && displayRadarChartData.length > 0 && (
        <Card className="shadow-xl border-border/60">
          <CardHeader className="items-center pb-2">
            <CardTitle className="text-2xl">Service Comparison Radar</CardTitle>
            <CardDescription className="text-center text-muted-foreground pt-1">
              Normalized view of services. Larger values are further from the center. Tooltips show original values.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4 min-h-[450px] sm:min-h-[550px] md:min-h-[600px]">
            <ChartContainer
              config={displayRadarChartConfig}
              className="mx-auto aspect-square max-h-[400px] sm:max-h-[500px] md:max-h-[550px]"
            >
              <RadarChart data={displayRadarChartData} outerRadius="75%" /* Adjusted outerRadius */ >
                <ChartTooltip cursor={{ strokeDasharray: '3 3' }} content={<RadarCustomTooltip />} />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <PolarGrid radialLines={true} stroke="hsl(var(--border))" className="opacity-50"/>
                {displayPerServiceMetrics.map((service) => (
                  <Radar
                    key={service.serviceId} name={service.name} dataKey={service.serviceId}
                    stroke={service.color} fill={service.color} fillOpacity={0.15} /* Slightly more opacity */ strokeWidth={2.5} /* Slightly thicker stroke */
                  />
                ))}
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-xl border-border/60">
        <CardHeader> <CardTitle className="text-xl">Understanding the Comparison Metrics</CardTitle> </CardHeader>
        <CardContent className="space-y-4 text-sm">
            {radarDimensions.map(dim => (
                <div key={dim.key} className="border-b border-border/40 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0"> {/* Added mb */}
                    <p><strong className="text-primary font-semibold">{dim.label}</strong> <span className="text-xs text-muted-foreground">({dim.unit})</span>:</p>
                    <p className="text-muted-foreground pl-3 text-xs sm:text-sm pt-0.5">{getDimensionDescription(dim.key, dim.unit)}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function getDimensionDescription(key: RadarDimensionKey, unit: string): string {
    switch (key) {
        case 'inferenceCount':
            return `The total number of inference requests processed by the service. Unit: ${unit}.`;
        case 'avgEmbodiedPerInference':
            return `The average CO₂ equivalent (in kg) from hardware lifecycle stages (material extraction, manufacturing, transport, installation) attributed to each inference request. Unit: ${unit}.`;
        case 'avgOperationalPerInference':
            return `The average CO₂ equivalent (in kg) from software lifecycle stages (use case generation, data handling, model exploration, training, operation, end-of-life) attributed to each inference request. Unit: ${unit}.`;
        case 'avgTotalPerInference':
            return `The average total CO₂ equivalent (in kg) from all lifecycle stages (hardware and software) attributed to each inference request. Unit: ${unit}.`;
        case 'totalEmbodiedImpact':
            return `The sum of all CO₂ emissions (in kg) from the hardware lifecycle stages for the service. Unit: ${unit}.`;
        case 'totalOperationalImpact':
            return `The sum of all CO₂ emissions (in kg) from the software lifecycle stages for the service. Unit: ${unit}.`;
        case 'totalImpact':
            return `The sum of all CO₂ emissions (in kg) from all lifecycle stages (hardware and software) for the service. Unit: ${unit}.`;
        default:
            // This should ideally not be reached if RadarDimensionKey is exhaustive
            { const exhaustiveCheck: never = key;
            return `Description not available for key: ${exhaustiveCheck}`; }
    }
}