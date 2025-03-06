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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    params.set(schemeCode.toString(), value);
    params.set('getselectedfundshistory', 'false'); // Set getselectedfundshistory to false
    router.replace(`${pathname}?${params.toString()}`);
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