'use server'

import { SchemeHistory } from "@/models/schemeHistory";
import { getReturnsForSipByFunds } from "../utils/processNav";
import { Schemes } from "@/models/scheme";
import { console } from "inspector";
import { SchemeLatest } from "@/models/SchemeLatest";

export const getSelectedFundsDataLatest = async (schemeCodes: number[]) => {
    try {
        const schemeDataArray: SchemeLatest[] = await Promise.all(
            schemeCodes.map(async (schemeCode) => {
                const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}/latest`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for scheme code: ${schemeCode}`);
                }
                return response.json();
            })
        );
        return schemeDataArray;
    } catch (error) {
        console.error('Error fetching scheme data:', error);
    }
}

export const getSelectedFundsDataHistory = async (selectedScheme: SchemeLatest[], startDate: string, endDate: string) => {
    try {
        const schemeDataArray: SchemeHistory[] = await Promise.all(
            selectedScheme.map(async (scheme) => {
                const response = await fetch(`https://api.mfapi.in/mf/${scheme.meta.scheme_code}?startDate=${startDate}&endDate=${endDate}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data for scheme code: ${scheme.meta.scheme_code}`);
                }
                let res: SchemeHistory = await response.json();
                res.meta.sipAmount = scheme.sipAmount || 0;
                return res;
            })
        );
        const returns = await getReturnsForSipByFunds(schemeDataArray);
        
        return returns;
    } catch (error) {
        return [];
    }
}

export const searchByFundName = async (fundName: string) => {
    const result = await fetch(`https://api.mfapi.in/mf/search?q=${fundName}`);
    const data: Schemes[] = await result.json();
    return data;
}

export const getMutualAllFunds = async (offset: number, limit: number) => {

    if (offset < 0) {
        offset = 0;
    }
    const result = await fetch(`https://api.mfapi.in/mf?offset=${offset}&limit=${limit}`);

    const data: Schemes[] = await result.json();
    return data;
}