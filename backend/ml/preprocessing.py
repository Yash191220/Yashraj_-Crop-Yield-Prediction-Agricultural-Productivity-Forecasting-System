import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

CATEGORICAL_FEATURES = ['region', 'crop', 'season', 'soil_type', 'irrigation_type']
BASE_NUMERICAL_FEATURES = [
    'area_hectares', 'rainfall_mm', 'temperature_celsius', 
    'humidity_percent', 'soil_ph', 'nitrogen_n', 
    'phosphorus_p', 'potassium_k', 'organic_matter_percent'
]
ENGINEERED_FEATURES = [
    'rainfall_per_temp', 'npk_sum', 'n_p_ratio', 'ph_deviation', 'temp_humidity_index'
]
NUMERICAL_FEATURES = BASE_NUMERICAL_FEATURES + ENGINEERED_FEATURES

TARGET_FEATURE = 'yield_kg_per_ha'

def get_preprocessor():
    """Returns ColumnTransformer for feature scaling and encoding."""
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), NUMERICAL_FEATURES),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    return preprocessor

def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans missing values, calculates engineered features, and filters extreme outliers."""
    df = df.copy()
    
    # Fill numeric NaNs with median
    for col in BASE_NUMERICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())
        else:
            df[col] = 0.0
    
    # Fill categorical NaNs with mode
    for col in CATEGORICAL_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
        else:
            df[col] = 'Unknown'

    # Advanced Feature Engineering
    df['rainfall_per_temp'] = df['rainfall_mm'] / (df['temperature_celsius'].abs() + 1.0)
    df['npk_sum'] = df['nitrogen_n'] + df['phosphorus_p'] + df['potassium_k']
    df['n_p_ratio'] = df['nitrogen_n'] / (df['phosphorus_p'] + 1.0)
    df['ph_deviation'] = (df['soil_ph'] - 6.8).abs()
    df['temp_humidity_index'] = df['temperature_celsius'] * (df['humidity_percent'] / 100.0)

    # Filter invalid target rows and extreme 99.5th percentile outliers for cleaner convergence
    if TARGET_FEATURE in df.columns:
        upper_limit = df[TARGET_FEATURE].quantile(0.995)
        df = df[(df[TARGET_FEATURE] > 50) & (df[TARGET_FEATURE] <= upper_limit)]

    return df
