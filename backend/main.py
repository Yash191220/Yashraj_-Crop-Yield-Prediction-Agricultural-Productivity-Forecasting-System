import sys
import os
from dotenv import load_dotenv

# Ensure backend directory is at the beginning of sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load environment variables from .env
load_dotenv(os.path.join(backend_dir, ".env"))

from app import app

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    reload_enabled = os.getenv("RELOAD", "True").lower() == "true"

    uvicorn.run("app:app", host=host, port=port, reload=reload_enabled)

