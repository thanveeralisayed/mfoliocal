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
import { TransferYearPoint } from "@/utils/balanceTransferCalculations"
import { formatCompactCurrency, formatIndianCurrency } from "@/utils/sipMath"

interface TransferComparisonChartProps {
  data: TransferYearPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: TransferYearPoint
    value?: number
    dataKey?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-md p-3.5 shadow-xl text-xs space-y-2.5 min-w-[220px]">
      <div className="font-bold text-foreground border-b border-border/50 pb-1.5 flex items-center justify-between">
        <span>Year {item.year} Comparison</span>
        {item.isBreakEvenAchieved && (
          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
            Break-Even Passed
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-slate-400" />
            Current Loan:
          </span>
          <span className="font-mono">{formatIndianCurrency(item.currentLoanBalance)}</span>
        </div>

        <div className="flex items-center justify-between text-primary font-medium">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Reduced EMI:
          </span>
          <span className="font-mono">{formatIndianCurrency(item.reducedEmiBalance)}</span>
        </div>

        <div className="flex items-center justify-between text-emerald-500 font-bold">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            Slashed Tenure:
          </span>
          <span className="font-mono">{formatIndianCurrency(item.slashedTenureBalance)}</span>
        </div>

        <div className="flex items-center justify-between text-muted-foreground text-[11px] pt-1 border-t border-border/40">
          <span>Cumulative Savings:</span>
          <span className="font-mono text-foreground font-semibold">
            {formatIndianCurrency(item.cumulativeSavings)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TransferComparisonChart({ data }: TransferComparisonChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-base font-bold text-foreground">
          Outstanding Principal Payoff Trajectory
        </h3>
        <p className="text-xs text-muted-foreground">
          Watch how switching bank rates flattens your debt curve and accelerates payoff
        </p>
      </div>

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="currentBalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
              </linearGradient>

              <linearGradient id="slashTenureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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

            {/* Current Loan Balance */}
            <Area
              type="monotone"
              dataKey="currentLoanBalance"
              name="Existing Loan"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="url(#currentBalGrad)"
            />

            {/* Reduced EMI Balance */}
            <Area
              type="monotone"
              dataKey="reducedEmiBalance"
              name="Strategy A (Reduced EMI)"
              stroke="#6366f1"
              strokeWidth={2}
              fill="transparent"
            />

            {/* Slashed Tenure Balance */}
            <Area
              type="monotone"
              dataKey="slashedTenureBalance"
              name="Strategy B (Slashed Tenure)"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#slashTenureGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
