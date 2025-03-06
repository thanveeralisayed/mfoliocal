import { Returns } from '@/models/returns'
import { SchemeLatest } from '@/models/SchemeLatest'
import { SearchParams } from '@/models/searchParams'
import { getSelectedFundsDataHistory, getSelectedFundsDataLatest } from '@/server/action'
import React from 'react'
import ReturnsCard from '../sip/returnsCard'

type AllReturnProps = {
    params: SearchParams
}


const AllReturns = async ({params}: AllReturnProps) => {
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
        <div>{selectedFundHistory?.map(fund=>(
            <ReturnsCard returns={fund} key={`${fund.schemeCode}-ret`} />
          ))}</div>
    )
}

export default AllReturns