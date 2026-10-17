"use client"

import * as React from "react"
import { Sparkles, TrendingDown, Clock, ShieldCheck, ArrowRight, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatINR, PrepaymentCalculationResult } from "@/utils/loanCalculations"

interface PrepaymentSavingsCardProps {
  prepaymentResult: PrepaymentCalculationResult
  tenureYears: number
  onApplyStrategy?: (strategy: string) => void
}

export function PrepaymentSavingsCard({
  prepaymentResult,
  tenureYears,
  onApplyStrategy,
}: PrepaymentSavingsCardProps) {
  const {
    hasPrepayment,
    interestSaved,
    yearsSaved,
    monthsSaved,
    totalPrepaymentPaid,
    netSavings,
    savingsMultiplier,
    effectiveTenureYears,
  } = prepaymentResult

  if (!hasPrepayment || interestSaved <= 0) {
    return (
      <Card className="border-dashed border-emerald-500/40 bg-emerald-500/[0.03] overflow-hidden relative">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-foreground">
                    Accelerate Your Debt-Free Journey
                  </h3>
                  <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-semibold">
                    Wealth Hack
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Even a small extra monthly payment or paying 1 additional EMI each year can shave <strong>5+ years</strong> off your loan and save <strong>₹10–25+ Lakhs</strong> in compound interest!
                </p>
              </div>
            </div>

            {onApplyStrategy && (
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={() => onApplyStrategy("1_extra_emi")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Zap className="size-3.5" />
                  <span>Try 1 Extra EMI / Yr</span>
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Active Prepayment Savings Display
  return (
    <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.08] via-card to-card shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingDown className="size-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
                Prepayment Impact Summary
              </span>
              <h3 className="text-lg font-bold text-foreground">
                You are Saving Big with Prepayments!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center">
            <ShieldCheck className="size-3.5" />
            <span>Debt-Free in {effectiveTenureYears} Years</span>
          </div>
        </div>

        {/* Big Savings Stats Grid: 2x2 layout for spacious, non-overflowing numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Total Interest Saved */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col justify-between min-w-0">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              Total Interest Saved
            </span>
            <div className="mt-2 min-w-0">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight block truncate">
                {formatINR(interestSaved)}
              </span>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 truncate">
                Saved in pure compound interest
              </p>
            </div>
          </div>

          {/* 2. Tenure Saved */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col justify-between min-w-0">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" />
              Tenure Reduced
            </span>
            <div className="mt-2 min-w-0">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700 dark:text-blue-400 tracking-tight block truncate">
                {yearsSaved > 0 && `${yearsSaved}y `}
                {monthsSaved > 0 ? `${monthsSaved}m` : yearsSaved === 0 ? "0m" : ""}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">sooner</span>
              </span>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-0.5 truncate">
                Closes in {effectiveTenureYears}y (was {tenureYears}y)
              </p>
            </div>
          </div>

          {/* 3. Prepayments Paid */}
          <div className="p-4 rounded-xl bg-card border border-border/70 flex flex-col justify-between min-w-0">
            <span className="text-xs font-semibold text-muted-foreground">
              Total Prepayment Made
            </span>
            <div className="mt-2 min-w-0">
              <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight block truncate">
                {formatINR(totalPrepaymentPaid)}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Net Savings: {formatINR(netSavings)}
              </p>
            </div>
          </div>

          {/* 4. Prepayment Multiplier ROI */}
          <div className="p-4 rounded-xl bg-card border border-border/70 flex flex-col justify-between min-w-0">
            <span className="text-xs font-semibold text-muted-foreground">
              Prepayment ROI Multiplier
            </span>
            <div className="mt-2 min-w-0">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight block truncate">
                {savingsMultiplier}x
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Every ₹1 prepaid saves ₹{savingsMultiplier} in interest
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Message */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 border border-border/50">
          <ArrowRight className="size-3.5 text-primary shrink-0" />
          <span>
            By executing this prepayment plan, you will become <strong>100% debt-free in Year {Math.ceil(effectiveTenureYears)}</strong> instead of waiting until Year {tenureYears}!
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
