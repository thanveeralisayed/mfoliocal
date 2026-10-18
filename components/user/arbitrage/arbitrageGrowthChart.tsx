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
  ReferenceLine,
} from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { YearSnapshot, formatCompactINR, formatINR } from "@/utils/arbitrageCalculations"
import { TrendingUp } from "lucide-react"

interface ArbitrageGrowthChartProps {
  timeline: YearSnapshot[]
  debtFreeYear: number
  crossoverYear: number | null
  tenureYears: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: YearSnapshot
    color: string
  }>
  label?: string | number
}

function CustomArbitrageTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const point = payload[0].payload
    const delta = point.wealthDifference

    return (
      <div className="rounded-xl border border-border/80 bg-popover/95 p-3.5 text-xs shadow-xl backdrop-blur-md min-w-[240px] z-50 space-y-2.5">
        <div className="font-bold text-foreground border-b border-border/40 pb-1.5 flex items-center justify-between">
          <span>Timeline: Year {label}</span>
          {point.isDebtFree && (
            <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
              Debt-Free Plan Active
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          {/* Equity SIP */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Equity SIP Corpus:</span>
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(point.sipPortfolioValue)}
            </span>
          </div>

          {/* Prepayment Wealth */}
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-full bg-amber-500 shrink-0" />
              <span>Prepayment Wealth:</span>
            </span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {formatINR(point.prepayRedirectedCorpus)}
            </span>
          </div>

          {/* Remaining Loan Balance */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
            <span>Standard Loan Balance:</span>
            <span className="font-mono">{formatINR(point.sipLoanBalance)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>Prepaid Loan Balance:</span>
            <span className="font-mono">
              {point.prepayLoanBalance === 0 ? "₹0 (Cleared)" : formatINR(point.prepayLoanBalance)}
            </span>
          </div>

          {/* Net Wealth Delta */}
          <div className="pt-1.5 border-t border-border/40 flex items-center justify-between font-semibold">
            <span className="text-muted-foreground">Net Wealth Gap:</span>
            <span className={delta >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 font-bold"}>
              {delta >= 0 ? `+${formatINR(delta)} (SIP Leads)` : `${formatINR(delta)} (Prepay Leads)`}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function ArbitrageGrowthChart({
  timeline,
  debtFreeYear,
  crossoverYear,
  tenureYears,
}: ArbitrageGrowthChartProps) {
  const [viewMode, setViewMode] = React.useState<"wealth" | "crossover">("wealth")

  return (
    <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <span>Compounding Trajectory & Wealth Growth Curve</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Visualize how your net worth accumulates over {tenureYears} years under both strategies
            </CardDescription>
          </div>

          {/* View Toggle */}
          <div className="inline-flex bg-muted/60 p-1 rounded-lg border border-border/50 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setViewMode("wealth")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "wealth"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Wealth Curve
            </button>
            <button
              type="button"
              onClick={() => setViewMode("crossover")}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                viewMode === "crossover"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Loan Balance vs SIP
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="h-[340px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "wealth" ? (
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="sipWealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="prepayWealthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="year"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Y${val}`}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompactINR(val)}
                />
                <Tooltip content={<CustomArbitrageTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
                />

                {debtFreeYear > 0 && debtFreeYear <= tenureYears && (
                  <ReferenceLine
                    x={Math.ceil(debtFreeYear)}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Debt Free (Yr ${debtFreeYear})`,
                      fill: "#f59e0b",
                      fontSize: 10,
                      position: "top",
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="sipPortfolioValue"
                  name="Pathway B: Equity SIP Wealth"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sipWealthGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="prepayRedirectedCorpus"
                  name="Pathway A: Prepayment + Reinvested Wealth"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#prepayWealthGradient)"
                />
              </AreaChart>
            ) : (
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="sipCorpusGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="loanBalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis
                  dataKey="year"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Y${val}`}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCompactINR(val)}
                />
                <Tooltip content={<CustomArbitrageTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px", fontWeight: "600" }}
                />

                {crossoverYear && crossoverYear <= tenureYears && (
                  <ReferenceLine
                    x={Math.ceil(crossoverYear)}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{
                      value: `Crossover (Yr ${crossoverYear})`,
                      fill: "#10b981",
                      fontSize: 10,
                      position: "top",
                    }}
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="sipPortfolioValue"
                  name="Accumulated SIP Corpus"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sipCorpusGradient2)"
                />
                <Area
                  type="monotone"
                  dataKey="sipLoanBalance"
                  name="Standard Loan Remaining Balance"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  fillOpacity={1}
                  fill="url(#loanBalGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="prepayLoanBalance"
                  name="Prepaid Loan Remaining Balance"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="none"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Explainer Note */}
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between text-[11px] text-muted-foreground gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Green represents the compounding growth of your equity SIP investments.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>Amber shows wealth generated after prepayment clears debt early.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
