import pandas as pd
import io
from fastapi import UploadFile
from typing import List, Dict, Any
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
    
    def _calculate_time_concentration(self, time_columns: List[str], aggregate_columns: List[str], concentration_buckets: List[int]) -> Dict[str, Any]:
        """
        Calculate concentration analysis over time periods.
        """
        # Create a copy of the dataframe to work with
        df_work = self.df.copy()
        
        # Convert time columns to datetime if they aren't already
        for col in time_columns:
            if col in df_work.columns:
                try:
                    # Only convert to datetime if it's not already a string and looks like a date
                    if df_work[col].dtype == 'object':
                        # Check if the column contains date-like strings (but not quarter strings like "Q1-2020")
                        sample_values = df_work[col].dropna().head()
                        if len(sample_values) > 0:
                            # Skip conversion if it looks like quarter format (Q1-2020, Q2-2021, etc.)
                            if not any(str(val).startswith('Q') and '-' in str(val) for val in sample_values):
                                # Only convert if it looks like a real date
                                if any('/' in str(val) or (len(str(val)) == 10 and '-' in str(val)) for val in sample_values):
                                    df_work[col] = pd.to_datetime(df_work[col], errors='coerce')
                except Exception as e:
                    print(f"Warning: Could not convert column {col} to datetime: {str(e)}")
        
        # Create combined time period column
        time_period_col = '_time_period'
        if len(time_columns) == 1:
            # For single time column, use the original column value
            col = time_columns[0]
            if pd.api.types.is_datetime64_any_dtype(df_work[col]):
                # If it's already datetime, format it nicely
                df_work[time_period_col] = df_work[col].dt.strftime('%Y-%m-%d')
            else:
                # Otherwise, convert to string - handle categorical columns
                if df_work[col].dtype.name == 'category':
                    df_work[time_period_col] = df_work[col].astype(str)
                else:
                    df_work[time_period_col] = df_work[col].astype(str)
        else:
            # Combine multiple time columns into a single period
            df_work[time_period_col] = df_work[time_columns].apply(
                lambda row: '_'.join([str(row[col]) for col in time_columns if pd.notna(row[col])]), 
                axis=1
            )
        
        # Remove rows where time period is null
        df_work = df_work.dropna(subset=[time_period_col])
        
        # Group by time period
        grouped = df_work.groupby(time_period_col)
        
        # Calculate concentration for each time period and aggregate column
        concentration_data = {}
        time_periods = []
        
        for agg_col in aggregate_columns:
            concentration_data[agg_col] = []
            
            for time_period, group_data in grouped:
                if time_period not in time_periods:
                    time_periods.append(time_period)
                
                # Calculate total for this time period
                total_value = group_data[agg_col].sum()
                total_count = len(group_data)
                
                if total_value <= 0:
                    # Skip periods with no data
                    continue
                
                # Sort by the aggregate column in descending order
                sorted_data = group_data.sort_values(agg_col, ascending=False)
                
                # Calculate concentration for each bucket
                period_concentration = {
                    'time_period': str(time_period),
                    'total_value': float(total_value),
                    'total_count': int(total_count)
                }
                
                for bucket in concentration_buckets:
                    # Calculate how many items represent this percentage
                    bucket_count = max(1, int((bucket / 100) * total_count))
                    bucket_value = sorted_data[agg_col].head(bucket_count).sum()
                    bucket_percentage = (bucket_value / total_value * 100) if total_value > 0 else 0
                    
                    period_concentration[f'top_{bucket}%_value'] = float(bucket_value)
                    period_concentration[f'top_{bucket}%_count'] = int(bucket_count)
                    period_concentration[f'top_{bucket}%_percentage'] = float(bucket_percentage)
                
                concentration_data[agg_col].append(period_concentration)
        
        # Sort time periods chronologically if possible
        try:
            # Try to sort chronologically by parsing the time periods
            def parse_time_period(period_str):
                """Parse time period string to get a sortable value"""
                period_str = str(period_str)
                
                # Handle quarter format: Q1-2020, Q2-2021, etc.
                if period_str.startswith('Q') and '-' in period_str:
                    quarter, year = period_str.split('-')
                    quarter_num = int(quarter[1])  # Extract number from Q1, Q2, etc.
                    return (int(year), quarter_num)
                
                # Handle year_month format: 2020_1, 2020_10, etc.
                if '_' in period_str:
                    try:
                        year, month = period_str.split('_')
                        return (int(year), int(month))
                    except:
                        pass
                
                # Handle year-month format: 2020-01, 2020-10, etc.
                if '-' in period_str and len(period_str) >= 7:
                    try:
                        year, month = period_str.split('-')[:2]
                        return (int(year), int(month))
                    except:
                        pass
                
                # Handle year format: 2020, 2021, etc.
                try:
                    return (int(period_str), 0)
                except:
                    pass
                
                # Fallback to string sorting
                return period_str
            
            # Sort using the parsing function
            time_periods.sort(key=parse_time_period)
        except Exception as e:
            # If sorting fails, keep original order
            print(f"Warning: Could not sort time periods chronologically: {str(e)}")
            pass
        
        # Format time periods for better display
        def format_time_period(period_str):
            """Format time period string for better display"""
            period_str = str(period_str)
            
            # Handle year_month format: 2020_1, 2020_10, etc.
            if '_' in period_str:
                try:
                    year, month = period_str.split('_')
                    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    month_name = month_names[int(month) - 1]
                    return f"{month_name} {year}"
                except:
                    pass
            
            # Handle quarter format: Q1-2020, Q2-2021, etc.
            if period_str.startswith('Q') and '-' in period_str:
                return period_str  # Keep as is, it's already readable
            
            # Handle year-month format: 2020-01, 2020-10, etc.
            if '-' in period_str and len(period_str) >= 7:
                try:
                    year, month = period_str.split('-')[:2]
                    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    month_name = month_names[int(month) - 1]
                    return f"{month_name} {year}"
                except:
                    pass
            
            # Return as is for other formats
            return period_str
        
        formatted_time_periods = [format_time_period(tp) for tp in time_periods]
        
        return {
            "time_periods": formatted_time_periods,
            "concentration_data": concentration_data,
            "time_columns": time_columns,
            "aggregate_columns": aggregate_columns,
            "concentration_buckets": concentration_buckets,
            "total_periods": len(time_periods)
        }