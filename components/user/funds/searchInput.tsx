'use client'
import { Input } from '@/components/ui/input'
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import React from 'react'
import { useDebouncedCallback } from 'use-debounce';



const SearchFundsInput = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();


    const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        const params = new URLSearchParams(searchParams);
        params.set('search', search);
        params.set('offset', "0");
        replace(`${pathname}?${params.toString()}`);
    }, 300)


    return (
        <Input defaultValue={searchParams.get('search')?.toString()} type="text" onChange={handleSearch} className='py-5' placeholder="Search schemes" />
    )
}

export default SearchFundsInput