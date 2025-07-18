"""
MedChain Database Setup Script
Creates and initializes the MongoDB database for the MedChain MVP
"""

import pymongo
import hashlib
import json
from datetime import datetime, timedelta
import random

# MongoDB connection (replace with your MongoDB Atlas connection string)
MONGODB_URI = "mongodb://localhost:27017/"  # Local MongoDB for demo
DATABASE_NAME = "medchain_mvp"

# Manufacturer to Origin Location Mapping
MANUFACTURER_LOCATION_MAP = {
    "Dr. Reddy's": ["Mumbai", "Chennai"],
    "Sun Pharma": ["Hyderabad", "Ahmedabad"],
    "Cipla Ltd": ["Goa", "Bangalore"],
    "Lupin Ltd": ["Pune", "Aurangabad"],
    "Aurobindo Pharma": ["Hyderabad", "Vizag"]
}

def hash_passcode(passcode):
    """Hash admin passcode for security"""
    return hashlib.sha256(passcode.encode()).hexdigest()

def generate_aadhaar_id():
    """Generate random 12-digit Aadhaar ID"""
    return str(random.randint(100000000000, 999999999999))

def generate_dummy_numbers():
    """Generate emergency dummy numbers"""
    return [f"EMG{str(i).zfill(3)}" for i in range(1, 21)]  # EMG001 to EMG020

def setup_medchain_database():
    """
    Set up the MedChain database with sample data
    """
    try:
        # Connect to MongoDB
        client = pymongo.MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        
        print("🔗 Connected to MongoDB")
        
        # Clear existing collections
        collections_to_drop = ['drug_batches', 'scan_records', 'inventory', 'patients', 'dispensing_records', 'audit_logs', 'dummy_numbers']
        for collection in collections_to_drop:
            if collection in db.list_collection_names():
                db[collection].drop()
                print(f"🗑️ Dropped collection: {collection}")
        
        # Create collections
        collections = [
            "drug_batches",
            "audit_logs", 
            "inventory",
            "patients",
            "users",
            "blockchain_transactions"
        ]
        
        for collection_name in collections:
            if collection_name not in db.list_collection_names():
                db.create_collection(collection_name)
                print(f"✅ Created collection: {collection_name}")
        
        # Insert sample drug batches
        drug_batches = [
            {
                "batch_id": "BATCH-1ldf2g-ABCDE",
                "drug_name": "Paracetamol 500mg",
                "manufacturer": "Sun Pharma",
                "quantity": 1000,
                "manufacture_date": "2024-01-01",
                "expiry_date": "2025-06-15",
                "origin": "Mumbai",
                "status": "dispatched",
                "qr_code": "QR-eyJiYXRjaElkIjoiQkFUQ0gtMWxkZjJnLUFCQ0RFIn0=",
                "blockchain_tx_id": "TX-1234567890",
                "created_at": datetime.utcnow()
            },
            {
                "batch_id": "BATCH-1ldf2h-XYZAB", 
                "drug_name": "Amoxicillin 250mg",
                "manufacturer": "Cipla Ltd",
                "quantity": 500,
                "manufacture_date": "2024-01-02",
                "expiry_date": "2025-08-20",
                "origin": "Goa",
                "status": "in_transit",
                "qr_code": "QR-eyJiYXRjaElkIjoiQkFUQ0gtMWxkZjJoLVhZWkFCIn0=",
                "blockchain_tx_id": "TX-1234567891",
                "created_at": datetime.utcnow()
            }
        ]
        
        db.drug_batches.insert_many(drug_batches)
        print("✅ Inserted sample drug batches")
        
        # Insert sample patients
        patients = [
            {
                "aadhaar_id": "1234-5678-9012",
                "name": "Rajesh Kumar",
                "age": 45,
                "phone": "+91-9876543210",
                "location": "Rural Health Center - Rajasthan",
                "dob": "1979-03-15",
                "health_history": [
                    "Diabetes Type 2 (diagnosed 2018)",
                    "Hypertension (controlled)",
                    "Seasonal allergies"
                ],
                "medicines_purchased": [
                    "Metformin 500mg - 30 tablets (Jan 2024)",
                    "Paracetamol 500mg - 20 tablets (Dec 2023)"
                ],
                "created_at": datetime.utcnow()
            }
        ]
        
        db.patients.insert_many(patients)
        print("✅ Inserted sample patients")
        
        # Insert sample inventory
        inventory_items = [
            {
                "drug_name": "Paracetamol 500mg",
                "current_stock": 45,
                "min_threshold": 100,
                "max_capacity": 500,
                "location": "Rural Health Center - Rajasthan",
                "location_type": "rural",
                "batch_id": "BATCH-1ldf2g-ABCDE",
                "expiry_date": "2025-06-15",
                "last_updated": datetime.utcnow()
            },
            {
                "drug_name": "Amoxicillin 250mg", 
                "current_stock": 180,
                "min_threshold": 50,
                "max_capacity": 300,
                "location": "AIIMS Delhi",
                "location_type": "urban",
                "batch_id": "BATCH-1ldf2h-XYZAB",
                "expiry_date": "2025-08-20",
                "last_updated": datetime.utcnow()
            }
        ]
        
        db.inventory.insert_many(inventory_items)
        print("✅ Inserted sample inventory")
        
        # Insert sample users
        users = [
            {
                "email": "manufacturer@sunpharma.com",
                "role": "Manufacturer",
                "org_name": "Sun Pharma Ltd",
                "location": "Mumbai, Maharashtra",
                "created_at": datetime.utcnow()
            },
            {
                "email": "distributor@delhi.com",
                "role": "Distributor", 
                "org_name": "Delhi Distribution Center",
                "location": "Delhi, India",
                "created_at": datetime.utcnow()
            },
            {
                "email": "hospital@aiims.edu",
                "role": "Hospital/Pharmacy",
                "org_name": "AIIMS Delhi",
                "location": "New Delhi, India", 
                "created_at": datetime.utcnow()
            }
        ]
        
        db.users.insert_many(users)
        print("✅ Inserted sample users")
        
        # Create indexes for better performance
        db.drug_batches.create_index("batch_id", unique=True)
        db.patients.create_index("aadhaar_id", unique=True)
        db.audit_logs.create_index("timestamp")
        db.inventory.create_index([("drug_name", 1), ("location", 1)])
        
        print("✅ Created database indexes")
        
        print("\n🎉 MedChain database setup completed successfully!")
        print(f"📊 Database: {db.name}")
        print(f"📋 Collections created: {len(collections)}")
        print(f"💊 Drug batches: {len(drug_batches)}")
        print(f"👥 Patients: {len(patients)}")
        print(f"📦 Inventory items: {len(inventory_items)}")
        print(f"👤 Users: {len(users)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up database: {str(e)}")
        return False
    
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    print("🚀 Starting MedChain database setup...")
    setup_medchain_database()
