"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatINR } from "@/utils/loanCalculations"

interface LoanDonutChartProps {
  principal: number
  totalInterest: number
}

const COLORS = {
  principal: "#3b82f6", // Vibrant Blue
  interest: "#f97316", // Warm Orange
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      name: string
      value: number
      color: string
    }
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const item = payload[0]
    return (
      <div className="rounded-lg border border-border/80 bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm z-50">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.payload.color }}
          />
          <span className="font-medium text-popover-foreground">
            {item.name}:
          </span>
          <span className="font-bold text-popover-foreground font-mono">
            {formatINR(Number(item.value))}
          </span>
        </div>
      </div>
    )
  }
  return null
}

export function LoanDonutChart({ principal, totalInterest }: LoanDonutChartProps) {
  const total = principal + totalInterest

  const data = React.useMemo(() => {
    return [
      { name: "Principal Amount", value: principal, color: COLORS.principal },
      { name: "Total Interest", value: totalInterest, color: COLORS.interest },
    ]
  }, [principal, totalInterest])

  const principalPercent = total > 0 ? Math.round((principal / total) * 100) : 0
  const interestPercent = total > 0 ? Math.round((totalInterest / total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-full h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={98}
              paddingAngle={3}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                  className="outline-none focus:outline-none transition-opacity duration-200 hover:opacity-90"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            Total Payable
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight mt-0.5">
            {formatINR(total)}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs w-full">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-blue-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Principal ({principalPercent}%)</span>
            <span className="font-semibold text-foreground">{formatINR(principal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-orange-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-muted-foreground">Interest ({interestPercent}%)</span>
            <span className="font-semibold text-foreground">{formatINR(totalInterest)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
