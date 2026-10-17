"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Returns } from "@/models/returns"
import { formatIndianCurrency } from "@/utils/sipMath"

interface SipAllocationDonutProps {
  funds: Returns[]
}

const PALETTE = [
  "#10B981", // Emerald
  "#3B82F6", // Royal Blue
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#6366F1", // Indigo
]

export const SipAllocationDonut: React.FC<SipAllocationDonutProps> = ({ funds }) => {
  if (!funds || funds.length === 0) return null

  // Derive SIP amount or invested amount for each scheme
  const totalInvestedSum = funds.reduce((acc, f) => acc + f.totalInvested, 0)

  const data = funds.map((f, i) => {
    const monthlySip = f.schemeHistory?.meta?.sipAmount || 0
    const pct = totalInvestedSum > 0 ? (f.totalInvested / totalInvestedSum) * 100 : 0

    return {
      name: f.schemeName,
      code: f.schemeCode,
      invested: f.totalInvested,
      currentValue: f.total,
      monthlySip,
      percentage: parseFloat(pct.toFixed(1)),
      color: PALETTE[i % PALETTE.length],
    }
  })

  const totalMonthlySip = funds.reduce((acc, f) => acc + (f.schemeHistory?.meta?.sipAmount || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-2">
      {/* Donut Chart with Center Text */}
      <div className="relative w-full h-72 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="invested"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.code}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                const d = payload[0].payload
                return (
                  <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
                    <div className="font-semibold text-foreground flex items-center gap-1.5 pb-1 border-b border-border/60">
                      <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="truncate">{d.name}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Invested:</span>
                      <span className="font-semibold text-foreground">{formatIndianCurrency(d.invested)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Current Value:</span>
                      <span className="font-semibold text-foreground">{formatIndianCurrency(d.currentValue)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground pt-1 border-t border-border/40">
                      <span>Portfolio Share:</span>
                      <span className="font-bold text-primary">{d.percentage}%</span>
                    </div>
                  </div>
                )
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Metric Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            {totalMonthlySip > 0 ? "Monthly SIP" : "Portfolio Split"}
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {totalMonthlySip > 0 ? formatIndianCurrency(totalMonthlySip) : `${funds.length} Funds`}
          </span>
          {totalMonthlySip > 0 && (
            <span className="text-[10px] text-muted-foreground">per month</span>
          )}
        </div>
      </div>

      {/* Allocation Breakdown List */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Asset Weighting & Allocation
        </h4>
        <div className="space-y-2">
          {data.map((item) => (
            <div
              key={item.code}
              className="p-2.5 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-all flex items-center justify-between text-xs gap-3"
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div className="truncate">
                  <div className="font-semibold text-foreground truncate">{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.monthlySip > 0 ? `${formatIndianCurrency(item.monthlySip)}/mo` : `${formatIndianCurrency(item.invested)} total`}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-foreground">{item.percentage}%</div>
                <div className="text-[11px] text-emerald-500 font-medium">
                  {formatIndianCurrency(item.currentValue)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
