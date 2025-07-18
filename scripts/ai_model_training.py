"""
MedChain AI Model Training Script
Trains machine learning models for demand forecasting and stock optimization
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def generate_synthetic_data():
    """
    Generate synthetic historical data for training
    """
    print("📊 Generating synthetic training data...")
    
    # Date range for historical data
    start_date = datetime(2020, 1, 1)
    end_date = datetime(2023, 12, 31)
    
    data = []
    
    # Drug types and their base demand
    drugs = {
        "Paracetamol 500mg": 150,
        "Amoxicillin 250mg": 80, 
        "Metformin 500mg": 120,
        "Aspirin 75mg": 90,
        "Omeprazole 20mg": 70
    }
    
    # Seasonal multipliers
    seasonal_factors = {
        1: 1.8,  # January - Winter
        2: 1.6,  # February - Winter  
        3: 1.3,  # March - Summer
        4: 1.2,  # April - Summer
        5: 1.1,  # May - Summer
        6: 2.0,  # June - Monsoon
        7: 2.2,  # July - Monsoon
        8: 2.1,  # August - Monsoon
        9: 1.9,  # September - Monsoon
        10: 1.4, # October - Post-monsoon
        11: 1.3, # November - Post-monsoon
        12: 1.7  # December - Winter
    }
    
    # Regional multipliers
    regional_factors = {
        "Rural Areas (High Priority)": 1.5,
        "Urban Areas": 1.0
    }
    
    current_date = start_date
    while current_date <= end_date:
        for drug_name, base_demand in drugs.items():
            for region, region_factor in regional_factors.items():
                # Calculate demand with seasonal and regional factors
                month = current_date.month
                seasonal_factor = seasonal_factors[month]
                
                # Add some random variation
                random_factor = np.random.normal(1.0, 0.1)
                
                # Calculate final demand
                demand = int(base_demand * seasonal_factor * region_factor * random_factor)
                demand = max(10, demand)  # Minimum demand of 10
                
                # Add epidemic/outbreak factor for certain months and drugs
                if month in [6, 7, 8, 9] and drug_name in ["Paracetamol 500mg", "Amoxicillin 250mg"]:
                    if np.random.random() < 0.3:  # 30% chance of outbreak
                        demand = int(demand * 1.5)
                
                data.append({
                    'date': current_date,
                    'drug_name': drug_name,
                    'region': region,
                    'month': month,
                    'year': current_date.year,
                    'seasonal_factor': seasonal_factor,
                    'regional_factor': region_factor,
                    'demand': demand,
                    'is_rural': 1 if region == "Rural Areas (High Priority)" else 0,
                    'is_monsoon': 1 if month in [6, 7, 8, 9] else 0,
                    'is_winter': 1 if month in [12, 1, 2] else 0
                })
        
        current_date += timedelta(days=30)  # Monthly data
    
    df = pd.DataFrame(data)
    print(f"✅ Generated {len(df)} training samples")
    return df

def train_demand_forecasting_model(data):
    """
    Train Random Forest model for demand forecasting
    """
    print("🤖 Training demand forecasting model...")
    
    # Prepare features
    features = [
        'month', 'year', 'seasonal_factor', 'regional_factor',
        'is_rural', 'is_monsoon', 'is_winter'
    ]
    
    # Create drug-specific features
    drug_dummies = pd.get_dummies(data['drug_name'], prefix='drug')
    feature_data = pd.concat([data[features], drug_dummies], axis=1)
    
    X = feature_data
    y = data['demand']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"✅ Model trained successfully!")
    print(f"📊 Mean Absolute Error: {mae:.2f}")
    print(f"📊 R² Score: {r2:.3f}")
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': X.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔍 Top 5 Most Important Features:")
    for _, row in feature_importance.head().iterrows():
        print(f"   {row['feature']}: {row['importance']:.3f}")
    
    return model, X.columns.tolist()

def save_model_and_metadata(model, feature_columns):
    """
    Save trained model and metadata
    """
    print("💾 Saving model and metadata...")
    
    # Save model
    joblib.dump(model, 'medchain_demand_model.pkl')
    
    # Save metadata
    metadata = {
        'model_type': 'RandomForestRegressor',
        'features': feature_columns,
        'training_date': datetime.now().isoformat(),
        'version': '1.0',
        'description': 'MedChain demand forecasting model with seasonal and regional factors'
    }
    
    with open('model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("✅ Model and metadata saved successfully!")

def main():
    """
    Main training pipeline
    """
    print("🚀 Starting MedChain AI Model Training...")
    print("=" * 50)
    
    try:
        # Generate training data
        data = generate_synthetic_data()
        
        # Train model
        model, feature_columns = train_demand_forecasting_model(data)
        
        # Save model
        save_model_and_metadata(model, feature_columns)
        
        print("\n🎉 AI Model Training Completed Successfully!")
        print("📁 Files created:")
        print("   - medchain_demand_model.pkl")
        print("   - model_metadata.json")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        return False

if __name__ == "__main__":
    main()
