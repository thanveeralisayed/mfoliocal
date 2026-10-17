/**
 * Robust SIP Mathematics & Financial Calculations Engine
 * Supports Newton-Raphson XIRR, Annual Step-Up SIP, and Adaptive Date Resampling
 */

export interface CashFlow {
  date: Date
  amount: number // Negative for investments (outflow), positive for redemption/final value (inflow)
}

export interface SIPTimelinePoint {
  date: string
  rawDate: Date
  nav: number
  invested: number
  value: number
  gain: number
  gainPercent: number
  units: number
}

export interface SIPCalculationResult {
  totalInvested: number
  currentValue: number
  totalUnits: number
  absoluteGain: number
  growthPercentage: number
  xirr: number // Annualized return in %
  wealthMultiplier: number // e.g. 1.85x
  timeline: SIPTimelinePoint[]
}

/**
 * Parse Indian / MFAPI date format: "DD-MM-YYYY" or standard ISO
 */
export function parseDateString(dateStr: string): Date {
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-")
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      } else {
        // DD-MM-YYYY
        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10))
      }
    }
  }
  return new Date(dateStr)
}

/**
 * Format Indian currency with Lakhs and Crores
 */
export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

/**
 * Format compact currency for charts (e.g. ₹5.4L, ₹1.2Cr, ₹45k)
 */
export function formatCompactCurrency(val: number): string {
  if (isNaN(val)) return "₹0"
  const abs = Math.abs(val)
  if (abs >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)}Cr`
  }
  if (abs >= 100000) {
    return `₹${(val / 100000).toFixed(2)}L`
  }
  if (abs >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`
  }
  return `₹${Math.round(val)}`
}

/**
 * Calculate XIRR using the Newton-Raphson root finding algorithm
 * Computes annualized internal rate of return for non-periodic/periodic cash flows.
 */
export function calculateXIRR(cashFlows: CashFlow[], guess = 0.12): number {
  if (cashFlows.length < 2) return 0

  const hasOutflow = cashFlows.some((cf) => cf.amount < 0)
  const hasInflow = cashFlows.some((cf) => cf.amount > 0)
  if (!hasOutflow || !hasInflow) return 0

  const startDate = cashFlows[0].date.getTime()
  const daysDiff = (d: Date) => (d.getTime() - startDate) / (1000 * 60 * 60 * 24 * 365)

  // Net Present Value function
  const npv = (rate: number): number => {
    return cashFlows.reduce((acc, cf) => {
      const t = daysDiff(cf.date)
      return acc + cf.amount / Math.pow(1 + rate, t)
    }, 0)
  }

  // Derivative of NPV with respect to rate
  const dNpv = (rate: number): number => {
    return cashFlows.reduce((acc, cf) => {
      const t = daysDiff(cf.date)
      if (t === 0) return acc
      return acc - (t * cf.amount) / Math.pow(1 + rate, t + 1)
    }, 0)
  }

  let rate = guess
  const maxIterations = 50
  const tolerance = 1e-5

  for (let i = 0; i < maxIterations; i++) {
    // Avoid rates that result in division by zero or negative powers
    if (rate <= -0.999) {
      rate = -0.99
    }

    const value = npv(rate)
    const derivative = dNpv(rate)

    if (Math.abs(derivative) < 1e-10) {
      break
    }

    const newRate = rate - value / derivative

    if (Math.abs(newRate - rate) < tolerance) {
      return parseFloat((newRate * 100).toFixed(2))
    }

    rate = newRate
  }

  // Fallback to simple CAGR approximation if Newton-Raphson diverges
  const totalInvested = Math.abs(
    cashFlows.filter((cf) => cf.amount < 0).reduce((a, b) => a + b.amount, 0)
  )
  const finalValue = cashFlows[cashFlows.length - 1]?.amount || 0
  const totalYears = Math.max(0.5, daysDiff(cashFlows[cashFlows.length - 1].date))

  if (totalInvested > 0 && finalValue > 0) {
    const cagr = (Math.pow(finalValue / totalInvested, 1 / totalYears) - 1) * 100
    return parseFloat(cagr.toFixed(2))
  }

  return 0
}

/**
 * Execute accurate SIP simulation over real historical NAV data
 * Supports monthly intervals, optional annual step-up %, and generates timeline data.
 */
