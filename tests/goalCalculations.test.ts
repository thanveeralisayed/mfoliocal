import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateGoalRequirements,
  getRecommendedAssetAllocation,
  type GoalInputs,
} from "../utils/goalCalculations.ts"

describe("Goal-Based Reverse SIP Calculations (goalCalculations.ts)", () => {
  describe("getRecommendedAssetAllocation", () => {
    it("should recommend Low Risk (10% Equity, 80% Debt) for short horizons (<= 3 years)", () => {
      const alloc1 = getRecommendedAssetAllocation(1)
      const alloc3 = getRecommendedAssetAllocation(3)

      assert.equal(alloc1.riskLevel, "Low Risk")
      assert.equal(alloc1.equityPercent, 10)
      assert.equal(alloc1.debtPercent, 80)
      assert.equal(alloc1.goldPercent, 10)
      assert.ok(alloc1.recommendedCategories.some((c) => c.includes("Arbitrage") || c.includes("Liquid")))

      assert.equal(alloc3.riskLevel, "Low Risk")
    })

    it("should recommend Moderate Risk (55% Equity, 35% Debt) for medium horizons (4 to 7 years)", () => {
      const alloc4 = getRecommendedAssetAllocation(4)
      const alloc7 = getRecommendedAssetAllocation(7)

      assert.equal(alloc4.riskLevel, "Moderate Risk")
      assert.equal(alloc4.equityPercent, 55)
      assert.equal(alloc4.debtPercent, 35)
      assert.equal(alloc4.goldPercent, 10)
      assert.ok(alloc4.recommendedCategories.some((c) => c.includes("Balanced Advantage")))

      assert.equal(alloc7.riskLevel, "Moderate Risk")
    })

    it("should recommend High Growth (80% Equity, 15% Debt) for long horizons (8+ years)", () => {
      const alloc8 = getRecommendedAssetAllocation(8)
      const alloc15 = getRecommendedAssetAllocation(15)

      assert.equal(alloc8.riskLevel, "High Growth")
      assert.equal(alloc8.equityPercent, 80)
      assert.equal(alloc8.debtPercent, 15)
      assert.equal(alloc8.goldPercent, 5)
      assert.ok(alloc8.recommendedCategories.some((c) => c.includes("Flexi Cap")))

      assert.equal(alloc15.riskLevel, "High Growth")
    })
  })

  describe("calculateGoalRequirements - Core Mathematics", () => {
    it("should calculate exact flat monthly SIP for standard 10-year goal unadjusted for inflation", () => {
      const inputs: GoalInputs = {
        targetAmount: 5000000, // ₹50 Lakhs
        targetYears: 10,
        expectedReturn: 12.0, // 12% CAGR
        inflationRate: 0,
        adjustForInflation: false,
        stepUpPercent: 0,
        existingSavings: 0,
      }

      const result = calculateGoalRequirements(inputs)

      assert.equal(result.todayCost, 5000000)
      assert.equal(result.effectiveTargetCorpus, 5000000)
      assert.equal(result.inflationCostAddition, 0)

      // At 12% p.a., monthly SIP required for ₹50L in 10Y is ~₹21,700–₹22,000
      assert.ok(
        result.monthlySipRequired >= 21000 && result.monthlySipRequired <= 23000,
        `Expected SIP around ₹21,700, got ${result.monthlySipRequired}`
      )
      assert.equal(result.monthlySipStepUpInitial, result.monthlySipRequired)

      // Total capital invested should be approximately monthlySip * 120 months (within rounding tolerance)
      assert.ok(Math.abs(result.totalCapitalInvested - result.monthlySipRequired * 120) < 50)
      assert.ok(result.totalWealthGain > 0)
      assert.ok(result.wealthMultiplier > 1.8)

      // Final point in trajectory must reach or exceed the target corpus
      const finalPoint = result.yearlyTrajectory[result.yearlyTrajectory.length - 1]
      assert.ok(
        Math.abs(finalPoint.compoundedValue - 5000000) < 50000,
        `Final trajectory value (${finalPoint.compoundedValue}) should be within ₹50k of ₹5,000,000`
      )
    })

    it("should accurately inflate target corpus when adjustForInflation is true", () => {
      const inputs: GoalInputs = {
        targetAmount: 3000000, // ₹30 Lakhs
        targetYears: 10,
        expectedReturn: 12.0,
        inflationRate: 6.0, // 6% annual inflation
        adjustForInflation: true,
        stepUpPercent: 0,
        existingSavings: 0,
      }

      const result = calculateGoalRequirements(inputs)

      // (1 + 0.06)^10 = 1.790847 -> ₹30L becomes ~₹53.72 Lakhs
      const expectedTarget = Math.round(3000000 * Math.pow(1.06, 10))
      assert.ok(
        Math.abs(result.effectiveTargetCorpus - expectedTarget) < 1000,
        `Expected ${expectedTarget}, got ${result.effectiveTargetCorpus}`
      )
      assert.ok(result.inflationCostAddition > 2000000)

      // Required SIP must be higher to hit the inflated corpus
      assert.ok(result.monthlySipRequired > 22000)
    })

    it("should compute lower Year 1 SIP when annual step-up top-up is applied", () => {
      const baseInputs: GoalInputs = {
        targetAmount: 5000000,
        targetYears: 10,
        expectedReturn: 12.0,
        inflationRate: 0,
        adjustForInflation: false,
        stepUpPercent: 0,
        existingSavings: 0,
      }

      const stepUpInputs: GoalInputs = {
        ...baseInputs,
        stepUpPercent: 10.0, // +10% annual top-up
      }

      const flatResult = calculateGoalRequirements(baseInputs)
      const stepUpResult = calculateGoalRequirements(stepUpInputs)

      // Step-up initial SIP should be significantly lower than flat SIP!
      assert.ok(
        stepUpResult.monthlySipStepUpInitial < flatResult.monthlySipRequired,
        `Step-up initial (${stepUpResult.monthlySipStepUpInitial}) should be lower than flat (${flatResult.monthlySipRequired})`
      )

      // Both must hit the ₹50L target at year 10
      const finalPoint = stepUpResult.yearlyTrajectory[stepUpResult.yearlyTrajectory.length - 1]
      assert.ok(
        Math.abs(finalPoint.compoundedValue - 5000000) < 50000,
        `Step-up final trajectory value (${finalPoint.compoundedValue}) should reach ~₹50 Lakhs`
      )
    })

    it("should deduct future value of existing earmarked savings", () => {
      const withoutSavingsInputs: GoalInputs = {
        targetAmount: 5000000,
        targetYears: 10,
        expectedReturn: 12.0,
        inflationRate: 0,
        adjustForInflation: false,
        stepUpPercent: 0,
        existingSavings: 0,
      }

      const withSavingsInputs: GoalInputs = {
        ...withoutSavingsInputs,
        existingSavings: 1000000, // ₹10 Lakhs already saved
      }

      const resWithout = calculateGoalRequirements(withoutSavingsInputs)
      const resWith = calculateGoalRequirements(withSavingsInputs)

      // ₹10 Lakhs at 12% over 10Y compounds to ~₹31 Lakhs!
      assert.ok(resWith.futureValueOfExistingSavings > 3000000)

      // Required monthly SIP should be less than half of without savings
      assert.ok(
        resWith.monthlySipRequired < resWithout.monthlySipRequired * 0.5,
        `With savings SIP (${resWith.monthlySipRequired}) should be less than half of without savings (${resWithout.monthlySipRequired})`
      )
    })
  })

  describe("calculateGoalRequirements - Extreme Boundary & Edge Cases", () => {
    it("should handle existing savings already exceeding the future target corpus", () => {
      const inputs: GoalInputs = {
        targetAmount: 1000000, // ₹10 Lakhs
        targetYears: 10,
        expectedReturn: 12.0,
        inflationRate: 0,
        adjustForInflation: false,
        stepUpPercent: 0,
        existingSavings: 2000000, // ₹20 Lakhs already saved (exceeds goal)
      }

      const result = calculateGoalRequirements(inputs)

      // Required SIP should be 0, never negative
      assert.equal(result.monthlySipRequired, 0)
      assert.equal(result.monthlySipStepUpInitial, 0)
      assert.equal(result.netCorpusFromSip, 0)
      assert.ok(!isNaN(result.wealthMultiplier))
    })

    it("should handle 1-year short term horizon with 0% inflation", () => {
      const inputs: GoalInputs = {
        targetAmount: 120000, // ₹1.2 Lakhs in 1 year
        targetYears: 1,
        expectedReturn: 7.0, // 7% liquid return
        inflationRate: 0,
        adjustForInflation: false,
        stepUpPercent: 0,
        existingSavings: 0,
      }

      const result = calculateGoalRequirements(inputs)

      assert.equal(result.yearlyTrajectory.length, 1)
      // Monthly SIP should be approximately ₹9,600 - ₹9,700
      assert.ok(result.monthlySipRequired >= 9500 && result.monthlySipRequired <= 10000)
    })

    it("should clamp extreme or negative values safely", () => {
      const inputs: GoalInputs = {
        targetAmount: -500000, // Negative amount
        targetYears: -5, // Negative years
        expectedReturn: -10, // Negative return
        inflationRate: -5,
        adjustForInflation: true,
        stepUpPercent: -10,
      }

      // Should not throw or crash
      const result = calculateGoalRequirements(inputs)

      assert.ok(result.yearlyTrajectory.length >= 1)
      assert.ok(!isNaN(result.monthlySipRequired))
      assert.ok(!isNaN(result.effectiveTargetCorpus))
    })

    it("should handle ultra-large goal of ₹100 Crore over 30 years without NaN or Infinity", () => {
      const inputs: GoalInputs = {
        targetAmount: 1000000000, // ₹100 Crore
        targetYears: 30,
        expectedReturn: 14.0,
        inflationRate: 6.0,
        adjustForInflation: true,
        stepUpPercent: 10.0,
      }

      const result = calculateGoalRequirements(inputs)

      assert.ok(Number.isFinite(result.effectiveTargetCorpus))
      assert.ok(Number.isFinite(result.monthlySipRequired))
      assert.ok(Number.isFinite(result.monthlySipStepUpInitial))
      assert.ok(result.effectiveTargetCorpus > 1000000000)
      assert.equal(result.yearlyTrajectory.length, 30)
    })
  })
})
