"use client"

import * as React from "react"
import { useQueryState, parseAsInteger, parseAsFloat } from "nuqs"
import {
  calculateBalanceTransfer,
  BalanceTransferInputs,
} from "@/utils/balanceTransferCalculations"
import { TransferForm } from "./transferForm"
import { TransferVerdictCard } from "./transferVerdictCard"
import { TransferComparisonChart } from "./transferComparisonChart"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"
import { ShareModal } from "@/components/user/sharing/shareModal"
import { generateBalanceTransferShareCard } from "@/components/user/sharing/canvasCardGenerator"

export function BalanceTransferCalculator() {
  const { updateBalanceTransferContext } = useFinancialAssistant()

  // URL state synchronization using nuqs
  const [principal, setPrincipal] = useQueryState(
    "principal",
    parseAsInteger.withDefault(4500000) // Default ₹45 Lakhs
  )
  const [currentRate, setCurrentRate] = useQueryState(
    "currRate",
    parseAsFloat.withDefault(9.25) // Default 9.25%
  )
  const [remainingTenure, setRemainingTenure] = useQueryState(
    "tenure",
    parseAsInteger.withDefault(18) // Default 18 Years
  )
  const [newRate, setNewRate] = useQueryState(
    "newRate",
    parseAsFloat.withDefault(8.4) // Default 8.40%
  )
  const [feePercent, setFeePercent] = useQueryState(
    "feePct",
    parseAsFloat.withDefault(0.35) // Default 0.35%
  )
  const [otherCharges, setOtherCharges] = useQueryState(
    "charges",
    parseAsInteger.withDefault(8000) // Default ₹8,000
  )

  const [isShareOpen, setIsShareOpen] = React.useState(false)

  // Master calculation memo
  const result = React.useMemo(() => {
    const inputs: BalanceTransferInputs = {
      outstandingPrincipal: principal,
      currentRate,
      remainingTenureYears: remainingTenure,
      newRate,
      processingFeePercent: feePercent,
      otherCharges,
    }
    return calculateBalanceTransfer(inputs)
  }, [principal, currentRate, remainingTenure, newRate, feePercent, otherCharges])

  // Sync state with global Kuber AI Assistant context
  React.useEffect(() => {
    if (updateBalanceTransferContext) {
      updateBalanceTransferContext({
        outstandingPrincipal: principal,
        currentRate,
        newRate,
        remainingTenureYears: remainingTenure,
        currentMonthlyEmi: result.currentMonthlyEmi,
        newMonthlyEmiA: result.strategyA.newMonthlyEmi,
        monthlyEmiSavings: result.strategyA.monthlyEmiSavings,
        netLifetimeSavingsA: result.strategyA.netLifetimeSavings,
        breakEvenMonthsA: result.strategyA.breakEvenMonths,
        yearsSavedB: result.strategyB.yearsSaved,
        netLifetimeSavingsB: result.strategyB.netLifetimeSavings,
        totalSwitchingCost: result.totalSwitchingCost,
        verdict: result.verdict,
      })
    }
  }, [
    principal,
    currentRate,
    newRate,
    remainingTenure,
    result,
    updateBalanceTransferContext,
  ])

  // Generator callback for the visual share card
  const handleGenerateCard = React.useCallback(async () => {
    return generateBalanceTransferShareCard({
      principal,
      currentRate,
      newRate,
      remainingTenure,
      monthlySavings: result.strategyA.monthlyEmiSavings,
      netLifetimeSavings: result.strategyA.netLifetimeSavings,
      breakEvenMonths: result.strategyA.breakEvenMonths,
      yearsSaved: result.strategyB.yearsSaved,
      switchingCost: result.totalSwitchingCost,
      verdict: result.verdict,
    })
  }, [principal, currentRate, newRate, remainingTenure, result])

  return (
    <div className="space-y-8">
      {/* 1. Hero Verdict & KPI Showcase */}
      <TransferVerdictCard
        result={result}
        onShareClick={() => setIsShareOpen(true)}
      />

      {/* 2. Main Grid: Input Form on Left, Payoff Chart on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5">
          <TransferForm
            outstandingPrincipal={principal}
            currentRate={currentRate}
            remainingTenureYears={remainingTenure}
            newRate={newRate}
            processingFeePercent={feePercent}
            otherCharges={otherCharges}
            onPrincipalChange={setPrincipal}
            onCurrentRateChange={setCurrentRate}
            onTenureChange={setRemainingTenure}
            onNewRateChange={setNewRate}
            onFeePercentChange={setFeePercent}
            onOtherChargesChange={setOtherCharges}
          />
        </div>

        {/* Right Column: Comparative Debt Payoff Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          <TransferComparisonChart data={result.yearlyTrajectory} />
        </div>
      </div>

      {/* Social Card Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Your Loan Refinance Audit"
        shareText={`I analyzed my home loan balance transfer on MfolioCal: Rate drop from ${currentRate}% to ${newRate}% yields ₹${(
          result.strategyA.netLifetimeSavings / 100000
        ).toFixed(1)} Lakhs in net interest savings with break-even in just ${
          result.strategyA.breakEvenMonths
        } months! Check out the details:`}
        generateCard={handleGenerateCard}
      />
    </div>
  )
}
