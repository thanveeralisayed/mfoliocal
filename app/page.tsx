import FundsTable from "@/components/user/funds/fundsTable";
import FundReturns from "@/components/user/returns/returns";
import ReturnsCard from "@/components/user/sip/returnsCard";
import SipCard from "@/components/user/sip/sipCard";
import { Returns } from "@/models/returns";
import { Schemes } from "@/models/scheme";
import { SchemeLatest } from "@/models/SchemeLatest";
import { SearchParams } from "@/models/searchParams";
import { getMutualAllFunds, getSelectedFundsDataHistory, getSelectedFundsDataLatest, searchByFundName } from "@/server/action";

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  let offset = params?.offset || "0";
  const searchString = `${params?.search || ''} direct growth` || "";
  const schemes: Schemes[] = [];
  if (searchString !== "") {
    console.log(searchString)
    const res = await searchByFundName(searchString);
    const startIndex = parseInt(offset);
    const endIndex = Math.min(startIndex + 5, res.length);
    if (startIndex < endIndex) {
      schemes.push(...res.slice(startIndex, endIndex));
    } else {
      offset = `${parseInt(offset) - 5}`;
      schemes.push(...res.slice(startIndex - 5, endIndex));
    }
  }
  let selectedFundHistory: Returns[] = [];
  const timeframe = params.timeframe || "3Y";
  const existingSchemeCodes = params.schemeCode?.split(',').filter(code => code.trim() !== '').map(code => parseInt(code, 10)) || [];
  if (params.getselectedfundshistory === 'true' && existingSchemeCodes.length > 0) {
    const funds: SchemeLatest[] = await getSelectedFundsDataLatest(existingSchemeCodes) || [];
    funds.forEach(fund => {
      const sipAmount: string = (params as Record<string, string>)[`${fund.meta.scheme_code}`];
      if (sipAmount) {
        fund.sipAmount = parseFloat(sipAmount);
      }
    });
    selectedFundHistory = await getSelectedFundsDataHistory(funds, timeframe);
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 flex flex-col space-y-4">
          <FundsTable offset={parseInt(offset)} schemes={schemes} />
          <div className="block md:hidden">
            <SipCard searchParams={params} />
            {selectedFundHistory?.map(fund=>(
                <ReturnsCard returns={fund} key={`${fund.schemeCode}-ret`} />
              ))}
          </div>
          <FundReturns searchParams={params} />
        </div>
        <div className="col-span-1 hidden md:block">
          <div className="h-full p-4">
            <SipCard searchParams={params} />
              {selectedFundHistory?.map(fund=>(
                <ReturnsCard returns={fund} key={`${fund.schemeCode}-ret`} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}