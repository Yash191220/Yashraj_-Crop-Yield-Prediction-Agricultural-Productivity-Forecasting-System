import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

CATEGORICAL_FEATURES = ['region', 'crop', 'season', 'soil_type', 'irrigation_type']
NUMERICAL_FEATURES = [
    'area_hectares', 'rainfall_mm', 'temperature_celsius', 
    'humidity_percent', 'soil_ph', 'nitrogen_n', 
    'phosphorus_p', 'potassium_k', 'organic_matter_percent'
]
TARGET_FEATURE = 'yield_kg_per_ha'

def get_preprocessor():
    """Returns standard ColumnTransformer for pre-processing tabular data."""
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    return preprocessor

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans missing values and standardizes column names."""
    df = df.copy()
    # Fill numeric NaNs with median
    for col in NUMERICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
    
    # Fill categorical NaNs with mode
    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
            
    return df
