import React from 'react'

interface FileUploadProps {
  selectedFile: File | null
  loading: boolean
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
}

const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  loading,
  onFileSelect,
  onUpload
}) => {
  return (
    <div className="step-container">
      <h2>Step 1: Upload Your Data File</h2>
      <div className="file-upload-section">
        <p>Supported formats: .csv, .xlsx, .xls</p>
        
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileSelect}
          className="file-input"
        />
        
        <button 
          onClick={onUpload} 
          disabled={loading || !selectedFile}
          className="upload-button"
        >
          {loading ? 'Processing...' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  )
}

export default FileUpload
