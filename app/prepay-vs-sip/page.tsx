import { Suspense } from "react"
import { Metadata } from "next"
import { Scale } from "lucide-react"
import { ArbitrageCalculator } from "@/components/user/arbitrage/arbitrageCalculator"
import CommentSection from "@/components/user/comments/commentSection"
import Loading from "@/components/loading"

export const metadata: Metadata = {
  title: "Home Loan Prepayment vs. Equity SIP Calculator | MfolioCal Arbitrage",
  description:
    "Should you prepay your Home Loan or invest surplus cash in an Equity Mutual Fund SIP? Run a full mathematical arbitrage simulation comparing guaranteed interest saved vs equity compounding wealth with tax impact.",
  keywords: [
    "home loan prepayment vs sip calculator",
    "prepay home loan or invest in mutual funds",
    "home loan arbitrage calculator",
    "extra emi vs sip",
    "home loan interest savings vs equity returns",
    "mfoliocal arbitrage",
  ],
  openGraph: {
    title: "Home Loan Prepay vs. Equity SIP Arbitrage Calculator | MfolioCal",
    description:
      "Simulate whether prepaying your 8.5% mortgage or investing surplus cash into an Equity SIP creates more wealth over 15-20 years. Free financial comparison engine.",
    type: "website",
  },
}

export default function PrepayVsSipPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MfolioCal Home Loan Prepayment vs Equity SIP Arbitrage Calculator",
    "url": "https://mfoliocal.com/prepay-vs-sip",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "description":
      "Interactive financial simulation engine comparing mortgage prepayment with equity mutual fund SIP compounding.",
  }

  return (
    <div className="container mx-auto px-4 mt-6 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Page Hero Header */}
      <div className="mb-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Scale className="size-3.5" />
            <span>Financial Arbitrage Engine</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            NEW
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Home Loan Prepay vs. Equity SIP
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          The ultimate personal finance dilemma solved with pure mathematics. Discover whether deploying your surplus cash into loan prepayment or an equity mutual fund SIP maximizes your net wealth.
        </p>
      </div>

      {/* Main Interactive Arbitrage Workspace */}
      <Suspense fallback={<Loading />}>
        <ArbitrageCalculator />
      </Suspense>

      {/* Community Comments & Discussion Section */}
      <div className="mt-12">
        <CommentSection />
      </div>

      {/* Connect Footer */}
      <div className="mt-8 mb-12 text-center">
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
