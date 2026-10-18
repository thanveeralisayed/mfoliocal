import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatCurrency,
  buildSystemInstruction,
  generateSmartFallbackResponse,
} from "../utils/chatHelpers.ts"

describe("AI Financial Assistant Engine (api/chat/route.ts)", () => {
  describe("formatCurrency", () => {
    it("should format numbers to Indian currency string", () => {
      const formatted = formatCurrency(5000000)
      assert.ok(formatted.includes("50,00,000"))
    })
  })

  describe("buildSystemInstruction", () => {
    it("should include Home Loan context when on home-loan page", () => {
      const instruction = buildSystemInstruction({
        page: "home-loan",
        loan: {
          principal: 5000000,
          annualRate: 8.5,
          tenureYears: 20,
          monthlyEmi: 43391,
          totalInterest: 5413879,
          totalPayment: 10413879,
          hasPrepayment: true,
          extraMonthly: 5000,
          interestSaved: 1150000,
          yearsSaved: 3.5,
        },
      })

      assert.ok(instruction.includes("CURRENT USER VIEW & CALCULATOR STATE (HOME LOAN)"))
      assert.ok(instruction.includes("50,00,000"))
      assert.ok(instruction.includes("8.5%"))
      assert.ok(instruction.includes("43,391"))
      assert.ok(instruction.includes("11,50,000"))
    })

    it("should include Mutual Fund context when on mutual-funds page", () => {
      const instruction = buildSystemInstruction({
        page: "mutual-funds",
        funds: [
          {
            scheme_code: 122639,
            scheme_name: "Parag Parikh Flexi Cap Fund",
            scheme_category: "Flexi Cap",
            nav: "74.50",
            sipAmount: 5000,
          },
        ],
        portfolio: {
          totalInvested: 60000,
          currentValue: 72000,
          totalGain: 12000,
          growthPercentage: 20,
          xirr: 18.5,
          wealthMultiplier: 1.2,
          timeframe: "1Y",
          fundsCount: 1,
        },
      })

      assert.ok(instruction.includes("CURRENT USER VIEW & SELECTED MUTUAL FUNDS"))
      assert.ok(instruction.includes("Parag Parikh Flexi Cap Fund"))
      assert.ok(instruction.includes("18.5% p.a."))
      assert.ok(instruction.includes("1.20x"))
    })

    it("should include Arbitrage context when on arbitrage page", () => {
      const instruction = buildSystemInstruction({
        page: "arbitrage",
        arbitrage: {
          loanPrincipal: 5000000,
          loanRate: 8.5,
          loanTenureYears: 20,
          monthlySurplus: 10000,
          annualLumpSum: 0,
          expectedSipReturn: 13.0,
          yearsSaved: 7.2,
          interestSaved: 2350000,
          sipFinalCorpus: 11450000,
          netWealthAdvantage: 3840000,
          arbitrageSpread: 4.5,
          prepayPayoffYears: 12.8,
        },
      })

      assert.ok(instruction.includes("HOME LOAN PREPAYMENT VS. EQUITY SIP ARBITRAGE"))
      assert.ok(instruction.includes("50,00,000"))
      assert.ok(instruction.includes("10,000/month"))
      assert.ok(instruction.includes("13% p.a."))
      assert.ok(instruction.includes("Arbitrage Spread: +4.5% p.a."))
      assert.ok(instruction.includes("MORE net wealth"))
    })
  })

  describe("generateSmartFallbackResponse", () => {
    it("should generate prepayment guidance for home loan queries", () => {
      const reply = generateSmartFallbackResponse("Should I prepay extra every month?", {
        page: "home-loan",
        loan: {
          principal: 5000000,
          annualRate: 8.5,
          tenureYears: 20,
          monthlyEmi: 43391,
          totalInterest: 5413879,
          totalPayment: 10413879,
        },
      })

      assert.ok(reply.includes("Prepayment Analysis for Your Loan"))
      assert.ok(reply.includes("43,391"))
      assert.ok(reply.includes("extra ₹5,000"))
      assert.ok(reply.includes("Kuber provides educational insights"))
    })

    it("should generate tax analysis for home loan queries", () => {
      const reply = generateSmartFallbackResponse("How much tax can I save under 80C and 24b?", {
        page: "home-loan",
        loan: {
          principal: 5000000,
          annualRate: 8.5,
          tenureYears: 20,
          monthlyEmi: 43391,
          totalInterest: 5413879,
          totalPayment: 10413879,
        },
      })

      assert.ok(reply.includes("Tax Deductions on Your Active Home Loan"))
      assert.ok(reply.includes("Section 24(b)"))
      assert.ok(reply.includes("Section 80C"))
      assert.ok(reply.includes("₹2,00,000"))
    })

    it("should generate arbitrage breakdown for arbitrage page", () => {
      const reply = generateSmartFallbackResponse("Is it better to prepay or invest in SIP?", {
        page: "arbitrage",
        arbitrage: {
          loanPrincipal: 5000000,
          loanRate: 8.5,
          loanTenureYears: 20,
          monthlySurplus: 10000,
          annualLumpSum: 0,
          expectedSipReturn: 13.0,
          yearsSaved: 7.2,
          interestSaved: 2350000,
          sipFinalCorpus: 11450000,
          netWealthAdvantage: 3840000,
          arbitrageSpread: 4.5,
          prepayPayoffYears: 12.8,
        },
      })

      assert.ok(reply.includes("Kuber's Arbitrage Verdict"))
      assert.ok(reply.includes("Pathway A: Prepay Loan Aggressively") || reply.includes("Option A: Prepay Loan Aggressively"))
      assert.ok(reply.includes("Option B: Invest Surplus in Equity SIP"))
      assert.ok(reply.includes("50:50 Hybrid Rule"))
    })

    it("should generate general guide when no specific context is active", () => {
      const reply = generateSmartFallbackResponse("Hello", {})
      assert.ok(reply.includes("I'm Kuber, your MfolioCal AI Wealth & Financial Guide"))
      assert.ok(reply.includes("Home Loan Analysis"))
      assert.ok(reply.includes("Mutual Fund Insights"))
    })
  })
})
