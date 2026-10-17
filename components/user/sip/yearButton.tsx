"use client"

import React from "react"
import { useQueryState } from "nuqs"

type YearButtonProps = {
  label: string
  value: string
}

const YearButton: React.FC<YearButtonProps> = ({ label, value }) => {
  const [timeframe, setTimeframe] = useQueryState("timeframe", { shallow: false, scroll: false })
  const [, setHistoryGet] = useQueryState("getselectedfundshistory", { shallow: false, scroll: false })

  const isSelected = (timeframe || "3Y") === value

  const handleClick = () => {
    setTimeframe(value)
    // If user already calculated, re-trigger calculation automatically on timeframe change
    if (timeframe !== value) {
      setHistoryGet("true")
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground shadow-xs font-bold scale-105"
          : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
      }`}
    >
      {label}
    </button>
  )
}

export default YearButton
