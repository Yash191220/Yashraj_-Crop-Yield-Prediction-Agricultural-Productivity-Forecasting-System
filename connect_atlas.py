#!/usr/bin/env python3
"""
YieldSense AI - MongoDB Atlas Cloud Connection & Auto-Migrator Tool
Usage:
  python3 connect_atlas.py "<YOUR_ATLAS_CONNECTION_STRING>"

Example:
  python3 connect_atlas.py "mongodb+srv://admin:password123@cluster0.mongodb.net/yieldsense_ai?retryWrites=true&w=majority"
"""

import sys
import os
import pandas as pd
from pymongo import MongoClient
from datetime import datetime
import bcrypt

def hash_pwd(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def setup_atlas(connection_string: str):
    print("=" * 65)
    print(" ☁️  YIELDSENSE AI - MONGODB ATLAS CLOUD AUTOMATED CONNECT & SEED ☁️ ")
    print("=" * 65)

    try:
        print(f"📡 Connecting to MongoDB Atlas Cloud Cluster...")
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Test connection
        server_info = client.server_info()
        print(f"✅ MongoDB Atlas Connected Successfully! Server Version: {server_info.get('version')}\n")

        db_name = "yieldsense_ai"
        db = client[db_name]

        # 1. Seed Users Collection
        print("👥 1/4 Seeding 'users' collection in Atlas Cloud...")
        db.users.delete_many({})
        db.users.insert_many([
            {
                "id": "usr_farmer_1",
                "name": "Rajesh Kumar (Farmer)",
                "email": "farmer@yieldsense.ai",
                "role": "farmer",
                "region": "North Region",
                "password_hash": hash_pwd("farmer123"),
                "created_at": datetime.utcnow()
            },
            {
                "id": "usr_agro_1",
                "name": "Dr. Sarah Jenkins (Agronomist)",
                "email": "agronomist@yieldsense.ai",
                "role": "agronomist",
                "region": "Central Region",
                "password_hash": hash_pwd("agro123"),
                "created_at": datetime.utcnow()
            },
            {
                "id": "usr_admin_1",
                "name": "System Administrator",
                "email": "admin@yieldsense.ai",
                "role": "admin",
                "region": "All Regions",
                "password_hash": hash_pwd("admin123"),
                "created_at": datetime.utcnow()
            }
        ])
        print("   ✓ User credentials seeded!")

        # 2. Import yield_df.csv (28,242 records)
        print("\n🌾 2/4 Importing 28,242 historical crop yield records into Atlas...")
        df1 = pd.read_csv("datasets/yield_df.csv")
        if 'Unnamed: 0' in df1.columns:
            df1 = df1.drop(columns=['Unnamed: 0'])
        db.historical_crop_yields.delete_many({})
        db.historical_crop_yields.insert_many(df1.to_dict(orient="records"))
        print("   ✓ Historical crop yields imported!")

        # 3. Import Crop_recommendation.csv (2,200 records)
        print("\n🧪 3/4 Importing 2,200 soil NPK recommendation records into Atlas...")
        df2 = pd.read_csv("datasets/Crop_recommendation.csv")
        db.crop_recommendation_dataset.delete_many({})
        db.crop_recommendation_dataset.insert_many(df2.to_dict(orient="records"))
        print("   ✓ Soil NPK recommendation records imported!")

        # 4. Import climate_change_impact_on_agriculture_2024.csv (10,000 records)
        print("\n🌧️ 4/4 Importing 10,000 climate agriculture impact records into Atlas...")
        df3 = pd.read_csv("datasets/climate_change_impact_on_agriculture_2024.csv")
        db.climate_agriculture_impact.delete_many({})
        db.climate_agriculture_impact.insert_many(df3.to_dict(orient="records"))
        print("   ✓ Climate impact records imported!")

        # Update .env file
        env_path = ".env"
        env_content = f"""MONGO_URI="{connection_string}"
DATABASE_NAME="{db_name}"
JWT_SECRET="yieldsense_secret_key_2026_super_secure"
"""
        with open(env_path, "w") as f:
            f.write(env_content)
        print(f"\n📝 Updated .env configuration file with your MongoDB Atlas Cloud URI!")

        print("\n" + "=" * 65)
        print("🎉 SUCCESS! YOUR MONGODB ATLAS CLOUD DATABASE IS LIVE & FULLY POPULATED!")
        print("=" * 65)
        print(f"📁 Active Database in Atlas: '{db_name}'")
        for col in db.list_collection_names():
            cnt = db[col].count_documents({})
            print(f"  • Collection '{col}': {cnt:,} documents")
        print("=" * 65)

    except Exception as e:
        print("\n❌ MongoDB Atlas Connection Error:", e)
        print("💡 Please check that your Atlas Username, Password, and Network IP Access (0.0.0.0/0) are correctly set up.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 connect_atlas.py \"<YOUR_ATLAS_CONNECTION_STRING>\"")
    else:
        uri = sys.argv[1]
        setup_atlas(uri)
