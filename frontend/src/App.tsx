import { useState } from 'react'
import './App.css'

interface AnalysisResponse {
  message: string
  data_shape: [number, number] | null
  columns: string[] | null
}

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setAnalysisData(null)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')
    setAnalysisData(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data: AnalysisResponse = await response.json()
      setAnalysisData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="app">
      <h1>Financial Data Concentration Analysis</h1>
      <div className="card">
        <div className="file-upload-section">
          <h3>Upload Excel or CSV File</h3>
          <p>Supported formats: .csv, .xlsx, .xls</p>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="file-input"
          />
          
          <button 
            onClick={uploadFile} 
            disabled={loading || !selectedFile}
            className="upload-button"
          >
            {loading ? 'Processing...' : 'Analyze File'}
          </button>
        </div>
        
        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}
        
        {analysisData && (
          <div className="analysis-results">
            <h3>Analysis Results</h3>
            <div className="analysis-info">
              <p><strong>Status:</strong> {analysisData.message}</p>
              {analysisData.data_shape && (
                <>
                  <p><strong>Rows:</strong> {analysisData.data_shape[0].toLocaleString()}</p>
                  <p><strong>Columns:</strong> {analysisData.data_shape[1]}</p>
                </>
              )}
            </div>
            
            {analysisData.columns && analysisData.columns.length > 0 && (
              <div className="columns-info">
                <h4>Columns:</h4>
                <div className="columns-grid">
                  {analysisData.columns.map((col, index) => (
                    <div key={index} className="column-item">
                      <span className="column-name">{col}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default App
