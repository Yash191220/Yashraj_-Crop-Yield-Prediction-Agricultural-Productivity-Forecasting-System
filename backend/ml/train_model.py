import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from preprocessing import get_preprocessor, clean_dataset, NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_FEATURE

try:
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except Exception:
    XGB_AVAILABLE = False
    print("Notice: XGBoost native C++ library (libomp) not found. Falling back to Scikit-Learn GradientBoostingRegressor.")

DATASETS_DIR = os.path.join(os.path.dirname(__file__), '../../datasets')
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def generate_default_data(n_samples=1000):
    """Generates baseline training data if custom dataset is not yet present."""
    np.random.seed(42)
    crops = ['Wheat', 'Rice', 'Maize', 'Soybean', 'Cotton', 'Barley', 'Sugarcane', 'Potato']
    regions = ['North Region', 'South Region', 'East Region', 'West Region', 'Central Region']
    seasons = ['Kharif', 'Rabi', 'Zaid', 'Spring', 'Autumn']
    soil_types = ['Loamy', 'Clay', 'Sandy', 'Black', 'Alluvial', 'Red']

    crop = np.random.choice(crops, n_samples)
    region = np.random.choice(regions, n_samples)
    season = np.random.choice(seasons, n_samples)
    soil_type = np.random.choice(soil_types, n_samples)
    irrigation_type = np.random.choice(['Rainfed', 'Drip', 'Canal', 'Sprinkler'], n_samples)

    area_hectares = np.random.uniform(1.0, 50.0, n_samples)
    rainfall_mm = np.random.uniform(300, 1800, n_samples)
    temperature_celsius = np.random.uniform(15, 38, n_samples)
    humidity_percent = np.random.uniform(40, 90, n_samples)
    soil_ph = np.random.uniform(5.5, 8.2, n_samples)
    nitrogen_n = np.random.uniform(40, 240, n_samples)
    phosphorus_p = np.random.uniform(15, 90, n_samples)
    potassium_k = np.random.uniform(20, 150, n_samples)
    organic_matter_percent = np.random.uniform(0.5, 4.5, n_samples)

    base_yield = {'Wheat': 3200, 'Rice': 4100, 'Maize': 4800, 'Soybean': 2600,
                  'Cotton': 1900, 'Barley': 3100, 'Sugarcane': 68000, 'Potato': 22000}

    yields = []
    for i in range(n_samples):
        b = base_yield.get(crop[i], 3000)
        rf_factor = 1.0 + (rainfall_mm[i] - 900) / 3000
        temp_factor = 1.0 - abs(temperature_celsius[i] - 25) / 100
        ph_factor = 1.0 - abs(soil_ph[i] - 6.8) / 10
        n_factor = 1.0 + (nitrogen_n[i] - 120) / 600
        irrig_mult = 1.2 if irrigation_type[i] in ['Drip', 'Sprinkler'] else 1.0
        
        calc_yield = b * rf_factor * temp_factor * ph_factor * n_factor * irrig_mult
        noise = np.random.normal(0, b * 0.05)
        yields.append(max(400, round(calc_yield + noise, 2)))

    return pd.DataFrame({
        'region': region, 'crop': crop, 'season': season, 'soil_type': soil_type,
        'irrigation_type': irrigation_type, 'area_hectares': area_hectares,
        'rainfall_mm': rainfall_mm, 'temperature_celsius': temperature_celsius,
        'humidity_percent': humidity_percent, 'soil_ph': soil_ph,
        'nitrogen_n': nitrogen_n, 'phosphorus_p': phosphorus_p,
        'potassium_k': potassium_k, 'organic_matter_percent': organic_matter_percent,
        'yield_kg_per_ha': yields
    })

