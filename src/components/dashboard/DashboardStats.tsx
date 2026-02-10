
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, Percent, TrendingUp, Wallet, Activity, Target, CalendarDays, BarChart4 } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import { Separator } from "../ui/separator"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { useState } from "react"
import { ChartDataPoint, TimeRange } from "@/app/dashboard/stats/StatsClient"

type Metric = 'revenue' | 'occupancy' | 'adr';

const chartConfigs: Record<Metric, ChartConfig> = {
    revenue: {
        revenue: { label: "Орлого", color: "hsl(var(--chart-1))" },
    },
    occupancy: {
        occupancy: { label: "Ачаалал", color: "hsl(var(--chart-2))" },
    },
    adr: {
        adr: { label: "ADR", color: "hsl(var(--chart-5))" },
    },
};

const metricDetails: Record<Metric, { title: string; icon: React.ElementType }> = {
    revenue: { title: "Нийт орлого", icon: TrendingUp },
    occupancy: { title: "Ачаалал", icon: BarChart4 },
    adr: { title: "Дундаж орлого (ADR)", icon: Activity },
};

type StatCardProps = {
    title: string
    value: string
    description?: string
    icon: React.ElementType
    className?: string
}

const StatCard = ({ title, value, description, icon: Icon, className }: StatCardProps) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
)

type MainMetricCardProps = {
    title: string;
    value: string;
    description: string;
    icon: React.ElementType;
}

const MainMetricCard = ({ title, value, description, icon: Icon }: MainMetricCardProps) => (
    <Card className="shadow-lg">
        <CardHeader>
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="text-3xl">{value}</CardTitle>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);


type StatsProps = {
    stats: {
        revPar: number;
        adr: number;
        occupancy: number;
        todaysRevenue: number;
        weekRevenue: number;
        monthRevenue: number;
        chartData: ChartDataPoint[];
    };
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
}


export default function DashboardStats({ stats, timeRange, setTimeRange }: StatsProps) {

    const [activeMetric, setActiveMetric] = useState<Metric>('revenue');
    const activeChartConfig = chartConfigs[activeMetric];
    const activeMetricDetail = metricDetails[activeMetric];

    const formatCurrency = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}₮`;

    const formatters: Record<Metric, (value: number) => string> = {
        revenue: formatCurrency,
        adr: formatCurrency,
        occupancy: (value) => `${value.toFixed(1)}%`
    };

    return (
        <div className="mb-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                <MainMetricCard
                    title="RevPAR"
                    value={`${formatCurrency(stats.revPar)}`}
                    description="Нэг өрөө тутмаас олох боломжит дундаж орлого. Буудлын ерөнхий гүйцэтгэлийг илтгэх хамгийн чухал үзүүлэлт."
                    icon={Target}
                />
                <MainMetricCard
                    title="ADR"
                    value={`${formatCurrency(stats.adr)}`}
                    description="Нэг шөнө зарагдсан өрөөний дундаж үнэ. Таны үнийн бодлогын үр дүнг харуулна."
                    icon={Activity}
                />
                <MainMetricCard
                    title="Ачаалал"
                    value={`${stats.occupancy.toFixed(1)}%`}
                    description="Нийт өрөөнүүдийн хэдэн хувь нь дүүрснийг харуулна. Маркетингийн үр дүнг илтгэнэ."
                    icon={Percent}
                />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                            <activeMetricDetail.icon className="h-5 w-5 text-muted-foreground" />
                            {activeMetricDetail.title}-н тойм
                        </CardTitle>
                        <CardDescription>
                            Сонгосон хугацааны өдөр тутмын гүйцэтгэлийг харна уу.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <ToggleGroup
                            type="single"
                            value={timeRange}
                            onValueChange={(value: TimeRange) => value && setTimeRange(value)}
                            className="h-9"
                        >
                            <ToggleGroupItem value="7d">7 хоног</ToggleGroupItem>
                            <ToggleGroupItem value="14d">14 хоног</ToggleGroupItem>
                            <ToggleGroupItem value="30d">30 хоног</ToggleGroupItem>
                        </ToggleGroup>
                        <Separator orientation="vertical" className="h-6" />
                        <ToggleGroup
                            type="single"
                            value={activeMetric}
                            onValueChange={(value: Metric) => value && setActiveMetric(value)}
                            className="h-9"
                        >
                            <ToggleGroupItem value="revenue">Орлого</ToggleGroupItem>
                            <ToggleGroupItem value="occupancy">Ачаалал</ToggleGroupItem>
                            <ToggleGroupItem value="adr">ADR</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                </CardHeader>
                <CardContent className="pl-2">
                    <ChartContainer config={activeChartConfig} className="h-[300px] w-full">
                        <AreaChart
                            data={stats.chartData}
                            margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id={`color-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={`var(--color-${activeMetric})`} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={`var(--color-${activeMetric})`} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) => value.slice(-2)}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={formatters[activeMetric]}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            />
                            <ChartTooltip
                                cursor={{ stroke: `hsl(var(--color-${activeMetric}))`, strokeWidth: 1.5, strokeDasharray: "3 3", fill: `hsl(var(--color-${activeMetric}) / 0.1)` }}
                                content={<ChartTooltipContent
                                    formatter={(value) => [formatters[activeMetric](value as number), activeMetricDetail.title]}
                                    indicator="dot"
                                />}
                            />
                            <Area
                                dataKey={activeMetric}
                                type="natural"
                                fill={`url(#color-${activeMetric})`}
                                stroke={`var(--color-${activeMetric})`}
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    strokeWidth: 1,
                                    fill: 'hsl(var(--background))'
                                }}
                                activeDot={{
                                    r: 6,
                                    strokeWidth: 2,
                                    stroke: 'hsl(var(--background))',
                                    fill: `var(--color-${activeMetric})`
                                }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <StatCard
                    title="Өнөөдрийн орлого"
                    value={formatCurrency(stats.todaysRevenue)}
                    icon={DollarSign}
                />
                <StatCard
                    title="Энэ долоо хоногийн орлого"
                    value={formatCurrency(stats.weekRevenue)}
                    icon={CalendarDays}
                />
                <StatCard
                    title="Энэ сарын орлого"
                    value={formatCurrency(stats.monthRevenue)}
                    icon={Wallet}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart4 className="h-5 w-5 text-muted-foreground" />
                        Орлого болон Ачааллын харьцаа
                    </CardTitle>
                    <CardDescription>
                        Үнийн бодлого болон өрөө дүүргэлт хоорондын хамаарлыг харьцуулан харна уу.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={{
                            revenue: { label: "Орлого", color: "hsl(var(--chart-1))" },
                            occupancy: { label: "Ачаалал (%)", color: "hsl(var(--chart-2))" }
                        }}
                        className="h-[350px] w-full"
                    >
                        <AreaChart
                            data={stats.chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                            />
                            <YAxis yAxisId="left" hide />
                            <YAxis yAxisId="right" orientation="right" hide />
                            <ChartTooltip
                                cursor={{ strokeDasharray: "3 3" }}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        formatter={(value, name) => [
                                            name === 'revenue' ? formatCurrency(value as number) : `${(value as number).toFixed(1)}%`,
                                            name === 'revenue' ? 'Орлого' : 'Ачаалал'
                                        ]}
                                    />
                                }
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(var(--chart-1))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                                name="revenue"
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="occupancy"
                                stroke="hsl(var(--chart-2))"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorOcc)"
                                name="occupancy"
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
