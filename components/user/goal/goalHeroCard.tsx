"use client"

import * as React from "react"
import Link from "next/link"
import {
  Target,
  Sparkles,
  TrendingUp,
  Wallet,
  ArrowRight,
  Flame,
  Share2,
} from "lucide-react"
import { GoalCalculationResult } from "@/utils/goalCalculations"
import { formatIndianCurrency, formatCompactCurrency } from "@/utils/sipMath"
import { AskKuberButton } from "@/components/user/chat/askKuberButton"

interface GoalHeroCardProps {
  result: GoalCalculationResult
  targetYears: number
  adjustForInflation: boolean
  stepUpPercent: number
  onShareClick?: () => void
}

export function GoalHeroCard({
  result,
  targetYears,
  adjustForInflation,
  stepUpPercent,
  onShareClick,
}: GoalHeroCardProps) {
  const activeMonthlySip =
    stepUpPercent > 0 ? result.monthlySipStepUpInitial : result.monthlySipRequired

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-primary/5 shadow-md p-5 sm:p-7 space-y-6">
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 size-48 sm:size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Top Banner: Verdict & Actions */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold shadow-xs shrink-0">
            <Target className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Goal Execution Verdict
              </span>
              {adjustForInflation && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Inflation Adjusted
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Path to {formatIndianCurrency(result.effectiveTargetCorpus)} in {targetYears} Years
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/60 hover:bg-muted border border-border/60 text-foreground transition-all cursor-pointer shadow-2xs"
            >
              <Share2 className="size-3.5 text-primary" />
              <span>Share Plan</span>
            </button>
          )}
          <AskKuberButton
            promptText={`I have a goal of ${formatIndianCurrency(result.effectiveTargetCorpus)} in ${targetYears} years. My calculated required monthly SIP is ${formatIndianCurrency(activeMonthlySip)}. What fund portfolio strategy do you recommend to achieve this?`}
          />
        </div>
      </div>

      {/* Main Hero Callout: The Exact Monthly SIP Required */}
      <div className="relative rounded-2xl border border-primary/25 bg-primary/5 dark:bg-primary/10 p-5 sm:p-6 space-y-3">
        <div className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <span>Required Monthly Investment</span>
          {stepUpPercent > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              +{stepUpPercent}% Annual Top-Up
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <div className="text-3xl sm:text-5xl font-black text-foreground tracking-tight font-mono">
            {formatIndianCurrency(activeMonthlySip)}
            <span className="text-sm sm:text-lg font-semibold text-muted-foreground font-sans ml-1.5">
              / month
            </span>
          </div>

          {stepUpPercent > 0 && (
            <div className="text-xs text-muted-foreground">
              (Starts at {formatIndianCurrency(result.monthlySipStepUpInitial)}/mo in Year 1, vs.{" "}
              {formatIndianCurrency(result.monthlySipRequired)}/mo flat)
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          By deploying{" "}
          <strong className="text-foreground">{formatIndianCurrency(activeMonthlySip)}/month</strong>,
          your cumulative principal of{" "}
          <strong className="text-foreground font-mono">
            {formatIndianCurrency(result.totalCapitalInvested)}
          </strong>{" "}
          compounds into a net maturity corpus of{" "}
          <strong className="text-foreground font-mono">
            {formatIndianCurrency(result.effectiveTargetCorpus)}
          </strong>
          .
        </p>
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Target Future Corpus */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Target className="size-3.5 text-primary" />
            <span>Target Corpus</span>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-foreground font-mono">
            {formatCompactCurrency(result.effectiveTargetCorpus)}
          </div>
          {adjustForInflation && result.inflationCostAddition > 0 && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
              +{formatCompactCurrency(result.inflationCostAddition)} inflation cushion
            </div>
          )}
        </div>

        {/* KPI 2: Total Principal Invested */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3.5 text-slate-500" />
            <span>Your Capital</span>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-foreground font-mono">
            {formatCompactCurrency(result.totalCapitalInvested)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {(
              (result.totalCapitalInvested / Math.max(1, result.effectiveTargetCorpus)) *
              100
            ).toFixed(0)}
            % of goal financed by you
          </div>
        </div>

        {/* KPI 3: Compounded Growth (Profit) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="size-3.5" />
            <span>Wealth Gained</span>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            +{formatCompactCurrency(result.totalWealthGain)}
          </div>
          <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
            Free wealth from compounding
          </div>
        </div>

        {/* KPI 4: Wealth Multiplier */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
            <Sparkles className="size-3.5" />
            <span>Multiplier</span>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-primary font-mono">
            {result.wealthMultiplier}x
          </div>
          <div className="text-[10px] text-muted-foreground">
            For every ₹1 invested, you get ₹{result.wealthMultiplier}
          </div>
        </div>
      </div>

      {/* Bridge to Live Funds Link */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-orange-500 shrink-0" />
          <span className="text-xs text-muted-foreground">
            Ready to deploy this strategy? Select actual mutual fund schemes with real historical NAVs.
          </span>
        </div>
        <Link
          href={`/?timeframe=5Y`}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 shadow-xs"
        >
          <span>Search Funds for SIP</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
