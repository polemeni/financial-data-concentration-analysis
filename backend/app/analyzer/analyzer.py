import pandas as pd
import io
from fastapi import UploadFile


class Analyzer:
    """
    Service class for analyzing financial data from uploaded files.
    """
    
    def __init__(self, uploaded_file: UploadFile):
        """
        Initialize the Analyzer with an uploaded file.
        
        Args:
            uploaded_file: The uploaded file object from FastAPI
        """
        self.uploaded_file = uploaded_file
        self.df = self._build_dataframe()
    
    def analyze(self):
        """
        Analyze the loaded data.
        Currently does nothing as requested.
        
        Returns:
            dict: Analysis results (empty for now)
        """
        return self._detect_schemas()
        # self._normalize_data()
        # self._perform_concentration_analysis()

    # ================ PRIVATE METHODS ================
    def _build_dataframe(self) -> pd.DataFrame:
        """
        Load the uploaded file into a pandas DataFrame.
        Supports Excel (.xlsx, .xls) and CSV files.
        """
        try:
            # Read the file content
            file_content = self.uploaded_file.file.read()
            
            # Determine file type and load accordingly
            filename = self.uploaded_file.filename.lower()

            print(f"Filename: {filename}")
            
            if filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(io.BytesIO(file_content))
            elif filename.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file type: {filename}")
            
            return df
                
        except Exception as e:
            raise ValueError(f"Error loading file: {str(e)}")

    def _detect_schemas(self):
        """
        Determines data type of each column in the data.
        """

        numerical_columns = self.df.select_dtypes(include=['int', 'float', 'float64']).columns
        categorical_columns = self.df.select_dtypes(include=['object']).columns

        # Convert categorical columns to string type for better memory usage
        self.df[categorical_columns] = self.df[categorical_columns].astype(str)

        print(f"Numerical columns: {numerical_columns}")
        print(f"Categorical columns: {categorical_columns}")

        return {
            "message": "Schema detection completed",
            "data_shape": list(self.df.shape),
            "columns": list(self.df.columns),
            "numerical_columns": list(numerical_columns),
            "categorical_columns": list(categorical_columns)
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
