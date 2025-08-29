from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from .analyzer import Analyzer

router = APIRouter()


@router.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    """
    Analyze an uploaded financial data file.
    
    Args:
        file: The uploaded file to analyze
        
    Returns:
        dict: Analysis results
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
        
        # Perform analysis
        results = analyzer.analyze()
        
        return JSONResponse(content=results)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
