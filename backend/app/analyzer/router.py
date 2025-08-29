from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from .analyzer import Analyzer
from .schemas import ConcentrationAnalysisRequest, ReclassifyColumnsRequest, TimeConcentrationAnalysisRequest


router = APIRouter()

# Global storage for analyzer instances (in production, use proper session management)
_current_analyzer = None

@router.post("/scan-file")
async def scan_file(file: UploadFile = File(...)):
    """
    Parse an uploaded financial data file and return column information.
    
    Args:
        file: The uploaded file to parse
        
    Returns:
        dict: Column information including numerical and categorical columns
    """
    try:
        # Validate file type
        allowed_extensions = ['.xlsx', '.xls', '.csv']
        if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Create Analyzer instance with the uploaded file
        analyzer = Analyzer(file)
        
        # Perform initial analysis to get column information
        results = analyzer.scan_file()
        
        # Store analyzer instance for later use
        global _current_analyzer
        _current_analyzer = analyzer
        
        # Add file key to results for frontend to use in subsequent requests
        results["file_key"] = file.filename
        
        return JSONResponse(content=results)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/reclassify-columns")
async def reclassify_columns(request: ReclassifyColumnsRequest):
    """
    Reclassify columns based on user input.
    
    Args:
        request: ReclassifyColumnsRequest containing categorical_columns and numerical_columns
        
    Returns:
        dict: Updated column information
    """
    try:
        # Use the stored analyzer instance
        global _current_analyzer
        if _current_analyzer is None:
            raise HTTPException(
                status_code=400, 
                detail="No file has been uploaded. Please upload a file first."
            )
        
        analyzer = _current_analyzer
        
        # Perform column reclassification
        results = analyzer.reclassify_columns(
            request.categorical_columns, 
            request.numerical_columns,
            request.time_columns
        )
        
        return JSONResponse(content=results)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/concentration-analysis")
async def perform_concentration_analysis(request: ConcentrationAnalysisRequest):
    """
    Perform concentration analysis based on user column selections.
    
    Args:
        request: ConcentrationAnalysisRequest containing group_by_columns and aggregate_columns
        
    Returns:
        dict: Concentration analysis results
    """
    try:
        # Use the stored analyzer instance
        global _current_analyzer
        if _current_analyzer is None:
            raise HTTPException(
                status_code=400, 
                detail="No file has been uploaded. Please upload a file first."
            )
        
        analyzer = _current_analyzer
        
        # Perform concentration analysis
        results = analyzer.perform_concentration_analysis(
            request.group_by_columns, 
            request.aggregate_columns
        )
        
        return JSONResponse(content=results)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/time-concentration-analysis")
async def perform_time_concentration_analysis(request: TimeConcentrationAnalysisRequest):
    """
    Perform concentration analysis over time periods.
    
    Args:
        request: TimeConcentrationAnalysisRequest containing time_columns, aggregate_columns, and concentration_buckets
        
    Returns:
        dict: Time-based concentration analysis results
    """
    try:
        # Use the stored analyzer instance
        global _current_analyzer
        if _current_analyzer is None:
            raise HTTPException(
                status_code=400, 
                detail="No file has been uploaded. Please upload a file first."
            )
        
        analyzer = _current_analyzer
        
        # Perform time-based concentration analysis
        results = analyzer.perform_time_concentration_analysis(
            request.time_columns, 
            request.aggregate_columns,
            request.concentration_buckets
        )
        
        return JSONResponse(content=results)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
