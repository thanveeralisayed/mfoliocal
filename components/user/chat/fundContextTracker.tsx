"use client"

import * as React from "react"
import { useFinancialAssistant, FundItemContext } from "@/context/FinancialAssistantContext"
import { SchemeLatest } from "@/models/SchemeLatest"

interface FundContextTrackerProps {
  funds: SchemeLatest[]
}

export function FundContextTracker({ funds }: FundContextTrackerProps) {
  const { updateFundsContext } = useFinancialAssistant()

  React.useEffect(() => {
    if (!funds || funds.length === 0) {
      updateFundsContext([])
      return
    }

    const items: FundItemContext[] = funds.map((f) => ({
      scheme_code: f.meta.scheme_code,
      scheme_name: f.meta.scheme_name,
      scheme_category: f.meta.scheme_category,
      fund_house: f.meta.fund_house,
      nav: f.data?.[0]?.nav,
      sipAmount: f.sipAmount,
    }))

    updateFundsContext(items)
  }, [funds, updateFundsContext])

  return null
}
