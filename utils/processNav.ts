'use server'

import { Returns } from "@/models/returns";
import { ReturnsHistory } from "@/models/returnsHistory";
import { SchemeHistory } from "@/models/schemeHistory"
import { calculateAccurateSIP, parseDateString } from "./sipMath";

export const getReturnsForSipByFunds = async (
    schemeData: SchemeHistory[],
    options?: { stepUpPercent?: number; frequency?: "monthly" | "weekly" }
): Promise<Returns[]> => {
    const returns: Returns[] = schemeData.map((scheme) => {
        const schemeName = scheme.meta.scheme_name;
        const schemeCode = scheme.meta.scheme_code;
        const schemeHistory = scheme;
        const sipAmount = scheme.meta.sipAmount || 0;

        // Keep full daily timeline points for precise multi-fund alignment
        const result = calculateAccurateSIP(scheme.data, sipAmount, {
            frequency: options?.frequency || "monthly",
            stepUpPercent: options?.stepUpPercent || 0,
            targetPoints: 9999,
        });

        // Also update scheme.data with returns for legacy compatibility
        if (result.timeline && result.timeline.length > 0) {
            scheme.data = result.timeline.map(t => ({
                date: t.date,
                nav: t.nav,
                returns: t.value,
            }));
        }

        return {
            returns: result.absoluteGain,
            schemeCode,
            schemeHistory,
            schemeName,
            total: result.currentValue,
            totalInvested: result.totalInvested,
            totalUnits: result.totalUnits,
            xirr: result.xirr,
            growthPercentage: result.growthPercentage,
            wealthMultiplier: result.wealthMultiplier,
            timeline: result.timeline,
        };
    });
    return returns;
}

export const processReturns = async (returnsData: Returns[]) => {
    if (!returnsData || returnsData.length === 0) return [];

    // Step 1: Collect union of all trading dates across all selected funds
    const dateTimestampMap = new Map<string, number>();
    returnsData.forEach((scheme) => {
        const timeline = scheme.timeline || [];
        timeline.forEach((pt) => {
            if (!dateTimestampMap.has(pt.date)) {
                dateTimestampMap.set(pt.date, parseDateString(pt.date).getTime());
            }
        });
    });

    const sortedDates = Array.from(dateTimestampMap.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([date, time]) => ({ date, time }));

    if (sortedDates.length === 0) return [];

    // Step 2: Sample ~80 evenly distributed dates across the timeline (always preserving start and latest)
    const targetPoints = 80;
    const sampledDates: typeof sortedDates = [];
    if (sortedDates.length <= targetPoints) {
        sampledDates.push(...sortedDates);
    } else {
        const step = Math.max(1, Math.floor(sortedDates.length / targetPoints));
        for (let i = 0; i < sortedDates.length; i += step) {
            sampledDates.push(sortedDates[i]);
        }
        if (sampledDates[sampledDates.length - 1].date !== sortedDates[sortedDates.length - 1].date) {
            sampledDates.push(sortedDates[sortedDates.length - 1]);
        }
    }

    // Step 3: Index each fund's timeline with timestamps for fast forward-fill binary/linear search
    const fundIndexedTimelines = returnsData.map((scheme) => ({
        schemeName: scheme.schemeName,
        schemeCode: scheme.schemeCode,
        timeline: (scheme.timeline || []).map((pt) => ({
            ...pt,
            time: parseDateString(pt.date).getTime(),
        })),
    }));

    // Step 4: Build continuous, aligned dataset with forward-filling (prevents any undefined or broken lines)
    const alignedCombined: Array<{
        date: string;
        totalInvested: number;
        totalValue: number;
        totalGain: number;
        gainPercent: number;
        [key: string]: any;
    }> = [];

    // Track active pointer index for each fund for linear O(N) sweep
    const pointers = new Array(fundIndexedTimelines.length).fill(0);
    const lastKnown = new Array(fundIndexedTimelines.length).fill(null);

    for (const target of sampledDates) {
        let totalInvestedOnDate = 0;
        let totalValueOnDate = 0;
        const rowData: Record<string, any> = {
            date: target.date,
        };

        fundIndexedTimelines.forEach((fund, fundIndex) => {
            const list = fund.timeline;
            let ptr = pointers[fundIndex];

            // Advance pointer to the latest point <= target.time
            while (ptr < list.length && list[ptr].time <= target.time) {
                lastKnown[fundIndex] = list[ptr];
                ptr++;
            }
            pointers[fundIndex] = ptr;

            const point = lastKnown[fundIndex];
            const fundInvested = point ? point.invested : 0;
            const fundValue = point ? point.value : 0;
            const fundGainPct = point ? point.gainPercent : 0;

            totalInvestedOnDate += fundInvested;
            totalValueOnDate += fundValue;

            // Safe alphanumeric key without special symbols/dots for Recharts
            rowData[`fund_${fund.schemeCode}`] = fundValue;
            rowData[`fund_${fund.schemeCode}__pct`] = fundGainPct;
            // Also store schemeName key for backwards compatibility
            rowData[fund.schemeName] = fundValue;
            rowData[`${fund.schemeName}__pct`] = fundGainPct;
        });

        const totalGainOnDate = totalValueOnDate - totalInvestedOnDate;
        const gainPercentOnDate = totalInvestedOnDate > 0 ? (totalGainOnDate / totalInvestedOnDate) * 100 : 0;

        rowData.totalInvested = Math.round(totalInvestedOnDate);
        rowData.totalValue = Math.round(totalValueOnDate);
        rowData.totalGain = Math.round(totalGainOnDate);
        rowData.gainPercent = parseFloat(gainPercentOnDate.toFixed(2));

        alignedCombined.push(rowData as any);
    }

    return alignedCombined as unknown as ReturnsHistory[];
}

export async function getDateRange(period: string): Promise<{ startDate: string, endDate: string }> {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
        case "6M":
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case "1Y":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case "3Y":
            startDate.setFullYear(startDate.getFullYear() - 3);
            break;
        case "5Y":
            startDate.setFullYear(startDate.getFullYear() - 5);
            break;
        case "8Y":
            startDate.setFullYear(startDate.getFullYear() - 8);
            break;
        case "10Y":
            startDate.setFullYear(startDate.getFullYear() - 10);
            break;
        default:
            startDate.setFullYear(startDate.getFullYear() - 3);
            break;
    }

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}