
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, LegendProps, Tooltip } from "recharts";
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
    label: "Зах зээл (хямд)",
    color: "hsl(var(--muted))",
  },
  competitorMid: {
    label: "Зах зээл (дундаж)",
    color: "hsl(var(--secondary))",
  },
  competitorHigh: {
      label: "Зах зээл (өндөр)",
      color: "hsl(var(--muted))"
  }
} satisfies ChartConfig;

const CustomLegend = (props: LegendProps) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <ul className="flex items-center justify-end gap-x-4 gap-y-1 text-sm text-muted-foreground flex-wrap">
      {payload.map((entry, index) => {
        const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
        if (!config || (entry.dataKey as string).startsWith('competitor')) return null;
        return (
          <li key={`item-${index}`} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {config.label}
          </li>
        );
      })}
       <li className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-muted" />
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                <span className="w-2.5 h-2.5 rounded-full bg-muted" />
            </div>
            Зах зээлийн хүрээ
        </li>
    </ul>
  );
}

export default function CompetitorPriceChart({ selectedRoom }: CompetitorPriceChartProps) {
  const yourPrice = selectedRoom.price;
  const competitorLow = Math.round(yourPrice * 0.8 / 1000) * 1000;
  const competitorAvg = Math.round(yourPrice * 1.1 / 1000) * 1000;
  const competitorHigh = Math.round(yourPrice * 1.4 / 1000) * 1000;

  const chartData = [
    {
      name: selectedRoom.roomName,
      yourPrice: yourPrice,
      competitorLow: competitorLow,
      competitorMid: competitorAvg - competitorLow,
      competitorHigh: competitorHigh - competitorAvg,
    }
  ];

  const formatCurrency = (value: number) => `${(value / 1000)}k`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зах зээлийн харьцуулалт</CardTitle>
        <CardDescription>
          <span className="font-bold text-primary">{selectedRoom.roomName}</span> өрөөний үнэ зах зээлд.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis 
                    type="number" 
                    tickFormatter={formatCurrency}
                    domain={[0, competitorHigh * 1.1]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis dataKey="name" type="category" tick={false} axisLine={false} />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                    content={
                        <ChartTooltipContent 
                          hideIndicator
                          formatter={(value, name) => {
                             if (name === 'yourPrice') {
                                return [`${Number(value).toLocaleString()}₮`, 'Таны үнэ'];
                            }
                            return null;
                          }}
                          payloadTransformer={(payload) => {
                                const yourPriceItem = payload.find(p => p.dataKey === 'yourPrice');
                                const low = payload.find(p => p.dataKey === 'competitorLow')?.value as number || 0;
                                const mid = payload.find(p => p.dataKey === 'competitorMid')?.value as number || 0;
                                const high = payload.find(p => p.dataKey === 'competitorHigh')?.value as number || 0;
                                
                                const avg = low + mid;
                                const totalHigh = avg + high;

                                let newPayload = [];
                                if (yourPriceItem) newPayload.push({
                                    ...yourPriceItem,
                                    dataKey: 'yourPrice',
                                    name: 'Таны үнэ',
                                    color: 'hsl(var(--primary))'
                                });
                                newPayload.push({
                                    ...payload[0],
                                    dataKey: 'competitorAvg',
                                    name: 'Зах зээлийн дундаж',
                                    value: avg.toLocaleString() + '₮',
                                    color: 'hsl(var(--secondary-foreground))'
                                });
                                newPayload.push({
                                    ...payload[0],
                                    dataKey: 'competitorRange',
                                    name: 'Зах зээлийн хязгаар',
                                    value: `${low.toLocaleString()}₮ - ${totalHigh.toLocaleString()}₮`,
                                    color: 'hsl(var(--muted-foreground))'
                                });
                                
                                return newPayload;
                          }}
                        />
                    }
                />
                <Legend content={<CustomLegend />} verticalAlign="top" wrapperStyle={{ paddingBottom: '16px' }} />
                
                <Bar dataKey="yourPrice" name={chartConfig.yourPrice.label} fill="var(--color-yourPrice)" radius={5} barSize={20} />
                 <Bar dataKey="competitorLow" stackId="a" fill="var(--color-competitorLow)" barSize={32} radius={[5, 0, 0, 5]} />
                <Bar dataKey="competitorMid" stackId="a" fill="var(--color-competitorMid)" barSize={32} />
                <Bar dataKey="competitorHigh" stackId="a" fill="var(--color-competitorHigh)" barSize={32} radius={[0, 5, 5, 0]} />

            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
