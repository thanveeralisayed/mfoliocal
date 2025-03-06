"use client"

import React from 'react';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SipAmountInputProps = {
  schemeCode: number;
};

const SipAmountInput: React.FC<SipAmountInputProps> = ({ schemeCode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    params.set(schemeCode.toString(), e.target.value);
    params.set('getselectedfundshistory', 'false'); 
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); 
  }

  return (
    <Input
      id={`sip-amount-${schemeCode}`}
      type="number"
      defaultValue={searchParams.get(`${schemeCode}`)?.toString() || ''}
      onChange={handleChange}
    />
  );
};

export default SipAmountInput;