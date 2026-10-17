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
