/**
 * Home Loan Prepayment vs. Equity SIP Arbitrage Mathematics Engine
 * Rigorous month-by-month financial simulation comparing loan prepayment vs equity SIP investment.
 */

export interface ArbitrageInputs {
  loanPrincipal: number          // e.g. 5,000,000 (50 Lakhs)
  loanRate: number               // e.g. 8.5%
  loanTenureYears: number        // e.g. 20 Years
  monthlySurplus: number         // e.g. 10,000/month
  annualLumpSum: number          // e.g. 50,000/year (e.g. bonus)
  expectedSipReturn: number      // e.g. 13.0% CAGR
  includeTaxImpact?: boolean     // LTCG 12.5% & Section 24(b) deduction
  taxBracketPercent?: number     // e.g. 30% for tax shield calculation
}

export interface YearSnapshot {
  year: number
  // Prepay Pathway
  prepayLoanBalance: number
  prepayCumulativeInterest: number
  prepayRedirectedCorpus: number
  prepayTotalWealth: number       // Redirected Corpus - Remaining Loan Balance
  isDebtFree: boolean

  // SIP Pathway
  sipLoanBalance: number
  sipCumulativeInterest: number
  sipInvestedPrincipal: number
  sipPortfolioValue: number
  sipTotalWealth: number          // Portfolio Value - Remaining Loan Balance

  // Delta
  wealthDifference: number        // sipTotalWealth - prepayTotalWealth (Positive means SIP leads)
}

export interface ArbitrageResult {
  // Base loan metrics
  standardMonthlyEmi: number
  standardTotalInterest: number
  standardTotalPayment: number
  standardTenureMonths: number

  // Prepayment pathway results
  prepayPayoffMonth: number
  prepayPayoffYears: number
  monthsSaved: number
  yearsSaved: number
  prepayTotalInterestPaid: number
  interestSaved: number
  prepayTotalPrincipalInvested: number // Sum of surplus paid + redirected EMI
  prepayFinalCorpus: number           // Value of redirected EMI accumulated by year T
  prepayNetWealthAtTenureEnd: number  // prepayFinalCorpus

  // SIP pathway results
  sipTotalInvested: number            // Total surplus capital invested
  sipFinalCorpus: number              // Value of SIP portfolio at year T
  sipTotalInterestPaid: number        // Standard total interest paid
  sipNetWealthAtTenureEnd: number     // sipFinalCorpus (since standard loan is 0 at year T)

  // Comparative Arbitrage Metrics
  netWealthAdvantage: number          // sipNetWealthAtTenureEnd - prepayNetWealthAtTenureEnd
  percentageAdvantage: number         // (netWealthAdvantage / prepayNetWealthAtTenureEnd) * 100
  arbitrageSpread: number             // expectedSipReturn - loanRate
  crossoverYear: number | null        // Year when SIP wealth permanently beats prepayment interest saved
  
  // Tax Metrics (if enabled)
  taxSavingsOnLoanInterest: number    // Section 24(b) tax savings on standard loan
  taxSavingsLostByPrepaying: number   // Section 24(b) tax shield forfeited by clearing loan early
  estimatedLtcgTax: number            // Estimated 12.5% LTCG tax on SIP capital gains (> ₹1.25L exemption)
  netPostTaxAdvantage: number

  // Annual timeline for charts and tables
  timeline: YearSnapshot[]
}

/**
 * Format currency in Indian format
 */
export function formatINR(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(val))
}

/**
 * Format compact currency in Lakhs / Crores
 */
