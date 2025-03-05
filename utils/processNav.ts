'use server'

import { Returns } from "@/models/returns";
import { ReturnsHistory } from "@/models/returnsHistory";
import { Schemes } from "@/models/scheme";
import { SchemeHistory } from "@/models/schemeHistory"



interface NavEntry {
    date: string;
    nav: number;
    returns: number;
}

function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function calculateSIPReturn(navData: NavEntry[], sipAmount: number, interval: "weekly" | "monthly" | "quarterly") {
    navData.reverse();
    let intervalDays: number;
    switch (interval) {
        case "weekly":
            intervalDays = 7;
            break;
        case "monthly":
            intervalDays = 30;
            break;
        case "quarterly":
            intervalDays = 90;
            break;
        default:
            throw new Error("Invalid interval");
    }

    let totalUnits = 0;
    let lastDate = parseDate(navData[0].date);
    let initialNav = navData[0].nav;
    totalUnits = sipAmount / initialNav;
    let totalInvested = sipAmount;

    for (let i = 1; i < navData.length; i++) {
        let { date, nav } = navData[i];
        let currentDate = parseDate(date);
        // Take first investment or investments at correct intervals
        if ((currentDate.getTime() - lastDate.getTime()) >= intervalDays * 24 * 60 * 60 * 1000) {
            let unitsBought = sipAmount / nav;
            totalUnits += unitsBought;
            totalInvested += sipAmount;
            const returns = totalUnits * nav;
            navData[i].returns = parseFloat(returns.toFixed(2))
            lastDate = currentDate; // Update last investment date
        }
        else {
            const returns = totalUnits * nav;
            navData[i].returns = parseFloat(returns.toFixed(2))
        }
    }

    // Use the latest NAV to calculate the final value
    let finalValue = totalUnits * navData[navData.length - 1].nav;
    let returns = finalValue - totalInvested;
    totalInvested = parseFloat(totalInvested.toFixed(2));
    finalValue = parseFloat(finalValue.toFixed(2));
    totalUnits = parseFloat(totalUnits.toFixed(3));
    returns = parseFloat(returns.toFixed(2));
    return { total: finalValue, totalInvested: totalInvested, totalUnits: totalUnits, returns };
}



export const getReturnsForSipByFunds = async (schemeData: SchemeHistory[]): Promise<Returns[]> => {
    const returns: Returns[] = schemeData.map((scheme) => {
        const schemeName = scheme.meta.scheme_name;
        const schemeCode = scheme.meta.scheme_code;
        const schemeHistory = scheme;
        const { total, totalInvested, totalUnits, returns } = calculateSIPReturn(scheme.data, scheme.meta.sipAmount || 0, "monthly");
        return { returns, schemeCode, schemeHistory, schemeName, total, totalInvested, totalUnits };
    });
    return returns;
}
export const processReturns = async (returnsData: Returns[]) => {
    const combinedReturns: ReturnsHistory[] = [];

    returnsData.forEach((scheme) => {
        scheme.schemeHistory.data.forEach((entry) => {
            const existingEntry = combinedReturns.find((e) => e.date === entry.date);
            if (existingEntry) {
                existingEntry[scheme.schemeName] = entry.returns;
            } else {
                combinedReturns.push({ date: entry.date, [scheme.schemeName]: Number(entry.returns) });
            }
        });
    });

    // Filter out dates that do not have returns for all funds
    const allSchemeNames = returnsData.map(scheme => scheme.schemeName);
    const filteredReturns = combinedReturns.filter(entry =>
        allSchemeNames.every(schemeName => schemeName in entry)
    );

    return filteredReturns;
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
        case "10Y":
            startDate.setFullYear(startDate.getFullYear() - 10);
            break;
        default:
            throw new Error("Invalid period");
    }

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}