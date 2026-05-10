export interface ReportSummary {
  currentTotal: number;
  previousTotal: number;
  changePercentage: number;
  dailyAverage: number;
  period: string;
  currentFrom: string;
  currentTo: string;
  previousFrom: string;
  previousTo: string;
}

export interface CategoryBreakdown {
  categoryName: string;
  total: number;
  percentage: number;
  count: number;
}

export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
