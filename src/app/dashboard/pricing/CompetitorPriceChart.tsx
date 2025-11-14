
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, CartesianGrid, LegendProps } from "recharts";
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
    color: "hsl(var(--muted) / 0.5)",
  },
  competitorMid: {
    label: "Зах зээл (дундаж)",
    color: "hsl(var(--muted) / 0.7)",
  },
  competitorHigh: {
      label: "Зах зээл (өндөр)",
      color: "hsl(var(--muted) / 0.9)"
  }
} satisfies ChartConfig;

const CustomLegend = (props: LegendProps) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <ul className="flex items-center justify-end gap-x-4 gap-y-1 text-sm text-muted-foreground flex-wrap">
      {payload.map((entry, index) => {
        const config = chartConfig[entry.dataKey as keyof typeof chartConfig];
        if (!config) return null;
        return (
          <li key={`item-${index}`} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            {config.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function CompetitorPriceChart({ selectedRoom }: CompetitorPriceChartProps) {
  // Mock data generation based on selected room's price
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
                margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--muted) / 0.5)" />
                <XAxis type="number" dataKey="yourPrice" tickFormatter={(value) => `${(Number(value) / 1000)}k`} />
                <YAxis dataKey="name" type="category" tick={false} axisLine={false} />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                    content={<ChartTooltipContent 
                      formatter={(value, name) => {
                          if (name === 'yourPrice') {
                              return [`${Number(value).toLocaleString()}₮`, chartConfig.yourPrice.label];
                          }
                           if (name === 'competitorLow') {
                              return [`${Number(value).toLocaleString()}₮`, chartConfig.competitorLow.label];
                          }
                          return null
                      }}
                      payloadTransformer={(payload) => {
                          const yourPrice = payload.find(p => p.dataKey === 'yourPrice');
                          const low = payload.find(p => p.dataKey === 'competitorLow')?.value as number || 0;
                          const mid = payload.find(p => p.dataKey === 'competitorMid')?.value as number || 0;
                          const high = payload.find(p => p.dataKey === 'competitorHigh')?.value as number || 0;
                          const avg = low + mid;
                          const range = `${low.toLocaleString()}₮ - ${(avg + high).toLocaleString()}₮`;

                          let newPayload = [];
                          if (yourPrice) newPayload.push(yourPrice);
                          newPayload.push({
                              ...payload[0],
                              dataKey: 'competitorAvg',
                              name: 'Зах зээлийн дундаж',
                              value: avg,
                              color: 'hsl(var(--muted-foreground))'
                          });
                           newPayload.push({
                              ...payload[0],
                              dataKey: 'competitorRange',
                              name: 'Зах зээлийн хязгаар',
                              value: range,
                              color: 'hsl(var(--muted))'
                          });
                          
                          return newPayload;
                      }}
                    />}
                />
                <Legend content={<CustomLegend />} verticalAlign="top" wrapperStyle={{ paddingBottom: '16px' }} />
                
                <Bar dataKey="yourPrice" name={chartConfig.yourPrice.label} fill="var(--color-yourPrice)" radius={5} barSize={20} />
                 <Bar dataKey="competitorLow" stackId="a" fill="var(--color-competitorLow)" barSize={20} radius={[5, 0, 0, 5]} />
                <Bar dataKey="competitorMid" stackId="a" fill="var(--color-competitorMid)" barSize={20} />
                <Bar dataKey="competitorHigh" stackId="a" fill="var(--color-competitorHigh)" barSize={20} radius={[0, 5, 5, 0]} />

            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
