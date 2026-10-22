/**
 * Home Loan Balance Transfer & Refinance ROI Mathematics Engine
 * Evaluates switching friction costs, break-even period, and dual strategies (Lower EMI vs. Slash Tenure).
 */

export interface BalanceTransferInputs {
  outstandingPrincipal: number // e.g. ₹45,00,000
  currentRate: number // e.g. 9.25%
  remainingTenureYears: number // e.g. 17 Years
  newRate: number // e.g. 8.40%
  processingFeePercent: number // e.g. 0.25% or 0.5%
  otherCharges: number // MODT, legal, valuation fees, e.g. ₹8,000
  existingBankForeclosureFee?: number // Usually 0% for floating loans under RBI
}

export interface BalanceTransferStrategyA {
  // Strategy A: Reduce Monthly EMI (Same Remaining Tenure)
  newMonthlyEmi: number
  monthlyEmiSavings: number
  totalInterestPaid: number
  grossInterestSavings: number
  netLifetimeSavings: number // After deducting switching cost
  breakEvenMonths: number
  breakEvenYears: number
}

export interface BalanceTransferStrategyB {
  // Strategy B: Keep Same Monthly EMI (Finish Loan Years Earlier)
  maintainedMonthlyEmi: number
  newTenureMonths: number
  newTenureYears: number
  monthsSaved: number
  yearsSaved: number
  totalInterestPaid: number
  grossInterestSavings: number
  netLifetimeSavings: number
  breakEvenMonths: number
}

export interface TransferYearPoint {
  year: number
  currentLoanBalance: number
  reducedEmiBalance: number
  slashedTenureBalance: number
  cumulativeSavings: number
  isBreakEvenAchieved: boolean
}

export interface BalanceTransferResult {
  // Base current loan
  currentMonthlyEmi: number
  currentTotalInterestRemaining: number
  currentTotalPaymentRemaining: number
  rateDifferenceBps: number // Basis points (e.g. 85 bps)

  // Switching friction
  processingFeeAmount: number
  totalSwitchingCost: number

  // Strategies
  strategyA: BalanceTransferStrategyA
  strategyB: BalanceTransferStrategyB

  // Verdict & Guidance
  verdict: "Strongly Recommended" | "Moderate ROI (Negotiate First)" | "Not Recommended"
  verdictDescription: string
  negotiationTip: string

  // Trajectory for charts
  yearlyTrajectory: TransferYearPoint[]
}

/**
 * Standard EMI calculation helper
 */
function calculateEmi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0
  const monthlyRate = annualRate / 12 / 100
  if (monthlyRate === 0) return principal / months
  const factor = Math.pow(1 + monthlyRate, months)
  return (principal * monthlyRate * factor) / (factor - 1)
}

