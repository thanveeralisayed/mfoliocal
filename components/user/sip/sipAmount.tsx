"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { useQueryState } from "nuqs"

type SipAmountInputProps = {
  schemeCode: number
}

const PRESETS = [2500, 5000, 10000, 25000]

const SipAmountInput: React.FC<SipAmountInputProps> = ({ schemeCode }) => {
  const [amount, setAmount] = useQueryState(`${schemeCode}`, { shallow: false, scroll: false })
  const [, setHistoryGet] = useQueryState("getselectedfundshistory", { shallow: false, scroll: false })

  const currentVal = amount || "5000"

  const handlePreset = (val: number) => {
    setAmount(val.toString())
    setHistoryGet("false")
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-semibold text-sm">
          ₹
        </span>
        <Input
          id={`sip-amount-${schemeCode}`}
          placeholder="5,000"
          type="number"
          step="500"
          min="500"
          value={currentVal}
          onChange={(e) => {
            setAmount(e.target.value)
            setHistoryGet("false")
          }}
          className="pl-8 h-10 rounded-xl font-semibold text-foreground text-sm border-border/70 bg-background/50 focus:bg-background"
        />
        <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs text-muted-foreground">
          / month
        </span>
      </div>

      {/* Quick Amount Presets */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mr-1">
          Quick:
        </span>
        {PRESETS.map((p) => {
          const isSelected = currentVal === p.toString()
          return (
            <button
              key={p}
              type="button"
              onClick={() => handlePreset(p)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              ₹{p >= 1000 ? `${p / 1000}k` : p}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SipAmountInput