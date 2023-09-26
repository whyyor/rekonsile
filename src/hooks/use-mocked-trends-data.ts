import { _mock } from 'src/_mock';
import records from './trendwiseRecords.json';

export type TrendRecord = {
  date: string;
  avgSales: number;
  avgPrice: number;
  productName: string;
  productCategory: string;
  brand: string;
};

export function getProductCategories(): Array<string> {
  return Array.from(new Set(records.map((r) => r.productCategory)));
}

export function useMockedTrends(productCategory: string): Array<TrendRecord> {
  return records
    .filter((r) => (r.productCategory ? r.productCategory === productCategory : true))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
