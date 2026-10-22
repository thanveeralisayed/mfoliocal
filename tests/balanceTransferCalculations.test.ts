import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateBalanceTransfer,
  type BalanceTransferInputs,
} from "../utils/balanceTransferCalculations.ts"

describe("Home Loan Balance Transfer Calculations (balanceTransferCalculations.ts)", () => {
  describe("Standard Refinance Scenarios", () => {
    it("should accurately compute Strategy A (Lower EMI) and Strategy B (Slash Tenure) for ₹45L loan", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 4500000, // ₹45 Lakhs
        currentRate: 9.25, // 9.25%
        remainingTenureYears: 18, // 18 Years (216 Months)
        newRate: 8.40, // 8.40% (85 bps rate drop)
        processingFeePercent: 0.35, // 0.35% = ₹15,750
        otherCharges: 8000, // ₹8,000 legal & MODT
      }

      const result = calculateBalanceTransfer(inputs)

      // Base loan checks
      assert.ok(result.currentMonthlyEmi > 42000 && result.currentMonthlyEmi < 45000)
      assert.equal(result.rateDifferenceBps, 85)
      assert.equal(result.processingFeeAmount, 15750)
      assert.equal(result.totalSwitchingCost, 15750 + 8000) // ₹23,750

      // Strategy A checks (Lower EMI)
      assert.ok(result.strategyA.newMonthlyEmi < result.currentMonthlyEmi)
      assert.ok(result.strategyA.monthlyEmiSavings > 2000) // ~₹2,500/mo cashflow freed
      assert.ok(result.strategyA.grossInterestSavings > 450000) // > ₹4.5 Lakhs interest saved
      assert.equal(
        result.strategyA.netLifetimeSavings,
        result.strategyA.grossInterestSavings - result.totalSwitchingCost
      )

      // Break-even months = ₹23,750 / monthly savings (~9-10 months)
      assert.ok(result.strategyA.breakEvenMonths >= 8 && result.strategyA.breakEvenMonths <= 12)
      assert.ok(result.strategyA.breakEvenYears <= 1.0)

      // Strategy B checks (Slash Tenure with Same EMI)
      assert.equal(result.strategyB.maintainedMonthlyEmi, result.currentMonthlyEmi)
      assert.ok(result.strategyB.newTenureYears < 18)
      assert.ok(result.strategyB.yearsSaved > 1.5) // Saves 1.5 to 2.5 years of payments
      assert.ok(result.strategyB.monthsSaved > 18)
      assert.ok(
        result.strategyB.grossInterestSavings > result.strategyA.grossInterestSavings,
        "Strategy B interest savings should exceed Strategy A"
      )

      // Verdict
      assert.equal(result.verdict, "Strongly Recommended")
      assert.ok(result.verdictDescription.includes("Break-even") || result.verdictDescription.includes("arbitrage"))
      assert.ok(result.negotiationTip.includes("rate conversion") || result.negotiationTip.includes("rate"))

      // Trajectory checks
      assert.equal(result.yearlyTrajectory.length, 18)
      const lastPoint = result.yearlyTrajectory[result.yearlyTrajectory.length - 1]
      assert.ok(lastPoint.isBreakEvenAchieved)
    })

    it("should handle full fee waiver (0% processing fee, 0 other charges)", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 5000000,
        currentRate: 9.0,
        remainingTenureYears: 20,
        newRate: 8.5,
        processingFeePercent: 0,
        otherCharges: 0,
      }

      const result = calculateBalanceTransfer(inputs)

      assert.equal(result.totalSwitchingCost, 0)
      assert.equal(result.strategyA.breakEvenMonths, 0)
      assert.equal(result.strategyA.netLifetimeSavings, result.strategyA.grossInterestSavings)
    })
  })

  describe("Smart Verdict Recommendation Engine", () => {
    it("should return 'Not Recommended' when new rate is higher or equal to current rate", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 5000000,
        currentRate: 8.5,
        remainingTenureYears: 15,
        newRate: 9.0, // Higher rate!
        processingFeePercent: 0.5,
        otherCharges: 5000,
      }

      const result = calculateBalanceTransfer(inputs)

      assert.equal(result.verdict, "Not Recommended")
      assert.ok(result.verdictDescription.includes("equal to or higher"))
    })

    it("should return 'Not Recommended' when switching fees outweigh interest savings on short remaining tenure", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 200000, // Only ₹2 Lakhs remaining
        currentRate: 9.0,
        remainingTenureYears: 1, // Only 1 Year left
        newRate: 8.85, // Tiny 15 bps spread
        processingFeePercent: 1.0, // ₹2,000 fee
        otherCharges: 10000, // ₹10,000 other charges = ₹12,000 total fees
      }

      const result = calculateBalanceTransfer(inputs)

      assert.equal(result.verdict, "Not Recommended")
      assert.ok(result.strategyA.netLifetimeSavings <= 0 || result.strategyA.breakEvenMonths > 36)
    })

    it("should return 'Moderate ROI (Negotiate First)' for moderate savings with longer break-even", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 3000000,
        currentRate: 9.2,
        remainingTenureYears: 15,
        newRate: 8.8, // 40 bps drop
        processingFeePercent: 0.35, // ₹10,500 fee
        otherCharges: 8000, // ₹8,000 other charges
      }

      const result = calculateBalanceTransfer(inputs)

      assert.equal(result.verdict, "Moderate ROI (Negotiate First)")
      assert.ok(result.strategyA.breakEvenMonths > 10)
    })
  })

  describe("Extreme Edge Cases & Boundary Conditions", () => {
    it("should handle large ₹100 Crore commercial/luxury home loan safely", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 1000000000, // ₹100 Crore
        currentRate: 9.5,
        remainingTenureYears: 25,
        newRate: 8.5,
        processingFeePercent: 0.25,
        otherCharges: 50000,
      }

      const result = calculateBalanceTransfer(inputs)

      assert.ok(Number.isFinite(result.currentMonthlyEmi))
      assert.ok(Number.isFinite(result.strategyA.newMonthlyEmi))
      assert.ok(Number.isFinite(result.strategyA.netLifetimeSavings))
      assert.ok(result.strategyA.netLifetimeSavings > 10000000) // Massive savings in Crores
      assert.equal(result.yearlyTrajectory.length, 25)
    })

    it("should clamp zero or negative rates and tenure gracefully", () => {
      const inputs: BalanceTransferInputs = {
        outstandingPrincipal: 0,
        currentRate: -5,
        remainingTenureYears: 0,
        newRate: -3,
        processingFeePercent: -0.5,
        otherCharges: -1000,
      }

      const result = calculateBalanceTransfer(inputs)

      assert.ok(!isNaN(result.currentMonthlyEmi))
      assert.ok(!isNaN(result.strategyA.newMonthlyEmi))
      assert.ok(result.totalSwitchingCost >= 0)
    })
  })
})
