import { Suspense } from "react"
import { Metadata } from "next"
import { Target } from "lucide-react"
import { GoalPlanner } from "@/components/user/goal/goalPlanner"
import CommentSection from "@/components/user/comments/commentSection"
import Loading from "@/components/loading"

export const metadata: Metadata = {
  title: "Goal-Based Reverse SIP Calculator | MfolioCal Financial Planner",
  description:
    "Reverse engineer your dream financial goals into exact monthly SIP contributions. Factors in inflation, annual step-up top-ups, and recommends tenure-based equity-debt asset allocation.",
  keywords: [
    "goal based sip calculator",
    "reverse sip calculator",
    "target wealth calculator",
    "child education sip planner",
    "retirement fire sip calculator",
    "inflation adjusted sip calculator",
    "mfoliocal goal planner",
  ],
  openGraph: {
    title: "Goal-Based Reverse SIP Calculator | MfolioCal",
    description:
      "Plan your child education, house down payment, or retirement with exact monthly SIP requirements, inflation adjustment, and optimal asset allocation.",
    type: "website",
  },
}

export default function GoalPlannerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MfolioCal Goal-Based Reverse SIP Planner",
    "url": "https://mfoliocal.com/goal-planner",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "description":
      "Reverse SIP financial planning engine calculating required monthly investment and asset allocation for future goals with inflation adjustment.",
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
            <Target className="size-3.5" />
            <span>Target Wealth Engineering</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
            NEW
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Goal-Based Reverse SIP Planner
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
          Start from your target milestone—whether it&apos;s your child&apos;s foreign MBA, a house down payment, or early retirement. Calculate the exact monthly SIP required today, adjusted for real inflation and annual salary step-ups.
        </p>
      </div>

      {/* Main Interactive Goal Workspace */}
      <Suspense fallback={<Loading />}>
        <GoalPlanner />
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
