import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  getDateRange,
  getReturnsForSipByFunds,
  processReturns,
} from "../utils/processNav.ts"
import type { SchemeHistory } from "../models/schemeHistory"

describe("Mutual Fund Historical NAV Processing (processNav.ts)", () => {
  describe("getDateRange", () => {
    it("should generate valid YYYY-MM-DD date range for 1Y, 3Y, 5Y", async () => {
      const r1y = await getDateRange("1Y")
      const r3y = await getDateRange("3Y")
      const r5y = await getDateRange("5Y")

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      assert.ok(dateRegex.test(r1y.startDate))
      assert.ok(dateRegex.test(r1y.endDate))

      const start1 = new Date(r1y.startDate)
      const end1 = new Date(r1y.endDate)
      assert.ok(start1.getTime() < end1.getTime(), "Start date must be earlier than end date")

      const start3 = new Date(r3y.startDate)
      assert.ok(start3.getTime() < start1.getTime(), "3Y start date must be earlier than 1Y start date")

      const start5 = new Date(r5y.startDate)
      assert.ok(start5.getTime() < start3.getTime(), "5Y start date must be earlier than 3Y start date")
    })

    it("should fallback to 3Y for unknown period", async () => {
      const rDefault = await getDateRange("unknown")
      const r3y = await getDateRange("3Y")
      assert.equal(rDefault.startDate, r3y.startDate)
    })
  })

  describe("getReturnsForSipByFunds", () => {
    it("should process fund scheme history and calculate SIP performance", async () => {
      // 12 monthly NAV data points
      const mockScheme: SchemeHistory = {
        meta: {
          fund_house: "Parag Parikh AMC",
          scheme_type: "Open Ended",
          scheme_category: "Flexi Cap",
          scheme_code: 122639,
          scheme_name: "Parag Parikh Flexi Cap Fund",
          isin_growth: "INF879O01019",
          isin_div_reinvestment: null,
          sipAmount: 5000,
        },
        data: Array.from({ length: 12 }, (_, i) => ({
          date: `2023-${String(i + 1).padStart(2, "0")}-01`,
          nav: 40 + i * 2, // NAV rising from 40 to 62
          returns: 0,
        })),
        status: "SUCCESS",
      } as SchemeHistory & { status: string }

      const returns = await getReturnsForSipByFunds([mockScheme])

      assert.equal(returns.length, 1)
      const fund = returns[0]

      assert.equal(fund.schemeCode, 122639)
      assert.equal(fund.schemeName, "Parag Parikh Flexi Cap Fund")
      assert.ok(fund.totalInvested > 0, "Invested capital should be positive")
      assert.ok(fund.totalUnits > 0, "Total units should be positive")
      assert.ok(fund.total > fund.totalInvested, "Final valuation should exceed invested capital due to growth")
      assert.ok((fund.wealthMultiplier || 0) > 1.0)
      assert.ok((fund.growthPercentage || 0) > 0)
    })
  })

  describe("processReturns", () => {
    it("should handle empty returns array gracefully", async () => {
      const combined = await processReturns([])
      assert.deepEqual(combined, [])
    })

    it("should aggregate multi-fund portfolios into continuous aligned timeline", async () => {
      const mockFundA: any = {
        schemeCode: 101,
        schemeName: "Fund A",
        timeline: [
          { date: "2023-01-01", invested: 5000, value: 5000, gainPercent: 0 },
          { date: "2023-02-01", invested: 10000, value: 10500, gainPercent: 5 },
          { date: "2023-03-01", invested: 15000, value: 16200, gainPercent: 8 },
        ],
      }

      const mockFundB: any = {
        schemeCode: 102,
        schemeName: "Fund B",
        timeline: [
          { date: "2023-01-01", invested: 3000, value: 3000, gainPercent: 0 },
          { date: "2023-02-01", invested: 6000, value: 6200, gainPercent: 3.33 },
          { date: "2023-03-01", invested: 9000, value: 9600, gainPercent: 6.67 },
        ],
      }

      const combined = await processReturns([mockFundA, mockFundB])

      assert.ok(combined.length > 0)

      // First data point: Total Invested should be 5000 + 3000 = 8000
      const firstPoint = combined[0] as any
      assert.equal(firstPoint.totalInvested, 8000)
      assert.equal(firstPoint.totalValue, 8000)

      // Final data point: Total Invested should be 15000 + 9000 = 24000
      const lastPoint = combined[combined.length - 1] as any
      assert.equal(lastPoint.totalInvested, 24000)
      assert.equal(lastPoint.totalValue, 16200 + 9600) // 25,800
      assert.equal(lastPoint.totalGain, 25800 - 24000) // 1,800
      assert.ok(lastPoint.gainPercent > 0)
    })
  })
})
