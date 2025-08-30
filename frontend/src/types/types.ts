export interface ScanFileResponse {
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

export interface TimeConcentrationAnalysisRequest {
  time_columns: string[];
  aggregate_columns: string[];
  concentration_buckets?: number[];
}

export interface TimeConcentrationPeriod {
  time_period: string;
  total_value: number;
  total_count: number;
  [key: string]: any; // For dynamic bucket properties like top_10%_value, top_20%_percentage, etc.
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
  | 'analyze'
  | 'results'
  | 'time-analysis'
  | 'analysis-results';

export type ColumnClassification = 'categorical' | 'numerical' | 'time';
