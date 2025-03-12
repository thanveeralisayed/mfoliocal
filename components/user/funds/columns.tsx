"use client"

import { Button } from "@/components/ui/button"
import { Schemes } from "@/models/scheme"
import { ColumnDef, Row } from "@tanstack/react-table"
import { CirclePlus, CircleMinus } from "lucide-react"
import { useQueryState } from "nuqs"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

interface AddFundButtonProps {
  row: Row<Schemes>;
}

const AddFundButton: React.FC<AddFundButtonProps> = ({ row }) => {
  const [existingSchemes, setExistingSchemeCodes] = useQueryState('schemeCode', { shallow: false, scroll: false })
  const [, setHistoryGet] = useQueryState('getselectedfundshistory');
  const [, setTimeframe] = useQueryState('timeframe');



  const handleAddFund = () => {
    const schemeCode = row.original.schemeCode;
    if (schemeCode !== undefined) {
      const existingSchemeCodes = existingSchemes?.split(',') || [];
      const schemeCodeIndex = existingSchemeCodes.indexOf(schemeCode.toString());

      if (schemeCodeIndex === -1) {
        existingSchemeCodes.push(schemeCode.toString());
      } else {
        existingSchemeCodes.splice(schemeCodeIndex, 1);
      }
      setHistoryGet('false');
      setExistingSchemeCodes(existingSchemeCodes.join(','));

      setTimeframe('3Y')
    }
  };

  const schemeCode = row.original.schemeCode;
  const isSelected = schemeCode !== undefined ? existingSchemes?.includes(schemeCode?.toString()) : false;

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