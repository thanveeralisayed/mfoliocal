"use client"

import React, { useEffect } from "react"
import { Returns } from "@/models/returns"
import { calculatePortfolioXIRR } from "@/utils/sipMath"
import { useFinancialAssistant } from "@/context/FinancialAssistantContext"

interface PortfolioContextTrackerProps {
  funds: Returns[]
  timeframe?: string
}

export const PortfolioContextTracker: React.FC<PortfolioContextTrackerProps> = ({
  funds,
  timeframe = "3Y",
}) => {
  const { updatePortfolioContext } = useFinancialAssistant()

  useEffect(() => {
    if (!funds || funds.length === 0) return

    const totalInvested = funds.reduce((acc, f) => acc + f.totalInvested, 0)
    const currentValue = funds.reduce((acc, f) => acc + f.total, 0)
    const totalGain = currentValue - totalInvested
    const growthPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0
    const xirr = calculatePortfolioXIRR(funds)
    const wealthMultiplier = totalInvested > 0 ? currentValue / totalInvested : 0

    updatePortfolioContext({
      totalInvested,
      currentValue,
      totalGain,
      growthPercentage,
      xirr,
      wealthMultiplier,
      timeframe,
      fundsCount: funds.length,
    })
  }, [funds, timeframe, updatePortfolioContext])

  return null
}
