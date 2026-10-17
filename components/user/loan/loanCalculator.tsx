"use client"

import * as React from "react"
import { Sparkles, PieChart as PieChartIcon, LineChart as LineChartIcon, SlidersHorizontal } from "lucide-react"
import {
  calculateHomeLoan,
  calculateYearlyAmortization,
  calculateLoanWithPrepayment,
  PrepaymentOptions,
} from "@/utils/loanCalculations"
import { LoanForm } from "./loanForm"
import { LoanSummary } from "./loanSummary"
import { LoanDonutChart } from "./loanDonutChart"
import { LoanComparisonChart } from "./loanComparisonChart"
import { PrepaymentForm } from "./prepaymentForm"
import { PrepaymentSavingsCard } from "./prepaymentSavingsCard"
import { AmortizationTable } from "./amortizationTable"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"
import { AskKuberButton } from "@/components/user/chat/askKuberButton"

const DEFAULT_PREPAYMENT: PrepaymentOptions = {
  extraMonthly: 0,
  annualLumpSum: 0,
  oneTimePrepayment: 0,
  oneTimeYear: 3,
  annualStepUpPercent: 0,
}

export function LoanCalculator() {
  const { updateLoanContext } = useFinancialAssistant()
  const [principal, setPrincipal] = React.useState<number>(5000000) // Default ₹50 Lakhs
  const [annualRate, setAnnualRate] = React.useState<number>(8.5) // Default 8.5%
  const [tenureYears, setTenureYears] = React.useState<number>(20) // Default 20 Years
  const [prepaymentOptions, setPrepaymentOptions] = React.useState<PrepaymentOptions>(DEFAULT_PREPAYMENT)
  const [inputTab, setInputTab] = React.useState<string>("loan")
  const [chartTab, setChartTab] = React.useState<string>("comparison")

  const standardResult = React.useMemo(() => {
    return calculateHomeLoan(principal, annualRate, tenureYears)
  }, [principal, annualRate, tenureYears])

  const standardSchedule = React.useMemo(() => {
    return calculateYearlyAmortization(principal, annualRate, tenureYears)
  }, [principal, annualRate, tenureYears])

  const prepaymentResult = React.useMemo(() => {
    return calculateLoanWithPrepayment(principal, annualRate, tenureYears, prepaymentOptions)
  }, [principal, annualRate, tenureYears, prepaymentOptions])

  // Sync loan state with global AI assistant context
  React.useEffect(() => {
    updateLoanContext({
      principal,
      annualRate,
      tenureYears,
      monthlyEmi: standardResult.monthlyEmi,
      totalInterest: standardResult.totalInterest,
      totalPayment: standardResult.totalPayment,
      hasPrepayment: prepaymentResult.hasPrepayment,
      extraMonthly: prepaymentOptions.extraMonthly,
      annualLumpSum: prepaymentOptions.annualLumpSum,
      interestSaved: prepaymentResult.interestSaved,
      monthsSaved: prepaymentResult.monthsSaved,
      yearsSaved: prepaymentResult.yearsSaved,
    })
  }, [
    principal,
    annualRate,
    tenureYears,
    standardResult,
    prepaymentResult,
    prepaymentOptions,
    updateLoanContext,
  ])

  // One-click strategy applicator
  const handleApplyStrategy = (strategy: string) => {
    if (strategy === "1_extra_emi") {
      setPrepaymentOptions({
        extraMonthly: 0,
        annualLumpSum: Math.round(standardResult.monthlyEmi),
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      })
    }
    setInputTab("prepay")
    setChartTab("comparison")
  }

  const hasPrepayment = prepaymentResult.hasPrepayment

  return (
    <div className="space-y-8">
      {/* Top Grid: Input Form Tabs on Left, Summary + Visualizations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls with Tabs */}
        <div className="lg:col-span-5">
          <Tabs value={inputTab} onValueChange={setInputTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-3 h-10 p-1 bg-muted/70">
              <TabsTrigger
                value="loan"
                className="text-xs sm:text-sm font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <SlidersHorizontal className="size-3.5" />
                <span>1. Loan Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="prepay"
                className="text-xs sm:text-sm font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="size-3.5 text-emerald-500" />
                <span>2. Prepayment Plan</span>
                {hasPrepayment && (
                  <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="loan" className="m-0 focus-visible:outline-none">
              <LoanForm
                principal={principal}
                annualRate={annualRate}
                tenureYears={tenureYears}
                onPrincipalChange={setPrincipal}
                onRateChange={setAnnualRate}
                onTenureChange={setTenureYears}
              />
            </TabsContent>

            <TabsContent value="prepay" className="m-0 focus-visible:outline-none">
              <PrepaymentForm
                options={prepaymentOptions}
                onChange={setPrepaymentOptions}
                standardMonthlyEmi={standardResult.monthlyEmi}
                tenureYears={tenureYears}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Hero Summary and Visualizations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Savings / Summary Card */}
          {hasPrepayment ? (
            <div className="space-y-4">
              <PrepaymentSavingsCard
                prepaymentResult={prepaymentResult}
                tenureYears={tenureYears}
                onApplyStrategy={handleApplyStrategy}
              />
              <LoanSummary result={standardResult} tenureYears={tenureYears} />
            </div>
          ) : (
            <div className="space-y-4">
              <LoanSummary result={standardResult} tenureYears={tenureYears} />
              <PrepaymentSavingsCard
                prepaymentResult={prepaymentResult}
                tenureYears={tenureYears}
                onApplyStrategy={handleApplyStrategy}
              />
            </div>
          )}

          {/* AI Consultation Prompt Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-indigo-500/10 to-violet-500/10 border border-primary/20 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Ask Kuber about this ₹{(principal / 100000).toFixed(0)}L Loan
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Calculate prepayment savings, tenure reduction, or compare against an equity SIP.
                </p>
              </div>
            </div>
            <AskKuberButton
              promptText={`Can you analyze my loan of ₹${(principal / 100000).toFixed(0)} Lakhs at ${annualRate}% for ${tenureYears} years (Monthly EMI: ₹${Math.round(standardResult.monthlyEmi).toLocaleString("en-IN")})? What is the smartest prepayment strategy and how much interest can I realistically save?`}
              label="Consult Kuber AI"
              variant="default"
              className="self-start sm:self-auto shrink-0"
            />
          </div>

          {/* Visualizations Card */}
          <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base font-semibold">
                  Visual Analytics & Comparison
                </CardTitle>

                {hasPrepayment && (
                  <div className="inline-flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setChartTab("comparison")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        chartTab === "comparison"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <LineChartIcon className="size-3.5 text-emerald-500" />
                      <span>Balance Comparison</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartTab("donut")}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        chartTab === "donut"
                          ? "bg-background text-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <PieChartIcon className="size-3.5 text-primary" />
                      <span>Distribution Breakdown</span>
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              {hasPrepayment && chartTab === "comparison" ? (
                <LoanComparisonChart
                  data={prepaymentResult.yearlyComparison}
                  tenureYears={tenureYears}
                />
              ) : (
                <LoanDonutChart
                  principal={standardResult.totalPrincipal}
                  totalInterest={
                    hasPrepayment
                      ? prepaymentResult.acceleratedTotalInterest
                      : standardResult.totalInterest
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Full Amortization Table */}
      <div className="w-full">
        <AmortizationTable
          standardSchedule={standardSchedule}
          acceleratedSchedule={prepaymentResult.acceleratedSchedule}
          hasPrepayment={hasPrepayment}
          principal={principal}
        />
      </div>
    </div>
  )
}
