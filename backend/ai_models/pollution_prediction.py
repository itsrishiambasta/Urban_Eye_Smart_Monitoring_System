import joblib
import pandas as pd
from datetime import datetime
import os

class AirPollutionModel:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "pollution_model.pkl")
            
        self.model_path = model_path
        self.model = None
        
        # Load the real Scikit-Learn model
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            print(f"✅ Loaded Air Pollution Model: {self.model_path}")
        else:
            print(f"❌ Warning: Trained model not found at {self.model_path}!")

    def predict_aqi(self, features: dict):
        """
        Predicts AQI based on input pollutant levels.
        """
        if not self.model:
            return {"error": "Model not loaded"}
            
        # The features array matches the list we trained on in the Notebook: 
        # ['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene']
        try:
            # Enforce exact column order as in the training notebook
            feature_order = ['PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3', 'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene']
            
            # Create a DataFrame with a single row and ensure the columns are in the correct order
            df = pd.DataFrame([features])
            
            # Fill missing columns with 0 if any (though pydantic should handle this)
            for col in feature_order:
                if col not in df.columns:
                    df[col] = 0.0
                    
            # Reorder columns explicitly
            df = df[feature_order]
            
            # Predict the AQI
            predicted_aqi = self.model.predict(df)[0]
            level = self._get_pollution_level(predicted_aqi)
            
            return {
                "current_aqi": round(predicted_aqi, 2),
                "level": level,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e)}
        
    def _get_pollution_level(self, aqi):
        if aqi <= 50: return "Good"
        elif aqi <= 100: return "Moderate"
        elif aqi <= 150: return "Unhealthy for Sensitive Groups"
        elif aqi <= 200: return "Unhealthy"
        elif aqi <= 300: return "Very Unhealthy"
        else: return "Hazardous"
