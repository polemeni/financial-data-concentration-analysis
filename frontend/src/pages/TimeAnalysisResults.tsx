import React from 'react';
import type { TimeConcentrationAnalysisResponse } from '../types/types';

interface TimeAnalysisResultsProps {
  results: TimeConcentrationAnalysisResponse;
  onBack: () => void;
}

const TimeAnalysisResults: React.FC<TimeAnalysisResultsProps> = ({
  results,
  onBack,
}) => {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const getBucketProperties = (bucket: number) => ({
    valueKey: `top_${bucket}%_value`,
    countKey: `top_${bucket}%_count`,
    percentageKey: `top_${bucket}%_percentage`,
  });

  return (
    <div className="step-container">
      <h2>Time-Based Concentration Analysis Results</h2>
      <p className="step-description">
        Concentration analysis over {results.total_periods} time periods
      </p>

      {Object.entries(results.concentration_data).map(
        ([aggregateColumn, periods]) => (
          <div key={aggregateColumn} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {aggregateColumn}
            </h2>

            <div className="concentration-table-card">
              <div className="table-container">
                <table className="concentration-table">
                  <thead>
                    <tr>
                      <th>Concentration</th>
                      {results.time_periods.map(period => (
                        <th key={period}>{period}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Concentration Bucket Rows */}
                    {results.concentration_buckets.map(bucket => {
                      const { valueKey, countKey } =
                        getBucketProperties(bucket);
                      return (
                        <tr key={bucket}>
                          <td>
                            Top {bucket}% ({periods[0]?.[countKey] || 0})
                          </td>
                          {results.time_periods.map(period => {
                            const periodData = periods.find(
                              p => p.time_period === period
                            );
                            const value = periodData?.[valueKey] || 0;
                            return <td key={period}>{formatNumber(value)}</td>;
                          })}
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr>
                      <td>Total</td>
                      {results.time_periods.map(period => {
                        const periodData = periods.find(
                          p => p.time_period === period
                        );
                        const totalValue = periodData?.total_value || 0;
                        return <td key={period}>{formatNumber(totalValue)}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* Summary Information */}
      <div className="results-summary">
        <h3>Analysis Summary</h3>
        <p>
          <strong>Time Columns:</strong> {results.time_columns.join(', ')}
        </p>
        <p>
          <strong>Aggregate Columns:</strong>{' '}
          {results.aggregate_columns.join(', ')}
        </p>
        <p>
          <strong>Concentration Buckets:</strong>{' '}
          {results.concentration_buckets.map(b => `${b}%`).join(', ')}
        </p>
      </div>

      <div className="step-actions">
        <button onClick={onBack} className="secondary-button">
          Back to Analysis Setup
        </button>
      </div>
    </div>
  );
};

export default TimeAnalysisResults;