def load_real_datasets():
    """Loads and preprocesses real datasets from datasets folder."""
    dataframes = []
    
    # 1. Load yield_df.csv
    yield_path = os.path.join(DATASETS_DIR, 'yield_df.csv')
    if os.path.exists(yield_path) and os.path.getsize(yield_path) > 100:
        print(f"Loading real dataset: {yield_path}")
        df1 = pd.read_csv(yield_path)
        df1_mapped = pd.DataFrame()
        df1_mapped['region'] = df1['Area'] if 'Area' in df1.columns else 'Central Region'
        df1_mapped['crop'] = df1['Item'] if 'Item' in df1.columns else 'Wheat'
        df1_mapped['rainfall_mm'] = pd.to_numeric(df1['average_rain_fall_mm_per_year'], errors='coerce')
        df1_mapped['temperature_celsius'] = pd.to_numeric(df1['avg_temp'], errors='coerce')
        df1_mapped['yield_kg_per_ha'] = pd.to_numeric(df1['hg/ha_yield'], errors='coerce') / 10.0
        dataframes.append(df1_mapped)

    # 2. Load climate_change_impact_on_agriculture_2024.csv
    climate_path = os.path.join(DATASETS_DIR, 'climate_change_impact_on_agriculture_2024.csv')
    if os.path.exists(climate_path) and os.path.getsize(climate_path) > 100:
        print(f"Loading real dataset: {climate_path}")
        df2 = pd.read_csv(climate_path)
        df2_mapped = pd.DataFrame()
        df2_mapped['region'] = df2['Region'] if 'Region' in df2.columns else (df2['Country'] if 'Country' in df2.columns else 'North Region')
        df2_mapped['crop'] = df2['Crop_Type'] if 'Crop_Type' in df2.columns else 'Maize'
        df2_mapped['temperature_celsius'] = pd.to_numeric(df2['Average_Temperature_C'], errors='coerce')
        df2_mapped['rainfall_mm'] = pd.to_numeric(df2['Total_Precipitation_mm'], errors='coerce')
        if 'Crop_Yield_MT_per_HA' in df2.columns:
            df2_mapped['yield_kg_per_ha'] = pd.to_numeric(df2['Crop_Yield_MT_per_HA'], errors='coerce') * 1000.0
        dataframes.append(df2_mapped)

    # 3. Load Crop_recommendation.csv
    rec_path = os.path.join(DATASETS_DIR, 'Crop_recommendation.csv')
    if os.path.exists(rec_path) and os.path.getsize(rec_path) > 100:
        print(f"Loading real dataset: {rec_path}")
        df3 = pd.read_csv(rec_path)
        df3_mapped = pd.DataFrame()
        df3_mapped['crop'] = df3['label'].str.capitalize() if 'label' in df3.columns else 'Wheat'
        df3_mapped['nitrogen_n'] = pd.to_numeric(df3['N'], errors='coerce')
        df3_mapped['phosphorus_p'] = pd.to_numeric(df3['P'], errors='coerce')
        df3_mapped['potassium_k'] = pd.to_numeric(df3['K'], errors='coerce')
        df3_mapped['temperature_celsius'] = pd.to_numeric(df3['temperature'], errors='coerce')
        df3_mapped['humidity_percent'] = pd.to_numeric(df3['humidity'], errors='coerce')
        df3_mapped['soil_ph'] = pd.to_numeric(df3['ph'], errors='coerce')
        df3_mapped['rainfall_mm'] = pd.to_numeric(df3['rainfall'], errors='coerce')
        dataframes.append(df3_mapped)

    if not dataframes:
        return generate_default_data()

    combined_df = pd.concat(dataframes, ignore_index=True)

    defaults = {
        'region': 'North Region', 'crop': 'Wheat', 'season': 'Rabi',
        'soil_type': 'Loamy', 'irrigation_type': 'Canal',
        'area_hectares': 10.0, 'rainfall_mm': 900.0, 'temperature_celsius': 25.0,
        'humidity_percent': 65.0, 'soil_ph': 6.8, 'nitrogen_n': 120.0,
        'phosphorus_p': 40.0, 'potassium_k': 60.0, 'organic_matter_percent': 2.5,
        'yield_kg_per_ha': 3200.0
    }

    for col, default_val in defaults.items():
        if col not in combined_df.columns:
            combined_df[col] = default_val
        else:
            combined_df[col] = combined_df[col].fillna(default_val)

    return combined_df

def train():
    print("Initializing High-Accuracy YieldSense AI Model Training Pipeline...")
    raw_df = load_real_datasets()
    df = clean_dataset(raw_df)
    print(f"Total processed dataset size after feature engineering & outlier filter: {len(df)} records")

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET_FEATURE]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = get_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # Model 1: Random Forest Regressor (Hyperparameter Tuned)
    print("Training Random Forest Regressor (200 trees)...")
    rf_model = RandomForestRegressor(n_estimators=200, max_depth=16, min_samples_split=4, random_state=42, n_jobs=-1)
    rf_model.fit(X_train_processed, y_train)
    rf_preds = rf_model.predict(X_test_processed)

    # Model 2: Extra Trees Regressor (High Diversity Ensemble)
    print("Training Extra Trees Regressor (200 trees)...")
    et_model = ExtraTreesRegressor(n_estimators=200, max_depth=18, min_samples_split=4, random_state=42, n_jobs=-1)
    et_model.fit(X_train_processed, y_train)
    et_preds = et_model.predict(X_test_processed)

    # Model 3: XGBoost or Gradient Boosting Regressor
    print("Training Gradient Boosting Regressor...")
    if XGB_AVAILABLE:
        boost_model = XGBRegressor(n_estimators=200, max_depth=8, learning_rate=0.06, subsample=0.8, random_state=42, n_jobs=-1)
    else:
        boost_model = GradientBoostingRegressor(n_estimators=200, max_depth=8, learning_rate=0.06, subsample=0.8, random_state=42)
        
    boost_model.fit(X_train_processed, y_train)
    boost_preds = boost_model.predict(X_test_processed)

    # Weighted Ensemble (40% RF + 40% ET + 20% GB)
    ensemble_preds = 0.40 * rf_preds + 0.40 * et_preds + 0.20 * boost_preds

    mae = mean_absolute_error(y_test, ensemble_preds)
    rmse = root_mean_squared_error(y_test, ensemble_preds)
    r2 = r2_score(y_test, ensemble_preds)

    print("\n--- High-Accuracy YieldSense AI Model Evaluation ---")
    print(f"Mean Absolute Error (MAE): {mae:.2f} kg/ha")
    print(f"Root Mean Square Error (RMSE): {rmse:.2f} kg/ha")
    print(f"R^2 Score (Accuracy): {r2:.4f} ({r2*100:.2f}%)")

    # Package Bundle
    model_bundle = {
        'preprocessor': preprocessor,
        'rf_model': rf_model,
        'et_model': et_model,
        'boost_model': boost_model,
        'metrics': {'mae': mae, 'rmse': rmse, 'r2': r2},
        'numerical_features': NUMERICAL_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES
    }

    joblib.dump(model_bundle, MODEL_SAVE_PATH)
    print(f"\nModel successfully saved to: {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train()
