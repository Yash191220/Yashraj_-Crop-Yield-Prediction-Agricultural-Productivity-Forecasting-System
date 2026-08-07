import os
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor, ExtraTreesRegressor

try:
    from xgboost import XGBRegressor
    XGB_AVAILABLE = True
except Exception:
    from sklearn.ensemble import GradientBoostingRegressor
    XGB_AVAILABLE = False

from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from preprocessing import clean_dataset, get_preprocessor, NUMERICAL_FEATURES, CATEGORICAL_FEATURES, TARGET_FEATURE

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def train(df):
    df = clean_dataset(df)
    df = df.dropna(subset=[TARGET_FEATURE])

    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = np.log1p(df[TARGET_FEATURE])

    X_train,X_test,y_train,y_test = train_test_split(
        X,y,test_size=0.2,random_state=42
    )

    preprocessor = get_preprocessor()
    X_train = preprocessor.fit_transform(X_train)
    X_test = preprocessor.transform(X_test)

    rf = RandomizedSearchCV(
        RandomForestRegressor(random_state=42,n_jobs=-1),
        {
            "n_estimators":[300,500],
            "max_depth":[20,None],
            "min_samples_leaf":[1,2]
        },
        cv=5,
        n_iter=6,
        scoring="r2",
        random_state=42,
        n_jobs=-1
    )

    rf.fit(X_train,y_train)
    rf_model = rf.best_estimator_

    et_model = ExtraTreesRegressor(
        n_estimators=500,
        random_state=42,
        n_jobs=-1
    )
    et_model.fit(X_train,y_train)

    if XGB_AVAILABLE:
        boost_model = XGBRegressor(
            n_estimators=500,
            learning_rate=0.03,
            max_depth=8,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=42
        )
    else:
        boost_model = GradientBoostingRegressor(random_state=42)

    boost_model.fit(X_train,y_train)

    rf_pred = np.expm1(rf_model.predict(X_test))
    et_pred = np.expm1(et_model.predict(X_test))
    gb_pred = np.expm1(boost_model.predict(X_test))
    y_true = np.expm1(y_test)

    pred = 0.45*rf_pred + 0.35*et_pred + 0.20*gb_pred

    metrics = {
        "mae": mean_absolute_error(y_true,pred),
        "rmse": root_mean_squared_error(y_true,pred),
        "r2": r2_score(y_true,pred)
    }

    bundle = {
        "preprocessor": preprocessor,
        "rf_model": rf_model,
        "et_model": et_model,
        "boost_model": boost_model,
        "metrics": metrics,
        "log_target": True
    }

    joblib.dump(bundle, MODEL_SAVE_PATH)
    return metrics