export function formatCompactINR(val: number): string {
  if (isNaN(val)) return "₹0"
  const abs = Math.abs(val)
  const sign = val < 0 ? "-" : ""
  if (abs >= 10000000) {
    const cr = abs / 10000000
    return `${sign}₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`
  }
  if (abs >= 100000) {
    const l = abs / 100000
    return `${sign}₹${Number.isInteger(l) ? l : l.toFixed(1)} L`
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(0)}k`
  }
  return `${sign}₹${Math.round(abs)}`
}

/**
 * Calculate Standard Home Loan EMI
 */
export function getStandardEmi(principal: number, annualRate: number, tenureYears: number): number {
  if (principal <= 0 || tenureYears <= 0) return 0
  const monthlyRate = annualRate / 12 / 100
  const totalMonths = tenureYears * 12
  if (monthlyRate === 0) return principal / totalMonths
  const factor = Math.pow(1 + monthlyRate, totalMonths)
  return (principal * monthlyRate * factor) / (factor - 1)
}

/**
 * Master Arbitrage Calculation Engine
 */
export function calculateArbitrage(inputs: ArbitrageInputs): ArbitrageResult {
  const {
    loanPrincipal,
    loanRate,
    loanTenureYears,
    monthlySurplus,
    annualLumpSum,
    expectedSipReturn,
    includeTaxImpact = false,
    taxBracketPercent = 30,
  } = inputs

  const totalMonths = Math.max(1, Math.round(loanTenureYears * 12))
  const monthlyLoanRate = loanRate / 12 / 100
  const monthlySipRate = expectedSipReturn / 12 / 100
  const standardEmi = getStandardEmi(loanPrincipal, loanRate, loanTenureYears)
  const standardTotalPayment = standardEmi * totalMonths
  const standardTotalInterest = Math.max(0, standardTotalPayment - loanPrincipal)

  // Simulation Trackers
  // Pathway 1: Prepayment
  let prepayBalance = loanPrincipal
  let prepayCumulativeInterest = 0
  let prepayPayoffMonth = totalMonths
  let prepayRedirectedCorpus = 0
  let isLoanCleared = false

  // Pathway 2: SIP Arbitrage
  let standardBalance = loanPrincipal
  let standardCumulativeInterest = 0
  let sipPortfolioValue = 0
  let sipInvestedPrincipal = 0

  // Tax trackers
  let standardTotalSec24Savings = 0
  let prepayTotalSec24Savings = 0

  const monthlySnapshots: {
    month: number
    prepayBalance: number
    prepayCumulativeInterest: number
    prepayRedirectedCorpus: number
    prepayTotalWealth: number
    isDebtFree: boolean
    standardBalance: number
    standardCumulativeInterest: number
    sipInvestedPrincipal: number
    sipPortfolioValue: number
    sipTotalWealth: number
  }[] = []

  let crossoverYear: number | null = null

  // Month-by-month simulation for the entire original loan tenure
  for (let m = 1; m <= totalMonths; m++) {
    const isYearEnd = m % 12 === 0
    const lumpSumThisMonth = isYearEnd ? annualLumpSum : 0

    // --- 1. PREPAYMENT TRACKER ---
    if (!isLoanCleared) {
      const monthInterest = prepayBalance * monthlyLoanRate
      prepayCumulativeInterest += monthInterest

      // Tax shield tracker under Sec 24(b) (max 2L deduction per financial year)
      // Approx monthly tax benefit if under old regime
      const maxMonthlySec24 = 200000 / 12
      prepayTotalSec24Savings += Math.min(monthInterest, maxMonthlySec24) * (taxBracketPercent / 100)

      const availableForPrincipal = (standardEmi - monthInterest) + monthlySurplus + lumpSumThisMonth

      if (availableForPrincipal >= prepayBalance) {
        // Loan fully settled this month!
        prepayBalance = 0
        prepayPayoffMonth = m
        isLoanCleared = true
      } else {
        prepayBalance -= availableForPrincipal
      }
    } else {
      // Loan is already 0! Reinvest the budgeted cashflow: standardEmi + monthlySurplus (+ lump sum at year end)
      const cashflowToInvest = standardEmi + monthlySurplus + lumpSumThisMonth
      prepayRedirectedCorpus = (prepayRedirectedCorpus + cashflowToInvest) * (1 + monthlySipRate)
    }

    // --- 2. SIP ARBITRAGE TRACKER ---
    // Standard Loan payment
    if (standardBalance > 0) {
      const stdInterest = standardBalance * monthlyLoanRate
      standardCumulativeInterest += stdInterest
      standardTotalSec24Savings += Math.min(stdInterest, 200000 / 12) * (taxBracketPercent / 100)
      const stdPrincipalPaid = standardEmi - stdInterest
      standardBalance = Math.max(0, standardBalance - stdPrincipalPaid)
    }

    // Surplus invested into SIP
    const sipDeposit = monthlySurplus + lumpSumThisMonth
    sipInvestedPrincipal += sipDeposit
    sipPortfolioValue = (sipPortfolioValue + sipDeposit) * (1 + monthlySipRate)

    // Calculate net wealth at this month
    const prepayTotalWealth = prepayRedirectedCorpus - prepayBalance
    const sipTotalWealth = sipPortfolioValue - standardBalance

    // Check for Crossover Year (when SIP wealth surpasses interest saved)
    const currentInterestSaved = standardTotalInterest - prepayCumulativeInterest
    if (crossoverYear === null && sipPortfolioValue > 0 && sipPortfolioValue >= currentInterestSaved && m >= 12) {
      crossoverYear = Number((m / 12).toFixed(1))
    }

    monthlySnapshots.push({
      month: m,
      prepayBalance: Math.max(0, prepayBalance),
      prepayCumulativeInterest,
      prepayRedirectedCorpus,
      prepayTotalWealth,
      isDebtFree: isLoanCleared,
      standardBalance: Math.max(0, standardBalance),
      standardCumulativeInterest,
      sipInvestedPrincipal,
      sipPortfolioValue,
      sipTotalWealth,
    })
  }

  // Yearly snapshots for charts and table
  const timeline: YearSnapshot[] = []
  const totalYears = Math.ceil(loanTenureYears)
  for (let y = 1; y <= totalYears; y++) {
    const monthIndex = Math.min(y * 12 - 1, monthlySnapshots.length - 1)
    const snap = monthlySnapshots[monthIndex]

    timeline.push({
      year: y,
      prepayLoanBalance: Math.round(snap.prepayBalance),
      prepayCumulativeInterest: Math.round(snap.prepayCumulativeInterest),
      prepayRedirectedCorpus: Math.round(snap.prepayRedirectedCorpus),
      prepayTotalWealth: Math.round(snap.prepayTotalWealth),
      isDebtFree: snap.isDebtFree,

      sipLoanBalance: Math.round(snap.standardBalance),
      sipCumulativeInterest: Math.round(snap.standardCumulativeInterest),
      sipInvestedPrincipal: Math.round(snap.sipInvestedPrincipal),
      sipPortfolioValue: Math.round(snap.sipPortfolioValue),
      sipTotalWealth: Math.round(snap.sipTotalWealth),

      wealthDifference: Math.round(snap.sipTotalWealth - snap.prepayTotalWealth),
    })
  }

  // Summary Metrics
  const monthsSaved = Math.max(0, totalMonths - prepayPayoffMonth)
  const yearsSaved = Number((monthsSaved / 12).toFixed(1))
  const interestSaved = Math.max(0, standardTotalInterest - prepayCumulativeInterest)

  const prepayFinalCorpus = Math.round(prepayRedirectedCorpus)
  const sipFinalCorpus = Math.round(sipPortfolioValue)

  // Net Wealth at Tenure End (Both loans are 0 at year T)
  const prepayNetWealthAtTenureEnd = prepayFinalCorpus
  const sipNetWealthAtTenureEnd = sipFinalCorpus
  const netWealthAdvantage = sipNetWealthAtTenureEnd - prepayNetWealthAtTenureEnd
  const percentageAdvantage =
    prepayNetWealthAtTenureEnd > 0
      ? Number(((netWealthAdvantage / prepayNetWealthAtTenureEnd) * 100).toFixed(1))
      : 0

  // Tax calculations:
  // Tax savings lost by prepaying early:
  const taxSavingsLostByPrepaying = Math.max(0, standardTotalSec24Savings - prepayTotalSec24Savings)
  // Estimated LTCG Tax on SIP gains:
  // Capital Gains = Final Value - Invested Principal. LTCG tax is 12.5% above exemption
  const totalSipGains = Math.max(0, sipFinalCorpus - sipInvestedPrincipal)
  const estimatedLtcgTax = Math.round(Math.max(0, totalSipGains - 125000) * 0.125)

  // Post tax advantage calculation
  const netPostTaxAdvantage =
    netWealthAdvantage - estimatedLtcgTax + (includeTaxImpact ? taxSavingsLostByPrepaying : 0)

  return {
    standardMonthlyEmi: Math.round(standardEmi),
    standardTotalInterest: Math.round(standardTotalInterest),
    standardTotalPayment: Math.round(standardTotalPayment),
    standardTenureMonths: totalMonths,

    prepayPayoffMonth,
    prepayPayoffYears: Number((prepayPayoffMonth / 12).toFixed(1)),
    monthsSaved,
    yearsSaved,
    prepayTotalInterestPaid: Math.round(prepayCumulativeInterest),
    interestSaved: Math.round(interestSaved),
    prepayTotalPrincipalInvested: Math.round(
      (monthlySurplus * prepayPayoffMonth) +
      (annualLumpSum * Math.floor(prepayPayoffMonth / 12)) +
      ((standardEmi + monthlySurplus) * (totalMonths - prepayPayoffMonth))
    ),
    prepayFinalCorpus,
    prepayNetWealthAtTenureEnd,

    sipTotalInvested: Math.round(sipInvestedPrincipal),
    sipFinalCorpus,
    sipTotalInterestPaid: Math.round(standardTotalInterest),
    sipNetWealthAtTenureEnd,

    netWealthAdvantage: Math.round(netWealthAdvantage),
    percentageAdvantage,
    arbitrageSpread: Number((expectedSipReturn - loanRate).toFixed(2)),
    crossoverYear,

    taxSavingsOnLoanInterest: Math.round(standardTotalSec24Savings),
    taxSavingsLostByPrepaying: Math.round(taxSavingsLostByPrepaying),
    estimatedLtcgTax,
    netPostTaxAdvantage: Math.round(netPostTaxAdvantage),

    timeline,
  }
}
