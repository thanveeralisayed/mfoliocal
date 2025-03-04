export interface SchemeMeta {
  fund_house: string;
  scheme_type: string;
  scheme_category: string;
  scheme_code: number;
  scheme_name: string;
  isin_growth: string | null;
  isin_div_reinvestment: string | null;
}

export interface SchemeData {
  date: string;
  nav: string;
}

export interface SchemeLatest {
  meta: SchemeMeta;
  data: SchemeData[];
  status: string;
  sipAmount?: number;
}