import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateHomeLoan,
  calculateYearlyAmortization,
  calculateLoanWithPrepayment,
  formatINR,
  formatCompactINR,
} from "../utils/loanCalculations.ts"
import type { PrepaymentOptions } from "../utils/loanCalculations.ts"

describe("Home Loan Calculations (loanCalculations.ts)", () => {
  describe("calculateHomeLoan", () => {
    it("should accurately calculate standard ₹50 Lakhs loan at 8.5% for 20 years", () => {
      const principal = 5000000
      const rate = 8.5
      const tenure = 20

      const result = calculateHomeLoan(principal, rate, tenure)

      // Expected EMI formula check:
      // P = 50,00,000, r = 0.085/12 = 0.00708333, n = 240
      // factor = (1+r)^240 = 5.424368
      // EMI = (5000000 * 0.00708333 * 5.424368) / (5.424368 - 1) = 43,391.13 -> 43,391
      assert.equal(result.monthlyEmi, 43391)
      assert.equal(result.totalPrincipal, 5000000)

      // Total payment calculated from exact EMI: 10,413,879
      assert.equal(result.totalPayment, 10413879)

      // Total interest: 10,413,879 - 5,000,000 = 5,413,879
      assert.equal(result.totalInterest, 5413879)

      // Interest ratio: (5,413,879 / 10,413,879) * 100 = 51.98% -> ~52.0%
      assert.ok(result.interestRatio >= 51.5 && result.interestRatio <= 52.5)
    })

    it("should accurately calculate ₹25 Lakhs loan at 9.0% for 15 years", () => {
      const result = calculateHomeLoan(2500000, 9.0, 15)

      // Monthly rate = 0.75%, 180 months -> EMI is approx ₹25,357
      assert.ok(result.monthlyEmi >= 25350 && result.monthlyEmi <= 25365)
      assert.equal(result.totalPrincipal, 2500000)
      assert.ok(result.totalInterest > 0)
      assert.equal(result.totalPayment, 4564200)
    })

    it("should handle 0% interest rate gracefully without division by zero", () => {
      const result = calculateHomeLoan(1200000, 0, 10)
      // 12,00,000 / 120 months = 10,000/month
      assert.equal(result.monthlyEmi, 10000)
      assert.equal(result.totalInterest, 0)
      assert.equal(result.totalPayment, 1200000)
      assert.equal(result.interestRatio, 0)
    })

    it("should handle edge cases: zero or negative principal and tenure", () => {
      const zeroPrincipal = calculateHomeLoan(0, 8.5, 20)
      assert.equal(zeroPrincipal.monthlyEmi, 0)
      assert.equal(zeroPrincipal.totalInterest, 0)

      const zeroTenure = calculateHomeLoan(5000000, 8.5, 0)
      assert.equal(zeroTenure.monthlyEmi, 0)
      assert.equal(zeroTenure.totalPayment, 0)

      const negativePrincipal = calculateHomeLoan(-5000000, 8.5, 20)
      assert.equal(negativePrincipal.monthlyEmi, 0)
    })
  })

  describe("calculateYearlyAmortization", () => {
    it("should generate exact yearly amortization schedule with conservation of money", () => {
      const principal = 5000000
      const rate = 8.5
      const tenure = 20

      const schedule = calculateYearlyAmortization(principal, rate, tenure)

      assert.equal(schedule.length, 20)

      // Year 1 opening balance must equal initial principal
      assert.equal(schedule[0].openingBalance, principal)

      // Final year closing balance must be 0
      assert.equal(schedule[19].closingBalance, 0)

      // Conservation of money: Sum of principal paid across all years must equal total principal (within 1 rupee rounding)
      const totalPrincipalPaid = schedule.reduce((sum, y) => sum + y.principalPaid, 0)
      assert.ok(Math.abs(totalPrincipalPaid - principal) <= 1)

      // Interest paid in early years must be higher than principal paid
      assert.ok(schedule[0].interestPaid > schedule[0].principalPaid)

      // In later years (e.g. Year 18), principal paid must exceed interest paid
      assert.ok(schedule[17].principalPaid > schedule[17].interestPaid)

      // Closing balance must decrease every single year
      for (let i = 1; i < schedule.length; i++) {
        assert.ok(schedule[i].closingBalance < schedule[i - 1].closingBalance)
      }
    })

    it("should return empty array for invalid inputs", () => {
      assert.deepEqual(calculateYearlyAmortization(0, 8.5, 20), [])
      assert.deepEqual(calculateYearlyAmortization(5000000, 8.5, 0), [])
    })
  })

  describe("calculateLoanWithPrepayment", () => {
    const basePrincipal = 5000000
    const baseRate = 8.5
    const baseTenure = 20

    it("should return identical values to standard loan when no prepayment is applied", () => {
      const noPrepay: PrepaymentOptions = {
        extraMonthly: 0,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      }

      const res = calculateLoanWithPrepayment(basePrincipal, baseRate, baseTenure, noPrepay)

      assert.equal(res.hasPrepayment, false)
      assert.equal(res.interestSaved, 0)
      assert.equal(res.yearsSaved, 0)
      assert.equal(res.monthsSaved, 0)
      assert.equal(res.acceleratedMonths, 240)
    })

    it("should accurately calculate interest savings and tenure reduction with extra monthly EMI", () => {
      const extraMonthly: PrepaymentOptions = {
        extraMonthly: 5000, // Extra ₹5,000/month
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      }

      const res = calculateLoanWithPrepayment(basePrincipal, baseRate, baseTenure, extraMonthly)

      assert.equal(res.hasPrepayment, true)
      // Paying ₹5,000 extra on a ₹50L loan knocks off ~3.5 to 4.5 years
      assert.ok(res.yearsSaved >= 3.0 && res.yearsSaved <= 5.0)
      assert.ok(res.acceleratedMonths < res.originalMonths)

      // Substantial interest savings (> ₹10 Lakhs)
      assert.ok(res.interestSaved >= 1000000)

      // Total amount paid with prepayment must be strictly less than standard total amount
      assert.ok(res.totalAmountPaid < res.standardTotalAmount)
    })

    it("should accurately calculate savings from 1 extra EMI per year (annual lump sum)", () => {
      const standardEmi = 43391
      const annualLumpSum: PrepaymentOptions = {
        extraMonthly: 0,
        annualLumpSum: standardEmi, // 1 extra EMI every year
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      }

      const res = calculateLoanWithPrepayment(basePrincipal, baseRate, baseTenure, annualLumpSum)

      assert.equal(res.hasPrepayment, true)
      assert.ok(res.yearsSaved >= 2.0 && res.yearsSaved <= 3.5)
      assert.ok(res.interestSaved >= 700000 && res.interestSaved <= 1100000)
    })

    it("should accurately calculate savings from one-time prepayment at year 3", () => {
      const oneTime: PrepaymentOptions = {
        extraMonthly: 0,
        annualLumpSum: 0,
        oneTimePrepayment: 500000, // ₹5 Lakhs one-time in Year 3
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      }

      const res = calculateLoanWithPrepayment(basePrincipal, baseRate, baseTenure, oneTime)

      assert.equal(res.hasPrepayment, true)
      assert.ok(res.yearsSaved >= 2.0)
      assert.ok(res.interestSaved >= 800000)
    })

    it("should handle large prepayments that clear the loan very quickly without negative balances", () => {
      const rapidPrepay: PrepaymentOptions = {
        extraMonthly: 100000, // ₹1 Lakh extra/month
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      }

      const res = calculateLoanWithPrepayment(basePrincipal, baseRate, baseTenure, rapidPrepay)

      assert.equal(res.hasPrepayment, true)
      assert.ok(res.acceleratedMonths < 48) // Cleared in under 4 years
      assert.ok(res.interestSaved > 3500000) // Saves over 35 Lakhs in interest

      // Final balance in accelerated schedule must be 0
      const finalRow = res.acceleratedSchedule[res.acceleratedSchedule.length - 1]
      assert.equal(finalRow.closingBalance, 0)
    })
  })

  describe("Formatting Utilities", () => {
    it("should format INR currency properly with commas", () => {
      assert.equal(formatINR(5000000), "₹50,00,000")
      assert.equal(formatINR(43391), "₹43,391")
      assert.equal(formatINR(0), "₹0")
    })

    it("should format compact INR with Crores and Lakhs", () => {
      assert.equal(formatCompactINR(10000000), "₹ 1 Cr")
      assert.equal(formatCompactINR(15000000), "₹ 1.50 Cr")
      assert.equal(formatCompactINR(5000000), "₹ 50 Lakh")
      assert.equal(formatCompactINR(2500000), "₹ 25 Lakh")
      assert.equal(formatCompactINR(50000), "₹50,000")
    })
  })
})
