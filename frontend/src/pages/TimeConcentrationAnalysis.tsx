import React, { useState } from 'react';
import type {
  TimeConcentrationAnalysisRequest,
  TimeConcentrationAnalysisResponse,
  ScanFileResponse,
} from '../types/types';
import { ColumnSelectionByClassification } from '..';

interface TimeConcentrationAnalysisProps {
  scanFileData: ScanFileResponse | null;
  selectedTimeGroupByColumns: string[];
  selectedCategoricalGroupByColumns: string[];
  selectedAggregateColumns: string[];
  loading: boolean;
  onTimeGroupByColumnToggle: (column: string) => void;
  onCategoricalGroupByColumnToggle: (column: string) => void;
  onAggregateColumnToggle: (column: string) => void;
  onResults: (results: TimeConcentrationAnalysisResponse) => void;
  onBack: () => void;
}

const AVAILABLE_BUCKETS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];
const DEFAULT_CONCENTRATION_BUCKETS = [10, 20, 50];

const TimeConcentrationAnalysis: React.FC<TimeConcentrationAnalysisProps> = ({
  scanFileData,
  selectedTimeGroupByColumns,
  selectedCategoricalGroupByColumns,
  selectedAggregateColumns,
  onTimeGroupByColumnToggle,
  onCategoricalGroupByColumnToggle,
  onAggregateColumnToggle,
  onResults,
  onBack,
}) => {
  const [concentrationBuckets, setConcentrationBuckets] = useState<number[]>(
    DEFAULT_CONCENTRATION_BUCKETS
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBucketToggle = (bucket: number) => {
    setConcentrationBuckets(prev =>
      prev.includes(bucket)
        ? prev.filter(b => b !== bucket)
        : [...prev, bucket].sort((a, b) => a - b)
    );
  };

  /**
   * Get time concentration analysis results
   */
  const getTimeConcentrationAnalysisResults = async () => {
    if (selectedTimeGroupByColumns.length === 0) {
      setError('Please select at least one time column');
      return;
    }

    if (selectedAggregateColumns.length === 0) {
      setError('Please select at least one aggregate column');
      return;
    }

    if (concentrationBuckets.length === 0) {
      setError('Please select at least one concentration bucket');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request: TimeConcentrationAnalysisRequest = {
        time_columns: selectedTimeGroupByColumns,
        aggregate_columns: selectedAggregateColumns,
        concentration_buckets: concentrationBuckets,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/time-concentration-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || 'Failed to perform time concentration analysis'
        );
      }

      const results: TimeConcentrationAnalysisResponse = await response.json();
      onResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="step-container">
      <h2>Step 3: Time-Based Concentration Analysis</h2>

      {error && <div className="error">{error}</div>}

      <div className="selection-grid">
        <ColumnSelectionByClassification
          title="Group By Columns (Times)"
          columns={scanFileData?.time_columns || []}
          selectedColumns={selectedTimeGroupByColumns}
          onGroupByColumnToggle={onTimeGroupByColumnToggle}
        />
        <ColumnSelectionByClassification
          title="Group By Columns (Categorical)"
          columns={scanFileData?.categorical_columns || []}
          selectedColumns={selectedCategoricalGroupByColumns}
          onGroupByColumnToggle={onCategoricalGroupByColumnToggle}
        />
        <ColumnSelectionByClassification
          title="Aggregate Columns (Numerical)"
          columns={scanFileData?.numerical_columns || []}
          selectedColumns={selectedAggregateColumns}
          onGroupByColumnToggle={onAggregateColumnToggle}
        />

        {/* Concentration Buckets Selection */}
        <div className="column-selection">
          <h3>Concentration Buckets</h3>
          <p>
            Select percentage buckets to analyze concentration (e.g., top 10%,
            20%, 50%):
          </p>
          <div className="concentration-buckets-grid">
            {AVAILABLE_BUCKETS.map(bucket => (
              <div
                key={bucket}
                className={`column-item ${concentrationBuckets.includes(bucket) ? 'selected' : ''}`}
                onClick={() => handleBucketToggle(bucket)}
              >
                <span className="column-name">{bucket}%</span>
                {concentrationBuckets.includes(bucket) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onBack} className="secondary-button">
          Back
        </button>
        <button
          onClick={getTimeConcentrationAnalysisResults}
          disabled={
            isLoading ||
            selectedCategoricalGroupByColumns.length === 0 ||
            selectedTimeGroupByColumns.length === 0 ||
            selectedAggregateColumns.length === 0
          }
          className="primary-button"
        >
          {isLoading ? 'Analyzing...' : 'Perform Time Analysis'}
        </button>
      </div>
    </div>
  );
};

export default TimeConcentrationAnalysis;
