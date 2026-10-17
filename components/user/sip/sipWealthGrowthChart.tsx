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
} from "recharts"
import { formatCompactCurrency, formatIndianCurrency } from "@/utils/sipMath"

export interface WealthGrowthPoint {
  date: string
  totalInvested: number
  totalValue: number
  totalGain: number
  gainPercent?: number
  [key: string]: string | number | undefined
}

interface SipWealthGrowthChartProps {
  data: WealthGrowthPoint[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: WealthGrowthPoint
    value?: number
    dataKey?: string
  }>
  label?: string
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]?.payload
  if (!item) return null

  const invested = item.totalInvested || 0
  const value = item.totalValue || 0
  const gain = value - invested
  const gainPercent = invested > 0 ? (gain / invested) * 100 : 0
  const isPositive = gain >= 0

  return (
    <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-2 min-w-[200px]">
      <div className="font-semibold text-foreground border-b border-border/60 pb-1.5 flex items-center justify-between">
        <span>{label}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          }`}
        >
          {isPositive ? "+" : ""}
          {gainPercent.toFixed(2)}%
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-indigo-500 inline-block" />
            Portfolio Value:
          </span>
          <span className="font-bold text-foreground">{formatIndianCurrency(value)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-slate-400 inline-block" />
            Invested Capital:
          </span>
          <span className="font-semibold text-foreground">{formatIndianCurrency(invested)}</span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40 font-medium">
          <span className="text-muted-foreground">Compounding Profit:</span>
          <span className={isPositive ? "text-emerald-500 font-bold" : "text-rose-500 font-bold"}>
            {isPositive ? "+" : ""}
            {formatIndianCurrency(gain)}
          </span>
        </div>
      </div>
    </div>
  )
}

export const SipWealthGrowthChart: React.FC<SipWealthGrowthChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
        No simulation data available.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Chart Legend Badges */}
      <div className="flex items-center justify-end flex-wrap gap-4 text-xs font-medium px-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-indigo-500 shadow-xs" />
          <span className="text-foreground">Portfolio Valuation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-slate-400 border border-slate-500/40" />
          <span className="text-muted-foreground">Invested Capital</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-500/50" />
          <span className="text-emerald-500">Compounding Spread</span>
        </div>
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="valuationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                <stop offset="60%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#64748B" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={28}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatCompactCurrency(v)}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Total Invested Capital Baseline */}
            <Area
              type="monotone"
              dataKey="totalInvested"
              stroke="#64748B"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#investedGradient)"
              connectNulls={true}
              activeDot={{ r: 4, strokeWidth: 1, fill: "#64748B" }}
            />

            {/* Market Valuation Area */}
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#valuationGradient)"
              connectNulls={true}
              activeDot={{ r: 6, strokeWidth: 2, fill: "#6366F1", stroke: "#FFFFFF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
