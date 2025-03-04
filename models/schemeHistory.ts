export type SchemeHistory = {
    totalInvested?: number,
    totalUnits?: number,
    total?: number,
    returns?: number,
    meta: {
        fund_house: string;
        scheme_type: string;
        scheme_category: string;
        scheme_code: number;
        scheme_name: string;
        isin_growth: string;
        isin_div_reinvestment: string | null;
        sipAmount: number;
    };
    data: {
        date: string,
        nav: number,
        returns: number
    }[];
};