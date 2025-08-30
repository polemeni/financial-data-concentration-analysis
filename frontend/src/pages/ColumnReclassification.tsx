import React from 'react';
import type { ScanFileResponse } from '../types/types';

interface ColumnReclassificationProps {
  scanFileData: ScanFileResponse | null;
  reclassifiedCategoricalColumns: string[];
  reclassifiedNumericalColumns: string[];
  reclassifiedTimeColumns: string[];
  loading: boolean;
  handleColumnReclassification: (
    column: string,
    newType: 'categorical' | 'numerical' | 'time'
  ) => void;
  onSubmitReclassifications: () => void;
  onReset: () => void;
}

const ColumnReclassification: React.FC<ColumnReclassificationProps> = ({
  scanFileData,
  reclassifiedCategoricalColumns,
  reclassifiedNumericalColumns,
  reclassifiedTimeColumns,
  loading,
  handleColumnReclassification,
  onSubmitReclassifications,
  onReset,
}) => {
  return (
    <div className="step-container">
      <h2>Step 2: Review & Reclassify Columns</h2>
      <p className="step-description">
        Review the automatically detected column types. You can reclassify
        columns if needed (e.g., numerical codes that should be treated as
        categorical).
      </p>

      <div className="reclassify-grid">
        <div className="column-section">
          <h3>All Columns</h3>
          <div className="all-columns-grid">
            {scanFileData?.columns?.map(col => {
              const isCategorical =
                reclassifiedCategoricalColumns.includes(col);
              const isNumerical = reclassifiedNumericalColumns.includes(col);
              const isTime = reclassifiedTimeColumns.includes(col);

              return (
                <div key={col} className="column-item">
                  <span className="column-name">{col}</span>
                  <div className="column-type-controls">
                    <button
                      className={`type-button ${isCategorical ? 'active' : ''}`}
                      onClick={() =>
                        handleColumnReclassification(col, 'categorical')
                      }
                    >
                      Categorical
                    </button>
                    <button
                      className={`type-button ${isNumerical ? 'active' : ''}`}
                      onClick={() =>
                        handleColumnReclassification(col, 'numerical')
                      }
                    >
                      Numerical
                    </button>
                    <button
                      className={`type-button ${isTime ? 'active' : ''}`}
                      onClick={() => handleColumnReclassification(col, 'time')}
                    >
                      Time
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button onClick={onReset} className="secondary-button">
          Start Over
        </button>
        <button
          onClick={onSubmitReclassifications}
          disabled={
            loading ||
            reclassifiedTimeColumns.length === 0 ||
            reclassifiedCategoricalColumns.length === 0 ||
            reclassifiedNumericalColumns.length === 0
          }
          className="primary-button"
        >
          {loading ? 'Updating...' : 'Continue to Column Selection'}
        </button>
      </div>
    </div>
  );
};

export default ColumnReclassification;
