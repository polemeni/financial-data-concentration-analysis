from pydantic import BaseModel
from fastapi import UploadFile

class AnalysisRequest(BaseModel):
    file: UploadFile

class AnalysisResponse(BaseModel):
    results: dict