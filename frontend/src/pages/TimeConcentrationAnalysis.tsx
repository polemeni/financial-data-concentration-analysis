import React, { useState } from 'react';
import type {
  TimeConcentrationAnalysisRequest,
  TimeConcentrationAnalysisResponse,
  AnalysisResponse,
} from '../types';

interface TimeConcentrationAnalysisProps {
  analysisData: AnalysisResponse;
  onResults: (results: TimeConcentrationAnalysisResponse) => void;
  onBack: () => void;
}

const TimeConcentrationAnalysis: React.FC<TimeConcentrationAnalysisProps> = ({
  analysisData,
  onResults,
  onBack,
}) => {
  const [selectedTimeColumns, setSelectedTimeColumns] = useState<string[]>([]);
  const [selectedAggregateColumns, setSelectedAggregateColumns] = useState<
    string[]
  >([]);
  const [concentrationBuckets, setConcentrationBuckets] = useState<number[]>([
    10, 20, 50,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTimeColumnToggle = (column: string) => {
    setSelectedTimeColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleAggregateColumnToggle = (column: string) => {
    setSelectedAggregateColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleBucketToggle = (bucket: number) => {
    setConcentrationBuckets(prev =>
      prev.includes(bucket)
        ? prev.filter(b => b !== bucket)
        : [...prev, bucket].sort((a, b) => a - b)
    );
  };

  const handleAnalyze = async () => {
    if (selectedTimeColumns.length === 0) {
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
        time_columns: selectedTimeColumns,
        aggregate_columns: selectedAggregateColumns,
        concentration_buckets: concentrationBuckets,
      };

      const response = await fetch(
        `${import.meta.env.API_BASE_URL}/time-concentration-analysis`,
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

  const availableBuckets = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];

  return (
    <div className="step-container">
      <h2>Time-Based Concentration Analysis</h2>

      {error && <div className="error">{error}</div>}

      <div className="selection-grid">
        {/* Time Columns Selection */}
        <div className="column-selection">
          <h3>Time Columns</h3>
          <p>
            Select one or more time columns to group the analysis by time
            periods:
          </p>
          <div className="columns-grid">
            {analysisData.time_columns?.map(column => (
              <div
                key={column}
                className={`column-item ${selectedTimeColumns.includes(column) ? 'selected' : ''}`}
                onClick={() => handleTimeColumnToggle(column)}
              >
                <span className="column-name">{column}</span>
                {selectedTimeColumns.includes(column) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
          {analysisData.time_columns?.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No time columns available
            </p>
          )}
        </div>

        {/* Aggregate Columns Selection */}
        <div className="column-selection">
          <h3>Aggregate Columns</h3>
          <p>
            Select numerical columns to aggregate and analyze for concentration:
          </p>
          <div className="columns-grid">
            {analysisData.numerical_columns?.map(column => (
              <div
                key={column}
                className={`column-item ${selectedAggregateColumns.includes(column) ? 'selected' : ''}`}
                onClick={() => handleAggregateColumnToggle(column)}
              >
                <span className="column-name">{column}</span>
                {selectedAggregateColumns.includes(column) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
          {analysisData.numerical_columns?.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No numerical columns available
            </p>
          )}
        </div>

        {/* Concentration Buckets Selection */}
        <div className="column-selection">
          <h3>Concentration Buckets</h3>
          <p>
            Select percentage buckets to analyze concentration (e.g., top 10%,
            20%, 50%):
          </p>
          <div className="columns-grid">
            {availableBuckets.map(bucket => (
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
          onClick={handleAnalyze}
          disabled={
            isLoading ||
            selectedTimeColumns.length === 0 ||
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
