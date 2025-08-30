from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from fastapi import UploadFile

class AnalysisRequest(BaseModel):
    file: UploadFile

class ScanFileResponse(BaseModel):
    results: dict

class ConcentrationAnalysisRequest(BaseModel):
    group_by_columns: List[str]
    aggregate_columns: List[str]

class ConcentrationAnalysisResponse(BaseModel):
    results: List[Dict[str, Any]]
    summary: Dict[str, Any]

class TimeConcentrationAnalysisRequest(BaseModel):
    time_columns: List[str]
    aggregate_columns: List[str]
    concentration_buckets: Optional[List[int]] = [10, 20, 50]

class TimeConcentrationAnalysisResponse(BaseModel):
    time_periods: List[str]
    concentration_data: Dict[str, List[Dict[str, Any]]]
    summary: Dict[str, Any]

class ReclassifyColumnsRequest(BaseModel):
    categorical_columns: List[str]
    numerical_columns: List[str]
    time_columns: List[str]