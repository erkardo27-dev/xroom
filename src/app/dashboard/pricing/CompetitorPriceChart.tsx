
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, Rectangle } from "recharts";
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
  const competitorLow = Math.round(selectedRoom.price * 0.8 / 1000) * 1000;
  const competitorAvg = Math.round(selectedRoom.price * 1.1 / 1000) * 1000;
  const competitorHigh = Math.round(selectedRoom.price * 1.4 / 1000) * 1000;

  const chartData = [
    {
      label: "Таны үнэ",
      value: selectedRoom.price,
      fill: "var(--color-yourPrice)"
    },
    {
      label: "Зах зээлийн үнэ",
      value: [competitorLow, competitorAvg, competitorHigh],
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
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
                <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tickMargin={10} className="text-sm" />
                <XAxis type="number" hide />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                    content={<ChartTooltipContent 
                      formatter={(value) => Array.isArray(value) ? value.map(v => `${Number(v).toLocaleString()}₮`).join(' - ') : `${Number(value).toLocaleString()}₮`}
                    />}
                />
                 <Legend verticalAlign="top" align="right" />

                <Bar dataKey="value" radius={5}>
                    {chartData.map((d, i) => {
                        if (d.label === "Таны үнэ") {
                             return <Rectangle key={d.label} fill={chartConfig.yourPrice.color} />;
                        }
                        // For competitor prices
                         return (
                            <Rectangle key={d.label} fill="transparent" /* We color in the background */ />
                        );
                    })}
                </Bar>
                 <Bar dataKey="value[2]" name={chartConfig.competitorHigh.label} stackId="a" fill={chartConfig.competitorHigh.color} radius={5} />
                 <Bar dataKey="value[1]" name={chartConfig.competitorAvg.label} stackId="a" fill={chartConfig.competitorAvg.color} radius={5}/>
                 <Bar dataKey="value[0]" name={chartConfig.competitorLow.label} stackId="a" fill={chartConfig.competitorLow.color} radius={5}/>

                 <Bar dataKey="value" name={chartConfig.yourPrice.label} barSize={32} fill={chartConfig.yourPrice.color} radius={5} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
