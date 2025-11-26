
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, ReferenceArea, Tooltip } from "recharts";
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
  competitorAvg: {
    label: "Зах зээлийн дундаж",
    color: "hsl(var(--secondary-foreground) / 0.5)",
  },
} satisfies ChartConfig;


export default function CompetitorPriceChart({ selectedRoom }: CompetitorPriceChartProps) {
  const yourPrice = selectedRoom.price;
  const competitorLow = Math.round(yourPrice * 0.8 / 1000) * 1000;
  const competitorAvg = Math.round(yourPrice * 1.1 / 1000) * 1000;
  const competitorHigh = Math.round(yourPrice * 1.4 / 1000) * 1000;

  const chartData = [
    {
      name: "Таны үнэ",
      value: yourPrice,
      fill: 'var(--color-yourPrice)'
    },
    {
      name: "Зах зээл",
      value: competitorAvg,
      fill: 'var(--color-competitorAvg)'
    }
  ];

  const formatCurrency = (value: number) => `${(value / 1000)}k`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зах зээлийн харьцуулалт</CardTitle>
        <CardDescription>
           <span className="font-bold text-primary">{selectedRoom.roomName}</span> өрөөний үнэ, зах зээлийн дундажтай харьцуулахад.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                barGap={10}
                barSize={35}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis 
                    type="number" 
                    dataKey="value"
                    tickFormatter={formatCurrency}
                    domain={[0, 'dataMax + 100000']}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 13 }}
                    width={80}
                />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    content={
                        <ChartTooltipContent 
                          hideLabel
                          formatter={(value, name, props) => {
                            if (props.payload.name === 'Таны үнэ') {
                                return [`${Number(value).toLocaleString()}₮`, 'Таны үнэ'];
                            }
                             if (props.payload.name === 'Зах зээл') {
                                return [
                                  <>
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            <span className="font-semibold">{competitorAvg.toLocaleString()}₮</span>
                                            <span className="text-muted-foreground ml-2">Зах зээлийн дундаж</span>
                                        </div>
                                        <div className="text-xs">
                                             <span className="font-semibold">{competitorLow.toLocaleString()}₮ - {competitorHigh.toLocaleString()}₮</span>
                                            <span className="text-muted-foreground ml-2">Зах зээлийн хүрээ</span>
                                        </div>
                                    </div>
                                  </>
                                ];
                            }
                            return null;
                          }}
                        />
                    }
                />
               
                <ReferenceArea x1={competitorLow} x2={competitorHigh} stroke="none" fill="hsl(var(--muted) / 0.3)" ifOverflow="visible" />
                <Bar dataKey="value" radius={5} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
