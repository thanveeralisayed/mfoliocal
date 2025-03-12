"use client"

import React from 'react';
import { Input } from '@/components/ui/input';
import { useQueryState } from 'nuqs'

type SipAmountInputProps = {
  schemeCode: number;
};

const SipAmountInput: React.FC<SipAmountInputProps> = ({ schemeCode }) => {
  const [amount, setAmount] = useQueryState(`${schemeCode}`)
  const [, setHistoryGet] = useQueryState('getselectedfundshistory');




  return (
    <Input
      id={`sip-amount-${schemeCode}`}
      type="number"
      defaultValue={amount || ''}
      onChange={e => {
        setAmount(e.target.value)
        setHistoryGet('false')
      }}
    />
  );
};

export default SipAmountInput;