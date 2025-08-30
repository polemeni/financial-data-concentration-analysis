import React from 'react';
import type { AnalysisResponse } from '../types';
import { ColumnSelectionByClassification } from '../components';

interface ColumnSelectionProps {
  analysisData: AnalysisResponse | null;
  selectedTimeGroupByColumns: string[];
  selectedCategoricalGroupByColumns: string[];
  selectedAggregateColumns: string[];
  loading: boolean;
  onTimeGroupByColumnToggle: (column: string) => void;
  onCategoricalGroupByColumnToggle: (column: string) => void;
  onAggregateColumnToggle: (column: string) => void;
  onBackToReclassify: () => void;
  onPerformAnalysis: () => void;
}

const ColumnSelection: React.FC<ColumnSelectionProps> = ({
  analysisData,
  selectedTimeGroupByColumns,
  selectedCategoricalGroupByColumns,
  selectedAggregateColumns,
  onTimeGroupByColumnToggle,
  onCategoricalGroupByColumnToggle,
  onAggregateColumnToggle,
  onBackToReclassify,
  onPerformAnalysis,
}) => {
  return (
    <div className="step-container">
      <h2>Step 3: Select Columns for Analysis</h2>

      <div className="selection-grid">
        <ColumnSelectionByClassification
          title="Group By Columns (Times)"
          columns={analysisData?.time_columns || []}
          selectedColumns={selectedTimeGroupByColumns}
          onGroupByColumnToggle={onTimeGroupByColumnToggle}
        />
        <ColumnSelectionByClassification
          title="Group By Columns (Categorical)"
          columns={analysisData?.categorical_columns || []}
          selectedColumns={selectedCategoricalGroupByColumns}
          onGroupByColumnToggle={onCategoricalGroupByColumnToggle}
        />
        <ColumnSelectionByClassification
          title="Aggregate Columns (Numerical)"
          columns={analysisData?.numerical_columns || []}
          selectedColumns={selectedAggregateColumns}
          onGroupByColumnToggle={onAggregateColumnToggle}
        />
      </div>

      <div className="step-actions">
        <button onClick={onBackToReclassify} className="secondary-button">
          Back to Column Types
        </button>
      </div>
      <div className="step-actions">
        <button onClick={onPerformAnalysis} className="primary-button">
          Perform Analysis
        </button>
      </div>
    </div>
  );
};

export default ColumnSelection;
