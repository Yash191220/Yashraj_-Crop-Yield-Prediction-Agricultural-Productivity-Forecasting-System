import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer

# ===========================
# Feature Lists
# ===========================

CATEGORICAL_FEATURES = [
    'region',
    'crop',
    'season',
    'soil_type',
    'irrigation_type'
]

BASE_NUMERICAL_FEATURES = [
    'area_hectares',
    'rainfall_mm',
    'temperature_celsius',
    'humidity_percent',
    'soil_ph',
    'nitrogen_n',
    'phosphorus_p',
    'potassium_k',
    'organic_matter_percent'
]

ENGINEERED_FEATURES = [
    'rainfall_per_temp',
    'npk_sum',
    'n_p_ratio',
    'ph_deviation',
    'temp_humidity_index',
    'fertility_index',
    'soil_quality',
    'rainfall_sq',
    'temperature_sq'
]

NUMERICAL_FEATURES = BASE_NUMERICAL_FEATURES + ENGINEERED_FEATURES

TARGET_FEATURE = "yield_kg_per_ha"


# ===========================
# Preprocessor
# ===========================

def get_preprocessor():

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                NUMERICAL_FEATURES
            ),
            (
                "cat",
                OneHotEncoder(
                    handle_unknown="ignore",
                    sparse_output=False
                ),
                CATEGORICAL_FEATURES
            )
        ]
    )

    return preprocessor


# ===========================
# Dataset Cleaning
# ===========================

def clean_dataset(df: pd.DataFrame):

    df = df.copy()

    # -----------------------
    # Remove duplicate rows
    # -----------------------

    df.drop_duplicates(inplace=True)

    # -----------------------
    # Numerical Missing Values
    # -----------------------

    for col in BASE_NUMERICAL_FEATURES:

        if col not in df.columns:
            df[col] = 0

        df[col] = pd.to_numeric(df[col], errors="coerce")
        df[col] = df[col].fillna(df[col].median())

    # -----------------------
    # Categorical Missing Values
    # -----------------------

    for col in CATEGORICAL_FEATURES:

        if col not in df.columns:
            df[col] = "Unknown"

        df[col] = df[col].fillna("Unknown")

    # ==================================================
    # Feature Engineering
    # ==================================================

    df["rainfall_per_temp"] = (
        df["rainfall_mm"] /
        (df["temperature_celsius"].abs() + 1)
    )

    df["npk_sum"] = (
        df["nitrogen_n"] +
        df["phosphorus_p"] +
        df["potassium_k"]
    )

    df["n_p_ratio"] = (
        df["nitrogen_n"] /
        (df["phosphorus_p"] + 1)
    )

    df["ph_deviation"] = (
        df["soil_ph"] - 6.5
    ).abs()

    df["temp_humidity_index"] = (
        df["temperature_celsius"] *
        (df["humidity_percent"] / 100)
    )

    df["fertility_index"] = (
        df["npk_sum"] *
        df["organic_matter_percent"]
    )

    df["soil_quality"] = (
        1 /
        (1 + abs(df["soil_ph"] - 6.5))
    )

    df["rainfall_sq"] = (
        df["rainfall_mm"] ** 2
    )

    df["temperature_sq"] = (
        df["temperature_celsius"] ** 2
    )

    # ==================================================
    # Remove Invalid Target
    # ==================================================

    if TARGET_FEATURE in df.columns:

        df = df[df[TARGET_FEATURE] > 0]

        # -----------------------
        # IQR Outlier Removal
        # -----------------------

        Q1 = df[TARGET_FEATURE].quantile(0.25)
        Q3 = df[TARGET_FEATURE].quantile(0.75)

        IQR = Q3 - Q1

        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        df = df[
            (df[TARGET_FEATURE] >= lower) &
            (df[TARGET_FEATURE] <= upper)
        ]

        # Optional:
        # Use log transform during training
        #
        # y = np.log1p(df[TARGET_FEATURE])

    return df