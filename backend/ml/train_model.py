import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from preprocessing import get_preprocessor, clean_dataset, NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_FEATURE

# Optional XGBoost import with fallback to GradientBoostingRegressor
try:
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except Exception:
    XGB_AVAILABLE = False
    print("Notice: XGBoost native C++ library (libomp) not found. Falling back to Scikit-Learn GradientBoostingRegressor.")

DATASET_PATH = os.path.join(os.path.dirname(__file__), '../../datasets/historical_yield.csv')
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
        b = base_yield[crop[i]]
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

def train():
    print("Initializing YieldSense AI Model Training Pipeline...")
    if os.path.exists(DATASET_PATH) and os.path.getsize(DATASET_PATH) > 100:
        print(f"Loading custom dataset from: {DATASET_PATH}")
        df = pd.read_csv(DATASET_PATH)
    else:
        print("Using synthetic dataset generator for initial model calibration...")
        df = generate_default_data()

    df = clean_dataset(df)
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET_FEATURE]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    preprocessor = get_preprocessor()
    X_train_processed = preprocessor.fit_transform(X_train)
    X_test_processed = preprocessor.transform(X_test)

    # Train Model 1: Random Forest Regressor
    rf_model = RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42)
    rf_model.fit(X_train_processed, y_train)
    rf_preds = rf_model.predict(X_test_processed)

    # Train Model 2: XGBoost or Gradient Boosting Regressor
    if XGB_AVAILABLE:
        boost_model = XGBRegressor(n_estimators=150, max_depth=6, learning_rate=0.08, random_state=42)
    else:
        boost_model = GradientBoostingRegressor(n_estimators=150, max_depth=6, learning_rate=0.08, random_state=42)
        
    boost_model.fit(X_train_processed, y_train)
    boost_preds = boost_model.predict(X_test_processed)

    # Ensemble Predictions (Weighted Average)
    ensemble_preds = 0.5 * rf_preds + 0.5 * boost_preds

    mae = mean_absolute_error(y_test, ensemble_preds)
    rmse = root_mean_squared_error(y_test, ensemble_preds)
    r2 = r2_score(y_test, ensemble_preds)

    print("\n--- YieldSense AI Model Evaluation ---")
    print(f"Mean Absolute Error (MAE): {mae:.2f} kg/ha")
    print(f"Root Mean Square Error (RMSE): {rmse:.2f} kg/ha")
    print(f"R^2 Score: {r2:.4f}")

    # Package Bundle
    model_bundle = {
        'preprocessor': preprocessor,
        'rf_model': rf_model,
        'boost_model': boost_model,
        'metrics': {'mae': mae, 'rmse': rmse, 'r2': r2},
        'numerical_features': NUMERICAL_FEATURES,
        'categorical_features': CATEGORICAL_FEATURES
    }

    joblib.dump(model_bundle, MODEL_SAVE_PATH)
    print(f"\nModel successfully saved to: {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train()