export function calculateBalanceTransfer(inputs: BalanceTransferInputs): BalanceTransferResult {
  const {
    outstandingPrincipal,
    currentRate,
    remainingTenureYears,
    newRate,
    processingFeePercent,
    otherCharges,
    existingBankForeclosureFee = 0,
  } = inputs

  const principal = Math.max(100000, outstandingPrincipal)
  const currentAnnualRate = Math.max(0.1, currentRate)
  const newAnnualRate = Math.max(0.1, newRate)
  const tenureYears = Math.max(1, Math.min(35, remainingTenureYears))
  const totalMonths = Math.round(tenureYears * 12)

  // 1. Current Loan Baseline
  const currentMonthlyEmi = calculateEmi(principal, currentAnnualRate, totalMonths)
  const currentTotalPaymentRemaining = currentMonthlyEmi * totalMonths
  const currentTotalInterestRemaining = Math.max(0, currentTotalPaymentRemaining - principal)
  const rateDifferenceBps = Math.round((currentAnnualRate - newAnnualRate) * 100)

  // 2. Switching Friction Costs
  const processingFeeAmount = (principal * Math.max(0, processingFeePercent)) / 100
  const totalSwitchingCost = Math.round(
    processingFeeAmount + Math.max(0, otherCharges) + Math.max(0, existingBankForeclosureFee)
  )

  // 3. Strategy A: Reduce EMI (Same Remaining Tenure)
  const newMonthlyEmiA = calculateEmi(principal, newAnnualRate, totalMonths)
  const monthlyEmiSavings = Math.max(0, currentMonthlyEmi - newMonthlyEmiA)
  const totalPaymentA = newMonthlyEmiA * totalMonths
  const totalInterestA = Math.max(0, totalPaymentA - principal)
  const grossInterestSavingsA = Math.max(0, currentTotalInterestRemaining - totalInterestA)
  const netLifetimeSavingsA = grossInterestSavingsA - totalSwitchingCost

  const breakEvenMonthsA =
    monthlyEmiSavings > 0
      ? Math.ceil(totalSwitchingCost / monthlyEmiSavings)
      : 999
  const breakEvenYearsA = Number((breakEvenMonthsA / 12).toFixed(1))

  // 4. Strategy B: Maintain Same EMI (Slash Tenure)
  let newTenureMonthsB = totalMonths
  let monthsSavedB = 0
  let totalInterestB = totalInterestA
  const maintainedMonthlyEmi = currentMonthlyEmi

  const newMonthlyRate = newAnnualRate / 12 / 100
  if (maintainedMonthlyEmi > principal * newMonthlyRate) {
    // Exact logarithmic formula to solve for months:
    const num = Math.log(1 - (principal * newMonthlyRate) / maintainedMonthlyEmi)
    const den = Math.log(1 + newMonthlyRate)
    newTenureMonthsB = Math.max(1, Math.ceil(-num / den))
    monthsSavedB = Math.max(0, totalMonths - newTenureMonthsB)
    totalInterestB = Math.max(0, maintainedMonthlyEmi * newTenureMonthsB - principal)
  }

  const yearsSavedB = Number((monthsSavedB / 12).toFixed(1))
  const grossInterestSavingsB = Math.max(0, currentTotalInterestRemaining - totalInterestB)
  const netLifetimeSavingsB = grossInterestSavingsB - totalSwitchingCost

  // Initial monthly interest reduction for Strategy B break-even:
  const month1InterestOld = (principal * (currentAnnualRate / 12)) / 100
  const month1InterestNew = (principal * (newAnnualRate / 12)) / 100
  const monthlyInterestDelta = Math.max(1, month1InterestOld - month1InterestNew)
  const breakEvenMonthsB = Math.ceil(totalSwitchingCost / monthlyInterestDelta)

  // 5. Intelligent Verdict Engine
  let verdict: "Strongly Recommended" | "Moderate ROI (Negotiate First)" | "Not Recommended" =
    "Strongly Recommended"
  let verdictDescription = ""
  let negotiationTip = ""

  if (newAnnualRate >= currentAnnualRate) {
    verdict = "Not Recommended"
    verdictDescription =
      "The new interest rate is equal to or higher than your current rate. A balance transfer will incur fees with negative ROI."
    negotiationTip = "Stay with your current lender or look for competitive offers below your current rate."
  } else if (netLifetimeSavingsA <= 0 || breakEvenMonthsA > 36) {
    verdict = "Not Recommended"
    verdictDescription = `Transfer fees (₹${(totalSwitchingCost / 1000).toFixed(0)}k) outweigh the interest saved over your remaining tenure. Break-even exceeds 3 years.`
    negotiationTip =
      "Your remaining loan tenure or principal is too small to justify switching bank paperwork."
  } else if (breakEvenMonthsA <= 10 && netLifetimeSavingsA >= 200000) {
    verdict = "Strongly Recommended"
    verdictDescription = `Excellent financial arbitrage. With a rate drop of ${(rateDifferenceBps / 100).toFixed(2)}%, you break even in just ${breakEvenMonthsA} months and pocket ₹${(netLifetimeSavingsA / 100000).toFixed(1)} Lakhs in net interest savings.`
    negotiationTip =
      "Proceed with the transfer, but ask your current bank first if they will match this rate for a nominal rate conversion fee (typically ₹1,000–₹5,000) to save yourself the paperwork!"
  } else {
    verdict = "Moderate ROI (Negotiate First)"
    verdictDescription = `Viable savings of ₹${(netLifetimeSavingsA / 100000).toFixed(1)} Lakhs, but switching costs take ${breakEvenMonthsA} months to recover.`
    negotiationTip =
      "Call your current bank relationship manager. Request an internal rate reduction under their 'repricing policy' before initiating an external balance transfer."
  }

  // 6. Generate yearly timeline points
  const yearlyTrajectory: TransferYearPoint[] = []
  let balCurrent = principal
  let balStratA = principal
  let balStratB = principal
  let cumSavings = 0

  const curMonthlyRate = currentAnnualRate / 12 / 100
  const curMonthlyEmiVal = currentMonthlyEmi
  const newMonthlyEmiValA = newMonthlyEmiA

  for (let yr = 1; yr <= tenureYears; yr++) {
    for (let m = 1; m <= 12; m++) {
      // Current loan step
      if (balCurrent > 0) {
        const intCur = balCurrent * curMonthlyRate
        const priCur = Math.min(balCurrent, curMonthlyEmiVal - intCur)
        balCurrent = Math.max(0, balCurrent - priCur)
      }

      // Strategy A step (lower EMI)
      if (balStratA > 0) {
        const intA = balStratA * newMonthlyRate
        const priA = Math.min(balStratA, newMonthlyEmiValA - intA)
        balStratA = Math.max(0, balStratA - priA)
      }

      // Strategy B step (slashed tenure)
      if (balStratB > 0) {
        const intB = balStratB * newMonthlyRate
        const priB = Math.min(balStratB, maintainedMonthlyEmi - intB)
        balStratB = Math.max(0, balStratB - priB)
      }

      cumSavings += Math.max(0, curMonthlyEmiVal - newMonthlyEmiValA)
    }

    yearlyTrajectory.push({
      year: yr,
      currentLoanBalance: Math.round(balCurrent),
      reducedEmiBalance: Math.round(balStratA),
      slashedTenureBalance: Math.round(balStratB),
      cumulativeSavings: Math.round(cumSavings),
      isBreakEvenAchieved: yr * 12 >= breakEvenMonthsA,
    })
  }

  return {
    currentMonthlyEmi: Math.round(currentMonthlyEmi),
    currentTotalInterestRemaining: Math.round(currentTotalInterestRemaining),
    currentTotalPaymentRemaining: Math.round(currentTotalPaymentRemaining),
    rateDifferenceBps,
    processingFeeAmount: Math.round(processingFeeAmount),
    totalSwitchingCost,
    strategyA: {
      newMonthlyEmi: Math.round(newMonthlyEmiA),
      monthlyEmiSavings: Math.round(monthlyEmiSavings),
      totalInterestPaid: Math.round(totalInterestA),
      grossInterestSavings: Math.round(grossInterestSavingsA),
      netLifetimeSavings: Math.round(netLifetimeSavingsA),
      breakEvenMonths: breakEvenMonthsA,
      breakEvenYears: breakEvenYearsA,
    },
    strategyB: {
      maintainedMonthlyEmi: Math.round(maintainedMonthlyEmi),
      newTenureMonths: newTenureMonthsB,
      newTenureYears: Number((newTenureMonthsB / 12).toFixed(1)),
      monthsSaved: monthsSavedB,
      yearsSaved: yearsSavedB,
      totalInterestPaid: Math.round(totalInterestB),
      grossInterestSavings: Math.round(grossInterestSavingsB),
      netLifetimeSavings: Math.round(netLifetimeSavingsB),
      breakEvenMonths: breakEvenMonthsB,
    },
    verdict,
    verdictDescription,
    negotiationTip,
    yearlyTrajectory,
  }
}
