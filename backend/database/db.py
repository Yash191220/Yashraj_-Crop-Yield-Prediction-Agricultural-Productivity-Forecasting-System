import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=True)

ATLAS_URI = "mongodb+srv://yashraj191220_db_user:S6fQWhT99rohAkli@cropyiled.slmdhrd.mongodb.net/yieldsense_ai?retryWrites=true&w=majority"
LOCAL_URI = "mongodb://localhost:27017"

DATABASE_NAME = "yieldsense_ai"

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

        # Try Atlas first, fallback to Local Mongo
        env_uri = os.getenv("MONGO_URI", ATLAS_URI)
        uris_to_try = [ATLAS_URI, LOCAL_URI] if "mongodb.net" in env_uri else [LOCAL_URI, ATLAS_URI]

        for uri in uris_to_try:
            try:
                client = MongoClient(
                    uri,
                    serverSelectionTimeoutMS=2500,
                    connectTimeoutMS=2500,
                    socketTimeoutMS=2500,
                    retryWrites=True
                )
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

