"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useQueryState } from "nuqs"
import { Calculator } from "lucide-react"

const CalculateButton: React.FC = () => {
  const [, setHistoryGet] = useQueryState("getselectedfundshistory", {
    shallow: false,
    scroll: false,
  })

  const handleCalculate = async () => {
    setHistoryGet("true")
  }

  return (
    <Button
      onClick={handleCalculate}
      className="gap-2 px-5 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer"
    >
      <Calculator className="size-4" />
      <span>Calculate Returns</span>
    </Button>
  )
}

export default CalculateButton