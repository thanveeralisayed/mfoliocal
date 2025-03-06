'use client'
import React from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type RemoveSchemeButtonProps = {
  schemeCode: number;
};

const RemoveSchemeButton: React.FC<RemoveSchemeButtonProps> = ({ schemeCode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleRemoveScheme = () => {
    const params = new URLSearchParams(searchParams);
    const existingSchemeCodes = (params.get('schemeCode') || '').split(',').filter(code => code.length > 0);
    const schemeCodeIndex = existingSchemeCodes.indexOf(schemeCode.toString());

    if (schemeCodeIndex !== -1) {
      existingSchemeCodes.splice(schemeCodeIndex, 1);
    }

    params.set('schemeCode', existingSchemeCodes.join(','));
    params.set('getselectedfundshistory', 'false'); // Set getselectedfundshistory to false
    params.delete(schemeCode.toString()); 
    params.delete('timeframe');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); 
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleRemoveScheme}>
      <XIcon className="w-4 h-4" />
    </Button>
  );
};

export default RemoveSchemeButton;