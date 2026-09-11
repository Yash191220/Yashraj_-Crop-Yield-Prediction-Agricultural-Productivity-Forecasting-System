import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=True)

ATLAS_URI = os.getenv("MONGO_URI", "mongodb+srv://yashraj191220_db_user:S6fQWhT99rohAkli@cropyiled.slmdhrd.mongodb.net/yieldsense_ai?retryWrites=true&w=majority")
LOCAL_URI = "mongodb://localhost:27017"

DATABASE_NAME = os.getenv("DATABASE_NAME", "yieldsense_ai")

class Database:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        # Return existing active connection if ping succeeds
        if cls._db is not None and cls._client is not None:
            try:
                cls._client.admin.command('ping')
                return cls._db
            except Exception:
                cls._db = None
                cls._client = None

        env_uri = os.getenv("MONGO_URI", ATLAS_URI)
        # Always try Atlas first (using env var), then local as fallback
        uris_to_try = list(dict.fromkeys([env_uri, ATLAS_URI]))
        if "localhost" not in env_uri:
            uris_to_try.append(LOCAL_URI)

        for uri in uris_to_try:
            try:
                client_kwargs = {
                    # Increased timeouts to handle Render cold-start (can take 30-60s)
                    "serverSelectionTimeoutMS": 30000,
                    "connectTimeoutMS": 30000,
                    "socketTimeoutMS": 30000,
                    "retryWrites": True,
                    "retryReads": True,
                }
                if "mongodb.net" in uri or "ssl=true" in uri.lower():
                    try:
                        client_kwargs["tlsCAFile"] = certifi.where()
                    except Exception:
                        pass

                client = MongoClient(uri, **client_kwargs)
                client.admin.command('ping')
                cls._client = client
                cls._db = client[DATABASE_NAME]
                db_type = "MongoDB Atlas Cloud" if "mongodb.net" in uri else "Local MongoDB"
                print(f"✅ Connected to {db_type} database: {DATABASE_NAME}")
                return cls._db
            except Exception as e:
                print(f"⚠️ Connection attempt failed for {uri[:35]}... : {e}")

        cls._db = None
        cls._client = None
        return None

def get_database():
    return Database.get_db()

