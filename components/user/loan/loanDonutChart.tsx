"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { formatINR } from "@/utils/loanCalculations"

interface LoanDonutChartProps {
  principal: number
  totalInterest: number
}

const COLORS = {
  principal: "#3b82f6", // Blue
  interest: "#f97316", // Vibrant Orange
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
      <div className="relative w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: unknown) => [formatINR(Number(value) || 0), ""]}
              contentStyle={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "var(--foreground)",
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xs text-muted-foreground font-medium">Total Payable</span>
          <span className="text-base sm:text-lg font-bold text-foreground">
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
