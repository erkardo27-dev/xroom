
"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, ReferenceArea, ReferenceLine } from "recharts";
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
    color: "hsl(var(--muted-foreground))",
  },
  competitorRange: {
      label: "Зах зээлийн хязгаар",
      color: "hsl(var(--muted) / 0.5)"
  }
} satisfies ChartConfig;

export default function CompetitorPriceChart({ selectedRoom }: CompetitorPriceChartProps) {
  // Mock data generation based on selected room's price
  const competitorLow = Math.round(selectedRoom.price * 0.8 / 1000) * 1000;
  const competitorAvg = Math.round(selectedRoom.price * 1.1 / 1000) * 1000;
  const competitorHigh = Math.round(selectedRoom.price * 1.4 / 1000) * 1000;

  const chartData = [
    {
      label: selectedRoom.roomName,
      yourPrice: selectedRoom.price,
      competitorAvg: competitorAvg,
      competitorRange: [competitorLow, competitorHigh]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Зах зээлийн харьцуулалт</CardTitle>
        <CardDescription>
          <span className="font-bold text-primary">{selectedRoom.roomName}</span> өрөөний үнийг зах зээлийн үнэд харьцуулж харуулав.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                barSize={24}
            >
                <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} tick={false} />
                <XAxis type="number" dataKey="yourPrice" domain={[0, 'dataMax + 50000']} tickFormatter={(value) => `${(Number(value) / 1000)}k`} />
                <ChartTooltip
                    cursor={{ fill: 'transparent' }}
                    content={<ChartTooltipContent 
                      formatter={(value, name, props) => {
                          if (name === 'yourPrice') {
                              return [`${Number(value).toLocaleString()}₮`, "Таны үнэ"];
                          }
                          if (name === 'competitorAvg') {
                              return [`${Number(value).toLocaleString()}₮`, "Зах зээлийн дундаж"];
                          }
                          if (name === 'competitorRange' && Array.isArray(value)) {
                              return [`${value[0].toLocaleString()}₮ - ${value[1].toLocaleString()}₮`, "Зах зээлийн хязгаар"]
                          }
                          return [`${Number(value).toLocaleString()}₮`, name as string];
                      }}
                       labelFormatter={() => ''} // Hide default label
                       itemSorter={(item) => {
                            if (item.name === 'yourPrice') return -1;
                            if (item.name === 'competitorAvg') return 0;
                            return 1;
                       }}
                    />}
                />

                <ReferenceArea 
                    y={0} 
                    x1={competitorLow} 
                    x2={competitorHigh} 
                    stroke="transparent" 
                    fill="hsl(var(--muted) / 0.4)" 
                    ifOverflow="visible"
                    radius={8}
                />
                 <ReferenceLine 
                    x={competitorAvg} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="3 3"
                    ifOverflow="visible"
                 >
                    <Legend content={() => <div className="text-xs text-muted-foreground -mt-2">Дундаж</div>} position="insideTopRight" />
                 </ReferenceLine>

                 <Bar dataKey="yourPrice" name={chartConfig.yourPrice.label} fill="var(--color-yourPrice)" radius={5} />

            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
