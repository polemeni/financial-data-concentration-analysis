import pandas as pd
import io
from fastapi import UploadFile
from typing import List, Dict, Any, Tuple, Union
from .constants import COMMON_TIME_COLUMNS, DEFAULT_CONCENTRATION_BUCKETS

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
        self.categorical_columns = []
        self.numerical_columns = []
        self.time_columns = []
    
    def scan_file(self):
        """
        Analyze the loaded data and return column information.
        
        Returns:
            dict: Column information including numerical and categorical columns
        """
        # Clean data
        self._clean_data()
        # TODO: Perform anomaly detection
        # self._detect_anomalies()
        schemas = self._identify_schemas()
        return schemas
    
    def reclassify_columns(self, 
        reclassify_categorical_columns: List[str], 
        reclassify_numerical_columns: List[str], 
        reclassify_time_columns: List[str]
    ) -> Dict[str, Any]:
        """
        Reclassify columns based on user input.
        
        Args:
            categorical_columns: List of columns to treat as categorical
            numerical_columns: List of columns to treat as numerical
            
        Returns:
            dict: Updated column information.
        """
        try:
            # Validate that all columns exist in the dataset
            all_columns = set(self.df.columns)
            
            for col in reclassify_categorical_columns + reclassify_numerical_columns + reclassify_time_columns:
                if col not in all_columns:
                    raise ValueError(f"Column '{col}' not found in dataset")
            
            # Check for overlapping columns
            overlap = set(reclassify_categorical_columns) & set(reclassify_numerical_columns) & set(reclassify_time_columns)
            if overlap:
                raise ValueError(f"Columns cannot be both categorical and numerical: {list(overlap)}")
            
            # Update the column classifications
            self.categorical_columns = reclassify_categorical_columns
            self.numerical_columns = reclassify_numerical_columns
            self.time_columns = reclassify_time_columns
            # Convert categorical columns to string type for better memory usage
            if reclassify_categorical_columns:
                self._convert_object_datatype_to_string()
            
            # Return updated schema information
            return self._get_schema_info()
            
        except Exception as e:
            raise ValueError(f"Error reclassifying columns: {str(e)}")

    def perform_time_concentration_analysis(
        self, 
        time_columns: List[str], 
        aggregate_columns: List[str], 
        concentration_buckets: List[int] = None
    ) -> Dict[str, Any]:
        """
        Perform concentration analysis over time periods.
        
        Args:
            time_columns: List of time columns to group by
            aggregate_columns: List of numerical columns to aggregate
            concentration_buckets: List of concentration percentages (e.g., [10, 20, 50])
            
        Returns:
            dict: Time-based concentration analysis results
        """
        try:
            # Validate input columns
            self._validate_columns(time_columns, aggregate_columns)
            
            # Use default buckets if none provided
            if concentration_buckets is None:
                concentration_buckets = DEFAULT_CONCENTRATION_BUCKETS
            
            # Perform the time-based concentration analysis
            results = self._calculate_time_concentration(time_columns, aggregate_columns, concentration_buckets)
            
            return results
            
        except Exception as e:
            raise ValueError(f"Error in time concentration analysis: {str(e)}")

    # ================ PRIVATE METHODS ================
    def _clean_data(self) -> None:
        """
        Clean the data.
        """
        self.df = self.df.dropna()
    
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

    def _identify_schemas(self) -> Dict[str, Any]:
        """
        Determines data type of each column in the data.
        """

        numerical_columns_set: set[str] = set(self.df.select_dtypes(include=['int', 'float', 'float64']).columns)
        categorical_columns_set: set[str] = set(self.df.select_dtypes(include=['object']).columns)
        time_columns_set: set[str] = set(self.df.select_dtypes(include=['datetime']).columns)

        # Some time columns are not detected as datetime.
        # See if any of the common time column names are present and 
        # re-classify them as time columns.
        for col in self.df.columns:
            if col.lower() in COMMON_TIME_COLUMNS:
                time_columns_set.add(col)
                if col in categorical_columns_set:
                    categorical_columns_set.remove(col)
                if col in numerical_columns_set:
                    numerical_columns_set.remove(col)

        self.numerical_columns = list(numerical_columns_set)
        self.categorical_columns = list(categorical_columns_set)
        self.time_columns = list(time_columns_set)

        self._convert_object_datatype_to_string()

        return self._get_schema_info()

    def _get_schema_info(self) -> Dict[str, Any]:
        """
        Returns the current schema information.
        """
        return {
            "message": "Schema detection completed",
            "data_shape": list(self.df.shape),
            "columns": list(self.df.columns),
            "numerical_columns": list(self.numerical_columns),
            "categorical_columns": list(self.categorical_columns),
            "time_columns": list(self.time_columns)
        }
    
    def _convert_object_datatype_to_string(self) -> None:
        """
        Convert object datatype to string for better memory usage.
        """
        try: 
            self.df[self.categorical_columns] = self.df[self.categorical_columns].astype(str)
        except Exception as e:
            print(f"Error converting categorical columns to string: {str(e)}")
    
    def _validate_columns(
        self, 
        group_by_columns: List[str], 
        aggregate_columns: List[str]
    ) -> None:
        """
        Validate that the provided columns exist in the dataset.
        """
        all_columns = set(self.df.columns)
        
        for col in group_by_columns:
            if col not in all_columns:
                raise ValueError(f"Group by column '{col}' not found in dataset")
        
        for col in aggregate_columns:
            if col not in all_columns:
                raise ValueError(f"Aggregate column '{col}' not found in dataset")
    

    def _calculate_time_concentration(
        self, 
        time_columns: List[str], 
        aggregate_columns: List[str], 
        concentration_buckets: List[int]
    ) -> Dict[str, Any]:
        """
        Calculate concentration analysis over time periods.
        """
        df = self.df.copy()

        # Step 0: Clean data - normalize time columns
        df = self._normalize_time_columns(df, time_columns)

        # Step 1: Build canonical time period column
        time_period_col = self._build_time_period_column(df, time_columns)

        # Step 2: Group by time period
        grouped = df.groupby(time_period_col)

        # Step 3: Calculate concentration data
        concentration_data, time_periods = self._calculate_concentration_for_groups(
            grouped, aggregate_columns, concentration_buckets
        )

        # Step 4: Chronologically sort + format time periods
        time_periods = self._sort_time_periods(time_periods)

        return {
            "time_periods": time_periods,
            "concentration_data": concentration_data,
            "time_columns": time_columns,
            "aggregate_columns": aggregate_columns,
            "concentration_buckets": concentration_buckets,
            "total_periods": len(time_periods),
        }

    def _normalize_time_columns(self, df: pd.DataFrame, time_columns: List[str]) -> pd.DataFrame:
        """Normalize time columns."""

        # Add leading zeros to single digit months and days
        for col in time_columns:
            if col in df.columns:
                df[col] = df[col].astype(str)
                df[col] = df[col].str.zfill(2)
        return df

    def _build_time_period_column(self, df: pd.DataFrame, time_columns: List[str]) -> str:
        """Create a time period column from one or more time columns."""

        # If there is only one time column, use it as the time period column
        if len(time_columns) == 1:
            col = time_columns[0]
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                df[col] = df[col].dt.strftime("%Y-%m-%d")
            else:
                df[col] = df[col].astype(str)
            return col

        # Multiple columns → join into string like "2020_1" or "2020_Q1"
        df["_time_period"] = df[time_columns].apply(
            lambda row: "_".join(str(row[col]) for col in time_columns),
            axis=1,
        )
        return "_time_period"

    def _calculate_concentration_for_groups(
        self,
        grouped: pd.core.groupby.DataFrameGroupBy,
        aggregate_columns: List[str],
        concentration_buckets: List[int],
    ) -> Tuple[Dict[str, List[Dict[str, Any]]], List[str]]:
        """Calculate concentration for each group of time period."""
        concentration_data = {}
        time_periods = []

        for agg_col in aggregate_columns:
            concentration_data[agg_col] = []

            for time_period, group_data in grouped:
                if time_period not in time_periods:
                    time_periods.append(time_period)

                total_value = group_data[agg_col].sum()
                total_count = len(group_data)
                if total_value <= 0:
                    continue

                sorted_data = group_data.sort_values(agg_col, ascending=False)

                period_data = {
                    "time_period": str(time_period),
                    "total_value": float(total_value),
                    "total_count": int(total_count),
                }

                for bucket in concentration_buckets:
                    bucket_count = max(1, int((bucket / 100) * total_count))
                    bucket_value = sorted_data[agg_col].head(bucket_count).sum()
                    bucket_pct = (bucket_value / total_value * 100) if total_value > 0 else 0

                    period_data[f"top_{bucket}%_value"] = float(bucket_value)
                    period_data[f"top_{bucket}%_count"] = int(bucket_count)
                    period_data[f"top_{bucket}%_percentage"] = float(bucket_pct)

                concentration_data[agg_col].append(period_data)

        return concentration_data, time_periods

    # TODO: Create a more robust sorting function
    def _sort_time_periods(self, time_periods: List[str]) -> List[str]:
        """Sort time periods chronologically"""
        return sorted(time_periods)

 