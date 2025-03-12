'use client'
import { Input } from '@/components/ui/input'
import { useQueryState } from 'nuqs';
import React from 'react'
import { useDebouncedCallback } from 'use-debounce';



const SearchFundsInput = () => {
    const [search, setSearch] = useQueryState('search', { shallow: false, scroll: false })
    const [, setOffset] = useQueryState('offset', { shallow: false, scroll: false })


    const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const search = e.target.value;
        setSearch(search)
        setOffset('0');
    }, 100)


    return (
        <Input defaultValue={search||''} type="text" onChange={handleSearch} className='py-5' placeholder="Search schemes" />
    )
}

export default SearchFundsInput