import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "yieldsense_db")

class Database:
    _client = None
    _db = None

    @classmethod
    def get_db(cls):
        if cls._db is None:
            try:
                cls._client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
                cls._db = cls._client[DATABASE_NAME]
                print(f"Connected to MongoDB database: {DATABASE_NAME}")
            except Exception as e:
                print(f"MongoDB connection notice: {e}. Running in in-memory / fallback mode.")
                cls._db = None
        return cls._db

def get_database():
    return Database.get_db()
