import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(override=True)

ATLAS_URI = "mongodb+srv://yashraj191220_db_user:S6fQWhT99rohAkli@cropyiled.slmdhrd.mongodb.net/yieldsense_ai?retryWrites=true&w=majority"
MONGO_URI = os.getenv("MONGO_URI", ATLAS_URI)
if "localhost" in MONGO_URI or "127.0.0.1" in MONGO_URI:
    MONGO_URI = ATLAS_URI

DATABASE_NAME = "yieldsense_ai"

class Database:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        # Retry connection if not connected or dropped
        if cls._db is None or cls._client is None:
            try:
                cls._client = MongoClient(
                    MONGO_URI,
                    serverSelectionTimeoutMS=15000,
                    connectTimeoutMS=15000,
                    socketTimeoutMS=15000,
                    retryWrites=True
                )
                # Verify ping
                cls._client.admin.command('ping')
                cls._db = cls._client[DATABASE_NAME]
                print(f"Connected to MongoDB Atlas Cloud database: {DATABASE_NAME}")
            except Exception as e:
                print(f"MongoDB Atlas Connection Error: {e}")
                cls._db = None
                cls._client = None
        else:
            # Verify existing connection is alive
            try:
                cls._client.admin.command('ping')
            except Exception:
                try:
                    cls._client = MongoClient(
                        MONGO_URI,
                        serverSelectionTimeoutMS=15000,
                        connectTimeoutMS=15000,
                        socketTimeoutMS=15000,
                        retryWrites=True
                    )
                    cls._db = cls._client[DATABASE_NAME]
                except Exception as e:
                    print(f"MongoDB Atlas Reconnection Error: {e}")
                    cls._db = None
                    cls._client = None
        return cls._db

def get_database():
    return Database.get_db()
