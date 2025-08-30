# Financial Data Concentration Analysis

A web application for analyzing concentration patterns in financial data using Excel or CSV files.

## User Flow

The application follows a four-step process:

### Step 1: File Upload
- User uploads an Excel (.xlsx, .xls) or CSV file containing financial data
- The server analyzes the file and identifies numerical, categorical and time columns
<img width="537" height="258" alt="Pasted Graphic" src="https://github.com/user-attachments/assets/778fb0f2-784b-4920-80cf-2639b1cf0f04" />

### Step 2: Column Reclassification (Optional)
- User reviews automatically detected column types
- User can reclassify columns if needed (e.g., numerical codes that should be categorical)
- This step is crucial for data with mixed types like industry codes, region codes, etc.
<img width="335" height="536" alt="Pasted Graphic 1" src="https://github.com/user-attachments/assets/a9c265ad-98fd-454e-85da-68a3baee9d3e" />

### Step 3: Column Selection
- User selects which categorical columns to group by (e.g., Industry, Region, Company)
- User selects which time columns to group by (e.g., quarter, month, year, or a combination thereof)
- User selects which numerical columns to analyze for concentration (e.g., Revenue, Assets, Employees)
- User selects concentration buckets (e.g., 10, 20, 50)
<img width="576" height="454" alt="Pasted Graphic 3" src="https://github.com/user-attachments/assets/15c27d1c-3048-41f1-942c-5b730e3c8c52" />


### Step 4: Concentration Analysis Results
- The server performs concentration analysis and displays results in a tabular format
- User can go back and select different configurations, or upload a new file
<img width="577" height="436" alt="Pasted Graphic 4" src="https://github.com/user-attachments/assets/d61b1d5e-10c6-4cee-b980-7c1be3fc696d" />

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

## Project Success Criteria, Gaps & Future Work

This project aims to meet four key success criteria for data workflows. Below is an analysis of current gaps and future work for improvement.

### 1. **Organize** Data Workflows for Clarity, Consistency, and Reusability

**Current State:**
- Basic workflow exists: file upload → column detection → reclassification → analysis
- Single `Analyzer` class handles all transformations
- Global variable `_current_analyzer` for session management

**Identified Gaps:**
- **No reusable transformation pipeline**: Each analysis step is tightly coupled and cannot be shared across multiple users
- **No intermediate data persistence**: There is no long-term storage for results and transformations
- **No workflow templates**: No standardized patterns for common analysis types

**Future Work:**
- Create and save reusable transformation components
- Add workflow versioning and templates
- Implement intermediate data persistence

### 2. **Standardize** Data Storage and Retrieval for Analyses

**Current State:**
- In-memory storage only using global variables
- No persistent data storage layer
- File uploads are processed but not stored
- Analysis results are returned but not cached

**Identified Gaps:**
- **No data persistence layer**: No database or file system storage for uploaded files or results
- **No data versioning**: No way to track different versions of the same dataset
- **No data lineage tracking**: No way to trace how data flows through transformations

**Future Work:**
- Implement database storage (e.g. S3, PostgreSQL, MongoDB) for files and results
- Add data versioning and lineage tracking

### 3. **Document** Transformations for Review, Onboarding, and Audit

**Current State:**
- Basic docstrings in the `Analyzer` class
- README with user flow description
- Some inline comments

**Identified Gaps:**
- **No transformation documentation**: No detailed documentation of what each transformation does
- **No data lineage documentation**: No way to trace data flow through the system
- **No audit trail**: No logging of who performed what analysis when
- **No transformation metadata**: No way to track parameters, versions, or dependencies
- **No onboarding documentation**: No guides for new developers or users
- **No API documentation**: No comprehensive API docs beyond basic README

**Future Work:**
- Create comprehensive transformation documentation
- Implement audit logging and data lineage tracking
- Add transformation metadata and versioning
- Develop onboarding guides and comprehensive API documentation

### 4. **Maintain** Transformations at Scale with Extensibility, Testability, and Reliability

**Current State:**
- Single monolithic `Analyzer` class
- No test files or testing framework
- No error handling beyond basic try/catch
- No configuration management
- No monitoring or observability

**Identified Gaps:**
- **No testing infrastructure**: Zero test files, no unit tests, integration tests, or test data
- **No modular architecture**: All logic in one class makes it hard to extend or maintain
- **No configuration management**: Hard-coded values and no environment-specific configs
- **No error handling strategy**: Basic error handling without proper logging or recovery
- **No monitoring/observability**: No metrics, logging, or health checks
- **No dependency management**: No clear separation of concerns or dependency injection
- **No performance optimization**: No caching, pagination, or optimization strategies (e.g. converting large Excel files into Parquet files)
- **No security considerations**: No input validation, rate limiting, or access controls

**Future Work:**
- Implement comprehensive testing framework (pytest)
- Refactor into modular architecture with dependency injection
- Add configuration management and environment-specific settings
- Implement proper error handling, logging, and monitoring
- Add performance optimization and security measures

