"use client"

import React from "react"
import { Returns } from "@/models/returns"
import { calculatePortfolioXIRR, formatIndianCurrency } from "@/utils/sipMath"
import { Wallet, TrendingUp, Sparkles, Gauge, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { AskKuberButton } from "../chat/askKuberButton"

interface SipHeroKpisProps {
  funds: Returns[]
  timeframe?: string
}

export const SipHeroKpis: React.FC<SipHeroKpisProps> = ({ funds, timeframe = "3Y" }) => {
  if (!funds || funds.length === 0) return null

  const totalInvested = funds.reduce((acc, f) => acc + f.totalInvested, 0)
  const currentValue = funds.reduce((acc, f) => acc + f.total, 0)
  const totalGain = currentValue - totalInvested
  const growthPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
  const portfolioXirr = calculatePortfolioXIRR(funds)
  const wealthMultiplier = totalInvested > 0 ? currentValue / totalInvested : 0
  const isPositive = totalGain >= 0

  const fundNamesSummary = funds.map((f) => f.schemeName).slice(0, 2).join(", ") + (funds.length > 2 ? ` +${funds.length - 2} more` : "")

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Invested */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-4 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Invested</span>
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {formatIndianCurrency(totalInvested)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            Across {funds.length} scheme{funds.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Card 2: Current Valuation */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-4 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Current Value</span>
            <div className="size-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {formatIndianCurrency(currentValue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            Latest AMFI NAV valuation
          </p>
        </div>

        {/* Card 3: Wealth Created */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md p-4 shadow-xs hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Wealth Created</span>
            <div className={`size-7 rounded-lg ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"} flex items-center justify-center`}>
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
            {isPositive ? "+" : ""}{formatIndianCurrency(totalGain)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold">
            {isPositive ? (
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3.5" /> +{growthPercentage.toFixed(2)}%
              </span>
            ) : (
              <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="size-3.5" /> {growthPercentage.toFixed(2)}%
              </span>
            )}
            <span className="text-muted-foreground font-normal">absolute return</span>
          </div>
        </div>

        {/* Card 4: Portfolio XIRR & Multiplier */}
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-md p-4 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Annualized XIRR</span>
            <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Gauge className="size-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-baseline gap-2">
            <span>{portfolioXirr > 0 ? `${portfolioXirr.toFixed(1)}%` : "N/A"}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {wealthMultiplier.toFixed(2)}x
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground truncate">
            {wealthMultiplier >= 1 ? "Compounding multiplier" : "Capital status"}
          </p>
        </div>
      </div>

      {/* AI Analysis Quick-Action Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-3.5 py-2 rounded-xl bg-muted/40 border border-border/60 text-xs">
        <span className="text-muted-foreground">
          Simulated over <span className="font-semibold text-foreground">{timeframe}</span> historical daily NAV data
        </span>
        <AskKuberButton
          promptText={`Can you analyze my portfolio returns? I've invested ₹${totalInvested} which has grown to ₹${currentValue} (Net gain: ₹${totalGain}, XIRR: ${portfolioXirr}% over ${timeframe} for ${fundNamesSummary}). How does this rate of return compare to standard benchmarks, inflation, and home loan interest?`}
          label="Ask Kuber to Analyze Portfolio"
          variant="subtle"
        />
      </div>
    </div>
  )
}
