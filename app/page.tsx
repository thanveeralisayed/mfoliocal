import FundsTable from "@/components/user/funds/fundsTable";
import FundReturns from "@/components/user/returns/returns";
import SipCard from "@/components/user/sip/sipCard";
import { Schemes } from "@/models/scheme";
import { SearchParams } from "@/models/searchParams";
import { getMutualAllFunds, searchByFundName } from "@/server/action";

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  let offset = params?.offset || "0";
  const searchString = params?.search || "";
  const schemes: Schemes[] = [];

  if (searchString !== "") {
    const res = await searchByFundName(searchString);
    const startIndex = parseInt(offset);
    const endIndex = Math.min(startIndex + 5, res.length);
    if (startIndex < endIndex) {
      schemes.push(...res.slice(startIndex, endIndex));
    } else {
      offset = `${parseInt(offset) - 5}`;
      schemes.push(...res.slice(startIndex - 5, endIndex));
    }
  } else {
    const res = await getMutualAllFunds(parseInt(offset), 5);
    schemes.push(...res);
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 flex flex-col space-y-4">
          <FundsTable offset={parseInt(offset)} schemes={schemes} />
          <FundReturns searchParams={params} />
        </div>
        <div className="col-span-1">
          <div className="h-full p-4">
            <SipCard searchParams={params} />
          </div>
        </div>
      </div>
    </div>
  );
}