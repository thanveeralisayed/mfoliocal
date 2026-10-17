import { Metadata } from "next"
import { Home as HomeIcon } from "lucide-react"
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
      <div className="mb-8">
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
