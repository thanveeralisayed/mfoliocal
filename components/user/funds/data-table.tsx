"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePathname, useSearchParams, useRouter } from 'next/navigation'


import { Button } from "@/components/ui/button"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  offset: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  offset
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const onNextPage = () => {
    offset = offset + 5
    const params = new URLSearchParams(searchParams);
    params.set('offset', offset.toString());
    replace(`${pathname}?${params.toString()}`);
  }

  const onPreviousPage = () => {
    offset = offset - 5
    const params = new URLSearchParams(searchParams);

    if (offset >= 0) {
      params.set('offset', offset.toString());
    } else {
      params.delete('offset');
    }
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="rounded-md border h-96">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {data.length > 0 && (
        <div className="flex justify-between p-4">
          <Button
            onClick={onPreviousPage}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}