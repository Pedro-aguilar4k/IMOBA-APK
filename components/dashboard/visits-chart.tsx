'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  visitas: {
    label: 'Visitas',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface VisitsChartProps {
  data: { date: string; label: string; visitas: number }[]
}

export function VisitsChart({ data }: VisitsChartProps) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillVisitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-visitas)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-visitas)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={28}
          allowDecimals={false}
          fontSize={11}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="visitas"
          type="monotone"
          fill="url(#fillVisitas)"
          stroke="var(--color-visitas)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
