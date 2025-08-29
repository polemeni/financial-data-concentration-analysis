# Financial Data Concentration Analysis

A web application for analyzing concentration patterns in financial data using Excel or CSV files.

## User Flow

The application follows a four-step process:

### Step 1: File Upload
- User uploads an Excel (.xlsx, .xls) or CSV file containing financial data
- The server analyzes the file and identifies numerical and categorical columns
- Results are displayed showing the data structure and available columns

### Step 2: Column Reclassification (Optional)
- User reviews automatically detected column types
- User can reclassify columns if needed (e.g., numerical codes that should be categorical)
- This step is crucial for data with mixed types like industry codes, region codes, etc.
- Visual interface with toggle buttons for each column type

### Step 3: Column Selection
- User selects which categorical columns to group by (e.g., Industry, Region, Company)
- User selects which numerical columns to analyze for concentration (e.g., Revenue, Assets, Employees)
- The interface provides a clear visual selection with checkmarks for selected columns

### Step 4: Concentration Analysis Results
- The server performs concentration analysis and displays results in a tabular format
- Results include:
  - **Concentration Metrics**: Top 10/20/50 concentration percentages, Herfindahl Index, Gini Coefficient
  - **Detailed Aggregation**: Sum, count, mean, and standard deviation for each group
  - **Summary Statistics**: Total groups, selected columns, and overall metrics

## Features

- **Multi-step User Interface**: Clear progression through upload, reclassification, selection, and results
- **Real-time Column Detection**: Automatically identifies numerical vs categorical columns
- **Column Reclassification**: Allows users to override automatic column type detection
- **Interactive Analysis**: Try different groupings without restarting the entire process
- **Sortable Results**: Sort detailed aggregation tables by any column (categorical or numerical)
- **Comprehensive Concentration Metrics**: 
  - Top N concentration percentages
  - Herfindahl-Hirschman Index (HHI) for market concentration
  - Gini Coefficient for inequality measurement
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Clear error messages and validation
- **Data Validation**: Ensures selected columns exist in the dataset

## Technical Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computations
- **OpenPyXL**: Excel file support

### Frontend
- **React**: User interface framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast development server
- **CSS Grid/Flexbox**: Responsive layout

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup (Alternative)
```bash
docker-compose up --build
```

## API Endpoints

### POST /api/scan-file
Upload and analyze a file to get column information.

**Request**: Multipart form with file
**Response**: Column information including numerical and categorical columns

### POST /api/reclassify-columns
Reclassify columns based on user input.

**Request**: JSON with categorical_columns and numerical_columns arrays
**Response**: Updated column information

### POST /api/concentration-analysis
Perform concentration analysis with selected columns.

**Request**: JSON with group_by_columns and aggregate_columns arrays
**Response**: Concentration analysis results with metrics and aggregations

## Usage Example

1. **Upload File**: Select a CSV or Excel file with financial data
2. **Review Columns**: See automatically detected numerical and categorical columns
3. **Reclassify Columns** (if needed): 
   - Change column types if automatic detection is incorrect
   - Common examples: Industry codes, region codes, ID numbers that should be categorical
4. **Select Columns**: 
   - Choose categorical columns for grouping (e.g., "Industry_Code", "Region")
   - Choose numerical columns for analysis (e.g., "Revenue", "Assets")
5. **View Results**: 
   - Concentration metrics show how concentrated the data is
   - Detailed tables show aggregation results by group
   - Higher concentration percentages indicate more concentrated markets
   - **Try Different Groupings**: Click "Try Different Groupings" to experiment with different column selections without restarting
   - **Sortable Tables**: Click on any column header to sort the detailed results (alphabetical for categorical, numerical for metrics)

## Column Reclassification

The column reclassification feature is essential for datasets with mixed data types:

### Common Use Cases
- **Industry Codes**: Numerical codes (1001, 2001) that represent categories
- **Region Codes**: Numerical identifiers for geographical regions
- **ID Numbers**: Customer IDs, product codes that should be treated as categories
- **Mixed Text/Numbers**: Columns containing both text and numerical values

### How It Works
1. System automatically detects column types based on data content
2. User reviews the classification in Step 2
3. User can toggle between "Categorical" and "Numerical" for each column
4. Changes are applied before proceeding to analysis

## Concentration Metrics Explained

- **Top N Concentration**: Percentage of total value held by the top N groups
- **Herfindahl Index**: Sum of squared market shares (0-1, higher = more concentrated)
- **Gini Coefficient**: Measure of inequality (0-1, higher = more unequal)

## File Format Requirements

- **Supported Formats**: CSV, Excel (.xlsx, .xls)
- **Data Requirements**: 
  - At least one categorical column (text/object data type)
  - At least one numerical column (int/float data type)
  - No missing values in columns used for analysis

## Development

### Project Structure
```
financial-data-concentration-analysis/
├── backend/
│   ├── app/
│   │   ├── analyzer/
│   │   │   ├── analyzer.py      # Core analysis logic
│   │   │   ├── router.py        # API endpoints
│   │   │   └── schemas.py       # Pydantic models
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ColumnReclassification.tsx
│   │   │   ├── ColumnSelection.tsx
│   │   │   ├── AnalysisResults.tsx
│   │   │   ├── ErrorDisplay.tsx
│   │   │   └── index.ts         # Component exports
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── App.tsx              # Main React component
│   │   └── App.css              # Styles
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

### Component Architecture

The frontend is organized into reusable components:

- **FileUpload**: Handles file selection and upload
- **ColumnReclassification**: Manages column type reclassification
- **ColumnSelection**: Handles selection of columns for analysis
- **AnalysisResults**: Displays concentration analysis results
- **ErrorDisplay**: Shows error messages consistently

### Type Definitions

All TypeScript interfaces are centralized in `frontend/src/types/index.ts`:
- `AnalysisResponse`: API response for file analysis
- `ReclassifyColumnsRequest`: Column reclassification request
- `ConcentrationAnalysisRequest`: Analysis request parameters
- `ConcentrationAnalysisResponse`: Analysis results
- `AppStep`: Application step enumeration

### Adding New Metrics
To add new concentration metrics, modify the `_calculate_concentration` method in `backend/app/analyzer/analyzer.py`.

### Styling Changes
Modify `frontend/src/App.css` to update the visual design.

### Adding New Components
1. Create the component in `frontend/src/components/`
2. Add proper TypeScript interfaces
3. Export from `frontend/src/components/index.ts`
4. Import and use in `App.tsx`

## License

MIT License - see LICENSE file for details.
