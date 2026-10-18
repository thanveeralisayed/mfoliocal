import { Suspense } from "react"
import Link from "next/link"
import { Scale, ArrowRight } from "lucide-react"
import { SearchParams } from "@/models/searchParams"
import CommentSection from "@/components/user/comments/commentSection"
import Loading from "@/components/loading"
import { InteractiveFundSearch } from "@/components/user/funds/interactiveFundSearch"
import SipCard from "@/components/user/sip/sipCard"
import FundReturns from "@/components/user/returns/returns"

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
      {/* Hero Header & Interactive Search Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          SIP Calculator
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Search any Indian mutual fund scheme to simulate real historical compounding,
          XIRR, and multi-fund outperformance.
        </p>

        {/* Global Interactive Search Bar with Dropdown */}
        <div className="pt-2">
          <InteractiveFundSearch />
        </div>

        {/* Cross-feature banner: Prepay vs SIP */}
        <div className="pt-1">
          <Link
            href="/prepay-vs-sip"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted/90 border border-border/70 transition-all text-xs font-medium text-muted-foreground hover:text-foreground shadow-2xs"
          >
            <Scale className="size-3.5 text-emerald-500" />
            <span>Have a Home Loan?</span>
            <span className="font-semibold text-foreground">Compare Prepayment vs. Equity SIP</span>
            <ArrowRight className="size-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Selected Schemes & SIP Parameter Configuration */}
      <div className="max-w-3xl mx-auto w-full">
        <Suspense key={params.schemeCode} fallback={<Loading />}>
          <SipCard searchParams={params} />
        </Suspense>
      </div>

      {/* Comprehensive Wealth Analytics & Recharts Visualizer Suite */}
      <div className="w-full">
        <Suspense key={`${params.getselectedfundshistory}-${params.timeframe}`} fallback={<Loading />}>
          <FundReturns searchParams={params} />
        </Suspense>
      </div>

      {/* Community Feedback & Comment Section */}
      <div className="pt-4">
        <CommentSection />
      </div>

      {/* Footer / Connect */}
      <div className="pt-4 pb-12 text-center">
        <a
          href="https://www.linkedin.com/in/thanveer-ali-98041a1a3/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          Connect with me on LinkedIn
        </a>
      </div>
    </div>
  )
}