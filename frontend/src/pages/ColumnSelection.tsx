import React from 'react';
import type { AnalysisResponse } from '../types';

interface ColumnSelectionProps {
  analysisData: AnalysisResponse | null;
  selectedGroupByColumns: string[];
  selectedAggregateColumns: string[];
  loading: boolean;
  onGroupByColumnToggle: (column: string) => void;
  onAggregateColumnToggle: (column: string) => void;
  onBackToReclassify: () => void;
  onPerformAnalysis: () => void;
  onTimeAnalysis: () => void;
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({
  analysisData,
  selectedGroupByColumns,
  selectedAggregateColumns,
  loading,
  onGroupByColumnToggle,
  onAggregateColumnToggle,
  onBackToReclassify,
  onPerformAnalysis,
  onTimeAnalysis,
}) => {
  return (
    <div className="step-container">
      <h2>Step 3: Select Columns for Analysis</h2>

      <div className="selection-grid">
        <div className="column-selection">
          <h3>Group By Columns (Categorical)</h3>
          <p>Select categorical columns to group your data by:</p>
          <div className="columns-grid">
            {analysisData?.categorical_columns?.map(col => (
              <div
                key={col}
                className={`column-item ${selectedGroupByColumns.includes(col) ? 'selected' : ''}`}
                onClick={() => onGroupByColumnToggle(col)}
              >
                <span className="column-name">{col}</span>
                {selectedGroupByColumns.includes(col) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="column-selection">
          <h3>Aggregate Columns (Numerical)</h3>
          <p>Select numerical columns to analyze concentration:</p>
          <div className="columns-grid">
            {analysisData?.numerical_columns?.map(col => (
              <div
                key={col}
                className={`column-item ${selectedAggregateColumns.includes(col) ? 'selected' : ''}`}
                onClick={() => onAggregateColumnToggle(col)}
              >
                <span className="column-name">{col}</span>
                {selectedAggregateColumns.includes(col) && (
                  <span className="checkmark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onBackToReclassify} className="secondary-button">
          Back to Column Types
        </button>
        <div className="analysis-buttons">
          <button
            onClick={onPerformAnalysis}
            disabled={
              loading ||
              selectedGroupByColumns.length === 0 ||
              selectedAggregateColumns.length === 0
            }
            className="primary-button"
          >
            {loading ? 'Analyzing...' : 'Perform Concentration Analysis'}
          </button>
          <button
            onClick={onTimeAnalysis}
            disabled={loading || !analysisData?.time_columns?.length}
            className="primary-button"
          >
            Time-Based Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelection;
