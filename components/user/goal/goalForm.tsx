"use client"

import * as React from "react"
import {
  GraduationCap,
  Home,
  Palmtree,
  Car,
  Flame,
  Target,
  IndianRupee,
  Calendar,
  TrendingUp,
  Sparkles,
  ShieldAlert,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatCompactCurrency } from "@/utils/sipMath"

export interface GoalPreset {
  id: string
  label: string
  icon: React.ElementType
  amount: number
  years: number
  returnRate: number
  inflation: number
  description: string
}

export const GOAL_PRESETS: GoalPreset[] = [
  {
    id: "education",
    label: "Child Education",
    icon: GraduationCap,
    amount: 3500000,
    years: 12,
    returnRate: 12.5,
    inflation: 8.0,
    description: "College / MBA tuition with 8% education inflation",
  },
  {
    id: "home",
    label: "House Down Payment",
    icon: Home,
    amount: 2500000,
    years: 5,
    returnRate: 11.0,
    inflation: 7.0,
    description: "20% down payment for your dream apartment",
  },
  {
    id: "fire",
    label: "FIRE / Retirement",
    icon: Flame,
    amount: 25000000,
    years: 18,
    returnRate: 13.0,
    inflation: 6.0,
    description: "Achieve true financial independence and freedom",
  },
  {
    id: "car",
    label: "Dream Car",
    icon: Car,
    amount: 1800000,
    years: 3,
    returnRate: 9.0,
    inflation: 5.0,
    description: "Upgrade vehicle debt-free without auto loan interest",
  },
  {
    id: "travel",
    label: "World Vacation",
    icon: Palmtree,
    amount: 800000,
    years: 2,
    returnRate: 7.5,
    inflation: 6.0,
    description: "Dream international holiday paid in full",
  },
]

interface GoalFormProps {
  targetAmount: number
  targetYears: number
  expectedReturn: number
  inflationRate: number
  adjustForInflation: boolean
  stepUpPercent: number
  existingSavings: number
  onAmountChange: (val: number) => void
  onYearsChange: (val: number) => void
  onReturnChange: (val: number) => void
  onInflationChange: (val: number) => void
  onAdjustInflationChange: (val: boolean) => void
  onStepUpChange: (val: number) => void
  onExistingSavingsChange: (val: number) => void
  onApplyPreset: (preset: GoalPreset) => void
}

export function GoalForm({
  targetAmount,
  targetYears,
  expectedReturn,
  inflationRate,
  adjustForInflation,
  stepUpPercent,
  existingSavings,
  onAmountChange,
  onYearsChange,
  onReturnChange,
  onInflationChange,
  onAdjustInflationChange,
  onStepUpChange,
  onExistingSavingsChange,
  onApplyPreset,
}: GoalFormProps) {
  return (
    <Card className="border-border/80 shadow-xs bg-card/90 backdrop-blur-xl">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Target className="size-5 text-primary" />
              <span>Define Your Financial Goal</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Select a popular life milestone or configure custom targets
            </CardDescription>
          </div>
        </div>

        {/* Milestone Preset Chips */}
        <div className="pt-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {GOAL_PRESETS.map((preset) => {
              const Icon = preset.icon
              const isSelected =
                targetAmount === preset.amount && targetYears === preset.years
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{preset.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* 1. Target Goal Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <IndianRupee className="size-4 text-primary" />
              <span>Target Cost (In Today&apos;s Value)</span>
            </Label>
            <span className="text-sm font-bold text-primary font-mono">
              {formatCompactCurrency(targetAmount)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
              ₹
            </span>
            <Input
              type="number"
              min={50000}
              max={100000000}
              step={50000}
              value={targetAmount}
              onChange={(e) => onAmountChange(Math.max(10000, Number(e.target.value) || 0))}
              className="pl-7 font-mono font-bold text-sm h-10"
            />
          </div>

          <input
            type="range"
            min={100000}
            max={50000000}
            step={100000}
            value={targetAmount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <button
              type="button"
              onClick={() => onAmountChange(1000000)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              ₹10L
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(2500000)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              ₹25L
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(5000000)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              ₹50L
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(10000000)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              ₹1 Cr
            </button>
            <button
              type="button"
              onClick={() => onAmountChange(25000000)}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              ₹2.5 Cr
            </button>
          </div>
        </div>

        {/* 2. Target Timeline (Years) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="size-4 text-primary" />
              <span>Time Horizon (Years)</span>
            </Label>
            <span className="text-sm font-bold text-primary font-mono">
              {targetYears} {targetYears === 1 ? "Year" : "Years"}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={targetYears}
            onChange={(e) => onYearsChange(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
            {[2, 3, 5, 10, 15, 20].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => onYearsChange(yr)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold border cursor-pointer transition-all ${
                  targetYears === yr
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {yr}Y
              </button>
            ))}
          </div>
        </div>

        {/* 3. Expected Return (CAGR %) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              <span>Expected Annual Return</span>
            </Label>
            <span className="text-sm font-bold text-primary font-mono">{expectedReturn}%</span>
          </div>

          <input
            type="range"
            min={6.0}
            max={18.0}
            step={0.5}
            value={expectedReturn}
            onChange={(e) => onReturnChange(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            {[7.5, 10.0, 12.0, 14.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => onReturnChange(rate)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold border cursor-pointer transition-all ${
                  expectedReturn === rate
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* 4. Inflation Adjustment Toggle & Rate */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-foreground">Adjust for Inflation</div>
                <div className="text-[11px] text-muted-foreground">
                  Account for rising cost of education/living
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => onAdjustInflationChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {adjustForInflation && (
            <div className="pt-2 border-t border-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Inflation Rate (% per year):</span>
                <span className="font-bold text-foreground font-mono">{inflationRate}%</span>
              </div>
              <input
                type="range"
                min={3.0}
                max={12.0}
                step={0.5}
                value={inflationRate}
                onChange={(e) => onInflationChange(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>General: 6%</span>
                <span>•</span>
                <span>Real Estate: 7%</span>
                <span>•</span>
                <span>Higher Education: 8%–10%</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. Annual Step-Up Option */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-500" />
              <div>
                <div className="text-xs font-bold text-foreground">Annual SIP Step-Up</div>
                <div className="text-[11px] text-muted-foreground">
                  Increase SIP each year with salary hikes
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +{stepUpPercent}% / yr
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={20}
            step={5}
            value={stepUpPercent}
            onChange={(e) => onStepUpChange(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-muted rounded-lg cursor-pointer"
          />

          <div className="flex items-center gap-1.5">
            {[0, 5, 10, 15].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStepUpChange(s)}
                className={`px-2 py-0.5 text-[11px] rounded-lg font-semibold border cursor-pointer transition-all ${
                  stepUpPercent === s
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted/50 border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === 0 ? "Flat (0%)" : `+${s}%`}
              </button>
            ))}
          </div>
        </div>

        {/* 6. Existing Savings */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">
              Existing Savings Already Earmarked (Optional)
            </Label>
            <span className="text-xs font-bold text-foreground font-mono">
              {formatCompactCurrency(existingSavings)}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              max={targetAmount}
              step={25000}
              value={existingSavings || ""}
              placeholder="0"
              onChange={(e) => onExistingSavingsChange(Math.max(0, Number(e.target.value) || 0))}
              className="pl-7 font-mono text-xs h-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
