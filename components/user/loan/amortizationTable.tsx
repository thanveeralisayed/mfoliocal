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
import { formatINR, YearlyAmortization } from "@/utils/loanCalculations"

interface AmortizationTableProps {
  schedule: YearlyAmortization[]
  principal: number
}

export function AmortizationTable({ schedule, principal }: AmortizationTableProps) {
  const handleExportCSV = () => {
    if (!schedule.length) return

    const headers = [
      "Year",
      "Opening Balance (INR)",
      "Principal Paid (INR)",
      "Interest Paid (INR)",
      "Total Payment (INR)",
      "Closing Balance (INR)",
      "Remaining Loan (%)",
    ]

    const rows = schedule.map((item) => [
      item.year,
      item.openingBalance,
      item.principalPaid,
      item.interestPaid,
      item.totalPayment,
      item.closingBalance,
      item.loanRemainingPercent,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `mfoliocal_amortization_schedule_${principal}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <TableIcon className="size-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">
                Yearly Amortization Schedule
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed breakdown of principal and interest paid each year
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2 cursor-pointer text-xs self-start sm:self-auto"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-xs">
              <TableRow>
                <TableHead className="w-[80px] font-semibold text-xs">Year</TableHead>
                <TableHead className="font-semibold text-xs">Opening Balance</TableHead>
                <TableHead className="font-semibold text-xs text-blue-600 dark:text-blue-400">
                  Principal Paid
                </TableHead>
                <TableHead className="font-semibold text-xs text-orange-600 dark:text-orange-400">
                  Interest Paid
                </TableHead>
                <TableHead className="font-semibold text-xs">Total Payment</TableHead>
                <TableHead className="font-semibold text-xs">Closing Balance</TableHead>
                <TableHead className="font-semibold text-xs text-right pr-6">
                  Remaining
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row) => (
                <TableRow key={row.year} className="hover:bg-muted/30">
                  <TableCell className="font-bold text-xs text-foreground">
                    Yr {row.year}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {formatINR(row.openingBalance)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    {formatINR(row.principalPaid)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-orange-600 dark:text-orange-400 font-mono">
                    {formatINR(row.interestPaid)}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-foreground font-mono">
                    {formatINR(row.totalPayment)}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-foreground font-mono">
                    {formatINR(row.closingBalance)}
                  </TableCell>
                  <TableCell className="text-xs text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, row.loanRemainingPercent)}%` }}
                        />
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {row.loanRemainingPercent}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
