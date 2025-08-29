import React, { useState } from 'react'
import type { ConcentrationAnalysisResponse } from '../types'

interface AnalysisResultsProps {
  concentrationResults: ConcentrationAnalysisResponse | null
  onReset: () => void
  onTryDifferentGroupings: () => void
}

type SortField = 'sum' | 'count' | 'mean' | 'std' | string
type SortDirection = 'asc' | 'desc'

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  concentrationResults,
  onReset,
  onTryDifferentGroupings
}) => {
  const [sortField, setSortField] = useState<SortField>('sum')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortedResults = (results: any[]) => {
    return [...results].sort((a, b) => {
      let aValue: any, bValue: any
      
      if (typeof sortField === 'string' && sortField in a) {
        aValue = a[sortField]
        bValue = b[sortField]
      } else {
        // Default to sum if field doesn't exist
        aValue = a.sum
        bValue = b.sum
      }
      
      // Handle string comparison for categorical columns
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      }
      
      // Handle numeric comparison
      if (sortDirection === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️'
    return sortDirection === 'asc' ? '↑' : '↓'
  }


  return (
    <div className="step-container">
      <h2>Step 4: Concentration Analysis Results</h2>
      
      {concentrationResults && (
        <div className="results-container">
          <div className="results-summary">
            <h3>Analysis Summary</h3>
            <p><strong>Group By:</strong> {concentrationResults.group_by_columns.join(', ')}</p>
            <p><strong>Aggregate Columns:</strong> {concentrationResults.aggregate_columns.join(', ')}</p>
            <p><strong>Total Groups:</strong> {concentrationResults.total_groups.toLocaleString()}</p>
          </div>

          <div className="concentration-table-section">
            <h3>Concentration Analysis</h3>
            {Object.entries(concentrationResults.concentration_metrics).map(([column, metrics]) => (
              <div key={column} className="concentration-table-card">
                <h4>{column}</h4>
                <div className="table-container">
                  <table className="concentration-table">
                    <thead>
                      <tr>
                        <th>Concentration</th>
                        <th>Total Sum</th>
                        <th>Top 10%</th>
                        <th>Top 20%</th>
                        <th>Top 50%</th>
     
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Values</td>
                        <td>{metrics.total_sum.toLocaleString()}</td>
                        <td>{metrics.top_10_concentration.toFixed(2)}%</td>
                        <td>{metrics.top_20_concentration.toFixed(2)}%</td>
                        <td>{metrics.top_50_concentration.toFixed(2)}%</td>
  
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="aggregation-results">
            <h3>Detailed Aggregation Results</h3>
            {Object.entries(concentrationResults.aggregation_results).map(([column, results]) => (
              <div key={column} className="aggregation-card">
                <h4>{column} - Top 10 Groups</h4>
                <div className="table-container">
                  <table className="results-table">
                    <thead>
                      <tr>
                        {concentrationResults.group_by_columns.map(col => (
                          <th 
                            key={col} 
                            className="sortable-header"
                            onClick={() => handleSort(col)}
                          >
                            {col} <span className="sort-icon">{getSortIcon(col)}</span>
                          </th>
                        ))}
                        <th 
                          className="sortable-header"
                          onClick={() => handleSort('sum')}
                        >
                          Sum <span className="sort-icon">{getSortIcon('sum')}</span>
                        </th>
                        <th 
                          className="sortable-header"
                          onClick={() => handleSort('count')}
                        >
                          Count <span className="sort-icon">{getSortIcon('count')}</span>
                        </th>
                        <th 
                          className="sortable-header"
                          onClick={() => handleSort('mean')}
                        >
                          Mean <span className="sort-icon">{getSortIcon('mean')}</span>
                        </th>
                        <th 
                          className="sortable-header"
                          onClick={() => handleSort('std')}
                        >
                          Std <span className="sort-icon">{getSortIcon('std')}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedResults(results).slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          {concentrationResults.group_by_columns.map(col => (
                            <td key={col}>{row[col]}</td>
                          ))}
                          <td>{row.sum.toLocaleString()}</td>
                          <td>{row.count.toLocaleString()}</td>
                          <td>{row.mean.toFixed(2)}</td>
                          <td>{row.std.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-actions">
        <button onClick={onTryDifferentGroupings} className="secondary-button">
          Try Different Groupings
        </button>
        <button onClick={onReset} className="primary-button">
          Start New Analysis
        </button>
      </div>
    </div>
  )
}

export default AnalysisResults
