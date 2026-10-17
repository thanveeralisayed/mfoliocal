"use client"

import * as React from "react"
import { IndianRupee, Landmark, Percent, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatINR, LoanCalculationResult } from "@/utils/loanCalculations"

interface LoanSummaryProps {
  result: LoanCalculationResult
  tenureYears: number
}

export function LoanSummary({ result, tenureYears }: LoanSummaryProps) {
  const isInterestHeavy = result.totalInterest >= result.totalPrincipal

  return (
    <div className="space-y-4">
      {/* Hero EMI Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <IndianRupee className="size-4 text-primary" />
                <span>Monthly Home Loan EMI</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-1">
                {formatINR(result.monthlyEmi)}
                <span className="text-sm font-normal text-muted-foreground ml-1.5">/ month</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-xl px-3 py-2 text-xs text-muted-foreground self-start sm:self-center">
              <Calendar className="size-4 text-primary" />
              <span>{tenureYears * 12} Total Payments</span>
            </div>
          </div>

          {/* Interest Warning / Insight Note */}
          {isInterestHeavy && (
            <div className="mt-4 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs text-orange-700 dark:text-orange-400">
              ⚠️ <strong>Heads up:</strong> At this tenure, your total interest payable (
              {formatINR(result.totalInterest)}) exceeds your borrowed principal! Consider shortening your tenure or planning annual prepayments.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid of Key Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-card/60 border-border/70">
          <CardContent className="p-0 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Landmark className="size-3.5 text-blue-500" />
              Principal Loan
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatINR(result.totalPrincipal)}
            </span>
          </CardContent>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <CardContent className="p-0 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Percent className="size-3.5 text-orange-500" />
              Total Interest
            </span>
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {formatINR(result.totalInterest)}
            </span>
          </CardContent>
        </Card>

        <Card className="p-4 bg-card/60 border-border/70">
          <CardContent className="p-0 flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <IndianRupee className="size-3.5 text-emerald-500" />
              Total Payment
            </span>
            <span className="text-lg font-bold text-foreground">
              {formatINR(result.totalPayment)}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
