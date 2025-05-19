// src/components/charts/QuadrantChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, ReferenceLine, Cell
} from 'recharts';
import type { TooltipProps } from 'recharts';

export interface ComparisonMetricForChart {
  serviceId: string;
  name: string;
  totalRequests: number;
  avgCO2FullLifecycle: number;
  avgCO2ModelOperation: number;
  color?: string;
  x: number; // X-coordinate value for the chart
  y: number; // Y-coordinate value for the chart
}

interface QuadrantChartProps {
  data: ComparisonMetricForChart[];
  xLabel: string;
  yLabel: string;
  title: string;
  xThreshold: number;
  yThreshold: number;
}

// Define a type for the props received by the custom scatter shape
interface CustomScatterShapeProps {
  cx?: number;
  cy?: number;
  fill?: string;
  payload?: ComparisonMetricForChart;
}

// Custom Scatter point shape for bigger points (radius r={6})
const CustomScatterShape = (props: CustomScatterShapeProps) => {
  const { cx, cy, fill } = props;
  const validCx = typeof cx === 'number' ? cx : 0;
  const validCy = typeof cy === 'number' ? cy : 0;
  const validFill = fill || 'hsl(var(--primary))'; // Default fill
  return <circle cx={validCx} cy={validCy} r={6} stroke={validFill} fill={validFill} strokeWidth={1} />;
};

export function QuadrantChart({ data, xLabel, yLabel, title, xThreshold, yThreshold }: QuadrantChartProps) {
  // Basic domain calculation with some padding, less complex than the last version
  const xValues = data.length > 0 ? data.map(d => d.x) : [0];
  const yValues = data.length > 0 ? data.map(d => d.y) : [0];

  const xMinDomain = Math.min(0, ...xValues) * 0.95; // Start slightly before min or 0
  const xMaxDomain = Math.max(0.1, ...xValues) * 1.05; // Extend slightly beyond max
  const yMinDomain = Math.min(0, ...yValues) * 0.95;
  const yMaxDomain = Math.max(100, ...yValues) * 1.05;

  const finalXDomain: [number, number] = [xMinDomain, xMaxDomain];
  const finalYDomain: [number, number] = [yMinDomain, yMaxDomain];

  // Simplified quadrant text info
  const quadrantTexts = [
    { text: "Ideal", x: xThreshold / 2, y: yThreshold + (yMaxDomain - yThreshold) / 2, className: "fill-green-600 dark:fill-green-400" },
    { text: "Problem", x: xThreshold + (xMaxDomain - xThreshold) / 2, y: yThreshold + (yMaxDomain - yThreshold) / 2, className: "fill-red-600 dark:fill-red-400" },
    { text: "Low Priority", x: xThreshold / 2, y: yThreshold / 2, className: "fill-gray-500 dark:fill-gray-400" },
    { text: "Review", x: xThreshold + (xMaxDomain - xThreshold) / 2, y: yThreshold / 2, className: "fill-yellow-500 dark:fill-yellow-400" },
  ];

  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const item = payload[0].payload as ComparisonMetricForChart;
      return (
        <div className="rounded-lg border bg-background p-2.5 shadow-sm text-sm">
          <div className="font-bold text-primary mb-1">{item.name}</div>
          <div className="grid grid-cols-[auto,1fr] gap-x-2">
            <span className="text-muted-foreground">{xLabel}:</span>
            <span className="font-semibold text-right tabular-nums">{item.x.toFixed(3)} kg</span>
            <span className="text-muted-foreground">{yLabel}:</span>
            <span className="font-semibold text-right tabular-nums">{item.y}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-xl flex flex-col">
        <CardHeader><CardTitle className="text-center text-xl">{title}</CardTitle></CardHeader>
        <CardContent className="flex-1 p-4 sm:p-6 min-h-[500px] sm:min-h-[600px] flex items-center justify-center">
          <p className="text-muted-foreground">No data to display. Upload services and generate the matrix.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 sm:p-6 min-h-[500px] sm:min-h-[600px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, bottom: 30, left: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              unit=" kg"
              domain={finalXDomain} // Using simplified domain
              allowDataOverflow={true}
              label={{ value: xLabel, position: 'insideBottom', offset: -15, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(tick) => typeof tick === 'number' ? tick.toFixed(1) : String(tick)}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              domain={finalYDomain} // Using simplified domain
              allowDataOverflow={true}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: -25, style: { fill: 'hsl(var(--muted-foreground))', fontSize: '12px' } }}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(tick) => typeof tick === 'number' && tick >= 1000 ? `${(tick/1000).toFixed(1)}k` : String(tick)}
            />
            <ZAxis dataKey="name" name="Service" />

            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

            <ReferenceLine y={yThreshold} stroke="hsl(var(--foreground))" strokeWidth={1.5} strokeDasharray="5 5" />
            <ReferenceLine x={xThreshold} stroke="hsl(var(--foreground))" strokeWidth={1.5} strokeDasharray="5 5" />

            {/* Simplified Quadrant Text Labels */}
            {quadrantTexts.map((q) => (
                <text
                    key={q.text}
                    x={q.x} // Using pre-calculated approximate x
                    y={q.y} // Using pre-calculated approximate y
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`text-xs sm:text-sm font-semibold pointer-events-none ${q.className.replace('fill-', 'text-')}`} // Use text color for labels
                >
                    {q.text}
                </text>
            ))}

            <Scatter name="Services" data={data} shape={<CustomScatterShape />}>
              {data.map((entry) => (
                <Cell key={`cell-${entry.serviceId}`} fill={entry.color || 'hsl(var(--primary))'} />
              ))}
              <LabelList dataKey="name" position="top" offset={10} style={{ fontSize: '10px', fill: 'hsl(var(--foreground))' }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}