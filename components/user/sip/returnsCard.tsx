"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Returns } from "@/models/returns"
import { formatIndianCurrency } from "@/utils/sipMath"
import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, Wallet, Layers } from "lucide-react"
import { AskKuberButton } from "../chat/askKuberButton"

interface ReturnsCardProps {
  returns: Returns
}

const ReturnsCard: React.FC<ReturnsCardProps> = ({ returns }) => {
  const invested = returns.totalInvested || 0
  const currentVal = returns.total || 0
  const gain = currentVal - invested
  const growthPercentage = returns.growthPercentage ?? (invested > 0 ? (gain / invested) * 100 : 0)
  const isPositive = gain >= 0
  const xirr = returns.xirr || 0
  const multiplier = returns.wealthMultiplier || (invested > 0 ? currentVal / invested : 0)

  // Progress bar ratio (capped at 100% for baseline)
  const growthRatio = invested > 0 ? Math.min(100, Math.max(10, (invested / currentVal) * 100)) : 100

  return (
    <Card className="overflow-hidden border border-border/80 bg-card/80 backdrop-blur-md shadow-xs hover:border-primary/40 transition-all mt-3">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header: Fund Name, Badges & AI Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border/60">
              Code: {returns.schemeCode}
            </span>
            <h3 className="text-base font-bold text-foreground tracking-tight leading-snug">
              {returns.schemeName}
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start shrink-0">
            {xirr > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {xirr}% XIRR
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {multiplier.toFixed(2)}x
            </span>
          </div>
        </div>

        {/* Visual Wealth Split Bar */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full w-full bg-emerald-500/20 overflow-hidden flex">
            <div
              className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-500"
              style={{ width: `${growthRatio}%` }}
              title={`Invested Capital: ${formatIndianCurrency(invested)}`}
            />
            <div
              className="h-full bg-emerald-500 transition-all duration-500 flex-1"
              title={`Compounding Gain: ${formatIndianCurrency(gain)}`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-slate-400" />
              Invested Capital ({formatIndianCurrency(invested)})
            </span>
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Compounding Gain (+{growthPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Wallet className="size-3" /> Invested
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {formatIndianCurrency(invested)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3" /> Current Value
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {formatIndianCurrency(currentVal)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3" /> Net Profit
            </div>
            <div className={`text-sm font-bold mt-0.5 flex items-center gap-0.5 ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
              {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {isPositive ? "+" : ""}{formatIndianCurrency(gain)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Layers className="size-3" /> Accumulated Units
            </div>
            <div className="text-sm font-bold text-foreground mt-0.5">
              {returns.totalUnits ? returns.totalUnits.toLocaleString("en-IN") : "0"} units
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action */}
        <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
          <span className="text-muted-foreground text-[11px]">
            Absolute return: <span className={isPositive ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold"}>
              {isPositive ? "+" : ""}{growthPercentage.toFixed(2)}%
            </span>
          </span>
          <AskKuberButton
            promptText={`Tell me about ${returns.schemeName}. What is its category risk, asset class, and how sustainable is its historical ${xirr ? `${xirr}% XIRR` : `${growthPercentage.toFixed(1)}% return`}?`}
            label="Ask Kuber About This Scheme"
            variant="subtle"
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default ReturnsCard
