#!/usr/bin/env python3
"""
YieldSense AI - Dataset Import Script for MongoDB
Imports all 40,442 dataset records from CSV files into MongoDB yieldsense_db
Run: python3 import_datasets_to_mongodb.py
"""

import pandas as pd
from pymongo import MongoClient
import sys

def import_datasets():
    print("=" * 65)
    print(" 🍃 YIELDSENSE AI - DATASET IMPORT TOOL FOR MONGODB 🍃 ")
    print("=" * 65)

    try:
        # Connect to local MongoDB instance
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        db = client["yieldsense_db"]
        print("✅ Connected to MongoDB at: mongodb://localhost:27017/yieldsense_db\n")

        # 1. Import yield_df.csv (28,242 records)
        print("📦 1/3 Importing 'datasets/yield_df.csv'...")
        df1 = pd.read_csv("datasets/yield_df.csv")
        if 'Unnamed: 0' in df1.columns:
            df1 = df1.drop(columns=['Unnamed: 0'])
        records1 = df1.to_dict(orient="records")
        db.historical_crop_yields.delete_many({}) # Clear existing
        db.historical_crop_yields.insert_many(records1)
        print(f"   ✓ Imported {len(records1):,} records into collection 'historical_crop_yields'")

        # 2. Import Crop_recommendation.csv (2,200 records)
        print("\n📦 2/3 Importing 'datasets/Crop_recommendation.csv'...")
        df2 = pd.read_csv("datasets/Crop_recommendation.csv")
        records2 = df2.to_dict(orient="records")
        db.crop_recommendation_dataset.delete_many({})
        db.crop_recommendation_dataset.insert_many(records2)
        print(f"   ✓ Imported {len(records2):,} records into collection 'crop_recommendation_dataset'")

        # 3. Import climate_change_impact_on_agriculture_2024.csv (10,000 records)
        print("\n📦 3/3 Importing 'datasets/climate_change_impact_on_agriculture_2024.csv'...")
        df3 = pd.read_csv("datasets/climate_change_impact_on_agriculture_2024.csv")
        records3 = df3.to_dict(orient="records")
        db.climate_agriculture_impact.delete_many({})
        db.climate_agriculture_impact.insert_many(records3)
        print(f"   ✓ Imported {len(records3):,} records into collection 'climate_agriculture_impact'")

        print("\n" + "=" * 65)
        print("🎉 SUCCESS! ALL 40,442 DATASET RECORDS IMPORTED TO MONGODB!")
        print("=" * 65)
        print("📁 All Collections in 'yieldsense_db':")
        for col in db.list_collection_names():
            cnt = db[col].count_documents({})
            print(f"  • {col}: {cnt:,} documents")
        print("=" * 65)

    except Exception as e:
        print("❌ Dataset Import Error:", e)

if __name__ == "__main__":
    import_datasets()
