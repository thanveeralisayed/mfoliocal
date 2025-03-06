'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

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

    const handleClick = useDebouncedCallback( () => {
        params.set('timeframe', value);
        params.set('getselectedfundshistory', 'false');
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    },0)

    return (
        <Button onClick={handleClick} variant={timeframe === value ? 'secondary' : 'outline'}>
            {label}
        </Button>
    );
};

export default YearButton;
