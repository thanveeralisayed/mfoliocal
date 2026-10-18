"use client"

import * as React from "react"
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Percent,
  Share2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArbitrageResult, formatCompactINR, formatINR } from "@/utils/arbitrageCalculations"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"

interface ArbitrageHeroCardProps {
  result: ArbitrageResult
  loanPrincipal: number
  loanRate: number
  loanTenureYears: number
  monthlySurplus: number
  expectedSipReturn: number
  includeTax: boolean
  onToggleTax: (enabled: boolean) => void
}

export function ArbitrageHeroCard({
  result,
  loanPrincipal,
  loanRate,
  loanTenureYears,
  monthlySurplus,
  expectedSipReturn,
  includeTax,
  onToggleTax,
}: ArbitrageHeroCardProps) {
  const { askPrompt } = useFinancialAssistant()
  const [copied, setCopied] = React.useState(false)

  const isSipWinning = result.netWealthAdvantage >= 0
  const advantageAmount = includeTax ? Math.abs(result.netPostTaxAdvantage) : Math.abs(result.netWealthAdvantage)
  const advantageFormatted = formatCompactINR(advantageAmount)

  const handleShare = () => {
    const textToShare = `⚖️ Home Loan Prepayment vs Equity SIP Arbitrage on MfolioCal:
• Loan: ${formatCompactINR(loanPrincipal)} @ ${loanRate}% (${loanTenureYears}Y)
• Surplus: ${formatINR(monthlySurplus)}/month
• Prepayment Result: Debt-free in ${result.prepayPayoffYears} yrs (Saved ${result.yearsSaved} yrs & ${formatCompactINR(result.interestSaved)} interest)
• SIP Result: Final corpus of ${formatCompactINR(result.sipFinalCorpus)} @ ${expectedSipReturn}% CAGR
• VERDICT: Equity SIP generates ${advantageFormatted} MORE wealth!
Calculate your scenario here: ${window.location.href}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  const handleAskKuber = () => {
    askPrompt(
      `Based on my loan of ₹${(loanPrincipal / 100000).toFixed(1)} Lakhs at ${loanRate}% and monthly surplus of ₹${monthlySurplus}, should I prepay the loan or invest in an equity SIP at ${expectedSipReturn}%? Provide a mathematical comparison and a hybrid strategy.`
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Main Winner Verdict Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6 shadow-md">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 size-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 font-bold px-2.5 py-0.5 text-xs flex items-center gap-1">
                <Sparkles className="size-3.5" />
                <span>ARBITRAGE VERDICT</span>
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Spread: <strong className="text-foreground">+{result.arbitrageSpread}% p.a.</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
              {isSipWinning ? (
                <>
                  Equity SIP creates{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500">
                    +{advantageFormatted} Extra Wealth
                  </span>{" "}
                  over Prepayment
                </>
              ) : (
                <>
                  Prepayment leads by{" "}
                  <span className="text-primary">
                    +{advantageFormatted}
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isSipWinning ? (
                <>
                  Investing your <strong>{formatINR(monthlySurplus)}/month</strong> surplus into an Equity SIP yields{" "}
                  <strong>{formatCompactINR(result.sipFinalCorpus)}</strong> vs{" "}
                  <strong>{formatCompactINR(result.prepayFinalCorpus)}</strong> via prepayment reinvestment. However,
                  prepaying makes you 100% debt-free <strong>{result.yearsSaved} years earlier</strong>.
                </>
              ) : (
                <>
                  Due to high loan interest rates, prepaying saves guaranteed interest of{" "}
                  <strong>{formatCompactINR(result.interestSaved)}</strong> and clears debt in{" "}
                  <strong>{result.prepayPayoffYears} years</strong>.
                </>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
            <Button
              onClick={handleAskKuber}
              size="sm"
              className="gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer"
            >
              <Sparkles className="size-3.5" />
              <span>Ask Kuber AI</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium border-border/80 hover:bg-muted/80 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5" />
                  <span>Share Result</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Pathway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pathway A: Prepayment Strategy */}
        <Card className="p-4 sm:p-5 border-border/80 bg-card hover:border-amber-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Pathway A: Aggressive Prepayment
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Guaranteed Risk-Free {loanRate}% Return
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[11px] font-bold">
              Debt Freedom
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium">Debt-Free In</div>
              <div className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                {result.prepayPayoffYears} <span className="text-xs font-normal text-muted-foreground">Years</span>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Saved {result.yearsSaved} yrs of EMIs
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium">Guaranteed Interest Saved</div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatCompactINR(result.interestSaved)}
              </div>
              <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                Direct tax-free savings
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Interest Paid:</span>
              <span className="font-semibold text-foreground">{formatINR(result.prepayTotalInterestPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wealth from Reinvested EMI*:</span>
              <span className="font-semibold text-foreground">{formatCompactINR(result.prepayFinalCorpus)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground pt-1 italic">
              *Assuming EMI ({formatINR(result.standardMonthlyEmi)}) + surplus is redirected to SIP after loan ends.
            </p>
          </div>
        </Card>

        {/* Pathway B: Equity SIP Arbitrage */}
        <Card className="p-4 sm:p-5 border-border/80 bg-card hover:border-emerald-500/40 transition-all space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Pathway B: Equity SIP Arbitrage
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Compounding @ {expectedSipReturn}% Expected CAGR
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-bold">
              Wealth Maximizer
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium">Final SIP Portfolio</div>
              <div className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                {formatCompactINR(result.sipFinalCorpus)}
              </div>
              <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                On {formatCompactINR(result.sipTotalInvested)} invested
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
              <div className="text-[11px] text-muted-foreground font-medium">Net Wealth Advantage</div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{advantageFormatted}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                +{result.percentageAdvantage}% wealth boost
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Standard Loan Tenure:</span>
              <span className="font-semibold text-foreground">{loanTenureYears} Years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Compounding Profit:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                +{formatCompactINR(result.sipFinalCorpus - result.sipTotalInvested)}
              </span>
            </div>
            {result.crossoverYear && (
              <p className="text-[10px] text-muted-foreground pt-1">
                ⭐ <strong>Crossover Point:</strong> By <strong>Year {result.crossoverYear}</strong>, SIP returns exceed all cumulative loan interest!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* 3. Tax Optimization Accordion / Banner */}
      <div className="rounded-xl border border-border/60 bg-muted/30 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Tax Nuance (Section 24b vs LTCG 12.5%):</span>{" "}
            <span className="text-muted-foreground">
              Prepaying forfeits ~{formatCompactINR(result.taxSavingsLostByPrepaying)} in Sec 24(b) interest tax shields. Equity gains over ₹1.25L incur 12.5% LTCG (~{formatCompactINR(result.estimatedLtcgTax)}).
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleTax(!includeTax)}
          className={`shrink-0 text-xs font-semibold cursor-pointer ${
            includeTax ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"
          }`}
        >
          {includeTax ? "✓ Tax Factors Applied" : "Apply Tax Factors"}
        </Button>
      </div>
    </div>
  )
}
