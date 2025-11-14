"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Percent, TrendingUp, Wallet, Activity, Target } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Separator } from "../ui/separator"

type StatCardProps = {
    title: string
    value: string
    description: string
    icon: React.ElementType
}

const StatCard = ({ title, value, description, icon: Icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
)

type StatsProps = {
    stats: {
        todaysRevenue: number;
        monthRevenue: number;
        occupancyToday: number;
        adr: number;
        revPar: number;
        occupancyMonth: number;
        dailyRevenue: { date: string; revenue: number }[];
    }
}

const chartConfig = {
    revenue: {
        label: "Орлого",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export default function DashboardStats({ stats }: StatsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} сая ₮`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)} мян. ₮`;
    }
    return `${value.toLocaleString()} ₮`;
  };

  return (
    <div className="mb-8 space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
                title="Сарын Дундаж Орлого (ADR)"
                value={`${formatCurrency(stats.adr)}`}
                description="Энэ сард нэг өрөөний дундаж орлого"
                icon={Activity}
            />
             <StatCard 
                title="Сарын Орлогот Өрөө (RevPAR)"
                value={`${formatCurrency(stats.revPar)}`}
                description="Нэг өрөө тутмаас олох боломжит орлого"
                icon={Target}
            />
            <StatCard 
                title="Сарын Ачаалал"
                value={`${stats.occupancyMonth.toFixed(1)}%`}
                description="Энэ сарын нийт өрөө ашиглалт"
                icon={Percent}
            />
        </div>
       <Separator />
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard 
                title="Өнөөдрийн орлого"
                value={`${stats.todaysRevenue.toLocaleString()} ₮`}
                description="Зөвхөн баталгаажсан орлого"
                icon={DollarSign}
            />
            <StatCard 
                title="Энэ сарын орлого"
                value={`${stats.monthRevenue.toLocaleString()} ₮`}
                description="Энэ сарын нийт орлого"
                icon={Wallet}
            />
            <StatCard 
                title="Ачаалал (өнөөдөр)"
                value={`${stats.occupancyToday.toFixed(1)}%`}
                description="Захиалгатай / Байрлаж буй"
                icon={Percent}
            />
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    Сүүлийн 7 хоногийн орлого
                </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart accessibilityLayer data={stats.dailyRevenue} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                         <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(-2)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatCurrency}
                        />
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                formatter={(value) => `${Number(value).toLocaleString()} ₮`} 
                                indicator="dot"
                            />}
                        />
                        <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}
