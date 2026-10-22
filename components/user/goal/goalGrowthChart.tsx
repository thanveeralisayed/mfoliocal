"use client"

import React from "react"
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { GoalYearlyPoint } from "@/utils/goalCalculations"
import { formatCompactCurrency, formatIndianCurrency } from "@/utils/sipMath"

interface GoalGrowthChartProps {
  data: GoalYearlyPoint[]
  targetAmount: number
  adjustForInflation: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: GoalYearlyPoint
    value?: number
    dataKey?: string
    color?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]?.payload
  if (!item) return null

  const invested = item.investedPrincipal || 0
  const corpus = item.compoundedValue || 0
  const gain = Math.max(0, corpus - invested)
  const target = item.targetInflationValue || 0

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-2.5 min-w-[220px]">
      <div className="font-bold text-foreground border-b border-border/50 pb-1.5 flex items-center justify-between">
        <span>Year {item.year} Milestone</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatIndianCurrency(item.monthlySip)}/mo
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-emerald-500 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Portfolio Value:
          </span>
          <span className="font-mono">{formatIndianCurrency(corpus)}</span>
        </div>

        <div className="flex items-center justify-between text-primary font-medium">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Total Invested:
          </span>
          <span className="font-mono">{formatIndianCurrency(invested)}</span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground text-[11px]">
          <span>Compounded Profit:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            +{formatIndianCurrency(gain)}
          </span>
        </div>

        <div className="flex items-center justify-between text-amber-500 text-[11px] pt-1 border-t border-border/40">
          <span>Target Curve:</span>
          <span className="font-mono">{formatIndianCurrency(target)}</span>
        </div>
      </div>
    </div>
  )
}

export function GoalGrowthChart({ data, adjustForInflation }: GoalGrowthChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-foreground">
          Wealth Compounding Trajectory
        </h3>
        <p className="text-xs text-muted-foreground">
          Visualizes your cumulative invested principal vs. total portfolio value over time
        </p>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Portfolio Compounding Gradient */}
              <linearGradient id="goalCorpusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Invested Principal Gradient */}
              <linearGradient id="goalInvestedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />

            <XAxis
              dataKey="year"
              tickFormatter={(y) => `Yr ${y}`}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
            />

            <YAxis
              tickFormatter={(v) => formatCompactCurrency(v)}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
              width={55}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
            />

            {/* Target Line / Inflated Target */}
            <Area
              type="monotone"
              dataKey="targetInflationValue"
              name={adjustForInflation ? "Target Goal (Inflated)" : "Target Goal"}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={2}
              fill="transparent"
            />

            {/* Compounded Value */}
            <Area
              type="monotone"
              dataKey="compoundedValue"
              name="Portfolio Value"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#goalCorpusGradient)"
            />

            {/* Total Invested */}
            <Area
              type="monotone"
              dataKey="investedPrincipal"
              name="Total Invested"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#goalInvestedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
