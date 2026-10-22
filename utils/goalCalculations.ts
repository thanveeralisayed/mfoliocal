/**
 * Goal-Based Reverse SIP Financial Engine
 * Computes exact monthly SIP needed to reach financial targets,
 * factoring in inflation, annual step-up top-ups, existing savings, and tenure-based asset allocation.
 */

export interface GoalInputs {
  targetAmount: number // Today's estimated cost (e.g., ₹50,00,000)
  targetYears: number // Years to achieve goal (e.g., 10)
  expectedReturn: number // Annual expected return % (e.g., 12.0)
  inflationRate: number // Annual inflation % (e.g., 6.0)
  adjustForInflation: boolean
  stepUpPercent: number // Annual SIP increment % (e.g., 10.0 or 0 for flat)
  existingSavings?: number // Already accumulated lump sum earmarked for this goal
}

export interface AssetAllocationRecommendation {
  equityPercent: number
  debtPercent: number
  goldPercent: number
  riskLevel: "Low Risk" | "Moderate Risk" | "High Growth"
  recommendedCategories: string[]
  reasoning: string
}

export interface GoalYearlyPoint {
  year: number
  investedPrincipal: number
  compoundedValue: number
  targetInflationValue: number
  monthlySip: number
}

export interface GoalCalculationResult {
  effectiveTargetCorpus: number
  todayCost: number
  inflationCostAddition: number
  monthlySipRequired: number
  monthlySipStepUpInitial: number
  totalCapitalInvested: number
  totalWealthGain: number
  wealthMultiplier: number
  futureValueOfExistingSavings: number
  netCorpusFromSip: number
  assetAllocation: AssetAllocationRecommendation
  yearlyTrajectory: GoalYearlyPoint[]
}

/**
 * Recommends optimal asset allocation mix based on investment time horizon
 */
export function getRecommendedAssetAllocation(years: number): AssetAllocationRecommendation {
  if (years <= 3) {
    return {
      equityPercent: 10,
      debtPercent: 80,
      goldPercent: 10,
      riskLevel: "Low Risk",
      recommendedCategories: [
        "Arbitrage Funds",
        "Short Duration Debt Funds",
        "Liquid / Ultra Short Term",
      ],
      reasoning:
        "Short time horizon (< 3 years). Capital preservation is paramount. Avoid equity volatility to prevent sequence-of-returns risk.",
    }
  }

  if (years <= 7) {
    return {
      equityPercent: 55,
      debtPercent: 35,
      goldPercent: 10,
      riskLevel: "Moderate Risk",
      recommendedCategories: [
        "Balanced Advantage / Dynamic Asset Allocation",
        "Large & Mid Cap Funds",
        "Corporate Bond Funds",
      ],
      reasoning:
        "Medium time horizon (3–7 years). A balanced equity-debt hybrid posture captures compounding while cushioning downside market corrections.",
    }
  }

  return {
    equityPercent: 80,
    debtPercent: 15,
    goldPercent: 5,
    riskLevel: "High Growth",
    recommendedCategories: [
      "Flexi Cap Funds",
      "Large Cap / Nifty 50 Index",
      "Mid Cap & Small Cap (Satellite)",
    ],
    reasoning:
      "Long time horizon (7+ years). Ample runway to ride out market cycles and harness maximum equity compounding and rupee-cost averaging.",
  }
}

/**
 * Calculates Reverse SIP requirements and year-by-year trajectory
 */
