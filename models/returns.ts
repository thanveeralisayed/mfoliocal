import { SchemeHistory } from "./schemeHistory";

export type Returns = {
    schemeName: string;
    schemeCode: number;
    totalInvested: number;
    total: number;
    totalUnits: number;
    returns: number;
    schemeHistory: SchemeHistory;
    xirr?: number;
    growthPercentage?: number;
    wealthMultiplier?: number;
    timeline?: Array<{
        date: string;
        invested: number;
        value: number;
        gain: number;
        gainPercent: number;
        nav: number;
    }>;
}