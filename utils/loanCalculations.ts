export interface LoanCalculationResult {
  monthlyEmi: number
  totalPrincipal: number
  totalInterest: number
  totalPayment: number
  interestRatio: number // % of total payment that is interest
}

export interface YearlyAmortization {
  year: number
  openingBalance: number
  principalPaid: number
  interestPaid: number
  totalPayment: number
  closingBalance: number
  loanRemainingPercent: number
}

export interface MonthlyAmortization {
  month: number
  year: number
  openingBalance: number
  principalPaid: number
  interestPaid: number
  totalPayment: number
  closingBalance: number
}

/**
 * Calculate Monthly EMI and totals
 */
export function calculateHomeLoan(
  principal: number,
  annualRate: number,
  tenureYears: number
): LoanCalculationResult {
  if (principal <= 0 || tenureYears <= 0) {
    return {
      monthlyEmi: 0,
      totalPrincipal: principal,
      totalInterest: 0,
      totalPayment: 0,
      interestRatio: 0,
    }
  }

  const monthlyRate = annualRate / 12 / 100
  const totalMonths = tenureYears * 12

  let monthlyEmi = 0
  if (monthlyRate === 0) {
    monthlyEmi = principal / totalMonths
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths)
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1)
  }

  const totalPayment = monthlyEmi * totalMonths
  const totalInterest = Math.max(0, totalPayment - principal)
  const interestRatio = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalPrincipal: Math.round(principal),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    interestRatio: Number(interestRatio.toFixed(1)),
  }
}

/**
 * Generate full Year-by-Year Amortization Schedule
 */
export function calculateYearlyAmortization(
  principal: number,
  annualRate: number,
  tenureYears: number
): YearlyAmortization[] {
  if (principal <= 0 || tenureYears <= 0) return []

  const monthlyRate = annualRate / 12 / 100
  const totalMonths = tenureYears * 12

  let emi = 0
  if (monthlyRate === 0) {
    emi = principal / totalMonths
  } else {
    const factor = Math.pow(1 + monthlyRate, totalMonths)
    emi = (principal * monthlyRate * factor) / (factor - 1)
  }

  const schedule: YearlyAmortization[] = []
  let balance = principal

  for (let y = 1; y <= tenureYears; y++) {
    const openingBalance = balance
    let yearPrincipal = 0
    let yearInterest = 0

    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break
      const interestForMonth = balance * monthlyRate
      let principalForMonth = emi - interestForMonth

      if (principalForMonth > balance) {
        principalForMonth = balance
      }

      yearInterest += interestForMonth
      yearPrincipal += principalForMonth
      balance = Math.max(0, balance - principalForMonth)
    }

    const totalPaid = yearPrincipal + yearInterest
    const loanRemainingPercent = (balance / principal) * 100

    schedule.push({
      year: y,
      openingBalance: Math.round(openingBalance),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      totalPayment: Math.round(totalPaid),
      closingBalance: Math.round(balance),
      loanRemainingPercent: Math.max(0, Number(loanRemainingPercent.toFixed(1))),
    })

    if (balance <= 0) break
  }

  return schedule
}

/**
 * Format numbers as Indian Rupee (INR)
 */
export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val)
}

/**
 * Format compact representations in Lakhs / Crores
 */
export function formatCompactINR(val: number): string {
  if (val >= 10000000) {
    const cr = val / 10000000
    return `₹ ${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`
  }
  if (val >= 100000) {
    const l = val / 100000
    return `₹ ${Number.isInteger(l) ? l : l.toFixed(1)} Lakh`
  }
  return formatINR(val)
}

export interface PrepaymentOptions {
  extraMonthly: number
  annualLumpSum: number
  oneTimePrepayment: number
  oneTimeYear: number
  annualStepUpPercent: number
}

export interface YearlyComparisonPoint {
  year: number
  standardBalance: number
  acceleratedBalance: number
  standardCumulativeInterest: number
  acceleratedCumulativeInterest: number
  prepaymentPaidThisYear: number
}

