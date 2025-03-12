'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';

type RemoveSchemeButtonProps = {
  schemeCode: number;
};

const RemoveSchemeButton: React.FC<RemoveSchemeButtonProps> = ({ schemeCode }) => {
  const [existingSchemes, setExistingSchemeCodes] = useQueryState('schemeCode', { shallow: false })
  const [, setAmount] = useQueryState(`${schemeCode}`)
  const [, setHistoryGet] = useQueryState('getselectedfundshistory');
  const [, setTimeframe] = useQueryState('timeframe');

  const handleRemoveScheme = () => {

    const existingSchemeCodes = existingSchemes?.split(',').filter(code => code.length > 0);
    const schemeCodeIndex = existingSchemeCodes?.indexOf(schemeCode.toString());

    if (schemeCodeIndex !== undefined && schemeCodeIndex !== -1) {
      existingSchemeCodes?.splice(schemeCodeIndex, 1);
    }

    setExistingSchemeCodes(existingSchemeCodes?.join(',') || null)
    setHistoryGet('false')
    setAmount(null)
    setTimeframe(null);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleRemoveScheme}>
      <XIcon className="w-4 h-4" />
    </Button>
  );
};

export default RemoveSchemeButton;