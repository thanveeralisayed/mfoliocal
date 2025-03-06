import { Schemes } from '@/models/scheme'
import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import SearchFundsInput from './searchInput'
import { SearchParams } from '@/models/searchParams'
import { searchByFundName } from '@/server/action'

type tableProps = {
  params:SearchParams
}

const FundsTable = async ({params}: tableProps) => {

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
  

  return (
    <div>
      <div className="mb-4  rounded-md">
        <SearchFundsInput />
      </div>
      <DataTable
        offset={parseInt(offset)}
        columns={columns}
        data={schemes}
      />
    </div>
  )
}

export default FundsTable