export function calculateGoalRequirements(inputs: GoalInputs): GoalCalculationResult {
  const {
    targetAmount,
    targetYears,
    expectedReturn,
    inflationRate,
    adjustForInflation,
    stepUpPercent,
    existingSavings = 0,
  } = inputs

  const safeYears = Math.max(1, Math.min(40, targetYears))
  const safeReturn = Math.max(0.1, expectedReturn)
  const safeInflation = adjustForInflation ? Math.max(0, inflationRate) : 0
  const safeStepUp = Math.max(0, stepUpPercent)

  // 1. Calculate future value of the target goal factoring inflation
  const inflationMultiplier = Math.pow(1 + safeInflation / 100, safeYears)
  const effectiveTargetCorpus = targetAmount * inflationMultiplier
  const inflationCostAddition = effectiveTargetCorpus - targetAmount

  // 2. Future value of existing earmarked savings
  const existingSavingsFV = existingSavings * Math.pow(1 + safeReturn / 100, safeYears)

  // 3. Net corpus that must be created exclusively via new monthly SIP
  const netCorpusNeeded = Math.max(0, effectiveTargetCorpus - existingSavingsFV)

  // Monthly return rate
  const monthlyRate = Math.pow(1 + safeReturn / 100, 1 / 12) - 1
  const totalMonths = safeYears * 12

  // 4. Calculate required monthly flat SIP
  let monthlySipFlat = 0
  if (netCorpusNeeded > 0) {
    if (monthlyRate === 0) {
      monthlySipFlat = netCorpusNeeded / totalMonths
    } else {
      const compoundingFactor = Math.pow(1 + monthlyRate, totalMonths) - 1
      monthlySipFlat = (netCorpusNeeded * monthlyRate) / (compoundingFactor * (1 + monthlyRate))
    }
  }

  // 5. Calculate initial monthly SIP if using annual step-up
  let monthlySipStepUpInitial = monthlySipFlat
  if (safeStepUp > 0 && netCorpusNeeded > 0) {
    // Solve for Year 1 SIP (S_0) using weighted compounding sum across years
    let totalAccumulationWeight = 0
    for (let year = 1; year <= safeYears; year++) {
      const yearStepMultiplier = Math.pow(1 + safeStepUp / 100, year - 1)
      const remainingMonths = (safeYears - year) * 12
      // Each year has 12 monthly contributions that grow until end of tenure
      for (let m = 1; m <= 12; m++) {
        const monthsCompounding = remainingMonths + (12 - m) + 1
        totalAccumulationWeight += yearStepMultiplier * Math.pow(1 + monthlyRate, monthsCompounding)
      }
    }
    monthlySipStepUpInitial = totalAccumulationWeight > 0 ? netCorpusNeeded / totalAccumulationWeight : monthlySipFlat
  }

  // Choose the active SIP structure (step-up vs flat) to generate the trajectory
  const useStepUp = safeStepUp > 0
  const baseMonthlySip = useStepUp ? monthlySipStepUpInitial : monthlySipFlat

  // 6. Generate year-by-year trajectory
  const yearlyTrajectory: GoalYearlyPoint[] = []
  let cumulativeInvested = existingSavings
  let currentCorpus = existingSavings

  for (let year = 1; year <= safeYears; year++) {
    const currentYearMonthlySip = useStepUp
      ? baseMonthlySip * Math.pow(1 + safeStepUp / 100, year - 1)
      : baseMonthlySip

    for (let m = 1; m <= 12; m++) {
      currentCorpus = (currentCorpus + currentYearMonthlySip) * (1 + monthlyRate)
      cumulativeInvested += currentYearMonthlySip
    }

    const yearTargetWithInflation = targetAmount * Math.pow(1 + safeInflation / 100, year)

    yearlyTrajectory.push({
      year,
      investedPrincipal: Math.round(cumulativeInvested),
      compoundedValue: Math.round(currentCorpus),
      targetInflationValue: Math.round(yearTargetWithInflation),
      monthlySip: Math.round(currentYearMonthlySip),
    })
  }

  const finalPoint = yearlyTrajectory[yearlyTrajectory.length - 1]
  const totalCapitalInvested = finalPoint ? finalPoint.investedPrincipal : cumulativeInvested
  const finalCorpus = finalPoint ? finalPoint.compoundedValue : currentCorpus
  const totalWealthGain = Math.max(0, finalCorpus - totalCapitalInvested)
  const wealthMultiplier = totalCapitalInvested > 0 ? finalCorpus / totalCapitalInvested : 1

  return {
    effectiveTargetCorpus: Math.round(effectiveTargetCorpus),
    todayCost: targetAmount,
    inflationCostAddition: Math.round(inflationCostAddition),
    monthlySipRequired: Math.round(monthlySipFlat),
    monthlySipStepUpInitial: Math.round(monthlySipStepUpInitial),
    totalCapitalInvested: Math.round(totalCapitalInvested),
    totalWealthGain: Math.round(totalWealthGain),
    wealthMultiplier: Number(wealthMultiplier.toFixed(2)),
    futureValueOfExistingSavings: Math.round(existingSavingsFV),
    netCorpusFromSip: Math.round(netCorpusNeeded),
    assetAllocation: getRecommendedAssetAllocation(safeYears),
    yearlyTrajectory,
  }
}
