"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { formatCompactINR, formatINR, YearlyComparisonPoint } from "@/utils/loanCalculations"

interface LoanComparisonChartProps {
  data: YearlyComparisonPoint[]
  tenureYears: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: YearlyComparisonPoint
    color: string
  }>
  label?: string | number
}

function CustomComparisonTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const point = payload[0].payload
    const diff = Math.max(0, point.standardBalance - point.acceleratedBalance)
    const isPaidOff = point.acceleratedBalance === 0

    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-md min-w-[210px] z-50 space-y-2">
        <div className="font-bold text-foreground border-b border-border/40 pb-1 flex items-center justify-between">
          <span>Year {label}</span>
          {isPaidOff && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
              Debt Free 🎉
            </span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-orange-500 shrink-0" />
              Standard Balance:
            </span>
            <span className="font-mono font-medium text-foreground">
              {formatINR(point.standardBalance)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              With Prepayment:
            </span>
            <span className={`font-mono font-medium ${isPaidOff ? "text-emerald-500 font-bold" : "text-foreground"}`}>
              {isPaidOff ? "₹0 (Paid Off)" : formatINR(point.acceleratedBalance)}
            </span>
          </div>

          {diff > 0 && !isPaidOff && (
            <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40 text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Principal Ahead By:</span>
              <span className="font-mono">{formatINR(diff)}</span>
            </div>
          )}

          {point.prepaymentPaidThisYear > 0 && (
            <div className="flex items-center justify-between gap-3 text-muted-foreground text-[11px]">
              <span>Prepayment in Yr {label}:</span>
              <span className="font-mono text-blue-500">
                +{formatINR(point.prepaymentPaidThisYear)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export function LoanComparisonChart({ data }: LoanComparisonChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Standard Gradient */}
              <linearGradient id="standardGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>

              {/* Accelerated Gradient */}
              <linearGradient id="acceleratedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />

            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={{ stroke: "var(--border)", opacity: 0.7 }}
              tickFormatter={(y) => `Yr ${y}`}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCompactINR(Number(v))}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              width={75}
            />

            <Tooltip content={<CustomComparisonTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
            />

            <Area
              type="monotone"
              dataKey="standardBalance"
              name="Standard Loan Balance"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#standardGradient)"
              activeDot={{ r: 5, stroke: "#f97316", strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="acceleratedBalance"
              name="With Prepayment Balance"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#acceleratedGradient)"
              activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 px-2 border-t border-border/40 mt-1">
        <span>📉 Loan Outstanding Balance over Tenure (Years)</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          Green line drop to ₹0 marks your early payoff!
        </span>
      </div>
    </div>
  )
}
