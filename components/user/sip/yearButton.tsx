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
    const pathname = usePathname();
    const { replace } = useRouter();
    const timeframe = searchParams.get('timeframe');

    const handleClick = () => {
        const params = new URLSearchParams(searchParams);
        params.set('timeframe', value);
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Button onClick={handleClick} variant={timeframe === value ? 'secondary' : 'outline'}>
            {label}
        </Button>
    );
};

export default YearButton;
