import pandas as pd
from typing import Optional
import io


class Analyzer:
    """
    Service class for analyzing financial data from uploaded files.
    """
    
    def __init__(self, uploaded_file):
        """
        Initialize the Analyzer with an uploaded file.
        
        Args:
            uploaded_file: The uploaded file object from FastAPI
        """
        self.uploaded_file = uploaded_file
        self.data: Optional[pd.DataFrame] = None
        #self._load_data()
    
    def _load_data(self):
        """
        Load the uploaded file into a pandas DataFrame.
        Supports Excel (.xlsx, .xls) and CSV files.
        """
        try:
            # Read the file content
            file_content = self.uploaded_file.file.read()
            
            # Determine file type and load accordingly
            filename = self.uploaded_file.filename.lower()
            
            if filename.endswith(('.xlsx', '.xls')):
                self.data = pd.read_excel(io.BytesIO(file_content))
            elif filename.endswith('.csv'):
                self.data = pd.read_csv(io.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file type: {filename}")
                
        except Exception as e:
            raise ValueError(f"Error loading file: {str(e)}")
    
    def analyze(self):
        """
        Analyze the loaded data.
        Currently does nothing as requested.
        
        Returns:
            dict: Analysis results (empty for now)
        """
        self._detect_schemas()
        self._normalize_data()
        self._perform_concentration_analysis()

    # ================ PRIVATE METHODS ================
    def _detect_schemas(self):
        """
        Determines data type of each column in the data.
        """
        # TODO: Implement actual schema detection logic
        return {
            "message": "Schema detection completed",
            "schema": self.data.dtypes.to_dict()
        }
    
    def _normalize_data(self):
        """
        Normalizes the data to a common format.
        """
        # TODO: Implement actual normalization logic
        return {
            "message": "Data normalization completed",
            "normalized_data": self.data.to_dict()
        }
    
    def _perform_concentration_analysis(self):
        """
        Performs concentration analysis on the data.
        """
        # TODO: Implement actual concentration analysis logic
        return {
            "message": "Concentration analysis completed",
            "concentration_analysis": self.data.to_dict()
        }
