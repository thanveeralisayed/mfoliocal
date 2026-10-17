"use client"

import * as React from "react"
import {
  calculateHomeLoan,
  calculateYearlyAmortization,
} from "@/utils/loanCalculations"
import { LoanForm } from "./loanForm"
import { LoanSummary } from "./loanSummary"
import { LoanDonutChart } from "./loanDonutChart"
import { AmortizationTable } from "./amortizationTable"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function LoanCalculator() {
  const [principal, setPrincipal] = React.useState<number>(5000000) // Default ₹50 Lakhs
  const [annualRate, setAnnualRate] = React.useState<number>(8.5) // Default 8.5%
  const [tenureYears, setTenureYears] = React.useState<number>(20) // Default 20 Years

  const result = React.useMemo(() => {
    return calculateHomeLoan(principal, annualRate, tenureYears)
  }, [principal, annualRate, tenureYears])

  const schedule = React.useMemo(() => {
    return calculateYearlyAmortization(principal, annualRate, tenureYears)
  }, [principal, annualRate, tenureYears])

  return (
    <div className="space-y-8">
      {/* Top Grid: Form on Left, Summary + Chart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-5">
          <LoanForm
            principal={principal}
            annualRate={annualRate}
            tenureYears={tenureYears}
            onPrincipalChange={setPrincipal}
            onRateChange={setAnnualRate}
            onTenureChange={setTenureYears}
          />
        </div>

        {/* Right: Summary and Donut Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <LoanSummary result={result} tenureYears={tenureYears} />

          <Card className="border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-semibold">
                Payment Distribution Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <LoanDonutChart
                principal={result.totalPrincipal}
                totalInterest={result.totalInterest}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Full Amortization Table */}
      <div className="w-full">
        <AmortizationTable schedule={schedule} principal={principal} />
      </div>
    </div>
  )
}
