'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useQueryState } from 'nuqs'

type YearButtonProps = {
    label: string;
    value: string;
};

const YearButton: React.FC<YearButtonProps> = ({ label, value }) => {
    const [timeframe, setTimeframe] = useQueryState('timeframe', { shallow: false });



    return (
        <Button className='mt-1.5' onClick={() => {
            setTimeframe(value)
        }} variant={timeframe === value ? 'secondary' : 'outline'}>
            {label}
        </Button>
    );
};

export default YearButton;
