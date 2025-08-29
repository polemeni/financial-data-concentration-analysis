# Financial Data Concentration Analysis

A monorepo containing a FastAPI backend and React frontend for financial data analysis.

## Docker Development Setup

This project is containerized for easy local development using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/polemeni/financial-data-concentration-analysis
   cd financial-data-concentration-analysis
   ```

2. **Start all services**

   ```bash
   docker-compose up --build
   ```

3. **Access the applications**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - Backend Health Check: http://localhost:8000/api/health

### Development Workflow

- **Backend**: The FastAPI service runs on port 8000 with auto-reload enabled
- **Frontend**: The React app runs on port 5173 with Vite dev server
- **Hot Reload**: Both services support hot reloading for development
- **Volumes**: Source code is mounted as volumes, so changes are reflected immediately

### Useful Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build

# View running containers
docker-compose ps
```

### Service Details

- **Backend**: Python 3.11 + FastAPI + Uvicorn
- **Frontend**: Node.js 20 + React + Vite
- **Network**: Services communicate via internal Docker network

### Troubleshooting

- If you encounter permission issues, ensure Docker has proper access to your project directory
- For port conflicts, modify the port mappings in `docker-compose.yml`
- To reset everything: `docker-compose down -v && docker-compose up --build`
