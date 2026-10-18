import { describe, it } from "node:test"
import assert from "node:assert"
import {
  calculateXIRR,
  calculateAccurateSIP,
  calculatePortfolioXIRR,
  parseDateString,
  formatIndianCurrency,
  formatCompactCurrency,
} from "../utils/sipMath.ts"
import {
  calculateHomeLoan,
  calculateYearlyAmortization,
  calculateLoanWithPrepayment,
  formatINR,
  formatCompactINR,
} from "../utils/loanCalculations.ts"
import {
  calculateArbitrage,
  getStandardEmi,
  formatINR as formatINRArbitrage,
  formatCompactINR as formatCompactINRArbitrage,
} from "../utils/arbitrageCalculations.ts"
import {
  buildSystemInstruction,
  generateSmartFallbackResponse,
  formatCurrency as formatCurrencyChat,
} from "../utils/chatHelpers.ts"
import { getDateRange, processReturns } from "../utils/processNav.ts"

describe("Comprehensive Edge Cases & Extreme Scenarios", () => {
  describe("XIRR Newton-Raphson Engine Edge Cases", () => {
    it("should handle completely unsorted cash flows by sorting chronologically", () => {
      // Inflow provided first, outflows provided in reverse order
      const unsortedFlows = [
        { date: new Date("2024-01-01"), amount: 110000 },
        { date: new Date("2023-07-01"), amount: -50000 },
        { date: new Date("2023-01-01"), amount: -50000 },
      ]
      const xirr = calculateXIRR(unsortedFlows)
      assert.ok(xirr > 0, "XIRR should be positive")
      // Should be roughly ~13-14% annualized return
      assert.ok(xirr >= 12 && xirr <= 15, `Expected ~13-14%, got ${xirr}%`)
    })

    it("should handle same-day cash flows (0 duration) without division by zero", () => {
      const sameDayFlows = [
        { date: new Date("2023-01-01"), amount: -100000 },
        { date: new Date("2023-01-01"), amount: 105000 },
      ]
      const xirr = calculateXIRR(sameDayFlows)
      assert.strictEqual(xirr, 0, "Same day flows should return 0 safely")
    })

    it("should accurately compute extreme market loss (-80% in 1 year)", () => {
      const lossFlows = [
        { date: new Date("2023-01-01"), amount: -100000 },
        { date: new Date("2024-01-01"), amount: 20000 },
      ]
      const xirr = calculateXIRR(lossFlows)
      assert.ok(Math.abs(xirr - -80.0) < 0.2, `Expected -80.00%, got ${xirr}%`)
    })

    it("should accurately compute extreme multibagger gain (+900% / 10x in 1 year)", () => {
      const multibaggerFlows = [
        { date: new Date("2023-01-01"), amount: -10000 },
        { date: new Date("2024-01-01"), amount: 100000 },
      ]
      const xirr = calculateXIRR(multibaggerFlows)
      assert.ok(Math.abs(xirr - 900.0) < 2.0, `Expected ~900%, got ${xirr}%`)
    })

    it("should safely return 0 when all cash flows are negative (no inflow)", () => {
      const allNegative = [
        { date: new Date("2023-01-01"), amount: -10000 },
        { date: new Date("2023-02-01"), amount: -10000 },
      ]
      assert.strictEqual(calculateXIRR(allNegative), 0)
    })

    it("should safely return 0 when all cash flows are positive (no outflow)", () => {
      const allPositive = [
        { date: new Date("2023-01-01"), amount: 10000 },
        { date: new Date("2023-02-01"), amount: 20000 },
      ]
      assert.strictEqual(calculateXIRR(allPositive), 0)
    })
  })

  describe("Accurate SIP Engine Edge Cases", () => {
    it("should filter out dirty, corrupt, or non-numeric NAV entries gracefully", () => {
      const dirtyNavData: any[] = [
        { date: "01-01-2023", nav: 100 },
        { date: "01-02-2023", nav: "N.A." },
        { date: "01-03-2023", nav: null },
        { date: "01-04-2023", nav: -50 },
        { date: "01-05-2023", nav: 0 },
        { date: "01-06-2023", nav: "120.5" }, // String number should be parsed
        { date: "01-07-2023", nav: 150 },
      ]
      const result = calculateAccurateSIP(dirtyNavData, 5000)
      assert.ok(result.totalInvested > 0, "Should successfully invest on valid NAV dates")
      assert.ok(result.currentValue > 0, "Current value should be positive")
      assert.ok(result.timeline.length > 0, "Timeline should exist")
    })

    it("should handle a single NAV data point without error", () => {
      const singleNavData = [{ date: "01-01-2023", nav: 100 }]
      const result = calculateAccurateSIP(singleNavData, 10000)
      assert.strictEqual(result.totalInvested, 10000)
      assert.strictEqual(result.currentValue, 10000)
      assert.strictEqual(result.totalUnits, 100)
      assert.strictEqual(result.absoluteGain, 0)
      assert.strictEqual(result.growthPercentage, 0)
      assert.strictEqual(result.wealthMultiplier, 1.0)
    })

    it("should accurately handle flat market (0% NAV growth)", () => {
      const flatNav = [
        { date: "01-01-2023", nav: 100 },
        { date: "01-02-2023", nav: 100 },
        { date: "01-03-2023", nav: 100 },
        { date: "01-04-2023", nav: 100 },
      ]
      const result = calculateAccurateSIP(flatNav, 5000)
      assert.strictEqual(result.totalInvested, 20000)
      assert.strictEqual(result.currentValue, 20000)
      assert.strictEqual(result.absoluteGain, 0)
      assert.strictEqual(result.growthPercentage, 0)
      assert.strictEqual(result.wealthMultiplier, 1.0)
    })

    it("should simulate severe market crash (-50% NAV drop)", () => {
      const crashNav = [
        { date: "01-01-2023", nav: 100 },
        { date: "01-02-2023", nav: 80 },
        { date: "01-03-2023", nav: 60 },
        { date: "01-04-2023", nav: 50 },
      ]
      const result = calculateAccurateSIP(crashNav, 10000)
      assert.strictEqual(result.totalInvested, 40000)
      assert.ok(result.currentValue < result.totalInvested, "Current value should be below invested capital")
      assert.ok(result.absoluteGain < 0, "Gain should be negative")
      assert.ok(result.growthPercentage < 0, "Growth percentage should be negative")
      assert.ok(result.wealthMultiplier < 1.0, "Wealth multiplier should be < 1.0x")
    })

    it("should execute weekly SIP frequency properly", () => {
      const weeklyNav = [
        { date: "01-01-2023", nav: 100 },
        { date: "08-01-2023", nav: 102 },
        { date: "15-01-2023", nav: 104 },
        { date: "22-01-2023", nav: 106 },
        { date: "29-01-2023", nav: 108 },
      ]
      const result = calculateAccurateSIP(weeklyNav, 2000, { frequency: "weekly" })
      assert.strictEqual(result.totalInvested, 10000) // 5 weekly installments of 2000
      assert.ok(result.totalUnits > 0)
      assert.ok(result.currentValue > 10000)
    })
  })

  describe("Portfolio XIRR Aggregation Edge Cases", () => {
    it("should return 0 for empty fund list", () => {
      assert.strictEqual(calculatePortfolioXIRR([]), 0)
    })

    it("should filter out funds with zero invested", () => {
      const funds = [
        { totalInvested: 0, total: 0, xirr: 15.0 },
        { totalInvested: 100000, total: 120000, xirr: 18.0 },
      ]
      assert.strictEqual(calculatePortfolioXIRR(funds), 18.0)
    })

    it("should accurately compute capital-weighted portfolio XIRR", () => {
      const funds = [
        { totalInvested: 100000, total: 110000, xirr: 10.0 }, // 25% weight
        { totalInvested: 300000, total: 360000, xirr: 20.0 }, // 75% weight
      ]
      // Weighted XIRR = (0.25 * 10) + (0.75 * 20) = 2.5 + 15 = 17.5%
      assert.strictEqual(calculatePortfolioXIRR(funds), 17.5)
    })
  })

  describe("Home Loan Engine Edge Cases", () => {
    it("should calculate home loan with fractional tenure (0.5 years / 6 months)", () => {
      const result = calculateHomeLoan(120000, 10, 0.5) // ₹1.2 Lakhs for 6 months at 10%
      assert.ok(result.monthlyEmi > 0, "Monthly EMI should be calculated")
      assert.ok(result.totalPayment > 120000, "Total payment should exceed principal")
      assert.ok(result.totalInterest > 0, "Interest should be positive")
    })

    it("should generate amortization schedule for fractional tenure (0.5 years)", () => {
      const schedule = calculateYearlyAmortization(120000, 10, 0.5)
      assert.strictEqual(schedule.length, 1, "Should have 1 year entry")
      assert.strictEqual(schedule[0].closingBalance, 0, "Closing balance should reach 0 at month 6")
      assert.strictEqual(schedule[0].loanRemainingPercent, 0)
    })

    it("should clamp negative interest rates to 0% gracefully", () => {
      const result = calculateHomeLoan(500000, -5, 5)
      assert.strictEqual(result.totalPrincipal, 500000)
      assert.strictEqual(result.totalInterest, 0)
      assert.strictEqual(result.totalPayment, 500000)
    })

    it("should handle large loan of ₹100 Crore without overflow or NaN", () => {
      const hundredCr = 1000000000
      const result = calculateHomeLoan(hundredCr, 8.5, 20)
      assert.ok(result.monthlyEmi > 8000000, "Monthly EMI should be > ₹80 Lakhs")
      assert.ok(result.totalPayment > hundredCr)
      assert.ok(!isNaN(result.monthlyEmi) && isFinite(result.monthlyEmi))
    })

    it("should handle immediate full payoff in Month 1 via prepayment", () => {
      const prepayResult = calculateLoanWithPrepayment(1000000, 8.5, 10, {
        extraMonthly: 0,
        annualLumpSum: 0,
        oneTimePrepayment: 1000000, // Prepay entire principal in year 1
        oneTimeYear: 1,
        annualStepUpPercent: 0,
      })
      assert.strictEqual(prepayResult.acceleratedMonths, 1, "Loan should be settled in 1 month")
      assert.ok(prepayResult.interestSaved > 0, "Massive interest saved")
      assert.ok(prepayResult.yearsSaved >= 9, "Almost full tenure saved")
      assert.strictEqual(prepayResult.acceleratedSchedule[0].closingBalance, 0)
    })

    it("should handle prepayment with fractional loan tenure (1.5 years)", () => {
      const prepayResult = calculateLoanWithPrepayment(300000, 9.0, 1.5, {
        extraMonthly: 10000,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 1,
        annualStepUpPercent: 0,
      })
      assert.ok(prepayResult.acceleratedMonths <= 18, "Should finish within 18 months")
      assert.ok(prepayResult.acceleratedSchedule.length <= 2, "Should have at most 2 yearly entries")
    })
  })

  describe("Prepay vs SIP Arbitrage Engine Edge Cases", () => {
    it("should handle zero surplus (0 monthly surplus and 0 lump sum)", () => {
      const result = calculateArbitrage({
        loanPrincipal: 5000000,
        loanRate: 8.5,
        loanTenureYears: 20,
        monthlySurplus: 0,
        annualLumpSum: 0,
        expectedSipReturn: 12.0,
      })
      assert.strictEqual(result.monthsSaved, 0, "No months saved without prepayment surplus")
      assert.strictEqual(result.interestSaved, 0, "No interest saved without prepayment surplus")
      assert.strictEqual(result.sipFinalCorpus, 0, "No SIP corpus built with 0 investment")
      assert.strictEqual(result.netWealthAdvantage, 0)
      assert.strictEqual(result.crossoverYear, null, "Crossover year should be null when surplus is 0")
    })

    it("should handle rate parity where loanRate equals expectedSipReturn (8.5% vs 8.5%)", () => {
      const result = calculateArbitrage({
        loanPrincipal: 4000000,
        loanRate: 8.5,
        loanTenureYears: 15,
        monthlySurplus: 15000,
        annualLumpSum: 0,
        expectedSipReturn: 8.5,
      })
      assert.strictEqual(result.arbitrageSpread, 0.0, "Spread should be exactly 0.00%")
    })

    it("should show prepayment clearly winning when equity returns are negative (-10%)", () => {
      const result = calculateArbitrage({
        loanPrincipal: 5000000,
        loanRate: 8.5,
        loanTenureYears: 20,
        monthlySurplus: 20000,
        annualLumpSum: 0,
        expectedSipReturn: -10.0,
      })
      assert.ok(result.netWealthAdvantage < 0, "Prepayment must beat negative equity return")
      assert.ok(result.interestSaved > 0)
    })

    it("should handle fractional tenure of 1.5 years in arbitrage engine", () => {
      const result = calculateArbitrage({
        loanPrincipal: 300000,
        loanRate: 8.5,
        loanTenureYears: 1.5,
        monthlySurplus: 5000,
        annualLumpSum: 0,
        expectedSipReturn: 12.0,
      })
      assert.strictEqual(result.standardTenureMonths, 18)
      assert.strictEqual(result.timeline.length, 2, "1.5 years should yield 2 timeline snapshots")
    })

    it("should calculate tax adjustments when includeTaxImpact is true", () => {
      const resultWithTax = calculateArbitrage({
        loanPrincipal: 5000000,
        loanRate: 8.5,
        loanTenureYears: 20,
        monthlySurplus: 15000,
        annualLumpSum: 50000,
        expectedSipReturn: 13.0,
        includeTaxImpact: true,
        taxBracketPercent: 30,
      })
      assert.ok(resultWithTax.taxSavingsOnLoanInterest > 0, "Should calculate Section 24b tax shield")
      assert.ok(resultWithTax.estimatedLtcgTax > 0, "Should calculate 12.5% LTCG tax on SIP profits")
      assert.ok(resultWithTax.netPostTaxAdvantage !== resultWithTax.netWealthAdvantage)
    })
  })

  describe("Date Parsing and Formatting Boundary Edge Cases", () => {
    it("should safely return Invalid Date for falsy and non-string dates in parseDateString", () => {
      assert.ok(isNaN(parseDateString("").getTime()))
      assert.ok(isNaN(parseDateString(null as any).getTime()))
      assert.ok(isNaN(parseDateString(undefined as any).getTime()))
      assert.ok(isNaN(parseDateString(12345 as any).getTime()))
    })

    it("should handle dates with forward slashes (DD/MM/YYYY and YYYY/MM/DD)", () => {
      const d1 = parseDateString("15/08/2023")
      assert.strictEqual(d1.getDate(), 15)
      assert.strictEqual(d1.getMonth(), 7) // 0-indexed August
      assert.strictEqual(d1.getFullYear(), 2023)

      const d2 = parseDateString("2023/12/25")
      assert.strictEqual(d2.getDate(), 25)
      assert.strictEqual(d2.getMonth(), 11) // 0-indexed December
      assert.strictEqual(d2.getFullYear(), 2023)
    })

    it("should trim surrounding whitespace in date strings", () => {
      const d = parseDateString("   01-01-2024   ")
      assert.strictEqual(d.getDate(), 1)
      assert.strictEqual(d.getFullYear(), 2024)
    })

    it("should parse leap day correctly (29-02-2024)", () => {
      const d = parseDateString("29-02-2024")
      assert.strictEqual(d.getDate(), 29)
      assert.strictEqual(d.getMonth(), 1) // February
      assert.strictEqual(d.getFullYear(), 2024)
    })

    it("should format negative numbers in formatCompactINR properly", () => {
      const formattedCr = formatCompactINR(-25000000)
      assert.ok(formattedCr.includes("-"), "Should include minus sign")
      assert.ok(formattedCr.includes("2.5") || formattedCr.includes("2.50"))
      assert.ok(formattedCr.includes("Cr"))

      const formattedLakh = formatCompactINR(-500000)
      assert.ok(formattedLakh.includes("-"))
      assert.ok(formattedLakh.includes("5"))
      assert.ok(formattedLakh.includes("Lakh"))
    })

    it("should handle NaN, Infinity, and boundary values in formatCompactINR", () => {
      assert.strictEqual(formatCompactINR(NaN), "₹ 0")
      assert.strictEqual(formatCompactINR(Infinity), "₹ 0")
      assert.strictEqual(formatCompactINR(-Infinity), "₹ 0")
      // Boundary 99,999 vs 1,00,000
      assert.ok(formatCompactINR(99999).includes("99,999"))
      assert.ok(formatCompactINR(100000).includes("1 Lakh"))
      // Boundary 99,99,999 vs 1,00,00,000
      assert.ok(formatCompactINR(10000000).includes("1 Cr"))
    })

    it("should handle NaN, null, and undefined in formatCurrencyChat", () => {
      assert.strictEqual(formatCurrencyChat(NaN), "₹0")
      assert.strictEqual(formatCurrencyChat(null as any), "₹0")
      assert.strictEqual(formatCurrencyChat(undefined as any), "₹0")
    })
  })

  describe("AI Financial Assistant Edge Cases", () => {
    it("should handle empty or whitespace query in generateSmartFallbackResponse", () => {
      const resp = generateSmartFallbackResponse("   ")
      assert.ok(resp.includes("Kuber"), "Should return general guide for empty query")
    })

    it("should be case-insensitive for queries like PREPAYMENT, TAX, and SIP", () => {
      const homeLoanContext: any = {
        page: "home-loan",
        loan: {
          principal: 5000000,
          annualRate: 8.5,
          tenureYears: 20,
          monthlyEmi: 43391,
          totalInterest: 5413876,
        },
      }
      const prepayResp = generateSmartFallbackResponse("WHAT IF I DO PREPAYMENT?", homeLoanContext)
      assert.ok(prepayResp.includes("Prepayment Analysis"))

      const taxResp = generateSmartFallbackResponse("TELL ME ABOUT 80C AND SECTION 24 TAX", homeLoanContext)
      assert.ok(taxResp.includes("Tax Deductions"))
    })

    it("should build system instruction safely when context is completely empty or undefined", () => {
      const instruction = buildSystemInstruction(undefined)
      assert.ok(instruction.includes("Kuber"))
      assert.ok(instruction.includes("financial"))
    })
  })

  describe("Multi-Fund Process NAV Edge Cases", () => {
    it("should handle funds with non-overlapping timelines in processReturns", async () => {
      const returnsData: any[] = [
        {
          schemeCode: 101,
          schemeName: "Fund Early",
          timeline: [
            { date: "01-01-2020", invested: 5000, value: 5500, gainPercent: 10 },
            { date: "01-01-2021", invested: 10000, value: 12000, gainPercent: 20 },
          ],
        },
        {
          schemeCode: 102,
          schemeName: "Fund Late",
          timeline: [
            { date: "01-01-2022", invested: 5000, value: 5200, gainPercent: 4 },
            { date: "01-01-2023", invested: 10000, value: 11500, gainPercent: 15 },
          ],
        },
      ]

      const aligned = await processReturns(returnsData)
      assert.ok(aligned.length > 0, "Should generate aligned combined timeline")
      // First point (2020) should have Fund Early value and 0 for Fund Late
      const firstRow: any = aligned[0]
      assert.strictEqual(firstRow.fund_101, 5500)
      assert.strictEqual(firstRow.fund_102, 0)
    })
  })
})
