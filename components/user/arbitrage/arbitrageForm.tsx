"use client"

import * as React from "react"
import {
  IndianRupee,
  Percent,
  Clock,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { formatCompactINR, formatINR } from "@/utils/arbitrageCalculations"

interface ArbitrageFormProps {
  loanPrincipal: number
  loanRate: number
  loanTenureYears: number
  monthlySurplus: number
  annualLumpSum: number
  expectedSipReturn: number
  standardEmi: number
  onPrincipalChange: (val: number) => void
  onRateChange: (val: number) => void
  onTenureChange: (val: number) => void
  onSurplusChange: (val: number) => void
  onLumpSumChange: (val: number) => void
  onSipReturnChange: (val: number) => void
}

const PRINCIPAL_PRESETS = [
  { label: "₹30 L", value: 3000000 },
  { label: "₹50 L", value: 5000000 },
  { label: "₹75 L", value: 7500000 },
  { label: "₹1 Cr", value: 10000000 },
]

const RATE_PRESETS = [8.25, 8.5, 9.0, 9.5]
const TENURE_PRESETS = [10, 15, 20, 25]

const SURPLUS_PRESETS = [
  { label: "₹5k", value: 5000 },
  { label: "₹10k", value: 10000 },
  { label: "₹15k", value: 15000 },
  { label: "₹25k", value: 25000 },
]

const SIP_RETURN_PRESETS = [
  { label: "Conservative (10%)", value: 10.0 },
  { label: "Moderate (12.5%)", value: 12.5 },
  { label: "Aggressive (14.5%)", value: 14.5 },
  { label: "Nifty 50 (13.5%)", value: 13.5 },
]

const BENCHMARK_FUNDS = [
  { name: "Nifty 50 Index", rate: 13.2, category: "Index / Large Cap" },
  { name: "Parag Parikh Flexi Cap", rate: 15.5, category: "Flexi Cap" },
  { name: "Quant Small Cap", rate: 18.0, category: "Small Cap" },
  { name: "Mirae Asset Large Cap", rate: 12.8, category: "Large Cap" },
]

export function ArbitrageForm({
  loanPrincipal,
  loanRate,
  loanTenureYears,
  monthlySurplus,
  annualLumpSum,
  expectedSipReturn,
  standardEmi,
  onPrincipalChange,
  onRateChange,
  onTenureChange,
  onSurplusChange,
  onLumpSumChange,
  onSipReturnChange,
}: ArbitrageFormProps) {
  // Apply 1 extra EMI per year strategy
  const handleApply1ExtraEmi = () => {
    // 1 extra EMI per year = regular EMI spread across 12 months, or as annual lump sum
    onLumpSumChange(Math.round(standardEmi))
  }

  return (
    <div className="space-y-6">
      {/* 1. Loan Parameters Card */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>Home Loan Setup</span>
            </CardTitle>
            <Badge variant="outline" className="font-semibold text-xs border-primary/30 text-primary">
              EMI: {formatINR(standardEmi)}/mo
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Configure your existing or prospective home mortgage
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Loan Principal */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <IndianRupee className="size-3.5 text-primary" />
                <span>Loan Principal Amount</span>
              </Label>
              <span className="text-xs font-bold text-primary">
                {formatCompactINR(loanPrincipal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-bold pl-1">₹</span>
              <Input
                type="number"
                min={500000}
                max={50000000}
                step={50000}
                value={loanPrincipal}
                onChange={(e) => onPrincipalChange(Number(e.target.value) || 0)}
                className="font-semibold text-sm h-9"
              />
            </div>

            <input
              type="range"
              min={500000}
              max={30000000}
              step={100000}
              value={loanPrincipal}
              onChange={(e) => onPrincipalChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {PRINCIPAL_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onPrincipalChange(p.value)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    loanPrincipal === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Tenure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Interest Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Percent className="size-3 text-primary" />
                  <span>Interest Rate</span>
                </Label>
                <span className="text-xs font-bold text-foreground">{loanRate}% p.a.</span>
              </div>

              <Input
                type="number"
                min={5}
                max={16}
                step={0.1}
                value={loanRate}
                onChange={(e) => onRateChange(Number(e.target.value) || 0)}
                className="font-semibold text-sm h-9"
              />

              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {RATE_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onRateChange(r)}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                      loanRate === r
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Clock className="size-3 text-primary" />
                  <span>Loan Tenure</span>
                </Label>
                <span className="text-xs font-bold text-foreground">{loanTenureYears} Years</span>
              </div>

              <Input
                type="number"
                min={3}
                max={30}
                step={1}
                value={loanTenureYears}
                onChange={(e) => onTenureChange(Number(e.target.value) || 0)}
                className="font-semibold text-sm h-9"
              />

              <div className="flex items-center gap-1 flex-wrap pt-0.5">
                {TENURE_PRESETS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onTenureChange(t)}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                      loanTenureYears === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                    }`}
                  >
                    {t}Y
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Surplus Cashflow & SIP Investment Setup */}
      <Card className="border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Surplus Cash & Investment</span>
            </CardTitle>
            <Badge variant="outline" className="font-semibold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              Surplus: {formatINR(monthlySurplus)}/mo
            </Badge>
          </div>
          <CardDescription className="text-xs">
            How much extra cash can you deploy towards Prepayment OR Equity SIP?
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Monthly Surplus */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <IndianRupee className="size-3.5 text-emerald-500" />
                <span>Extra Monthly Surplus Cash</span>
              </Label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(monthlySurplus)}/month
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-bold pl-1">₹</span>
              <Input
                type="number"
                min={1000}
                max={500000}
                step={1000}
                value={monthlySurplus}
                onChange={(e) => onSurplusChange(Number(e.target.value) || 0)}
                className="font-semibold text-sm h-9"
              />
            </div>

            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={monthlySurplus}
              onChange={(e) => onSurplusChange(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {SURPLUS_PRESETS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => onSurplusChange(s.value)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    monthlySurplus === s.value
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                  }`}
                >
                  {s.label}
                </button>
              ))}

              <button
                type="button"
                onClick={handleApply1ExtraEmi}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                title="Pay 1 extra EMI each year as annual lump sum bonus"
              >
                <Zap className="size-3" />
                <span>+1 Extra EMI/Yr</span>
              </button>
            </div>
          </div>

          {/* Annual Lump Sum / Bonus */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <IndianRupee className="size-3.5 text-muted-foreground" />
                <span>Annual Bonus / Lump Sum (Optional)</span>
              </Label>
              <span className="text-xs font-bold text-foreground">
                {annualLumpSum > 0 ? formatCompactINR(annualLumpSum) : "₹0"}
              </span>
            </div>

            <Input
              type="number"
              min={0}
              max={5000000}
              step={10000}
              value={annualLumpSum}
              onChange={(e) => onLumpSumChange(Number(e.target.value) || 0)}
              className="font-semibold text-sm h-9"
              placeholder="e.g. ₹50,000 yearly bonus"
            />
          </div>

          {/* Expected SIP Return Rate */}
          <div className="space-y-2.5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" />
                <span>Expected Equity SIP Return (CAGR)</span>
              </Label>
              <span className="text-xs font-bold text-primary">
                {expectedSipReturn}% p.a.
              </span>
            </div>

            <input
              type="range"
              min={8}
              max={20}
              step={0.5}
              value={expectedSipReturn}
              onChange={(e) => onSipReturnChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {SIP_RETURN_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onSipReturnChange(p.value)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    expectedSipReturn === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted border-border/60"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Benchmark Real Funds Quick Selector */}
            <div className="pt-2">
              <div className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                <span>Historical Category Benchmarks:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {BENCHMARK_FUNDS.map((f) => (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => onSipReturnChange(f.rate)}
                    className={`text-left p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      expectedSipReturn === f.rate
                        ? "border-primary bg-primary/10 text-foreground font-semibold"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <div className="truncate font-medium">{f.name}</div>
                    <div className="text-[10px] text-primary font-bold">{f.rate}% CAGR</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
