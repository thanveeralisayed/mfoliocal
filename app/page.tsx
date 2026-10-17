
import CommentSection from "@/components/user/comments/commentSection";
import Loading from "@/components/loading";
import FundsTable from "@/components/user/funds/fundsTable";
import AllReturns from "@/components/user/returns/allReturns";
import FundReturns from "@/components/user/returns/returns";
import SipCard from "@/components/user/sip/sipCard";
import { SearchParams } from "@/models/searchParams";
import { Suspense } from "react";


export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  return (
    <div className="container mx-auto px-4 mt-8 space-y-6">
      {/* Top Section: Fund Selection & SIP Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fund Discovery & Selection */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <Suspense fallback={<Loading />}>
            <FundsTable params={params} />
          </Suspense>
        </div>

        {/* Right Column: SIP Parameters & Scheme Management */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <Suspense key={params.schemeCode} fallback={<Loading />}>
            <SipCard searchParams={params} />
          </Suspense>
          <Suspense key={params.getselectedfundshistory || params.timeframe} fallback={<Loading />}>
            <AllReturns params={params} />
          </Suspense>
        </div>
      </div>

      {/* Comprehensive Wealth Analytics & Recharts Visualizer Suite */}
      <div className="w-full pt-2">
        <Suspense key={params.getselectedfundshistory || params.timeframe} fallback={<Loading />}>
          <FundReturns searchParams={params} />
        </Suspense>
      </div>

      {/* Community Feedback & Comment Section */}
      <CommentSection />

      <div className="mt-8 mb-12 text-center">
        <a href="https://www.linkedin.com/in/thanveer-ali-98041a1a3/" target="_blank" rel="noopener noreferrer" className="btn">
          Connect with me on LinkedIn
        </a>
      </div>
    </div>
  );
}