"use client"

import { Button } from "@/components/ui/button"
import { Schemes } from "@/models/scheme"
import { ColumnDef, Row } from "@tanstack/react-table"
import { CirclePlus, CircleMinus } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

interface AddFundButtonProps {
  row: Row<Schemes>;
}

const AddFundButton: React.FC<AddFundButtonProps> = ({ row }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleAddFund = () => {
    const schemeCode = row.original.schemeCode;
    if (schemeCode !== undefined) {
      const params = new URLSearchParams(searchParams);
      const existingSchemeCodes = params.get('schemeCode')?.split(',') || [];
      const schemeCodeIndex = existingSchemeCodes.indexOf(schemeCode.toString());

      if (schemeCodeIndex === -1) {
        // Add schemeCode if it doesn't exist
        existingSchemeCodes.push(schemeCode.toString());
      } else {
        // Remove schemeCode if it already exists
        existingSchemeCodes.splice(schemeCodeIndex, 1);
      }
      params.set('getselectedfundshistory', 'false'); // Set getselectedfundshistory to false
      params.set('schemeCode', existingSchemeCodes.join(','));
      params.set('timeframe', '3Y');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false }); 
    }
  };

  const schemeCode = row.original.schemeCode;
  const existingSchemeCodes = searchParams.get('schemeCode')?.split(',') || [];
  const isSelected = schemeCode !== undefined ? existingSchemeCodes.includes(schemeCode?.toString()) : false;

  return (
    <Button onClick={handleAddFund} variant="outline" >
      {
        isSelected ? (
          <CircleMinus className="w-4 h-4 text-red-500" />
        ) : (
          <CirclePlus className="w-4 h-4 text-green-500" />
        )
      }
    </Button >
  );
};

export const columns: ColumnDef<Schemes>[] = [
  {
    id: 'addFund',
    cell: ({ row }) => <AddFundButton row={row} />,
  },
  {
    accessorKey: "schemeName",
    header: "Scheme Name",
  },
];