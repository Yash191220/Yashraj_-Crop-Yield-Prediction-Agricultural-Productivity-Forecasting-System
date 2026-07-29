#!/usr/bin/env python3
"""
YieldSense AI - Local MongoDB Inspector Script
Run: python3 check_mongodb.py
"""

from pymongo import MongoClient

def inspect_mongodb():
    print("=" * 65)
    print(" 🍃 YIELDSENSE AI - LOCAL MONGODB INSPECTOR REPORT 🍃 ")
    print("=" * 65)

    try:
        # Connect to local MongoDB instance
        client = MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
        server_info = client.server_info()
        print(f"✅ MongoDB Server Connected! Version: {server_info.get('version')}")
        print(f"🔗 URI: mongodb://localhost:27017\n")

        # List all databases
        dbs = client.list_database_names()
        print(f"📁 All Databases on System ({len(dbs)}):", dbs)
        print("-" * 65)

        # Inspect yieldsense_db
        db_name = "yieldsense_db"
        if db_name in dbs or True:
            db = client[db_name]
            collections = db.list_collection_names()
            print(f"📊 Target Database: '{db_name}'")
            print(f"📦 Collections Found ({len(collections)}):", collections)
            print("-" * 65)

            for col_name in collections:
                col = db[col_name]
                count = col.count_documents({})
                print(f"\n📂 Collection: '{col_name}' | Total Documents: {count}")
                print("~" * 55)
                
                # Fetch recent 3 documents
                docs = list(col.find({}, {"_id": 0}).limit(3))
                if docs:
                    for idx, doc in enumerate(docs, 1):
                        print(f"  Document #{idx}:")
                        for k, v in doc.items():
                            print(f"    • {k}: {v}")
                        print()
                else:
                    print("  (No documents in collection)")

        print("=" * 65)
        print("💡 TIP: You can also open MongoDB Compass and connect to:")
        print("   mongodb://localhost:27017  ->  Database: yieldsense_db")
        print("=" * 65)

    except Exception as e:
        print("❌ Could not connect to local MongoDB server.")
        print(f"   Error Details: {e}")

if __name__ == "__main__":
    inspect_mongodb()
