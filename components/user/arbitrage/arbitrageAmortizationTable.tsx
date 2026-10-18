"use client"

import * as React from "react"
import { Download, Table as TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { YearSnapshot, formatINR } from "@/utils/arbitrageCalculations"

interface ArbitrageAmortizationTableProps {
  timeline: YearSnapshot[]
  loanTenureYears: number
}

export function ArbitrageAmortizationTable({
  timeline,
  loanTenureYears,
}: ArbitrageAmortizationTableProps) {
  const handleExportCSV = () => {
    if (!timeline.length) return

    const headers = [
      "Year",
      "Prepay Loan Balance (INR)",
      "Prepay Reinvested Wealth (INR)",
      "Standard Loan Balance (INR)",
      "Equity SIP Corpus (INR)",
      "Net Wealth Difference (INR)",
      "Status",
    ]

    const rows = timeline.map((row) => [
      row.year,
      row.prepayLoanBalance,
      row.prepayRedirectedCorpus,
      row.sipLoanBalance,
      row.sipPortfolioValue,
      row.wealthDifference,
      row.isDebtFree ? "Debt-Free" : "Active Loan",
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `MfolioCal_Loan_Prepay_vs_SIP_Arbitrage_${loanTenureYears}Y.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TableIcon className="size-4 text-primary" />
              <span>Year-by-Year Financial Progression Table</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Direct mathematical breakdown of balances, compounding wealth, and net wealth gap
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-semibold gap-1.5 border-border/70 hover:bg-muted self-start sm:self-center cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Export to CSV</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table className="text-xs">
            <TableHeader className="bg-muted/70 sticky top-0 z-20 backdrop-blur-md">
              <TableRow className="border-b border-border/60">
                <TableHead className="font-bold text-foreground w-[70px]">Year</TableHead>
                <TableHead className="font-bold text-amber-600 dark:text-amber-400">
                  Prepay Balance
                </TableHead>
                <TableHead className="font-bold text-amber-600 dark:text-amber-400">
                  Prepay Wealth
                </TableHead>
                <TableHead className="font-bold text-muted-foreground">
                  Std Loan Balance
                </TableHead>
                <TableHead className="font-bold text-emerald-600 dark:text-emerald-400">
                  Equity SIP Corpus
                </TableHead>
                <TableHead className="font-bold text-foreground text-right pr-4">
                  Net Wealth Delta
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {timeline.map((row) => {
                const isSipAhead = row.wealthDifference >= 0

                return (
                  <TableRow
                    key={row.year}
                    className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${
                      row.isDebtFree ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <TableCell className="font-bold text-foreground flex items-center gap-1.5 py-3">
                      <span>Yr {row.year}</span>
                      {row.isDebtFree && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1 rounded-sm font-bold">
                          Debt Free
                        </span>
                      )}
                    </TableCell>

                    {/* Prepay Loan Balance */}
                    <TableCell className="font-mono">
                      {row.prepayLoanBalance === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          ₹0 (Cleared)
                        </span>
                      ) : (
                        formatINR(row.prepayLoanBalance)
                      )}
                    </TableCell>

                    {/* Prepay Reinvested Wealth */}
                    <TableCell className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                      {row.prepayRedirectedCorpus > 0
                        ? formatINR(row.prepayRedirectedCorpus)
                        : "—"}
                    </TableCell>

                    {/* Standard Loan Balance */}
                    <TableCell className="font-mono text-muted-foreground">
                      {formatINR(row.sipLoanBalance)}
                    </TableCell>

                    {/* Equity SIP Portfolio */}
                    <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(row.sipPortfolioValue)}
                    </TableCell>

                    {/* Delta */}
                    <TableCell className="font-mono font-bold text-right pr-4">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          isSipAhead
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {isSipAhead ? `+${formatINR(row.wealthDifference)}` : formatINR(row.wealthDifference)}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
