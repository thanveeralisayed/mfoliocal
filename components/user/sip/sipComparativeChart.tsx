"use client"

import React, { useState } from "react"
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Returns } from "@/models/returns"
import { formatCompactCurrency, formatIndianCurrency } from "@/utils/sipMath"

interface SipComparativeChartProps {
  funds: Returns[]
  combinedData: Record<string, string | number>[]
}

const PALETTE = [
  "#10B981", // Emerald
  "#3B82F6", // Royal Blue
  "#8B5CF6", // Purple/Violet
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
]

export const SipComparativeChart: React.FC<SipComparativeChartProps> = ({ funds, combinedData }) => {
  const [activeMetric, setActiveMetric] = useState<"value" | "percentage">("percentage")
  const [highlightedFund, setHighlightedFund] = useState<string | null>(null)

  if (!funds || funds.length === 0 || !combinedData || combinedData.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-sm text-muted-foreground">
        Select schemes and calculate to compare performances.
      </div>
    )
  }

  // Pre-map fund color assignments
  const fundConfigs = funds.map((f, i) => ({
    name: f.schemeName,
    code: f.schemeCode,
    color: PALETTE[i % PALETTE.length],
    xirr: f.xirr || 0,
    growth: f.growthPercentage || 0,
    valueKey: f.schemeName,
    pctKey: `${f.schemeName}__pct`,
  }))

  return (
    <div className="space-y-3">
      {/* View Switcher: Percentage Growth vs Rupee Valuation */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-muted-foreground font-medium">
          Comparative outperformance across <span className="font-semibold text-foreground">{funds.length}</span> schemes
        </span>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveMetric("percentage")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeMetric === "percentage"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Growth Rate (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric("value")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeMetric === "value"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Valuation (₹)
          </button>
        </div>
      </div>

      <div className="w-full h-80 sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
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
              tickFormatter={(v) => (activeMetric === "percentage" ? `${Math.round(v)}%` : formatCompactCurrency(v))}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-muted-foreground"
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null
                return (
                  <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-2 min-w-[220px]">
                    <div className="font-semibold text-foreground border-b border-border/60 pb-1.5">
                      {label}
                    </div>
                    <div className="space-y-1.5">
                      {fundConfigs.map((cfg) => {
                        const targetKey = activeMetric === "percentage" ? cfg.pctKey : cfg.valueKey
                        const entry = payload.find((p) => p.dataKey === targetKey)
                        const val = entry ? entry.value : undefined
                        if (val === undefined || val === null) return null

                        return (
                          <div key={cfg.code} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[140px]">
                              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                              <span className="truncate">{cfg.name}</span>
                            </span>
                            <span className="font-bold text-foreground">
                              {activeMetric === "percentage"
                                ? `${typeof val === "number" ? val.toFixed(2) : val}%`
                                : formatIndianCurrency(Number(val))}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }}
            />

            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px" }}
              content={() => (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {fundConfigs.map((cfg) => (
                    <button
                      key={cfg.code}
                      type="button"
                      onMouseEnter={() => setHighlightedFund(cfg.name)}
                      onMouseLeave={() => setHighlightedFund(null)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                        highlightedFund === null || highlightedFund === cfg.name
                          ? "opacity-100"
                          : "opacity-40"
                      }`}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                      <span className="text-foreground max-w-[120px] sm:max-w-[180px] truncate">{cfg.name}</span>
                      <span className="text-muted-foreground font-mono">
                        ({cfg.xirr > 0 ? `${cfg.xirr}%` : `${cfg.growth.toFixed(1)}%`})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            />

            {fundConfigs.map((cfg) => {
              const dataKey = activeMetric === "percentage" ? cfg.pctKey : cfg.valueKey
              const isDimmed = highlightedFund !== null && highlightedFund !== cfg.name

              return (
                <Line
                  key={cfg.code}
                  type="monotone"
                  dataKey={dataKey}
                  name={cfg.name}
                  stroke={cfg.color}
                  strokeWidth={highlightedFund === cfg.name ? 3 : 2}
                  strokeOpacity={isDimmed ? 0.25 : 1}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 1, fill: cfg.color, stroke: "#FFFFFF" }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
