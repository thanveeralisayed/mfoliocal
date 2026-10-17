import { Suspense } from "react"
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