import { Metadata } from "next"
import Link from "next/link"
import { Home as HomeIcon, Scale, ArrowRight, ArrowRightLeft } from "lucide-react"
import { LoanCalculator } from "@/components/user/loan/loanCalculator"
import CommentSection from "@/components/user/comments/commentSection"

export const metadata: Metadata = {
  title: "Home Loan EMI Calculator | MfolioCal",
  description:
    "Calculate your monthly Home Loan EMI, total interest payable, and explore year-by-year amortization schedules with interactive sliders.",
}

export default function HomeLoanPage() {
  return (
    <div className="container mx-auto px-4 mt-6 max-w-7xl">
      {/* Page Hero Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <HomeIcon className="size-3.5" />
            <span>Mortgage & Real Estate</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Home Loan EMI Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Estimate your monthly installments, total interest cost, and visualize your year-by-year principal payoff schedule.
        </p>

        {/* Cross Promotion Callouts */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <Link
            href="/balance-transfer"
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 transition-all text-xs font-semibold text-foreground shadow-2xs"
          >
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
              <ArrowRightLeft className="size-3.5" />
              <span>Paying high interest?</span>
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              Calculate Balance Transfer ROI & Break-Even
            </span>
            <ArrowRight className="size-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/prepay-vs-sip"
            className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/10 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-xs font-semibold text-foreground shadow-2xs"
          >
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <Scale className="size-3.5" />
              <span>Extra monthly savings?</span>
            </span>
            <span className="text-muted-foreground hidden sm:inline">
              Compare Prepaying this Loan vs. Equity SIP Arbitrage
            </span>
            <ArrowRight className="size-3.5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Main Interactive Loan Calculator */}
      <LoanCalculator />

      {/* Community Feedback & Comment Section */}
      <CommentSection />

      {/* Footer LinkedIn */}
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
