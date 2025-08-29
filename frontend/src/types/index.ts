export interface AnalysisResponse {
  message: string;
  data_shape: [number, number] | null;
  columns: string[] | null;
  numerical_columns: string[] | null;
  categorical_columns: string[] | null;
  time_columns: string[] | null;
  file_key: string;
}

export interface ReclassifyColumnsRequest {
  categorical_columns: string[];
  numerical_columns: string[];
  time_columns: string[];
}

export interface ConcentrationAnalysisRequest {
  group_by_columns: string[];
  aggregate_columns: string[];
}

export interface TimeConcentrationAnalysisRequest {
  time_columns: string[];
  aggregate_columns: string[];
  concentration_buckets?: number[];
}

export interface ConcentrationMetric {
  total_sum: number;
  total_count: number;
  top_10_concentration: number;
  top_20_concentration: number;
  top_50_concentration: number;
}

export interface TimeConcentrationPeriod {
  time_period: string;
  total_value: number;
  total_count: number;
  [key: string]: any; // For dynamic bucket properties like top_10%_value, top_20%_percentage, etc.
}

export interface ConcentrationAnalysisResponse {
  aggregation_results: Record<string, any[]>;
  concentration_metrics: Record<string, ConcentrationMetric>;
  group_by_columns: string[];
  aggregate_columns: string[];
  total_groups: number;
}

export interface TimeConcentrationAnalysisResponse {
  time_periods: string[];
  concentration_data: Record<string, TimeConcentrationPeriod[]>;
  time_columns: string[];
  aggregate_columns: string[];
  concentration_buckets: number[];
  total_periods: number;
}

export type AppStep =
  | 'upload'
  | 'reclassify'
  | 'select'
  | 'results'
  | 'time-analysis'
  | 'time-results';

export type ColumnType = 'categorical' | 'numerical' | 'time';
