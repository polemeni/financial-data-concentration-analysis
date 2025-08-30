# Financial Data Concentration Analysis

A web application for analyzing concentration patterns in financial data using Excel or CSV files.

## User Flow

The application follows a four-step process:

### Step 1: File Upload
- User uploads an Excel (.xlsx, .xls) or CSV file containing financial data
- The server analyzes the file and identifies numerical, categorical and time columns

### Step 2: Column Reclassification (Optional)
- User reviews automatically detected column types
- User can reclassify columns if needed (e.g., numerical codes that should be categorical)
- This step is crucial for data with mixed types like industry codes, region codes, etc.

### Step 3: Column Selection
- User selects which categorical columns to group by (e.g., Industry, Region, Company)
- User selects which time columns to group by (e.g., quarter, month, year, or a combination thereof)
- User selects which numerical columns to analyze for concentration (e.g., Revenue, Assets, Employees)
- User selects concentration buckets (e.g., 10, 20, 50)

### Step 4: Concentration Analysis Results
- The server performs concentration analysis and displays results in a tabular format
- User can go back and select different configurations, or upload a new file

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Docker Setup (Recommended)
```bash
docker-compose up --build
```

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



## License

MIT License - see LICENSE file for details.
