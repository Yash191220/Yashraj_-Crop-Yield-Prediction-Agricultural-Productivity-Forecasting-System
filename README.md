# 🌱 Crop Yield Prediction & Agricultural Advisory System (YieldSense AI)

A modern, full-stack AI platform that helps farmers and agricultural planners forecast crop yields, assess environmental risks, and receive personalized agronomic advice based on soil, weather, and farm conditions.

---

## 📌 Project Overview

Predicting crop yield before harvest helps farmers choose the right crops, plan fertilizers, and reduce financial risk. **YieldSense AI** takes field conditions (soil NPK, pH, rainfall, temperature, humidity, farm size) and delivers:
1. **Accurate Yield Predictions** (in kg/ha and total tonnes) using an ML Ensemble model.
2. **Crop Suitability Rankings** comparing 8 major crops for the same field inputs.
3. **Soil Health Assessment** evaluating nutrient balance and soil fertility (score out of 100).
4. **Smart Advisory Modules** for fertilizer schedule, irrigation planning, risk assessment, and crop rotation.

---

## 🚀 Key Features

- **🌾 AI Yield Forecasting**: Predicts expected harvest (kg/ha and total metric tonnes) in real-time.
- **🏆 Crop Recommendation**: Automatically runs the model across all 8 crops (Wheat, Rice, Maize, Soybean, Cotton, Barley, Sugarcane, Potato) to highlight the most profitable choice.
- **🧪 Soil Health Index**: Analyzes Nitrogen (N), Phosphorus (P), Potassium (K), pH, and Organic Matter with actionable improvement suggestions.
- **🛡️ Multi-Risk Assessment**: Evaluates Drought, Heatwave, Flood/Excess Rain, Pest, and Soil Degradation risks with risk level badges and financial Value-at-Risk (VaR).
- **💡 Agricultural Advisory**:
  - Fertilizer Split Timeline (Basal, Vegetative, Flowering stages)
  - Irrigation Scheduling (Weekly water requirements & methods)
  - Pest Defense Strategy & Crop Rotation recommendations
- **📊 Interactive Dashboard**: Visualizes yield comparisons, baseline benchmarks, and historical records with CSV export.
- **🔐 Secure User & Admin Portal**: Role-based access (Farmer & Admin), JWT authentication, and farm profile management.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite | Fast, responsive single-page dashboard |
| **Styling** | Vanilla CSS + Tailwind classes | Clean modern UI with glassmorphic cards and dark/light accents |
| **Data Viz** | Recharts + Lucide Icons | Real-time charts, progress rings, and indicators |
| **Backend** | Python 3.11+ / FastAPI | High-performance asynchronous REST API with Swagger docs |
| **Machine Learning** | Scikit-Learn + XGBoost | Multi-model weighted ensemble (RF + Extra Trees + XGBoost) |
| **Database** | MongoDB (with in-memory fallback) | Farm profiles, user data, and prediction logs |

---

## 🧠 Machine Learning Pipeline

Our model uses an ensemble of 3 distinct algorithms for high accuracy and robust generalization:

```
[Soil + Weather + Crop Inputs]
              │
              ▼
   [Feature Engineering & Scaling]
   (Rainfall/Temp index, NPK balance, pH deviation)
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
[Random Forest] [Extra Trees] [XGBoost]
    (40%)          (40%)        (20%)
      └───────┬───────┘
              ▼
    [Weighted Ensemble Blend]
              │
              ▼
   [Predicted Yield (kg/ha)]
```

### Model Performance Metrics
- **R² Score**: ~0.94 - 0.96 (explains over 94% of yield variance)
- **RMSE**: Low root-mean-square error across diverse climatic conditions
- **Target Transformation**: Log-transformation `log1p(yield)` to normalize skewed crop distributions (e.g., Sugarcane vs. Barley).

---

## 📂 Project Structure

```
CropYield/
├── backend/                  # FastAPI Application
│   ├── app.py                # Server entry point & route registration
│   ├── routes/               # API endpoints (auth, prediction, farm, admin, etc.)
│   ├── models/               # Pydantic data schemas
│   ├── ml/                   # Machine learning models, training & inference scripts
│   │   ├── model.pkl         # Trained ensemble bundle
│   │   ├── train_model.py    # Training pipeline
│   │   ├── predict.py        # Prediction logic
│   │   └── preprocessing.py  # Feature engineering
│   └── database/             # MongoDB connection and fallback handler
│
├── frontend/                 # React Application
│   ├── src/
│   │   ├── App.jsx           # Main dashboard interface
│   │   ├── api.js            # Axios client with JWT interceptor
│   │   └── components/       # UI modules, visualizations, login & register
│   └── package.json
│
└── datasets/                 # Agricultural and historical crop datasets
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher
- Git

### 1. Backend Setup

```bash
# Move into backend directory
cd backend

# Create & activate a virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app:app --reload --port 8000
```
API runs at `http://localhost:8000`  
Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Open a new terminal and move into frontend
cd frontend

# Install packages
npm install

# Start the development server
npm run dev
```
Web application will be accessible at `http://localhost:5173`

---

## 📋 API Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a new farmer account |
| `/api/auth/login` | `POST` | User login returning JWT Bearer token |
| `/api/prediction/predict` | `POST` | Run ML yield prediction & risk analysis |
| `/api/prediction/crop-recommend` | `POST` | Compare and rank all 8 crops for current inputs |
| `/api/prediction/history` | `GET` | Fetch previous predictions for current user |
| `/api/farm/create` | `POST` | Save a new farm profile |
| `/api/farm/list` | `GET` | Retrieve saved farms |
| `/api/health` | `GET` | Backend health check |

---

## 👥 Authors & Acknowledgments

- **Developer**: Yashraj
- **Project**: Agricultural Productivity Forecasting & Advisory System (YieldSense AI)
- Built with Python, FastAPI, React, and Machine Learning.
