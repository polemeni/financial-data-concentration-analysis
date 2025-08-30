import { useState } from 'react';
import './App.css';
import { FileUpload, ColumnReclassification, ErrorDisplay } from '.';
import TimeConcentrationAnalysis from './pages/TimeConcentrationAnalysis';
import TimeAnalysisResults from './pages/TimeAnalysisResults';
import type {
  ScanFileResponse,
  ReclassifyColumnsRequest,
  TimeConcentrationAnalysisResponse,
  AppStep,
  ColumnClassification,
} from './types/types';
const COLUMN_CLASSIFICATIONS: ColumnClassification[] = [
  'categorical',
  'numerical',
  'time',
];

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [scanFileData, setScanFileData] = useState<ScanFileResponse | null>(
    null
  );
  const [timeAnalysisResults, setTimeAnalysisResults] =
    useState<TimeConcentrationAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Column selection state
  const [selectedTimeGroupByColumns, setSelectedTimeGroupByColumns] = useState<
    string[]
  >([]);
  const [
    selectedCategoricalGroupByColumns,
    setSelectedCategoricalGroupByColumns,
  ] = useState<string[]>([]);
  const [selectedAggregateColumns, setSelectedAggregateColumns] = useState<
    string[]
  >([]);

  // Column reclassification state
  const [reclassifiedCategoricalColumns, setReclassifiedCategoricalColumns] =
    useState<string[]>([]);
  const [reclassifiedNumericalColumns, setReclassifiedNumericalColumns] =
    useState<string[]>([]);
  const [reclassifiedTimeColumns, setReclassifiedTimeColumns] = useState<
    string[]
  >([]);

  /**
   * Handles file selection
   * @param event - The file input event
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setScanFileData(null);
      setCurrentStep('upload');
    }
  };

  /**
   * Uploads file to scan-file endpoint
   */
  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setScanFileData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/scan-file`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: ScanFileResponse = await response.json();
      setScanFileData(data);

      // Initialize reclassification state with detected columns
      setReclassifiedCategoricalColumns(data.categorical_columns || []);
      setReclassifiedNumericalColumns(data.numerical_columns || []);
      setReclassifiedTimeColumns(data.time_columns || []);

      setCurrentStep('reclassify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles column reclassification
   * @param column - The column to reclassify
   * @param newClassification - The new classification of the column
   */
  const handleColumnReclassification = (
    column: string,
    newClassification: ColumnClassification
  ) => {
    const setters: Record<
      ColumnClassification,
      React.Dispatch<React.SetStateAction<string[]>>
    > = {
      categorical: setReclassifiedCategoricalColumns,
      numerical: setReclassifiedNumericalColumns,
      time: setReclassifiedTimeColumns,
    };

    COLUMN_CLASSIFICATIONS.forEach(classification => {
      setters[classification](
        prev =>
          classification === newClassification
            ? prev.includes(column)
              ? prev
              : [...prev, column] // add if missing
            : prev.filter(col => col !== column) // remove from others
      );
    });
  };

  /**
   * Reclassifies columns
   */
  const onSubmitReclassifications = async () => {
    if (!scanFileData) return;

    setLoading(true);
    setError('');

    try {
      const request: ReclassifyColumnsRequest = {
        categorical_columns: reclassifiedCategoricalColumns,
        numerical_columns: reclassifiedNumericalColumns,
        time_columns: reclassifiedTimeColumns,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reclassify-columns`,
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
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: ScanFileResponse = await response.json();
      setScanFileData(data);
      setCurrentStep('analyze');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleColumnToggle = (
    column: string,
    setGroups: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setGroups(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const resetAnalysis = () => {
    setCurrentStep('upload');
    setScanFileData(null);
    setTimeAnalysisResults(null);
    setSelectedFile(null);
    setSelectedTimeGroupByColumns([]);
    setSelectedCategoricalGroupByColumns([]);
    setSelectedAggregateColumns([]);
    setReclassifiedCategoricalColumns([]);
    setReclassifiedNumericalColumns([]);
    setError('');
  };

  const goBackToReclassify = () => {
    setCurrentStep('reclassify');
  };

  const handleTimeAnalysisResults = (
    results: TimeConcentrationAnalysisResponse
  ) => {
    setTimeAnalysisResults(results);
    setCurrentStep('analysis-results');
  };

  const goBackToTimeAnalysisSetup = () => {
    setCurrentStep('analyze');
  };

  return (
    <div className="app">
      <h1>Financial Data Concentration Analysis</h1>

      <ErrorDisplay error={error} />

      {currentStep === 'upload' && (
        <FileUpload
          selectedFile={selectedFile}
          loading={loading}
          onFileSelect={handleFileSelect}
          onUpload={uploadFile}
        />
      )}

      {currentStep === 'reclassify' && (
        <ColumnReclassification
          scanFileData={scanFileData}
          reclassifiedCategoricalColumns={reclassifiedCategoricalColumns}
          reclassifiedNumericalColumns={reclassifiedNumericalColumns}
          reclassifiedTimeColumns={reclassifiedTimeColumns}
          loading={loading}
          handleColumnReclassification={handleColumnReclassification}
          onSubmitReclassifications={onSubmitReclassifications}
          onReset={resetAnalysis}
        />
      )}

      {currentStep === 'analyze' && (
        <TimeConcentrationAnalysis
          scanFileData={scanFileData}
          selectedTimeGroupByColumns={selectedTimeGroupByColumns}
          selectedCategoricalGroupByColumns={selectedCategoricalGroupByColumns}
          selectedAggregateColumns={selectedAggregateColumns}
          loading={loading}
          onTimeGroupByColumnToggle={column =>
            handleColumnToggle(column, setSelectedTimeGroupByColumns)
          }
          onCategoricalGroupByColumnToggle={column =>
            handleColumnToggle(column, setSelectedCategoricalGroupByColumns)
          }
          onAggregateColumnToggle={column =>
            handleColumnToggle(column, setSelectedAggregateColumns)
          }
          onBack={goBackToReclassify}
          onResults={handleTimeAnalysisResults}
        />
      )}

      {currentStep === 'analysis-results' && timeAnalysisResults && (
        <TimeAnalysisResults
          results={timeAnalysisResults}
          onBack={goBackToTimeAnalysisSetup}
        />
      )}
    </div>
  );
}

export default App;
