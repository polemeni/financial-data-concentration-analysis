import { useState } from 'react'
import './App.css'

function App() {
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchTestData = async () => {
    setLoading(true)
    setError('')
    setResponse('')
    
    try {
      const response = await fetch('http://localhost:8000/api/test')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setResponse(data.message || JSON.stringify(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Financial Data Analysis</h1>
      <div className="card">
        <button 
          onClick={fetchTestData} 
          disabled={loading}
          className="test-button"
        >
          {loading ? 'Loading...' : 'Test Backend Connection'}
        </button>
        
        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}
        
        {response && (
          <div className="response">
            <h3>Backend Response:</h3>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
