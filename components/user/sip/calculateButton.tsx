"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { useQueryState } from 'nuqs';



const CalculateButton: React.FC = () => {
  const [, setHistoryGet] = useQueryState('getselectedfundshistory',{shallow:false,scroll:false});

  const handleCalculate = async () => {
    setHistoryGet('true');
  };

  return (
    <Button onClick={handleCalculate}>
      Calculate
    </Button>
  );
};

export default CalculateButton;