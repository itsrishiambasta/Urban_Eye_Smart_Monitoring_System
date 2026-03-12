from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ai_models.pollution_prediction import AirPollutionModel
import models
from database import get_db

router = APIRouter(prefix="/pollution-prediction", tags=["Pollution"])
model = AirPollutionModel()

class PollutantsInput(BaseModel):
    # Field names must match the columns in the dataset exactly
    PM2_5: float = 0.0
    PM10: float = 0.0
    NO: float = 0.0
    NO2: float = 0.0
    NOx: float = 0.0
    NH3: float = 0.0
    CO: float = 0.0
    SO2: float = 0.0
    O3: float = 0.0
    Benzene: float = 0.0
    Toluene: float = 0.0
    Xylene: float = 0.0

@router.get("/")
def get_pollution_prediction(db: Session = Depends(get_db)):
    """
    Returns a default prediction (for backwards compatibility with existing dashboard).
    """
    # Provide default middle-ground values if no input is provided
    default_features = {
        'PM2.5': 45.0,
        'PM10': 90.0,
        'NO': 15.0,
        'NO2': 30.0,
        'NOx': 40.0,
        'NH3': 20.0,
        'CO': 1.0,
        'SO2': 10.0,
        'O3': 30.0,
        'Benzene': 2.0,
        'Toluene': 5.0,
        'Xylene': 1.0
    }
    data = model.predict_aqi(default_features)
    
    if "error" not in data:
        record = models.PollutionRecord(
            current_aqi=data["current_aqi"],
            level=data["level"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        
    return data

@router.post("/predict-aqi")
def predict_interactive_aqi(input_data: PollutantsInput, db: Session = Depends(get_db)):
    """
    Interactive endpoint that takes user input of pollutants and returns an AI prediction.
    """
    # Convert Pydantic model to dictionary, renaming PM2_5 to 'PM2.5' as expected by the model
    features = input_data.model_dump()
    if 'PM2_5' in features:
        features['PM2.5'] = features.pop('PM2_5')
        
    data = model.predict_aqi(features)
    
    if "error" not in data:
        record = models.PollutionRecord(
            current_aqi=data["current_aqi"],
            level=data["level"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        
    return data
