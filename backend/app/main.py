from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.analyzer.router import router as analyzer_router

app = FastAPI(title="Financial Data Concentration Analysis Backend")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the API routes
app.include_router(analyzer_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Financial Data Concentration Analysis API"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI backend running!"}


