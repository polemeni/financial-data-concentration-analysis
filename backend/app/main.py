from fastapi import FastAPI

app = FastAPI(title="Finance POC Backend")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "FastAPI backend running!"}
