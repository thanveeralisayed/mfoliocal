"use client"

import * as React from "react"
import {
  ShieldCheck,
  TrendingUp,
  Scale,
  Check,
  HelpCircle,
  Percent,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ArbitrageDecisionGuide() {
  return (
    <div className="space-y-6">
      {/* 1. Head vs Heart Section */}
      <Card className="border-border/80 shadow-sm bg-card p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            <Scale className="size-3.5 mr-1" />
            Decision Framework
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">Head vs. Heart</span>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
            The Eternal Dilemma: Math vs. Psychological Peace
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            In personal finance, the mathematically optimal choice is not always the psychologically comfortable one.
            Use this guide to determine which path matches your risk profile and life stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Prepayment Persona */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-600 dark:text-amber-400">
              <ShieldCheck className="size-4" />
              <span>Choose Prepayment If:</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Debt causes you emotional stress</strong> and keeping a home loan weighs heavily on your peace of mind.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>You are <strong>within 7–10 years of retirement</strong> and want a debt-free roof over your head.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Your income is variable (e.g. freelance, business cycles) and lowering fixed monthly liabilities is a priority.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>You want a <strong>guaranteed, tax-free return</strong> equal to your loan interest rate (8.5%–9.5%).</span>
              </li>
            </ul>
          </div>

          {/* SIP Arbitrage Persona */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
              <span>Choose Equity SIP Arbitrage If:</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You have a <strong>10+ year investment horizon</strong> and can tolerate short-term stock market volatility.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You are <strong>under 45 years of age</strong> with high career earnings growth ahead.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You value <strong>liquidity</strong>: Money prepaid into a house is locked in brick-and-mortar; money in a mutual fund can be withdrawn anytime in emergencies.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>You want to exploit the <strong>historical 4%–6% spread</strong> between equity returns (~13%–15%) and loan rates (~8.5%).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 50:50 Hybrid Rule Banner */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <h4 className="text-sm font-bold text-foreground">The 50:50 Golden Hybrid Rule</h4>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Can’t decide between peace of mind and wealth maximization? Split your surplus: deploy <strong>50% towards loan prepayment</strong> (reducing tenure and interest) and <strong>50% into a disciplined Equity SIP</strong>. This gives you debt freedom years earlier while simultaneously building a multi-lakh investment corpus.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Indian Tax Nuances (80C, 24b, LTCG) */}
      <Card className="border-border/80 shadow-sm bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Indian Tax Implications to Consider</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
            <div className="font-bold text-foreground">1. Section 24(b) Deduction</div>
            <p className="text-muted-foreground leading-relaxed">
              Under the Old Tax Regime, you can deduct up to <strong>₹2 Lakhs</strong> of home loan interest per year. When you prepay your loan early, you forfeit this tax shield in later years.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
            <div className="font-bold text-foreground">2. Section 80C Principal</div>
            <p className="text-muted-foreground leading-relaxed">
              Principal repayment qualifies under Section 80C (up to ₹1.5 Lakh limit, shared with EPF, PPF, and ELSS). In the New Tax Regime, 80C deductions are not available.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-1.5">
            <div className="font-bold text-foreground">3. Capital Gains Tax (LTCG)</div>
            <p className="text-muted-foreground leading-relaxed">
              Equity Mutual Fund profits held over 12 months are taxed as Long Term Capital Gains at <strong>12.5%</strong> on gains exceeding ₹1.25 Lakh per financial year.
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Common FAQs for SEO */}
      <Card className="border-border/80 shadow-sm bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
            <div className="font-bold text-foreground">Is home loan prepayment penalized by banks in India?</div>
            <p className="text-muted-foreground">
              No. RBI regulations mandate that banks and NBFCs cannot charge any prepayment penalty or foreclosure fees on floating-rate individual home loans. You can prepay anytime without extra fees.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
            <div className="font-bold text-foreground">When is the best time to prepay a home loan?</div>
            <p className="text-muted-foreground">
              Prepayment has the highest financial impact in the <strong>first 5 to 7 years</strong> of a 20-year loan. During this initial phase, 70% to 80% of each EMI goes purely towards interest. Prepaying early attacks the principal when the compounding interest penalty is highest.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1">
            <div className="font-bold text-foreground">What happens to liquidity if I prepay?</div>
            <p className="text-muted-foreground">
              Prepaying into real estate locks your money. If you face a medical or career emergency, you cannot easily withdraw prepaid equity from your home without taking a top-up loan. In contrast, open-ended mutual funds provide T+2 liquidity. Always maintain an emergency fund before prepaying.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
