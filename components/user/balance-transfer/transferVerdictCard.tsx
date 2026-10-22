"use client"

import * as React from "react"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingDown,
  Clock,
  Sparkles,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import { BalanceTransferResult } from "@/utils/balanceTransferCalculations"
import { formatIndianCurrency } from "@/utils/sipMath"
import { AskKuberButton } from "@/components/user/chat/askKuberButton"

interface TransferVerdictCardProps {
  result: BalanceTransferResult
  onShareClick?: () => void
}

export function TransferVerdictCard({ result, onShareClick }: TransferVerdictCardProps) {
  const [copiedScript, setCopiedScript] = React.useState(false)

  const isRecommended = result.verdict === "Strongly Recommended"
  const isModerate = result.verdict === "Moderate ROI (Negotiate First)"

  const negotiationEmail = `Dear Bank Manager / Loan Operations,

I hold an active Home Loan with your branch. My current interest rate is ${
    result.yearlyTrajectory.length > 0 ? "higher than prevailing market rates" : ""
  }. 

I have received a sanctioned Balance Transfer offer from another leading financial institution offering a lower floating rate. 

Before I initiate the balance transfer documentation and mortgage release, I would like to explore if your bank can match this rate under your internal repricing/rate reset policy with an applicable conversion fee.

Kindly let me know the procedure to retain my loan account with your institution.

Thank you.`

  const handleCopyScript = () => {
    navigator.clipboard.writeText(negotiationEmail)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2500)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/95 to-primary/5 shadow-md p-5 sm:p-7 space-y-6">
      {/* Top Banner: Status Badge & Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`size-10 rounded-2xl flex items-center justify-center font-bold shadow-xs shrink-0 ${
              isRecommended
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isModerate
                ? "bg-amber-500/15 text-amber-500"
                : "bg-rose-500/15 text-rose-500"
            }`}
          >
            {isRecommended ? (
              <CheckCircle2 className="size-5" />
            ) : isModerate ? (
              <AlertTriangle className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isRecommended
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isModerate
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}
              >
                {result.verdict}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {result.rateDifferenceBps > 0 ? `-${result.rateDifferenceBps} bps spread` : "No spread"}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Home Loan Balance Transfer Audit
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
              <span>Share Audit</span>
            </button>
          )}
          <AskKuberButton
            promptText={`I am evaluating a home loan balance transfer. My current monthly EMI is ${formatIndianCurrency(
              result.currentMonthlyEmi
            )}, switching costs are ${formatIndianCurrency(
              result.totalSwitchingCost
            )}, and potential net interest savings are ${formatIndianCurrency(
              result.strategyA.netLifetimeSavings
            )}. Break-even is in ${result.strategyA.breakEvenMonths} months. What is your honest recommendation?`}
          />
        </div>
      </div>

      {/* Main Highlights Callout */}
      <div className="rounded-2xl border border-border/70 bg-muted/30 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Highlight 1: Net Lifetime Savings */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <TrendingDown className="size-3.5 text-emerald-500" />
              <span>Net Lifetime Interest Saved</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatIndianCurrency(Math.max(0, result.strategyA.netLifetimeSavings))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Clean savings after deducting ₹{(result.totalSwitchingCost / 1000).toFixed(0)}k switching fees
            </p>
          </div>

          {/* Highlight 2: Break-Even Horizon */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>Break-Even Period</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
              {result.strategyA.breakEvenMonths <= 360
                ? `${result.strategyA.breakEvenMonths} Months`
                : "N/A"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {result.strategyA.breakEvenYears < 1
                ? "Full fee recovered in under a year"
                : `Takes ~${result.strategyA.breakEvenYears} years to recover transfer fees`}
            </p>
          </div>

          {/* Highlight 3: Switching Friction Cost */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Wallet className="size-3.5 text-slate-500" />
              <span>Total Switching Fees</span>
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
              {formatIndianCurrency(result.totalSwitchingCost)}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Processing fee + MODT + Valuation & Legal
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
          {result.verdictDescription}
        </p>
      </div>

      {/* Dual Strategy Showcase: Strategy A (Lower EMI) vs Strategy B (Slash Tenure) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="size-4 text-primary" />
          <span>Compare Your Two Post-Transfer Options:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strategy A Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Strategy A: Lower Monthly EMI
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Immediate Cashflow
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">New Monthly EMI:</div>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatIndianCurrency(result.strategyA.newMonthlyEmi)}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
              </div>
            </div>

            <div className="pt-2 border-t border-primary/20 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Cash Saved:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  +{formatIndianCurrency(result.strategyA.monthlyEmiSavings)}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Lifetime Savings:</span>
                <span className="font-bold text-foreground font-mono">
                  {formatIndianCurrency(result.strategyA.netLifetimeSavings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Break-Even Time:</span>
                <span className="font-bold text-foreground font-mono">
                  {result.strategyA.breakEvenMonths} Months
                </span>
              </div>
            </div>
          </div>

          {/* Strategy B Card */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Strategy B: Maintain EMI, Slash Tenure
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Max Wealth Preservation
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Debt-Free Sooner By:</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {result.strategyB.yearsSaved} Years Earlier
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/20 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Payoff Duration:</span>
                <span className="font-bold text-foreground font-mono">
                  {result.strategyB.newTenureYears} Years ({result.strategyB.newTenureMonths} mos)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Interest Saved:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatIndianCurrency(result.strategyB.grossInterestSavings)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Savings (After Fees):</span>
                <span className="font-bold text-foreground font-mono">
                  {formatIndianCurrency(result.strategyB.netLifetimeSavings)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Tip & Template */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Pro-Tip for Borrowers:</span>
          </div>
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
          >
            {copiedScript ? (
              <>
                <Check className="size-3 text-emerald-500" />
                <span className="text-emerald-500">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy Negotiation Script</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {result.negotiationTip}
        </p>
      </div>
    </div>
  )
}
