import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  calculateXIRR,
  calculateAccurateSIP,
  parseDateString,
  formatIndianCurrency,
  formatCompactCurrency,
} from "../utils/sipMath.ts"
import type { CashFlow } from "../utils/sipMath.ts"

describe("SIP Mathematics (sipMath.ts)", () => {
  describe("calculateXIRR", () => {
    it("should calculate exact 10% XIRR for a 1-year investment", () => {
      const flows: CashFlow[] = [
        { date: new Date("2023-01-01"), amount: -100000 },
        { date: new Date("2024-01-01"), amount: 110000 },
      ]

      const xirr = calculateXIRR(flows)
      // 100,000 growing to 110,000 in exactly 365 days is 10.0%
      assert.ok(Math.abs(xirr - 10.0) <= 0.1, `Expected ~10.0%, got ${xirr}%`)
    })

    it("should calculate exact 20% XIRR for a 1-year investment", () => {
      const flows: CashFlow[] = [
        { date: new Date("2023-01-01"), amount: -50000 },
        { date: new Date("2024-01-01"), amount: 60000 },
      ]

      const xirr = calculateXIRR(flows)
      assert.ok(Math.abs(xirr - 20.0) <= 0.1, `Expected ~20.0%, got ${xirr}%`)
    })

    it("should calculate multi-period SIP cash flows accurately", () => {
      // 3 monthly installments of ₹10,000 followed by final redemption
      const flows: CashFlow[] = [
        { date: new Date("2023-01-01"), amount: -10000 },
        { date: new Date("2023-02-01"), amount: -10000 },
        { date: new Date("2023-03-01"), amount: -10000 },
        { date: new Date("2023-04-01"), amount: 31500 }, // ~5% return over short period
      ]

      const xirr = calculateXIRR(flows)
      assert.ok(xirr > 0, "XIRR should be positive for profitable investment")
    })

    it("should handle edge cases: invalid or one-sided cash flows", () => {
      assert.equal(calculateXIRR([]), 0)
      assert.equal(calculateXIRR([{ date: new Date(), amount: -10000 }]), 0)

      // Only outflows (no redemptions)
      assert.equal(
        calculateXIRR([
          { date: new Date("2023-01-01"), amount: -10000 },
          { date: new Date("2023-02-01"), amount: -10000 },
        ]),
        0
      )

      // Only inflows
      assert.equal(
        calculateXIRR([
          { date: new Date("2023-01-01"), amount: 10000 },
          { date: new Date("2023-02-01"), amount: 10000 },
        ]),
        0
      )
    })
  })

  describe("calculateAccurateSIP", () => {
    it("should accurately calculate units, principal, and valuation on linear NAV growth", () => {
      // 12 monthly NAV data points growing linearly from ₹10 to ₹21
      const rawNav = Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, "0")
        return {
          date: `2023-${month}-01`,
          nav: 10 + i, // 10, 11, 12 ... 21
        }
      })

      const sipAmount = 1000
      const result = calculateAccurateSIP(rawNav, sipAmount, { frequency: "monthly" })

      assert.ok(result.totalInvested > 0, "Total invested must be greater than 0")
      assert.ok(result.totalUnits > 0, "Total units must be positive")
      assert.ok(result.currentValue > result.totalInvested, "Value must exceed invested amount due to rising NAV")
      assert.ok(result.wealthMultiplier > 1.0, "Wealth multiplier must exceed 1.0")
      assert.ok(result.absoluteGain > 0, "Absolute gain must be positive")
      assert.equal(result.absoluteGain, result.currentValue - result.totalInvested)
    })

    it("should apply annual step-up percentage to investment installments", () => {
      // 24 months of data spanning 2 years
      const rawNav = [
        ...Array.from({ length: 12 }, (_, i) => ({
          date: `2022-${String(i + 1).padStart(2, "0")}-01`,
          nav: 50,
        })),
        ...Array.from({ length: 12 }, (_, i) => ({
          date: `2023-${String(i + 1).padStart(2, "0")}-01`,
          nav: 50,
        })),
      ]

      const initialSip = 10000
      const resFlat = calculateAccurateSIP(rawNav, initialSip, { stepUpPercent: 0 })
      const resStepUp = calculateAccurateSIP(rawNav, initialSip, { stepUpPercent: 10 })

      // With step-up, total invested capital must be strictly greater than flat SIP
      assert.ok(
        resStepUp.totalInvested > resFlat.totalInvested,
        `Expected step-up (${resStepUp.totalInvested}) > flat (${resFlat.totalInvested})`
      )
    })

    it("should handle edge cases: empty data or zero SIP amount", () => {
      assert.equal(calculateAccurateSIP([], 5000).totalInvested, 0)
      assert.equal(calculateAccurateSIP([{ date: "2023-01-01", nav: 50 }], 0).totalInvested, 0)
      assert.equal(calculateAccurateSIP([{ date: "2023-01-01", nav: -10 }], 5000).totalInvested, 0)
    })
  })

  describe("Date Parsing and Currency Formatting", () => {
    it("should parse Indian DD-MM-YYYY and ISO YYYY-MM-DD dates", () => {
      const d1 = parseDateString("15-08-2023")
      assert.equal(d1.getDate(), 15)
      assert.equal(d1.getMonth(), 7) // 0-indexed August is 7
      assert.equal(d1.getFullYear(), 2023)

      const d2 = parseDateString("2023-08-15")
      assert.equal(d2.getDate(), 15)
      assert.equal(d2.getMonth(), 7)
      assert.equal(d2.getFullYear(), 2023)
    })

    it("should format Indian currency with Rupee symbol and commas", () => {
      assert.equal(formatIndianCurrency(100000), "₹1,00,000")
      assert.equal(formatIndianCurrency(5000000), "₹50,00,000")
      assert.equal(formatIndianCurrency(0), "₹0")
    })

    it("should format compact currency in Lakhs and Crores", () => {
      assert.equal(formatCompactCurrency(10000000), "₹1.00Cr")
      assert.equal(formatCompactCurrency(25000000), "₹2.50Cr")
      assert.equal(formatCompactCurrency(500000), "₹5.00L")
      assert.equal(formatCompactCurrency(45000), "₹45.0k")
    })
  })
})
