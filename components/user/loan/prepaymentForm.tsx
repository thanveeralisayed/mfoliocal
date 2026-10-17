"use client"

import * as React from "react"
import {
  Zap,
  TrendingUp,
  Calendar,
  RotateCcw,
  IndianRupee,
  Layers,
  Sparkles,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCompactINR, formatINR, PrepaymentOptions } from "@/utils/loanCalculations"

interface PrepaymentFormProps {
  options: PrepaymentOptions
  onChange: (options: PrepaymentOptions) => void
  standardMonthlyEmi: number
  tenureYears: number
}

export function PrepaymentForm({
  options,
  onChange,
  standardMonthlyEmi,
  tenureYears,
}: PrepaymentFormProps) {
  // Preset Strategies
  const applyPresetStrategy = (strategy: string) => {
    if (strategy === "1_extra_emi") {
      onChange({
        extraMonthly: 0,
        annualLumpSum: Math.round(standardMonthlyEmi),
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      })
    } else if (strategy === "step_up_5") {
      onChange({
        extraMonthly: 0,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 5,
      })
    } else if (strategy === "extra_5k") {
      onChange({
        extraMonthly: 5000,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      })
    } else if (strategy === "extra_10k") {
      onChange({
        extraMonthly: 10000,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      })
    } else if (strategy === "reset") {
      onChange({
        extraMonthly: 0,
        annualLumpSum: 0,
        oneTimePrepayment: 0,
        oneTimeYear: 3,
        annualStepUpPercent: 0,
      })
    }
  }

  const isPresetActive = (strategy: string) => {
    if (strategy === "1_extra_emi") {
      return (
        options.annualLumpSum > 0 &&
        options.extraMonthly === 0 &&
        options.annualStepUpPercent === 0
      )
    }
    if (strategy === "step_up_5") {
      return options.annualStepUpPercent === 5 && options.extraMonthly === 0 && options.annualLumpSum === 0
    }
    if (strategy === "extra_5k") {
      return options.extraMonthly === 5000 && options.annualLumpSum === 0 && options.annualStepUpPercent === 0
    }
    if (strategy === "extra_10k") {
      return options.extraMonthly === 10000 && options.annualLumpSum === 0 && options.annualStepUpPercent === 0
    }
    return false
  }

  return (
    <Card className="border-border/80 shadow-sm bg-card">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-500" />
            <div>
              <CardTitle className="text-lg font-bold">
                Prepayment Strategy Planner
              </CardTitle>
              <CardDescription className="text-xs">
                Configure extra payments to see instant interest & tenure reduction
              </CardDescription>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => applyPresetStrategy("reset")}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2 gap-1 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* 1-Click Popular Strategies */}
        <div className="pt-3">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            ⚡ Popular Strategies:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPresetStrategy("1_extra_emi")}
              className={`text-xs p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isPresetActive("1_extra_emi")
                  ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1 font-semibold text-foreground text-xs">
                <Zap className="size-3.5 text-emerald-500" />
                1 Extra EMI / Yr
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                {formatINR(standardMonthlyEmi)}/yr
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPresetStrategy("step_up_5")}
              className={`text-xs p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isPresetActive("step_up_5")
                  ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1 font-semibold text-foreground text-xs">
                <TrendingUp className="size-3.5 text-blue-500" />
                +5% Step-Up / Yr
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                Annual Salary Rise
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPresetStrategy("extra_5k")}
              className={`text-xs p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isPresetActive("extra_5k")
                  ? "bg-primary/15 border-primary text-primary font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1 font-semibold text-foreground text-xs">
                <IndianRupee className="size-3.5 text-primary" />
                +₹5,000 / Month
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                Small Monthly Boost
              </span>
            </button>

            <button
              type="button"
              onClick={() => applyPresetStrategy("extra_10k")}
              className={`text-xs p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isPresetActive("extra_10k")
                  ? "bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 font-semibold shadow-xs"
                  : "bg-muted/40 hover:bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-1 font-semibold text-foreground text-xs">
                <Layers className="size-3.5 text-purple-500" />
                +₹10,000 / Month
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                Aggressive Payoff
              </span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* 1. Extra Monthly Payment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="extra-monthly" className="text-sm font-medium flex items-center gap-1.5">
              <IndianRupee className="size-4 text-emerald-500" />
              <span>Extra Monthly Prepayment</span>
            </Label>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(options.extraMonthly)} / mo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-semibold pl-1">₹</span>
            <Input
              id="extra-monthly"
              type="number"
              min={0}
              max={100000}
              step={500}
              value={options.extraMonthly || ""}
              placeholder="0"
              onChange={(e) =>
                onChange({ ...options, extraMonthly: Number(e.target.value) || 0 })
              }
              className="font-semibold text-base"
            />
          </div>

          <input
            type="range"
            min={0}
            max={50000}
            step={1000}
            value={options.extraMonthly}
            onChange={(e) =>
              onChange({ ...options, extraMonthly: Number(e.target.value) })
            }
            className="w-full accent-emerald-500 h-2 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
            {[2500, 5000, 10000, 20000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...options, extraMonthly: val })}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  options.extraMonthly === val
                    ? "bg-emerald-600 text-white border-emerald-600 font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                +₹{val / 1000}k
              </button>
            ))}
          </div>
        </div>

        {/* 2. Annual Lump Sum Payment */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label htmlFor="annual-lump-sum" className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>Annual Prepayment (Every Year)</span>
            </Label>
            <span className="text-sm font-bold text-primary">
              {formatCompactINR(options.annualLumpSum)} / yr
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm font-semibold pl-1">₹</span>
            <Input
              id="annual-lump-sum"
              type="number"
              min={0}
              max={2000000}
              step={5000}
              value={options.annualLumpSum || ""}
              placeholder="0"
              onChange={(e) =>
                onChange({ ...options, annualLumpSum: Number(e.target.value) || 0 })
              }
              className="font-semibold text-base"
            />
          </div>

          <input
            type="range"
            min={0}
            max={500000}
            step={10000}
            value={options.annualLumpSum}
            onChange={(e) =>
              onChange({ ...options, annualLumpSum: Number(e.target.value) })
            }
            className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...options, annualLumpSum: Math.round(standardMonthlyEmi) })
              }
              className="text-xs px-2.5 py-0.5 rounded-md border bg-muted/40 hover:bg-muted text-muted-foreground border-border cursor-pointer"
            >
              1 Extra EMI ({formatINR(standardMonthlyEmi)})
            </button>
            {[50000, 100000, 200000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChange({ ...options, annualLumpSum: val })}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  options.annualLumpSum === val
                    ? "bg-primary text-primary-foreground border-primary font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                ₹{val / 100000} Lakh
              </button>
            ))}
          </div>
        </div>

        {/* 3. One-Time Lump Sum Prepayment */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label htmlFor="onetime-prepayment" className="text-sm font-medium flex items-center gap-1.5">
              <Zap className="size-4 text-orange-500" />
              <span>One-Time Lump Sum Prepayment</span>
            </Label>
            <span className="text-sm font-bold text-foreground">
              {options.oneTimePrepayment > 0
                ? `${formatCompactINR(options.oneTimePrepayment)} in Year ${options.oneTimeYear}`
                : "None"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 flex items-center gap-2">
              <span className="text-muted-foreground text-sm font-semibold pl-1">₹</span>
              <Input
                id="onetime-prepayment"
                type="number"
                min={0}
                max={10000000}
                step={25000}
                value={options.oneTimePrepayment || ""}
                placeholder="Lump Sum Amount (e.g. ₹5,00,000)"
                onChange={(e) =>
                  onChange({
                    ...options,
                    oneTimePrepayment: Number(e.target.value) || 0,
                  })
                }
                className="font-semibold text-base"
              />
            </div>

            <div className="sm:col-span-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">In Year:</span>
              <Input
                type="number"
                min={1}
                max={tenureYears}
                value={options.oneTimeYear}
                onChange={(e) =>
                  onChange({
                    ...options,
                    oneTimeYear: Math.max(1, Math.min(tenureYears, Number(e.target.value) || 1)),
                  })
                }
                className="font-semibold text-center"
              />
            </div>
          </div>
        </div>

        {/* 4. Annual Step-up EMI */}
        <div className="space-y-3 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between">
            <Label htmlFor="stepup-percent" className="text-sm font-medium flex items-center gap-1.5">
              <TrendingUp className="size-4 text-blue-500" />
              <span>Annual EMI Step-Up Rate (% p.a.)</span>
            </Label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {options.annualStepUpPercent}% / year
            </span>
          </div>

          <input
            id="stepup-percent"
            type="range"
            min={0}
            max={15}
            step={1}
            value={options.annualStepUpPercent}
            onChange={(e) =>
              onChange({ ...options, annualStepUpPercent: Number(e.target.value) })
            }
            className="w-full accent-blue-500 h-2 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
            {[0, 3, 5, 8, 10].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => onChange({ ...options, annualStepUpPercent: pct })}
                className={`text-xs px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  options.annualStepUpPercent === pct
                    ? "bg-blue-600 text-white border-blue-600 font-medium"
                    : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
