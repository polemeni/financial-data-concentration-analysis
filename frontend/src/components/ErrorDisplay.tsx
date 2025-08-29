import React from 'react'

interface ErrorDisplayProps {
  error: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null

  return (
    <div className="error">
      <p>Error: {error}</p>
    </div>
  )
}

export default ErrorDisplay
