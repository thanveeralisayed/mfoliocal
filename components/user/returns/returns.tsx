import React from "react"
import { SearchParams } from "@/models/searchParams"
import { getSelectedFundsDataHistory, getSelectedFundsDataLatest } from "@/server/action"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { Returns } from "@/models/returns"
import { processReturns } from "@/utils/processNav"
import { ReturnsHistory } from "@/models/returnsHistory"
import { SchemeLatest } from "@/models/SchemeLatest"
import { SipHeroKpis } from "../sip/sipHeroKpis"
import { SipWealthGrowthChart, WealthGrowthPoint } from "../sip/sipWealthGrowthChart"
import { SipComparativeChart } from "../sip/sipComparativeChart"
import { SipAllocationDonut } from "../sip/sipAllocationDonut"
import { PortfolioContextTracker } from "../sip/portfolioContextTracker"
import ReturnsCard from "../sip/returnsCard"
import { TrendingUp, BarChart3, PieChart, Layers, Sparkles, ShieldCheck } from "lucide-react"

const FundReturns = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams
  const timeframe = params.timeframe || "3Y"
  const existingSchemeCodes =
    params.schemeCode
      ?.split(",")
      .filter((code) => code.trim() !== "")
      .map((code) => parseInt(code, 10)) || []

  let selectedFundHistory: Returns[] = []
  let combinedReturns: ReturnsHistory[] = []

  if (params.getselectedfundshistory === "true" && existingSchemeCodes.length > 0) {
    const funds: SchemeLatest[] = (await getSelectedFundsDataLatest(existingSchemeCodes)) || []
    funds.forEach((fund) => {
      const sipAmount: string = (params as Record<string, string>)[`${fund.meta.scheme_code}`]
      fund.sipAmount = sipAmount && parseFloat(sipAmount) > 0 ? parseFloat(sipAmount) : 5000
    })
    selectedFundHistory = await getSelectedFundsDataHistory(funds, timeframe)
    combinedReturns = await processReturns(selectedFundHistory)
  }

  return (
    <div className="space-y-4">
      {selectedFundHistory.length > 0 ? (
        <>
          {/* Real-time Assistant Context Sync */}
          <PortfolioContextTracker funds={selectedFundHistory} timeframe={timeframe} />

          {/* Hero Financial KPI Ribbon */}
          <SipHeroKpis funds={selectedFundHistory} timeframe={timeframe} />

          {/* Main Visualizer Container */}
          <Card className="overflow-hidden border border-border/80 bg-card/90 backdrop-blur-xl shadow-sm">
            <Tabs defaultValue="growth" className="w-full">
              <div className="px-4 pt-4 border-b border-border/60 flex items-center justify-between flex-wrap gap-2">
                <TabsList className="bg-muted/70 p-1 rounded-xl">
                  <TabsTrigger value="growth" className="flex items-center gap-1.5 text-xs">
                    <TrendingUp className="size-3.5" />
                    <span>Wealth Compounding</span>
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="flex items-center gap-1.5 text-xs">
                    <BarChart3 className="size-3.5" />
                    <span>Fund Comparison</span>
                  </TabsTrigger>
                  <TabsTrigger value="allocation" className="flex items-center gap-1.5 text-xs">
                    <PieChart className="size-3.5" />
                    <span>Asset Allocation</span>
                  </TabsTrigger>
                  <TabsTrigger value="schemes" className="flex items-center gap-1.5 text-xs">
                    <Layers className="size-3.5" />
                    <span>Fund Breakdown ({selectedFundHistory.length})</span>
                  </TabsTrigger>
                </TabsList>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real AMFI Historical NAV</span>
                </div>
              </div>

              {/* Tab 1: Wealth Compounding Dual Area Chart */}
              <TabsContent value="growth" className="p-4 sm:p-5 m-0 focus-visible:outline-hidden">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    Portfolio Wealth Accumulation & Compounding Curve
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Visualizes your cumulative invested principal against total market valuation over {timeframe}.
                  </p>
                </div>
                <SipWealthGrowthChart data={combinedReturns as unknown as WealthGrowthPoint[]} />
              </TabsContent>

              {/* Tab 2: Scheme Performance Comparison */}
              <TabsContent value="compare" className="p-4 sm:p-5 m-0 focus-visible:outline-hidden">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    Multi-Scheme Performance Benchmarking
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Unstacked relative growth rates starting at day 1 to compare scheme outperformance.
                  </p>
                </div>
                <SipComparativeChart
                  funds={selectedFundHistory}
                  combinedData={combinedReturns as unknown as Record<string, string | number>[]}
                />
              </TabsContent>

              {/* Tab 3: Asset & Capital Allocation Donut */}
              <TabsContent value="allocation" className="p-4 sm:p-5 m-0 focus-visible:outline-hidden">
                <div className="mb-3">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    Capital Distribution & Asset Weighting
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Breakdown of monthly SIP contributions and total value split across selected funds.
                  </p>
                </div>
                <SipAllocationDonut funds={selectedFundHistory} />
              </TabsContent>

              {/* Tab 4: Individual Fund Cards */}
              <TabsContent value="schemes" className="p-4 sm:p-5 m-0 focus-visible:outline-hidden space-y-3">
                <div className="mb-2">
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    Individual Scheme Performance Summaries
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Detailed XIRR, accumulated units, wealth multiplier, and NAV metrics for each selected scheme.
                  </p>
                </div>
                {selectedFundHistory.map((fund) => (
                  <ReturnsCard key={fund.schemeCode} returns={fund} />
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </>
      ) : (
        /* Modern Empty / Ready State Card */
        <Card className="overflow-hidden border border-dashed border-border/80 bg-card/60 backdrop-blur-md p-6 sm:p-8 text-center">
          <CardContent className="p-0 flex flex-col items-center max-w-md mx-auto space-y-4">
            <div className="size-14 rounded-2xl bg-gradient-to-tr from-primary/15 via-indigo-500/10 to-emerald-500/15 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <TrendingUp className="size-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground tracking-tight">
                Historical SIP Wealth & Compounding Analytics
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Select mutual fund schemes, configure your monthly SIP amount, and click{" "}
                <span className="font-semibold text-foreground">Calculate</span> to simulate real historical AMFI NAV returns.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30 text-left text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Sparkles className="size-3.5 text-primary" />
                  Newton-Raphson XIRR
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Exact annualized returns across market cycles
                </p>
              </div>

              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30 text-left text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  Compounding Spread
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Invested capital vs. compounding profit zones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default FundReturns