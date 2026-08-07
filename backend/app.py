import sys
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

load_dotenv(os.path.join(backend_dir, ".env"))

from routes import auth, user, prediction, weather, soil, recommendation, farm, admin

app = FastAPI(
    title="YieldSense AI Backend API",
    description="Crop Yield Prediction & Agricultural Productivity Forecasting System API",
    version="1.0.0"
)

# CORS setup
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for seamless dev setup
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(farm.router)
app.include_router(prediction.router)
app.include_router(weather.router)
app.include_router(soil.router)
app.include_router(recommendation.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "YieldSense AI API Engine",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "yieldsense-backend"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app:app", host=host, port=port, reload=True)
