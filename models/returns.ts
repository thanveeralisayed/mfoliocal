import { SchemeHistory } from "./schemeHistory";

export type Returns = {
    schemeName: string;
    schemeCode: number;
    totalInvested: number;
    total: number;
    totalUnits: number;
    returns: number;
    schemeHistory: SchemeHistory;
}