export function calculateAccurateSIP(
  rawNavData: { date: string; nav: number }[],
  initialSipAmount: number,
  options?: {
    frequency?: "monthly" | "weekly"
    stepUpPercent?: number // e.g. 5 for 5% annual step-up
    targetPoints?: number // For adaptive chart resampling (default ~60 points)
  }
): SIPCalculationResult {
  if (!rawNavData || rawNavData.length === 0 || initialSipAmount <= 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalUnits: 0,
      absoluteGain: 0,
      growthPercentage: 0,
      xirr: 0,
      wealthMultiplier: 0,
      timeline: [],
    }
  }

  const frequency = options?.frequency || "monthly"
  const stepUpPercent = options?.stepUpPercent || 0
  const targetPoints = options?.targetPoints || 60

  // Sort chronologically (oldest to newest)
  const sortedNav = [...rawNavData]
    .map((d) => ({
      date: d.date,
      rawDate: parseDateString(d.date),
      nav: typeof d.nav === "number" ? d.nav : parseFloat(d.nav as any),
    }))
    .filter((d) => !isNaN(d.nav) && d.nav > 0)
    .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())

  if (sortedNav.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalUnits: 0,
      absoluteGain: 0,
      growthPercentage: 0,
      xirr: 0,
      wealthMultiplier: 0,
      timeline: [],
    }
  }

  const intervalDays = frequency === "weekly" ? 7 : 30
  const cashFlows: CashFlow[] = []

  let totalUnits = 0
  let totalInvested = 0
  let currentSipAmount = initialSipAmount

  const startDate = sortedNav[0].rawDate
  let lastInvestmentDate = new Date(startDate.getTime() - intervalDays * 24 * 60 * 60 * 1000 - 1)
  let currentYear = startDate.getFullYear()

  // Full simulation track
  const fullTimeline: SIPTimelinePoint[] = []

  for (let i = 0; i < sortedNav.length; i++) {
    const point = sortedNav[i]
    const currentDate = point.rawDate

    // Check for annual step-up
    if (stepUpPercent > 0 && currentDate.getFullYear() > currentYear) {
      const yearsElapsed = currentDate.getFullYear() - startDate.getFullYear()
      currentSipAmount = initialSipAmount * Math.pow(1 + stepUpPercent / 100, yearsElapsed)
      currentYear = currentDate.getFullYear()
    }

    // Trigger SIP installment if interval elapsed
    const daysSinceLast = (currentDate.getTime() - lastInvestmentDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceLast >= intervalDays) {
      const unitsBought = currentSipAmount / point.nav
      totalUnits += unitsBought
      totalInvested += currentSipAmount
      lastInvestmentDate = currentDate

      cashFlows.push({
        date: currentDate,
        amount: -currentSipAmount, // Outflow
      })
    }

    const currentValue = totalUnits * point.nav
    const gain = currentValue - totalInvested
    const gainPercent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0

    fullTimeline.push({
      date: point.date,
      rawDate: currentDate,
      nav: parseFloat(point.nav.toFixed(2)),
      invested: Math.round(totalInvested),
      value: Math.round(currentValue),
      gain: Math.round(gain),
      gainPercent: parseFloat(gainPercent.toFixed(2)),
      units: parseFloat(totalUnits.toFixed(3)),
    })
  }

  // Latest status
  const latestPoint = fullTimeline[fullTimeline.length - 1]
  const finalValue = latestPoint ? latestPoint.value : 0
  const finalInvested = latestPoint ? latestPoint.invested : 0
  const absoluteGain = finalValue - finalInvested
  const growthPercentage = finalInvested > 0 ? (absoluteGain / finalInvested) * 100 : 0
  const wealthMultiplier = finalInvested > 0 ? parseFloat((finalValue / finalInvested).toFixed(2)) : 0

  // Append final redemption inflow for XIRR
  if (latestPoint && finalValue > 0) {
    cashFlows.push({
      date: latestPoint.rawDate,
      amount: finalValue, // Inflow
    })
  }

  const xirr = calculateXIRR(cashFlows)

  // Adaptive Resampling: Pick ~targetPoints representative points (including start and end)
  let resampledTimeline: SIPTimelinePoint[] = []
  if (fullTimeline.length <= targetPoints) {
    resampledTimeline = fullTimeline
  } else {
    const step = Math.floor(fullTimeline.length / targetPoints)
    for (let i = 0; i < fullTimeline.length; i += step) {
      resampledTimeline.push(fullTimeline[i])
    }
    // Always include the last latest point
    if (resampledTimeline[resampledTimeline.length - 1] !== fullTimeline[fullTimeline.length - 1]) {
      resampledTimeline.push(fullTimeline[fullTimeline.length - 1])
    }
  }

  return {
    totalInvested: Math.round(finalInvested),
    currentValue: Math.round(finalValue),
    totalUnits: parseFloat(totalUnits.toFixed(3)),
    absoluteGain: Math.round(absoluteGain),
    growthPercentage: parseFloat(growthPercentage.toFixed(2)),
    xirr,
    wealthMultiplier,
    timeline: resampledTimeline,
  }
}

/**
 * Calculate aggregate portfolio XIRR across multiple funds
 */
export function calculatePortfolioXIRR(funds: { totalInvested: number; total: number; xirr?: number }[]): number {
  if (!funds || funds.length === 0) return 0
  const validFunds = funds.filter((f) => f.totalInvested > 0)
  if (validFunds.length === 0) return 0
  if (validFunds.length === 1) return validFunds[0].xirr || 0

  const totalInvested = validFunds.reduce((acc, f) => acc + f.totalInvested, 0)
  if (totalInvested === 0) return 0

  // Capital-weighted XIRR
  const weightedXirr = validFunds.reduce((acc, f) => {
    return acc + (f.xirr || 0) * (f.totalInvested / totalInvested)
  }, 0)

  return parseFloat(weightedXirr.toFixed(2))
}
