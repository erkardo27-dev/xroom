
"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";
import { useMemo, useEffect, useState } from "react";

const chartConfig = {
  occupancy: {
    label: "Ачаалал (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Mock data generation
const generateForecastData = () => {
  const data = [];
  const today = new Date();
  let lastOccupancy = Math.random() * 30 + 40; // Start between 40-70%

  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    let trend = 0;
    // Higher occupancy on weekends
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Fri, Sat
      trend = Math.random() * 10 + 5;
    } else { // Weekdays
      trend = Math.random() * 10 - 7;
    }

    let newOccupancy = lastOccupancy + trend;
    newOccupancy = Math.max(20, Math.min(95, newOccupancy)); // Clamp between 20% and 95%
    lastOccupancy = newOccupancy;

    data.push({
      date: date,
      day: i + 1,
      occupancy: parseFloat(newOccupancy.toFixed(1)),
    });
  }

  // Aggregate by week
  const weeklyData = [];
  for (let i = 0; i < 4; i++) {
    const weekSlice = data.slice(i * 7, (i + 1) * 7);
    const avgOccupancy = weekSlice.reduce((sum, d) => sum + d.occupancy, 0) / weekSlice.length;
    weeklyData.push({
      date: `Дол ${i + 1}`,
      occupancy: parseFloat(avgOccupancy.toFixed(1)),
    })
  }

  return weeklyData;
};


export default function OccupancyForecastChart() {

  const [chartData, setChartData] = useState<{date: string, occupancy: number}[]>([]);

  useEffect(() => {
    setChartData(generateForecastData());
  }, [])
  
  const averageOccupancy = useMemo(() => {
    if (chartData.length === 0) return 0;
    const total = chartData.reduce((sum, item) => sum + item.occupancy, 0);
    return total / chartData.length;
  }, [chartData]);
  
  const aiInsight = useMemo(() => {
    if (averageOccupancy > 75) {
        return "Ирэх сард ачаалал өндөр байх төлөвтэй. Үнээ оновчтой тохируулж, орлогоо нэмэгдүүлээрэй.";
    } else if (averageOccupancy < 50) {
        return "Ирэх сард ачаалал бага зэрэг буурах төлөвтэй байна. Хямдралтай багц санал болгох, сурталчилгаа хийхийг зөвлөж байна.";
    } else {
        return "Ирэх сард ачаалал ердийн түвшинд байх төлөвтэй. Онцгой үйл явдлуудыг ашиглан маркетингаа идэвхжүүлээрэй.";
    }
  }, [averageOccupancy]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Ирэх 4 долоо хоногийн ачааллын таамаг</CardTitle>
        <CardDescription>
          Түүхэн мэдээлэл болон зах зээлийн нөхцөл байдалд үндэслэсэн таамаглал.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
                <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-occupancy)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-occupancy)" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted) / 0.5)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1.5, strokeDasharray: "3 3" }}
              content={<ChartTooltipContent 
                formatter={(value) => [`${value}%`, "Ачаалал"]}
                indicator="dot"
              />}
            />
            <Area
              dataKey="occupancy"
              type="natural"
              fill="url(#colorOccupancy)"
              stroke="var(--color-occupancy)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: 'hsl(var(--background))',
                fill: 'var(--color-occupancy)'
              }}
            />
          </AreaChart>
        </ChartContainer>
         <Alert variant="default" className="bg-accent/50 border-accent/30">
            <Lightbulb className="h-5 w-5 text-accent-foreground" />
            <AlertTitle className="font-semibold text-accent-foreground">Ухаалаг зөвлөгөө</AlertTitle>
            <AlertDescription className="text-muted-foreground">
               {aiInsight}
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
