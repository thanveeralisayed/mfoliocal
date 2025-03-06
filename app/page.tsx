
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
    <div className="container mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 flex flex-col space-y-4">
          <Suspense fallback={<Loading/>}>
            <FundsTable params={params} />
          </Suspense>
          <div className="block md:hidden">
            <Suspense key={params.schemeCode}  fallback={<Loading/>}>
              <SipCard searchParams={params} />
            </Suspense>
            <Suspense key={params.getselectedfundshistory || params.timeframe}  fallback={<Loading/>}>
              <AllReturns params={params} />
            </Suspense>
          </div>
          <Suspense key={params.getselectedfundshistory || params.timeframe} fallback={<Loading/>}>
            <FundReturns searchParams={params} />
          </Suspense>
        </div>
        <div className="col-span-1 hidden md:block">
          <div className="h-full p-4">
            <Suspense key={params.schemeCode} fallback={<Loading/>}>
              <SipCard key={params.schemeCode} searchParams={params} />
            </Suspense>
            <Suspense key={params.getselectedfundshistory || params.timeframe}  fallback={<Loading/>}>
              <AllReturns params={params} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <a href="https://www.linkedin.com/in/thanveer-ali-98041a1a3/" target="_blank" rel="noopener noreferrer" className="btn">
          Connect with me on LinkedIn
        </a>
      </div>
    </div>
  );
}