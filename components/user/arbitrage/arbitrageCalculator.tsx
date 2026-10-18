"use client"

import * as React from "react"
import { useQueryState, parseAsInteger, parseAsFloat, parseAsBoolean } from "nuqs"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  TrendingUp,
  Table as TableIcon,
  Scale,
} from "lucide-react"
import { calculateArbitrage, ArbitrageInputs } from "@/utils/arbitrageCalculations"
import { ArbitrageForm } from "./arbitrageForm"
import { ArbitrageHeroCard } from "./arbitrageHeroCard"
import { ArbitrageGrowthChart } from "./arbitrageGrowthChart"
import { ArbitrageAmortizationTable } from "./arbitrageAmortizationTable"
import { ArbitrageDecisionGuide } from "./arbitrageDecisionGuide"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"

export function ArbitrageCalculator() {
  const { updateArbitrageContext } = useFinancialAssistant()

  // URL state synchronization using nuqs for deep linking & sharing
  const [principal, setPrincipal] = useQueryState(
    "principal",
    parseAsInteger.withDefault(5000000) // Default ₹50 Lakhs
  )
  const [rate, setRate] = useQueryState(
    "rate",
    parseAsFloat.withDefault(8.5) // Default 8.5%
  )
  const [tenure, setTenure] = useQueryState(
    "tenure",
    parseAsInteger.withDefault(20) // Default 20 Years
  )
  const [surplus, setSurplus] = useQueryState(
    "surplus",
    parseAsInteger.withDefault(10000) // Default ₹10,000/month
  )
  const [lumpSum, setLumpSum] = useQueryState(
    "lumpSum",
    parseAsInteger.withDefault(0)
  )
  const [sipReturn, setSipReturn] = useQueryState(
    "sipReturn",
    parseAsFloat.withDefault(13.0) // Default 13.0% CAGR
  )
  const [includeTax, setIncludeTax] = useQueryState(
    "tax",
    parseAsBoolean.withDefault(false)
  )

  const [activeTab, setActiveTab] = React.useState<string>("visualizer")

  // Master calculation memo
  const arbitrageResult = React.useMemo(() => {
    const inputs: ArbitrageInputs = {
      loanPrincipal: principal,
      loanRate: rate,
      loanTenureYears: tenure,
      monthlySurplus: surplus,
      annualLumpSum: lumpSum,
      expectedSipReturn: sipReturn,
      includeTaxImpact: includeTax,
    }
    return calculateArbitrage(inputs)
  }, [principal, rate, tenure, surplus, lumpSum, sipReturn, includeTax])

  // Sync state with global Kuber AI context
  React.useEffect(() => {
    updateArbitrageContext({
      loanPrincipal: principal,
      loanRate: rate,
      loanTenureYears: tenure,
      monthlySurplus: surplus,
      annualLumpSum: lumpSum,
      expectedSipReturn: sipReturn,
      yearsSaved: arbitrageResult.yearsSaved,
      interestSaved: arbitrageResult.interestSaved,
      sipFinalCorpus: arbitrageResult.sipFinalCorpus,
      netWealthAdvantage: arbitrageResult.netWealthAdvantage,
      arbitrageSpread: arbitrageResult.arbitrageSpread,
      prepayPayoffYears: arbitrageResult.prepayPayoffYears,
    })
  }, [
    principal,
    rate,
    tenure,
    surplus,
    lumpSum,
    sipReturn,
    arbitrageResult,
    updateArbitrageContext,
  ])

  return (
    <div className="space-y-8">
      {/* 1. Hero Verdict & KPI Showcase */}
      <ArbitrageHeroCard
        result={arbitrageResult}
        loanPrincipal={principal}
        loanRate={rate}
        loanTenureYears={tenure}
        monthlySurplus={surplus}
        expectedSipReturn={sipReturn}
        includeTax={includeTax}
        onToggleTax={(val) => setIncludeTax(val ? true : null)}
      />

      {/* 2. Main Workspace: Form on Left, Tabs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <ArbitrageForm
            loanPrincipal={principal}
            loanRate={rate}
            loanTenureYears={tenure}
            monthlySurplus={surplus}
            annualLumpSum={lumpSum}
            expectedSipReturn={sipReturn}
            standardEmi={arbitrageResult.standardMonthlyEmi}
            onPrincipalChange={(val) => setPrincipal(val)}
            onRateChange={(val) => setRate(val)}
            onTenureChange={(val) => setTenure(val)}
            onSurplusChange={(val) => setSurplus(val)}
            onLumpSumChange={(val) => setLumpSum(val)}
            onSipReturnChange={(val) => setSipReturn(val)}
          />
        </div>

        {/* Right Column: Interactive Tabs for Charts, Table, and Decision Guide */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-muted/70 p-1 rounded-xl inline-flex w-full sm:w-auto overflow-x-auto gap-1 border border-border/50 h-auto">
              <TabsTrigger
                value="visualizer"
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-semibold"
              >
                <TrendingUp className="size-3.5 text-primary" />
                <span>Wealth Visualizer</span>
              </TabsTrigger>

              <TabsTrigger
                value="table"
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-semibold"
              >
                <TableIcon className="size-3.5" />
                <span>Annual Schedule</span>
              </TabsTrigger>

              <TabsTrigger
                value="guide"
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg cursor-pointer font-semibold"
              >
                <Scale className="size-3.5" />
                <span>Decision Guide</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Chart */}
            <TabsContent value="visualizer" className="mt-4 focus-visible:outline-hidden">
              <ArbitrageGrowthChart
                timeline={arbitrageResult.timeline}
                debtFreeYear={arbitrageResult.prepayPayoffYears}
                crossoverYear={arbitrageResult.crossoverYear}
                tenureYears={tenure}
              />
            </TabsContent>

            {/* Tab 2: Table */}
            <TabsContent value="table" className="mt-4 focus-visible:outline-hidden">
              <ArbitrageAmortizationTable
                timeline={arbitrageResult.timeline}
                loanTenureYears={tenure}
              />
            </TabsContent>

            {/* Tab 3: Decision Guide */}
            <TabsContent value="guide" className="mt-4 focus-visible:outline-hidden">
              <ArbitrageDecisionGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
