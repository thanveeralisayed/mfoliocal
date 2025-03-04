import { Schemes } from '@/models/scheme'
import React from 'react'
import { DataTable } from './data-table'
import { columns } from './columns'
import SearchFundsInput from './searchInput'

type tableProps = {
  schemes: Schemes[]
  offset: number
}

const FundsTable = (props: tableProps) => {

  

  return (
    <div>
      <div className="mb-4  rounded-md">
        <SearchFundsInput />
      </div>
      <DataTable
        offset={props.offset}
        columns={columns}
        data={props.schemes}
      />
    </div>
  )
}

export default FundsTable