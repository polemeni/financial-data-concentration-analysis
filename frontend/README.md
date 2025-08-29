# Financial Data Concentration Analysis - Frontend

This is the frontend application for the Financial Data Concentration Analysis project. It's built with React, TypeScript, and Vite.

## Features

- File upload interface for Excel (.xlsx, .xls) and CSV files
- Real-time analysis results display
- Responsive design with modern UI
- Error handling and loading states

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000`:

- **POST** `/api/analyze` - Upload and analyze financial data files
- **GET** `/health` - Health check endpoint

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:5173`

### Build

To build for production:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## Backend Compatibility

This frontend is designed to work with the FastAPI backend that provides:
- File upload and analysis endpoints
- CORS configuration for localhost:5173
- Support for Excel and CSV file formats

Make sure the backend is running on `http://localhost:8000` before using the frontend.
