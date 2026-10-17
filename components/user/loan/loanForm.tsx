"use client"

import * as React from "react"
import { IndianRupee, Percent, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatCompactINR } from "@/utils/loanCalculations"

interface LoanFormProps {
  principal: number
  annualRate: number
  tenureYears: number
  onPrincipalChange: (val: number) => void
  onRateChange: (val: number) => void
  onTenureChange: (val: number) => void
}

const AMOUNT_PRESETS = [
  { label: "₹25 L", value: 2500000 },
  { label: "₹50 L", value: 5000000 },
  { label: "₹75 L", value: 7500000 },
  { label: "₹1 Cr", value: 10000000 },
  { label: "₹1.5 Cr", value: 15000000 },
]

const RATE_PRESETS = [8.0, 8.5, 9.0, 9.5]
const TENURE_PRESETS = [10, 15, 20, 25, 30]

export function LoanForm({
  principal,
  annualRate,
  tenureYears,
  onPrincipalChange,
  onRateChange,
  onTenureChange,
}: LoanFormProps) {
  return (
    <Card className="border-border/80 shadow-sm bg-card">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-lg font-bold">Loan Details</CardTitle>
        <CardDescription className="text-xs">
          Adjust the sliders or type directly to calculate your monthly EMI
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* 1. Loan Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="loan-amount" className="text-sm font-medium flex items-center gap-1.5">
              <IndianRupee className="size-4 text-primary" />
              <span>Loan Amount</span>
            </Label>
            <span className="text-sm font-bold text-primary">
              {formatCompactINR(principal)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-semibold pl-1">₹</span>
            <Input
              id="loan-amount"
              type="number"
              min={100000}
              max={50000000}
              step={50000}
              value={principal}
              onChange={(e) => onPrincipalChange(Number(e.target.value) || 0)}
              className="font-semibold text-base"
            />
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={500000}
            max={30000000}
            step={100000}
            value={principal}
            onChange={(e) => onPrincipalChange(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
          />

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
            {AMOUNT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onPrincipalChange(preset.value)}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  principal === preset.value
                    ? "bg-primary text-primary-foreground border-primary font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interest Rate */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label htmlFor="interest-rate" className="text-sm font-medium flex items-center gap-1.5">
              <Percent className="size-4 text-orange-500" />
              <span>Interest Rate (% p.a.)</span>
            </Label>
            <span className="text-sm font-bold text-foreground">{annualRate}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="interest-rate"
              type="number"
              min={1}
              max={25}
              step={0.05}
              value={annualRate}
              onChange={(e) => onRateChange(Number(e.target.value) || 0)}
              className="font-semibold text-base"
            />
            <span className="text-muted-foreground text-sm font-semibold pr-1">%</span>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={6.0}
            max={15.0}
            step={0.1}
            value={annualRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="w-full accent-orange-500 h-2 bg-muted rounded-lg cursor-pointer"
          />

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
            {RATE_PRESETS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onRateChange(rate)}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  annualRate === rate
                    ? "bg-orange-500 text-white border-orange-500 font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* 3. Loan Tenure */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label htmlFor="loan-tenure" className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="size-4 text-blue-500" />
              <span>Loan Tenure (Years)</span>
            </Label>
            <span className="text-sm font-bold text-foreground">
              {tenureYears} Years ({tenureYears * 12} Months)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="loan-tenure"
              type="number"
              min={1}
              max={35}
              step={1}
              value={tenureYears}
              onChange={(e) => onTenureChange(Number(e.target.value) || 0)}
              className="font-semibold text-base"
            />
            <span className="text-muted-foreground text-sm font-semibold pr-1">Yrs</span>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenureYears}
            onChange={(e) => onTenureChange(Number(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-muted rounded-lg cursor-pointer"
          />

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
            {TENURE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTenureChange(t)}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  tenureYears === t
                    ? "bg-blue-600 text-white border-blue-600 font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {t}Y
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
