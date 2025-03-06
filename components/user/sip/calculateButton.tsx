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

  const handleCalculate = async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(100);
    const params = new URLSearchParams(searchParams);
    params.set('getselectedfundshistory', 'true');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); 

  };

  return (
    <Button onClick={handleCalculate}>
      Calculate
    </Button>
  );
};

export default CalculateButton;