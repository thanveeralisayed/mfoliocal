import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateArbitrage,
  getStandardEmi,
  formatINR,
  formatCompactINR,
} from "../utils/arbitrageCalculations.ts"
import type { ArbitrageInputs } from "../utils/arbitrageCalculations.ts"

describe("Home Loan Prepay vs. Equity SIP Arbitrage (arbitrageCalculations.ts)", () => {
  const defaultInputs: ArbitrageInputs = {
    loanPrincipal: 5000000,   // ₹50 Lakhs
    loanRate: 8.5,            // 8.5%
    loanTenureYears: 20,      // 20 Years
    monthlySurplus: 10000,    // ₹10,000/month
    annualLumpSum: 0,
    expectedSipReturn: 13.0,  // 13.0% CAGR
    includeTaxImpact: false,
  }

  describe("getStandardEmi", () => {
    it("should accurately compute monthly EMI for 50 Lakhs at 8.5% for 20 years", () => {
      const emi = getStandardEmi(5000000, 8.5, 20)
      assert.equal(Math.round(emi), 43391)
    })

    it("should handle 0 principal or tenure gracefully", () => {
      assert.equal(getStandardEmi(0, 8.5, 20), 0)
      assert.equal(getStandardEmi(5000000, 8.5, 0), 0)
    })
  })

  describe("calculateArbitrage Baseline and Pathways", () => {
    it("should accurately compute baseline loan metrics", () => {
      const result = calculateArbitrage(defaultInputs)

      assert.equal(result.standardMonthlyEmi, 43391)
      assert.equal(result.standardTenureMonths, 240)
      assert.equal(result.standardTotalPayment, 10413879)
      assert.equal(result.standardTotalInterest, 5413879)
    })

    it("should simulate Pathway A (Prepayment) correctly", () => {
      const result = calculateArbitrage(defaultInputs)

      // Paying ₹10,000 extra on ₹43,391 EMI knocks off ~6.5 to 7.5 years
      assert.ok(result.yearsSaved >= 6.0 && result.yearsSaved <= 8.0)
      assert.ok(result.prepayPayoffYears < defaultInputs.loanTenureYears)
      assert.equal(result.prepayPayoffMonth + result.monthsSaved, 240)

      // Substantial interest saved (over ₹20 Lakhs)
      assert.ok(result.interestSaved >= 1800000 && result.interestSaved <= 2600000)

      // Reinvested wealth after loan ends must be positive and substantial
      assert.ok(result.prepayFinalCorpus > 0)
      assert.equal(result.prepayNetWealthAtTenureEnd, result.prepayFinalCorpus)
    })

    it("should simulate Pathway B (Equity SIP Arbitrage) correctly", () => {
      const result = calculateArbitrage(defaultInputs)

      // Total invested surplus across 20 years: 10,000 * 240 = 2,400,000 (₹24 Lakhs)
      assert.equal(result.sipTotalInvested, 2400000)

      // ₹10,000/mo invested for 20 years @ 13% CAGR grows to ~₹1.1 to ₹1.2 Crore!
      assert.ok(result.sipFinalCorpus >= 10000000 && result.sipFinalCorpus <= 13000000)

      // Net wealth equals SIP corpus since mortgage is settled at year 20
      assert.equal(result.sipNetWealthAtTenureEnd, result.sipFinalCorpus)
    })

    it("should confirm Equity SIP produces superior wealth when return rate exceeds loan rate", () => {
      const result = calculateArbitrage(defaultInputs)

      // Arbitrage spread = 13.0% - 8.5% = +4.5%
      assert.equal(result.arbitrageSpread, 4.5)

      // Net wealth advantage must be strongly positive for Equity SIP
      assert.ok(result.netWealthAdvantage > 0, "SIP should create more wealth than prepayment")
      assert.ok(result.percentageAdvantage > 0)

      // Crossover point should occur within the loan tenure
      assert.ok(result.crossoverYear !== null)
      assert.ok(result.crossoverYear! > 0 && result.crossoverYear! <= defaultInputs.loanTenureYears)
    })

    it("should show Prepayment winning if expected equity returns are lower than loan rate", () => {
      const lowReturnInputs: ArbitrageInputs = {
        loanPrincipal: 5000000,
        loanRate: 10.0,           // 10.0% high interest loan
        loanTenureYears: 15,
        monthlySurplus: 15000,
        annualLumpSum: 0,
        expectedSipReturn: 6.0,   // Low 6% return (Debt/FD return)
      }

      const result = calculateArbitrage(lowReturnInputs)

      // Spread is negative: 6% - 10% = -4%
      assert.equal(result.arbitrageSpread, -4.0)

      // When loan rate > equity return, Prepayment beats SIP
      assert.ok(result.netWealthAdvantage < 0, "Prepayment should create more wealth than low-return SIP")
    })

    it("should incorporate annual bonus lump sum prepayment correctly", () => {
      const inputsWithBonus: ArbitrageInputs = {
        ...defaultInputs,
        annualLumpSum: 100000, // ₹1 Lakh bonus every year
      }

      const result = calculateArbitrage(inputsWithBonus)

      // With annual bonus, loan is paid off even faster than with monthly surplus alone
      assert.ok(result.yearsSaved > 9.0)
      assert.ok(result.interestSaved > 2500000)
    })

    it("should calculate tax adjustments (Section 24b and LTCG)", () => {
      const taxInputs: ArbitrageInputs = {
        ...defaultInputs,
        includeTaxImpact: true,
        taxBracketPercent: 30,
      }

      const result = calculateArbitrage(taxInputs)

      // Tax savings lost by prepaying early must be calculated
      assert.ok(result.taxSavingsLostByPrepaying > 0)

      // LTCG tax on capital gains above ₹1.25L must be positive
      assert.ok(result.estimatedLtcgTax > 0)

      // Post-tax advantage accounts for taxes
      assert.ok(result.netPostTaxAdvantage > 0)
    })

    it("should verify timeline consistency and final balances", () => {
      const result = calculateArbitrage(defaultInputs)

      // Timeline must have exactly 20 yearly snapshots
      assert.equal(result.timeline.length, 20)

      // At year 20, both standard and prepaid balances must be 0
      const finalYear = result.timeline[19]
      assert.equal(finalYear.prepayLoanBalance, 0)
      assert.equal(finalYear.sipLoanBalance, 0)
      assert.equal(finalYear.isDebtFree, true)

      // Timeline wealth difference matches final net wealth advantage within 1 rupee rounding
      assert.ok(Math.abs(finalYear.wealthDifference - result.netWealthAdvantage) <= 1)
    })
  })

  describe("Formatting Functions", () => {
    it("should format INR properly", () => {
      assert.equal(formatINR(1250000), "₹12,50,000")
      assert.equal(formatINR(0), "₹0")
    })

    it("should format compact INR for Crores, Lakhs, and negative numbers", () => {
      assert.equal(formatCompactINR(12500000), "₹1.25 Cr")
      assert.equal(formatCompactINR(3500000), "₹35 L")
      assert.equal(formatCompactINR(-2500000), "-₹25 L")
      assert.equal(formatCompactINR(25000), "₹25k")
    })
  })
})
