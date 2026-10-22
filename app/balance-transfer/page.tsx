import { Suspense } from "react"
import { Metadata } from "next"
import { ArrowRightLeft } from "lucide-react"
import { BalanceTransferCalculator } from "@/components/user/balance-transfer/balanceTransferCalculator"
import CommentSection from "@/components/user/comments/commentSection"
import Loading from "@/components/loading"

export const metadata: Metadata = {
  title: "Home Loan Balance Transfer & Refinance ROI Calculator | MfolioCal",
  description:
    "Should you switch your Home Loan to another bank for a lower interest rate? Calculate exact net interest savings, switching friction fees (processing fee, MODT, legal), and break-even recovery timeline.",
  keywords: [
    "home loan balance transfer calculator",
    "mortgage refinance calculator india",
    "home loan switch roi",
    "balance transfer break even calculator",
    "home loan interest rate reduction",
    "mfoliocal balance transfer",
  ],
  openGraph: {
    title: "Home Loan Balance Transfer & Refinance ROI Calculator | MfolioCal",
    description:
      "Audit your potential savings before switching banks. Compare Lower Monthly EMI vs Slashed Loan Tenure with processing fee recovery.",
    type: "website",
  },
}

export default function BalanceTransferPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MfolioCal Home Loan Balance Transfer & Refinance Calculator",
    "url": "https://mfoliocal.com/balance-transfer",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "description":
      "Financial audit engine evaluating switching fees, break-even period, and net interest savings for mortgage balance transfers.",
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
            <ArrowRightLeft className="size-3.5" />
            <span>Mortgage Debt Optimization</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            NEW
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Home Loan Balance Transfer & Refinance Calculator
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Evaluate whether switching your home loan to a competitor bank offering a lower interest rate is financially prudent. Deduct all processing, MODT stamp duty, and legal fees to determine your true break-even month and lifetime net savings.
        </p>
      </div>

      {/* Main Interactive Balance Transfer Workspace */}
      <Suspense fallback={<Loading />}>
        <BalanceTransferCalculator />
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
