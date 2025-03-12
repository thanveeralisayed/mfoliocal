'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useQueryState } from 'nuqs'
import { useRouter, useSearchParams } from "next/navigation";

type YearButtonProps = {
    label: string;
    value: string;
};

const YearButton: React.FC<YearButtonProps> = ({ label, value }) => {
    const [timeframe,setTimeframe] = useQueryState('timeframe');
    const [, setHistoryGet] = useQueryState('getselectedfundshistory');
    const router = useRouter();
    const searchParams = useSearchParams();
  
    useEffect(() => {
      router.refresh(); 
    }, [searchParams, router]);
  

    return (
        <Button className='mt-1.5' onClick={()=>{
            setTimeframe(value)
            setHistoryGet('false')
            }} variant={timeframe === value ? 'secondary' : 'outline'}>
            {label}
        </Button>
    );
};

export default YearButton;
