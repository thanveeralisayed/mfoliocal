"use client"

import * as React from "react"
import {
  IndianRupee,
  Percent,
  Clock,
  ArrowRightLeft,
  Building,
  Tag,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatCompactINR } from "@/utils/loanCalculations"
import { formatIndianCurrency } from "@/utils/sipMath"

interface TransferFormProps {
  outstandingPrincipal: number
  currentRate: number
  remainingTenureYears: number
  newRate: number
  processingFeePercent: number
  otherCharges: number
  onPrincipalChange: (val: number) => void
  onCurrentRateChange: (val: number) => void
  onTenureChange: (val: number) => void
  onNewRateChange: (val: number) => void
  onFeePercentChange: (val: number) => void
  onOtherChargesChange: (val: number) => void
}

export function TransferForm({
  outstandingPrincipal,
  currentRate,
  remainingTenureYears,
  newRate,
  processingFeePercent,
  otherCharges,
  onPrincipalChange,
  onCurrentRateChange,
  onTenureChange,
  onNewRateChange,
  onFeePercentChange,
  onOtherChargesChange,
}: TransferFormProps) {
  const rateDelta = (currentRate - newRate).toFixed(2)

  return (
    <div className="space-y-6">
      {/* 1. Current Loan Parameters */}
      <Card className="border-border/80 shadow-xs bg-card/90 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Building className="size-4.5 text-primary" />
            <span>Existing Home Loan Details</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your current remaining balance, interest rate, and tenure
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* Outstanding Principal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <IndianRupee className="size-4 text-primary" />
                <span>Outstanding Loan Principal</span>
              </Label>
              <span className="text-sm font-bold text-primary font-mono">
                {formatCompactINR(outstandingPrincipal)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                ₹
              </span>
              <Input
                type="number"
                min={100000}
                max={100000000}
                step={50000}
                value={outstandingPrincipal}
                onChange={(e) => onPrincipalChange(Math.max(50000, Number(e.target.value) || 0))}
                className="pl-7 font-mono font-bold text-sm h-10"
              />
            </div>

            <input
              type="range"
              min={500000}
              max={20000000}
              step={100000}
              value={outstandingPrincipal}
              onChange={(e) => onPrincipalChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* Current Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Percent className="size-4 text-primary" />
                <span>Current Interest Rate</span>
              </Label>
              <span className="text-sm font-bold text-primary font-mono">{currentRate}%</span>
            </div>

            <input
              type="range"
              min={7.5}
              max={12.0}
              step={0.05}
              value={currentRate}
              onChange={(e) => onCurrentRateChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {[8.75, 9.0, 9.25, 9.5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onCurrentRateChange(r)}
                  className={`px-2 py-0.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                    currentRate === r
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Remaining Tenure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                <span>Remaining Tenure</span>
              </Label>
              <span className="text-sm font-bold text-primary font-mono">
                {remainingTenureYears} Years ({remainingTenureYears * 12} mos)
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={remainingTenureYears}
              onChange={(e) => onTenureChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {[5, 10, 15, 20, 25].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => onTenureChange(y)}
                  className={`px-2 py-0.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                    remainingTenureYears === y
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. New Bank Offer & Switching Friction */}
      <Card className="border-border/80 shadow-xs bg-card/90 backdrop-blur-xl">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ArrowRightLeft className="size-4.5 text-emerald-500" />
              <span>New Bank Offer & Fees</span>
            </CardTitle>
            {Number(rateDelta) > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {rateDelta}% Lower Rate
              </span>
            )}
          </div>
          <CardDescription className="text-xs">
            Specify the competitor rate and switching processing fees
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-5">
          {/* New Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Percent className="size-4 text-emerald-500" />
                <span>New Bank Offer Rate</span>
              </Label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {newRate}%
              </span>
            </div>

            <input
              type="range"
              min={7.0}
              max={11.0}
              step={0.05}
              value={newRate}
              onChange={(e) => onNewRateChange(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {[8.15, 8.35, 8.5, 8.75].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onNewRateChange(r)}
                  className={`px-2 py-0.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                    newRate === r
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>

          {/* Processing Fee % */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                <Tag className="size-4 text-muted-foreground" />
                <span>New Bank Processing Fee</span>
              </Label>
              <span className="text-xs font-mono font-bold text-foreground">
                {processingFeePercent}% (
                {formatIndianCurrency((outstandingPrincipal * processingFeePercent) / 100)})
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={1.0}
              step={0.05}
              value={processingFeePercent}
              onChange={(e) => onFeePercentChange(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
            />

            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {[0, 0.25, 0.35, 0.5].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFeePercentChange(f)}
                  className={`px-2 py-0.5 rounded-lg border font-semibold cursor-pointer transition-all ${
                    processingFeePercent === f
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === 0 ? "Zero Fee (Waiver)" : `${f}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Other charges */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Legal, MODT & Valuation Charges (Estimated)
              </Label>
              <span className="text-xs font-bold text-foreground font-mono">
                {formatIndianCurrency(otherCharges)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
                ₹
              </span>
              <Input
                type="number"
                min={0}
                max={100000}
                step={1000}
                value={otherCharges}
                onChange={(e) => onOtherChargesChange(Math.max(0, Number(e.target.value) || 0))}
                className="pl-7 font-mono text-xs h-9"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Includes Memorandum of Deposit of Title Deeds (MODT) stamp duty and lawyer legal fee.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
