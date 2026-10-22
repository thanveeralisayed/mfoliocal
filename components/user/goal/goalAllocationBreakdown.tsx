"use client"

import * as React from "react"
import { ShieldCheck, PieChart, Info, Layers, CheckCircle2 } from "lucide-react"
import { AssetAllocationRecommendation } from "@/utils/goalCalculations"
import { formatIndianCurrency } from "@/utils/sipMath"

interface GoalAllocationBreakdownProps {
  allocation: AssetAllocationRecommendation
  monthlySip: number
  targetYears: number
}

export function GoalAllocationBreakdown({
  allocation,
  monthlySip,
  targetYears,
}: GoalAllocationBreakdownProps) {
  const equityAmount = Math.round((monthlySip * allocation.equityPercent) / 100)
  const debtAmount = Math.round((monthlySip * allocation.debtPercent) / 100)
  const goldAmount = Math.round((monthlySip * allocation.goldPercent) / 100)

  return (
    <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <PieChart className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Recommended Asset Allocation
            </h3>
            <p className="text-xs text-muted-foreground">
              Optimized portfolio split for a {targetYears}-year investment horizon
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
            allocation.riskLevel === "High Growth"
              ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
              : allocation.riskLevel === "Moderate Risk"
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          }`}
        >
          <ShieldCheck className="size-3.5" />
          <span>{allocation.riskLevel} Portfolio</span>
        </span>
      </div>

      {/* Visual Tri-Color Allocation Bar */}
      <div className="space-y-2">
        <div className="h-4 rounded-xl overflow-hidden flex bg-muted/60 p-0.5 border border-border/60">
          {allocation.equityPercent > 0 && (
            <div
              style={{ width: `${allocation.equityPercent}%` }}
              className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-l-lg transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
              title={`Equity: ${allocation.equityPercent}%`}
            >
              {allocation.equityPercent >= 15 ? `${allocation.equityPercent}%` : ""}
            </div>
          )}
          {allocation.debtPercent > 0 && (
            <div
              style={{ width: `${allocation.debtPercent}%` }}
              className="h-full bg-slate-500 dark:bg-slate-400 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
              title={`Debt: ${allocation.debtPercent}%`}
            >
              {allocation.debtPercent >= 15 ? `${allocation.debtPercent}%` : ""}
            </div>
          )}
          {allocation.goldPercent > 0 && (
            <div
              style={{ width: `${allocation.goldPercent}%` }}
              className="h-full bg-amber-500 rounded-r-lg transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
              title={`Gold / Commodities: ${allocation.goldPercent}%`}
            >
              {allocation.goldPercent >= 10 ? `${allocation.goldPercent}%` : ""}
            </div>
          )}
        </div>

        {/* Breakdown Legend with Monthly Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Equity */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="size-2 rounded-full bg-primary" />
                Equity ({allocation.equityPercent}%)
              </span>
              <span className="font-mono text-foreground font-bold">
                {formatIndianCurrency(equityAmount)}/mo
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Drives wealth compounding over time
            </p>
          </div>

          {/* Debt */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="size-2 rounded-full bg-slate-500" />
                Debt ({allocation.debtPercent}%)
              </span>
              <span className="font-mono text-foreground font-bold">
                {formatIndianCurrency(debtAmount)}/mo
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Provides downside cushion & capital stability
            </p>
          </div>

          {/* Gold */}
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="size-2 rounded-full bg-amber-500" />
                Gold / Liquid ({allocation.goldPercent}%)
              </span>
              <span className="font-mono text-foreground font-bold">
                {formatIndianCurrency(goldAmount)}/mo
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Hedge against inflation and macro shocks
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Fund Categories */}
      <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Layers className="size-4 text-primary" />
          <span>Recommended Mutual Fund Scheme Categories:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {allocation.recommendedCategories.map((cat, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-background border border-border/70 text-foreground shadow-2xs"
            >
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>{cat}</span>
            </span>
          ))}
        </div>

        <div className="flex items-start gap-2 pt-1 text-xs text-muted-foreground leading-relaxed">
          <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span>{allocation.reasoning}</span>
        </div>
      </div>
    </div>
  )
}
