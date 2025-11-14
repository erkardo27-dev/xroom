
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Room } from "@/lib/data";

type CompetitorPriceChartProps = {
  selectedRoom: Room;
};

const chartConfig = {
  yourPrice: {
    label: "Таны үнэ",
    color: "hsl(var(--primary))",
  },
  competitorLow: {
    label: "Зах зээлийн доод үнэ",
    color: "hsl(var(--chart-2))",
  },
  competitorAvg: {
    label: "Зах зээлийн дундаж",
    color: "hsl(var(--chart-4))",
  },
  competitorHigh: {
    label: "Зах зээлийн дээд үнэ",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export default function CompetitorPriceChart({ selectedRoom }: CompetitorPriceChartProps) {
  // Mock data generation based on selected room's price
  const chartData = [
    {
      label: "Харьцуулалт",
      yourPrice: selectedRoom.price,
      competitorLow: Math.round(selectedRoom.price * 0.8 / 1000) * 1000,
      competitorAvg: Math.round(selectedRoom.price * 1.1 / 1000) * 1000,
      competitorHigh: Math.round(selectedRoom.price * 1.4 / 1000) * 1000,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зах зээлийн харьцуулалт</CardTitle>
        <CardDescription>
          Сонгосон <span className="font-bold text-primary">{selectedRoom.roomName}</span> өрөөний үнийг зах зээлийн үнэд харьцуулж харуулав.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={false}
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value) => `${Number(value).toLocaleString()}₮`} 
              />}
            />
             <Legend verticalAlign="top" height={40} />
            <Bar dataKey="yourPrice" name={chartConfig.yourPrice.label} fill="var(--color-yourPrice)" radius={4} barSize={24} />
            <Bar dataKey="competitorAvg" name={chartConfig.competitorAvg.label} fill="var(--color-competitorAvg)" radius={4} barSize={24} />
            <Bar dataKey="competitorLow" name={chartConfig.competitorLow.label} fill="var(--color-competitorLow)" radius={4} barSize={24} />
            <Bar dataKey="competitorHigh" name={chartConfig.competitorHigh.label} fill="var(--color-competitorHigh)" radius={4} barSize={24} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