export interface PrepaymentCalculationResult {
  hasPrepayment: boolean
  standardMonthlyEmi: number
  standardTotalInterest: number
  acceleratedTotalInterest: number
  interestSaved: number
  originalMonths: number
  acceleratedMonths: number
  yearsSaved: number
  monthsSaved: number
  totalPrepaymentPaid: number
  totalAmountPaid: number
  standardTotalAmount: number
  netSavings: number
  savingsMultiplier: number
  effectiveTenureYears: number
  acceleratedSchedule: YearlyAmortization[]
  yearlyComparison: YearlyComparisonPoint[]
}

/**
 * Calculate full loan payoff and savings with prepayment strategies
 */
export function calculateLoanWithPrepayment(
  principal: number,
  annualRate: number,
  tenureYears: number,
  options: PrepaymentOptions
): PrepaymentCalculationResult {
  const standard = calculateHomeLoan(principal, annualRate, tenureYears)
  const standardSchedule = calculateYearlyAmortization(principal, annualRate, tenureYears)
  const totalMonths = tenureYears * 12
  const monthlyRate = annualRate / 12 / 100

  const hasPrepayment =
    options.extraMonthly > 0 ||
    options.annualLumpSum > 0 ||
    options.oneTimePrepayment > 0 ||
    options.annualStepUpPercent > 0

  if (!hasPrepayment || principal <= 0 || tenureYears <= 0) {
    let cumInt = 0
    const comparison: YearlyComparisonPoint[] = standardSchedule.map((s) => {
      cumInt += s.interestPaid
      return {
        year: s.year,
        standardBalance: s.closingBalance,
        acceleratedBalance: s.closingBalance,
        standardCumulativeInterest: cumInt,
        acceleratedCumulativeInterest: cumInt,
        prepaymentPaidThisYear: 0,
      }
    })

    return {
      hasPrepayment: false,
      standardMonthlyEmi: standard.monthlyEmi,
      standardTotalInterest: standard.totalInterest,
      acceleratedTotalInterest: standard.totalInterest,
      interestSaved: 0,
      originalMonths: totalMonths,
      acceleratedMonths: totalMonths,
      yearsSaved: 0,
      monthsSaved: 0,
      totalPrepaymentPaid: 0,
      totalAmountPaid: standard.totalPayment,
      standardTotalAmount: standard.totalPayment,
      netSavings: 0,
      savingsMultiplier: 0,
      effectiveTenureYears: tenureYears,
      acceleratedSchedule: standardSchedule,
      yearlyComparison: comparison,
    }
  }

  // Prepayment Month-by-Month Simulation
  let balance = principal
  let totalInterestPaid = 0
  let totalPrepaymentPaid = 0
  let monthsElapsed = 0

  const acceleratedSchedule: YearlyAmortization[] = []
  const yearlyComparison: YearlyComparisonPoint[] = []

  // Precompute standard cumulative interests by year
  const standardCumIntMap: number[] = []
  let sAcc = 0
  for (let y = 0; y < tenureYears; y++) {
    const sYear = standardSchedule[y]
    sAcc += sYear ? sYear.interestPaid : 0
    standardCumIntMap.push(sAcc)
  }

  let acceleratedCumInterest = 0

  for (let y = 1; y <= tenureYears; y++) {
    const openingBalance = balance
    let yearPrincipal = 0
    let yearInterest = 0
    let yearPrepayment = 0

    // Step-up factor for current year (if annual step-up % configured)
    const stepUpFactor =
      options.annualStepUpPercent > 0
        ? Math.pow(1 + options.annualStepUpPercent / 100, y - 1)
        : 1
    const currentBaseEmi = standard.monthlyEmi * stepUpFactor

    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) break
      monthsElapsed++

      const interestThisMonth = balance * monthlyRate
      let scheduledPrincipal = currentBaseEmi - interestThisMonth
      if (scheduledPrincipal < 0) scheduledPrincipal = 0
      if (scheduledPrincipal > balance) scheduledPrincipal = balance

      // Prepayments
      let prepayThisMonth = options.extraMonthly
      // Annual lump sum at month 12
      if (m === 12 && options.annualLumpSum > 0) {
        prepayThisMonth += options.annualLumpSum
      }
      // One-time prepayment at month 1 of the chosen year
      if (y === options.oneTimeYear && m === 1 && options.oneTimePrepayment > 0) {
        prepayThisMonth += options.oneTimePrepayment
      }

      // Prepayment cannot exceed remaining balance after scheduled principal
      const remainingBalance = Math.max(0, balance - scheduledPrincipal)
      if (prepayThisMonth > remainingBalance) {
        prepayThisMonth = remainingBalance
      }

      const totalPrincipalThisMonth = scheduledPrincipal + prepayThisMonth

      yearInterest += interestThisMonth
      yearPrincipal += totalPrincipalThisMonth
      yearPrepayment += prepayThisMonth

      totalInterestPaid += interestThisMonth
      totalPrepaymentPaid += prepayThisMonth
      balance = Math.max(0, balance - totalPrincipalThisMonth)
    }

    acceleratedCumInterest += yearInterest
    const yearTotalPayment = yearPrincipal + yearInterest
    const remainingPercent = (balance / principal) * 100

    if (yearPrincipal > 0 || yearInterest > 0) {
      acceleratedSchedule.push({
        year: y,
        openingBalance: Math.round(openingBalance),
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        totalPayment: Math.round(yearTotalPayment),
        closingBalance: Math.round(balance),
        loanRemainingPercent: Math.max(0, Number(remainingPercent.toFixed(1))),
      })
    }

    const stdItem = standardSchedule[y - 1]
    yearlyComparison.push({
      year: y,
      standardBalance: stdItem ? stdItem.closingBalance : 0,
      acceleratedBalance: Math.round(balance),
      standardCumulativeInterest: standardCumIntMap[y - 1] || standard.totalInterest,
      acceleratedCumulativeInterest: Math.round(acceleratedCumInterest),
      prepaymentPaidThisYear: Math.round(yearPrepayment),
    })

    if (balance <= 0) {
      // Fill remaining comparison years with 0 balance for a complete visual curve
      for (let remY = y + 1; remY <= tenureYears; remY++) {
        const remStd = standardSchedule[remY - 1]
        yearlyComparison.push({
          year: remY,
          standardBalance: remStd ? remStd.closingBalance : 0,
          acceleratedBalance: 0,
          standardCumulativeInterest: standardCumIntMap[remY - 1] || standard.totalInterest,
          acceleratedCumulativeInterest: Math.round(acceleratedCumInterest),
          prepaymentPaidThisYear: 0,
        })
      }
      break
    }
  }

  const interestSaved = Math.max(0, standard.totalInterest - Math.round(totalInterestPaid))
  const savedMonthsTotal = Math.max(0, totalMonths - monthsElapsed)
  const yearsSaved = Math.floor(savedMonthsTotal / 12)
  const monthsSaved = savedMonthsTotal % 12
  const totalAmountPaid = Math.round(principal + totalInterestPaid)
  const netSavings = Math.max(0, standard.totalPayment - totalAmountPaid)
  const savingsMultiplier =
    totalPrepaymentPaid > 0
      ? Number((interestSaved / totalPrepaymentPaid).toFixed(2))
      : 0
  const effectiveTenureYears = Number((monthsElapsed / 12).toFixed(1))

  return {
    hasPrepayment: true,
    standardMonthlyEmi: standard.monthlyEmi,
    standardTotalInterest: standard.totalInterest,
    acceleratedTotalInterest: Math.round(totalInterestPaid),
    interestSaved,
    originalMonths: totalMonths,
    acceleratedMonths: monthsElapsed,
    yearsSaved,
    monthsSaved,
    totalPrepaymentPaid: Math.round(totalPrepaymentPaid),
    totalAmountPaid,
    standardTotalAmount: standard.totalPayment,
    netSavings,
    savingsMultiplier,
    effectiveTenureYears,
    acceleratedSchedule,
    yearlyComparison,
  }
}
