"use client"

import * as React from "react"
import { useQueryState, parseAsInteger, parseAsFloat, parseAsBoolean } from "nuqs"
import { calculateGoalRequirements, GoalInputs } from "@/utils/goalCalculations"
import { GoalForm, GoalPreset } from "./goalForm"
import { GoalHeroCard } from "./goalHeroCard"
import { GoalAllocationBreakdown } from "./goalAllocationBreakdown"
import { GoalGrowthChart } from "./goalGrowthChart"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"
import { ShareModal } from "@/components/user/sharing/shareModal"
import { generateGoalShareCard } from "@/components/user/sharing/canvasCardGenerator"

export function GoalPlanner() {
  const { updateGoalContext } = useFinancialAssistant()

  // URL state synchronization using nuqs
  const [targetAmount, setTargetAmount] = useQueryState(
    "amount",
    parseAsInteger.withDefault(3500000) // Default ₹35 Lakhs
  )
  const [targetYears, setTargetYears] = useQueryState(
    "years",
    parseAsInteger.withDefault(10) // Default 10 Years
  )
  const [expectedReturn, setExpectedReturn] = useQueryState(
    "return",
    parseAsFloat.withDefault(12.0) // Default 12% CAGR
  )
  const [inflationRate, setInflationRate] = useQueryState(
    "inflation",
    parseAsFloat.withDefault(6.0) // Default 6% inflation
  )
  const [adjustForInflation, setAdjustForInflation] = useQueryState(
    "adjInf",
    parseAsBoolean.withDefault(true)
  )
  const [stepUpPercent, setStepUpPercent] = useQueryState(
    "stepUp",
    parseAsInteger.withDefault(0)
  )
  const [existingSavings, setExistingSavings] = useQueryState(
    "savings",
    parseAsInteger.withDefault(0)
  )

  // Share modal state
  const [isShareOpen, setIsShareOpen] = React.useState(false)

  // Main calculation memo
  const result = React.useMemo(() => {
    const inputs: GoalInputs = {
      targetAmount,
      targetYears,
      expectedReturn,
      inflationRate,
      adjustForInflation,
      stepUpPercent,
      existingSavings,
    }
    return calculateGoalRequirements(inputs)
  }, [
    targetAmount,
    targetYears,
    expectedReturn,
    inflationRate,
    adjustForInflation,
    stepUpPercent,
    existingSavings,
  ])

  // Sync with global Kuber AI Assistant context
  React.useEffect(() => {
    if (updateGoalContext) {
      updateGoalContext({
        targetAmount,
        targetYears,
        expectedReturn,
        inflationRate,
        adjustForInflation,
        effectiveTargetCorpus: result.effectiveTargetCorpus,
        monthlySipRequired: result.monthlySipRequired,
        monthlySipStepUpInitial: result.monthlySipStepUpInitial,
        stepUpPercent,
        totalCapitalInvested: result.totalCapitalInvested,
        totalWealthGain: result.totalWealthGain,
        wealthMultiplier: result.wealthMultiplier,
        riskLevel: result.assetAllocation.riskLevel,
      })
    }
  }, [
    targetAmount,
    targetYears,
    expectedReturn,
    inflationRate,
    adjustForInflation,
    stepUpPercent,
    result,
    updateGoalContext,
  ])

  const handleApplyPreset = (preset: GoalPreset) => {
    setTargetAmount(preset.amount)
    setTargetYears(preset.years)
    setExpectedReturn(preset.returnRate)
    setInflationRate(preset.inflation)
    setAdjustForInflation(true)
  }

  // Generator callback for the visual share card
  const handleGenerateCard = React.useCallback(async () => {
    return generateGoalShareCard({
      targetAmount,
      effectiveTargetCorpus: result.effectiveTargetCorpus,
      targetYears,
      monthlySip: stepUpPercent > 0 ? result.monthlySipStepUpInitial : result.monthlySipRequired,
      totalInvested: result.totalCapitalInvested,
      wealthMultiplier: result.wealthMultiplier,
      riskLevel: result.assetAllocation.riskLevel,
      stepUpPercent,
    })
  }, [targetAmount, targetYears, result, stepUpPercent])

  return (
    <div className="space-y-8">
      {/* Top Hero Card */}
      <GoalHeroCard
        result={result}
        targetYears={targetYears}
        adjustForInflation={adjustForInflation}
        stepUpPercent={stepUpPercent}
        onShareClick={() => setIsShareOpen(true)}
      />

      {/* Main Grid: Form on Left, Allocation Breakdown & Charts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Controls */}
        <div className="lg:col-span-5 space-y-6">
          <GoalForm
            targetAmount={targetAmount}
            targetYears={targetYears}
            expectedReturn={expectedReturn}
            inflationRate={inflationRate}
            adjustForInflation={adjustForInflation}
            stepUpPercent={stepUpPercent}
            existingSavings={existingSavings}
            onAmountChange={setTargetAmount}
            onYearsChange={setTargetYears}
            onReturnChange={setExpectedReturn}
            onInflationChange={setInflationRate}
            onAdjustInflationChange={setAdjustForInflation}
            onStepUpChange={setStepUpPercent}
            onExistingSavingsChange={setExistingSavings}
            onApplyPreset={handleApplyPreset}
          />
        </div>

        {/* Visualizers & Breakdowns */}
        <div className="lg:col-span-7 space-y-6">
          <GoalAllocationBreakdown
            allocation={result.assetAllocation}
            monthlySip={
              stepUpPercent > 0 ? result.monthlySipStepUpInitial : result.monthlySipRequired
            }
            targetYears={targetYears}
          />

          <GoalGrowthChart
            data={result.yearlyTrajectory}
            targetAmount={result.effectiveTargetCorpus}
            adjustForInflation={adjustForInflation}
          />
        </div>
      </div>

      {/* Social Card Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="Share Your Goal Plan"
        shareText={`I planned my financial milestone of ₹${(result.effectiveTargetCorpus / 100000).toFixed(1)} Lakhs in ${targetYears} years on MfolioCal! Check out the required monthly SIP and asset allocation plan:`}
        generateCard={handleGenerateCard}
      />
    </div>
  )
}
