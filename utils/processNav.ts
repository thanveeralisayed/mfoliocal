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

        const result = calculateAccurateSIP(scheme.data, sipAmount, {
            frequency: options?.frequency || "monthly",
            stepUpPercent: options?.stepUpPercent || 0,
            targetPoints: 75,
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

    // Map by date across all funds
    const dateMap = new Map<string, {
        date: string;
        totalInvested: number;
        totalValue: number;
        totalGain: number;
        gainPercent: number;
        [key: string]: any;
    }>();

    returnsData.forEach((scheme) => {
        const timeline = scheme.timeline || [];
        timeline.forEach((pt) => {
            const existing = dateMap.get(pt.date);
            if (existing) {
                existing.totalInvested += pt.invested;
                existing.totalValue += pt.value;
                existing.totalGain += pt.gain;
                existing.gainPercent = existing.totalInvested > 0 ? parseFloat(((existing.totalGain / existing.totalInvested) * 100).toFixed(2)) : 0;
                existing[scheme.schemeName] = pt.value;
                existing[`${scheme.schemeName}__pct`] = pt.gainPercent;
            } else {
                dateMap.set(pt.date, {
                    date: pt.date,
                    totalInvested: pt.invested,
                    totalValue: pt.value,
                    totalGain: pt.gain,
                    gainPercent: pt.invested > 0 ? parseFloat(((pt.gain / pt.invested) * 100).toFixed(2)) : 0,
                    [scheme.schemeName]: pt.value,
                    [`${scheme.schemeName}__pct`]: pt.gainPercent,
                });
            }
        });
    });

    const combined = Array.from(dateMap.values());
    combined.sort((a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime());
    return combined as unknown as ReturnsHistory[];
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