"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { CategoryBreakdown } from "@/components/category-breakdown"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  byCategoryAndPerson,
  byKind,
  cumulativeByDay,
  formatTick,
  topCategories,
} from "@/lib/chart-data"
import { formatAmount, OWNERS, type Spending } from "@/lib/spendings"

/** Only three categorical hues clear the colour-blindness floors together. */
const KIND_CONFIG = {
  Recurring: { label: "Recurring", color: "var(--viz-1)" },
  Food: { label: "Food", color: "var(--viz-2)" },
  "One-off": { label: "One-off", color: "var(--viz-3)" },
} satisfies ChartConfig

const PERSON_CONFIG = {
  jev: { label: "Jev", color: "var(--viz-1)" },
  olia: { label: "Olia", color: "var(--viz-2)" },
} satisfies ChartConfig

const DAY_CONFIG = {
  total: { label: "Spent so far", color: "var(--viz-1)" },
} satisfies ChartConfig

/** Ordinal ramp: the slices are ordered by size, so magnitude is the encoding. */
const SLICE_COLORS = [
  "var(--viz-seq-1)",
  "var(--viz-seq-2)",
  "var(--viz-seq-3)",
  "var(--viz-seq-4)",
  "var(--viz-seq-5)",
  "var(--viz-other)",
]

export function CategoryCharts({ spendings }: { spendings: Spending[] }) {
  if (spendings.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm font-medium">Nothing to chart yet</p>
          <p className="text-sm text-muted-foreground">
            Add a spending and it will show up here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="amounts" className="gap-6">
      {/* One row of four: the list has a fixed height, so wrapping to a
          second row leaves the extra tabs outside its background. */}
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="amounts">Amounts</TabsTrigger>
        <TabsTrigger value="kind">Type</TabsTrigger>
        <TabsTrigger value="person">Person</TabsTrigger>
        <TabsTrigger value="day">Day</TabsTrigger>
      </TabsList>

      <TabsContent value="amounts" className="min-w-0">
        <CategoryBreakdown spendings={spendings} />
      </TabsContent>

      <TabsContent value="kind" className="min-w-0 space-y-6">
        <KindDonut spendings={spendings} />
        <ShareDonut spendings={spendings} />
      </TabsContent>

      <TabsContent value="person" className="min-w-0">
        <PersonBars spendings={spendings} />
      </TabsContent>

      <TabsContent value="day" className="min-w-0">
        <DayArea spendings={spendings} />
      </TabsContent>
    </Tabs>
  )
}

function KindDonut({ spendings }: { spendings: Spending[] }) {
  const rows = byKind(spendings)
  const total = rows.reduce((sum, row) => sum + row.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Committed against the rest</CardTitle>
        <CardDescription>
          How much of {formatAmount(total)} is already spoken for
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={KIND_CONFIG} className="mx-auto h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel />}
            />
            <Pie
              data={rows}
              dataKey="total"
              nameKey="label"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {rows.map((row) => (
                <Cell
                  key={row.kind}
                  fill={
                    KIND_CONFIG[row.label as keyof typeof KIND_CONFIG].color
                  }
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          </PieChart>
        </ChartContainer>

        {/* The contrast relief: every slice is also named with its amount. */}
        <dl className="mt-4 grid gap-2 sm:grid-cols-3">
          {rows.map((row) => (
            <div key={row.kind} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{
                  background:
                    KIND_CONFIG[row.label as keyof typeof KIND_CONFIG].color,
                }}
              />
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="ml-auto font-medium tabular-nums">
                {formatAmount(row.total)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function ShareDonut({ spendings }: { spendings: Spending[] }) {
  const slices = topCategories(spendings)
  const total = slices.reduce((sum, slice) => sum + slice.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share of spending</CardTitle>
        <CardDescription>
          The five biggest categories, everything else pooled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="mx-auto h-64 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="label" hideLabel />}
            />
            <Pie
              data={slices}
              dataKey="total"
              nameKey="label"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {slices.map((slice, index) => (
                <Cell key={slice.label} fill={SLICE_COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          {slices.map((slice, index) => (
            <div key={slice.label} className="flex items-center gap-2 text-sm">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ background: SLICE_COLORS[index] }}
              />
              <dt className="text-muted-foreground">{slice.label}</dt>
              <dd className="ml-auto font-medium tabular-nums">
                {Math.round((slice.total / total) * 100)}%
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function PersonBars({ spendings }: { spendings: Spending[] }) {
  const rows = byCategoryAndPerson(spendings)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who spends on what</CardTitle>
        <CardDescription>
          Each category split between {OWNERS.map((o) => o.name).join(" and ")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={PERSON_CONFIG}
          className="w-full"
          style={{ height: Math.max(240, rows.length * 34) }}
        >
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatTick} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={96}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="jev" stackId="a" fill="var(--color-jev)" radius={2} />
            <Bar
              dataKey="olia"
              stackId="a"
              fill="var(--color-olia)"
              radius={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function DayArea({ spendings }: { spendings: Spending[] }) {
  const rows = cumulativeByDay(spendings)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spent so far through the month</CardTitle>
        <CardDescription>
          A running total by day, so the shape of the month shows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={DAY_CONFIG} className="h-64 w-full">
          <AreaChart data={rows} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tickFormatter={formatTick} tickLine={false} axisLine={false} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={(d) => `Day ${d}`} />}
            />
            <Area
              dataKey="total"
              stroke="var(--color-total)"
              fill="var(--color-total)"
              fillOpacity={0.15}
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
