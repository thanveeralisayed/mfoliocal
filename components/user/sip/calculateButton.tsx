"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SchemeLatest } from '@/models/SchemeLatest';

type CalculateButtonProps = {
  funds: SchemeLatest[];
};

const CalculateButton: React.FC<CalculateButtonProps> = ({ funds }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleCalculate = () => {
    funds.forEach(fund => {
      const sipAmount = searchParams.get(fund.meta.scheme_code.toString());
      if (sipAmount) {
        fund.sipAmount = parseFloat(sipAmount);
      }
    });

    const params = new URLSearchParams(searchParams);
    params.set('getselectedfundshistory', 'true');
    router.replace(`${pathname}?${params.toString()}`);

  };

  return (
    <Button onClick={handleCalculate}>
      Calculate
    </Button>
  );
};

export default CalculateButton;