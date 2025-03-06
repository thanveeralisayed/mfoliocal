'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

type YearButtonProps = {
    label: string;
    value: string;
};

const YearButton: React.FC<YearButtonProps> = ({ label, value }) => {
    const searchParams = useSearchParams();
    const params = new URLSearchParams(searchParams);
    const pathname = usePathname();
    const { replace } = useRouter();
    const timeframe = searchParams.get('timeframe');

    const handleClick =  () => {
        params.set('timeframe', value);
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return (
        <Button className='mt-1.5' onClick={handleClick} variant={timeframe === value ? 'secondary' : 'outline'}>
            {label}
        </Button>
    );
};

export default YearButton;
