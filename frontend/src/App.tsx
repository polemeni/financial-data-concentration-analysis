import { useState } from 'react';
import './App.css';
import {
  FileUpload,
  ColumnReclassification,
  ColumnSelection,
  AnalysisResults,
  ErrorDisplay,
} from './components';
import TimeConcentrationAnalysis from './pages/TimeConcentrationAnalysis';
import TimeAnalysisResults from './pages/TimeAnalysisResults';
import type {
  AnalysisResponse,
  ReclassifyColumnsRequest,
  ConcentrationAnalysisRequest,
  ConcentrationAnalysisResponse,
  TimeConcentrationAnalysisResponse,
  AppStep,
  ColumnType,
} from './types';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null
  );
  const [concentrationResults, setConcentrationResults] =
    useState<ConcentrationAnalysisResponse | null>(null);
  const [timeAnalysisResults, setTimeAnalysisResults] =
    useState<TimeConcentrationAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Column selection state
  const [selectedGroupByColumns, setSelectedGroupByColumns] = useState<
    string[]
  >([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setAnalysisData(null);
      setConcentrationResults(null);
      setCurrentStep('upload');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisData(null);
    setConcentrationResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/api/scan-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }

      const data: AnalysisResponse = await response.json();
      setAnalysisData(data);

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

  const handleColumnReclassification = (
    column: string,
    newType: ColumnType
  ) => {
    const setters: Record<
      ColumnType,
      React.Dispatch<React.SetStateAction<string[]>>
    > = {
      categorical: setReclassifiedCategoricalColumns,
      numerical: setReclassifiedNumericalColumns,
      time: setReclassifiedTimeColumns,
    };

    const allTypes: ColumnType[] = ['categorical', 'numerical', 'time'];

    allTypes.forEach(type => {
      setters[type](
        prev =>
          type === newType
            ? prev.includes(column)
              ? prev
              : [...prev, column] // add if missing
            : prev.filter(col => col !== column) // remove from others
      );
    });
  };

  const reclassifyColumns = async () => {
    if (!analysisData) return;

    setLoading(true);
    setError('');

    try {
      const request: ReclassifyColumnsRequest = {
        categorical_columns: reclassifiedCategoricalColumns,
        numerical_columns: reclassifiedNumericalColumns,
        time_columns: reclassifiedTimeColumns,
      };

      const response = await fetch(
        'http://localhost:8000/api/reclassify-columns',
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

      const data: AnalysisResponse = await response.json();
      setAnalysisData(data);
      setCurrentStep('select');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const performConcentrationAnalysis = async () => {
    if (
      selectedGroupByColumns.length === 0 ||
      selectedAggregateColumns.length === 0
    ) {
      setError(
        'Please select at least one group by column and one aggregate column'
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const request: ConcentrationAnalysisRequest = {
        group_by_columns: selectedGroupByColumns,
        aggregate_columns: selectedAggregateColumns,
      };

      const response = await fetch(
        'http://localhost:8000/api/concentration-analysis',
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

      const data: ConcentrationAnalysisResponse = await response.json();
      setConcentrationResults(data);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupByColumnToggle = (column: string) => {
    setSelectedGroupByColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const handleAggregateColumnToggle = (column: string) => {
    setSelectedAggregateColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const resetAnalysis = () => {
    setCurrentStep('upload');
    setAnalysisData(null);
    setConcentrationResults(null);
    setTimeAnalysisResults(null);
    setSelectedFile(null);
    setSelectedGroupByColumns([]);
    setSelectedAggregateColumns([]);
    setReclassifiedCategoricalColumns([]);
    setReclassifiedNumericalColumns([]);
    setError('');
  };

  const goBackToReclassify = () => {
    setCurrentStep('reclassify');
  };

  const goBackToColumnSelection = () => {
    setCurrentStep('select');
  };

  const handleTimeAnalysisResults = (
    results: TimeConcentrationAnalysisResponse
  ) => {
    setTimeAnalysisResults(results);
    setCurrentStep('time-results');
  };

  const goToTimeAnalysis = () => {
    setCurrentStep('time-analysis');
  };

  const goBackToTimeAnalysisSetup = () => {
    setCurrentStep('select');
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
          analysisData={analysisData}
          reclassifiedCategoricalColumns={reclassifiedCategoricalColumns}
          reclassifiedNumericalColumns={reclassifiedNumericalColumns}
          reclassifiedTimeColumns={reclassifiedTimeColumns}
          loading={loading}
          onColumnReclassification={handleColumnReclassification}
          onReclassify={reclassifyColumns}
          onReset={resetAnalysis}
        />
      )}

      {currentStep === 'select' && (
        <ColumnSelection
          analysisData={analysisData}
          selectedGroupByColumns={selectedGroupByColumns}
          selectedAggregateColumns={selectedAggregateColumns}
          loading={loading}
          onGroupByColumnToggle={handleGroupByColumnToggle}
          onAggregateColumnToggle={handleAggregateColumnToggle}
          onBackToReclassify={goBackToReclassify}
          onPerformAnalysis={performConcentrationAnalysis}
          onTimeAnalysis={goToTimeAnalysis}
        />
      )}

      {currentStep === 'results' && (
        <AnalysisResults
          concentrationResults={concentrationResults}
          onReset={resetAnalysis}
          onTryDifferentGroupings={goBackToColumnSelection}
        />
      )}

      {currentStep === 'time-analysis' && analysisData && (
        <TimeConcentrationAnalysis
          analysisData={analysisData}
          onResults={handleTimeAnalysisResults}
          onBack={goBackToTimeAnalysisSetup}
        />
      )}

      {currentStep === 'time-results' && timeAnalysisResults && (
        <TimeAnalysisResults
          results={timeAnalysisResults}
          onBack={goBackToTimeAnalysisSetup}
        />
      )}
    </div>
  );
}

export default App;
