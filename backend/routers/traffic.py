from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ai_models.vehicle_detection import VehicleDetectionModel
import models
from database import get_db

router = APIRouter(prefix="/traffic-data", tags=["Traffic"])
model = VehicleDetectionModel()

@router.get("/")
def get_traffic_data(location: str = "New Delhi, India", db: Session = Depends(get_db)):
    """
    Returns the latest traffic count and density for a specific location,
    and saves the data to the SQLite database.
    """
    data = model.analyze_frame(location)
    
    # If the webcam failed to open or another error occurred, don't crash the server
    if "error" in data:
        return {
             "counts": {"cars": 0, "bikes": 0, "buses": 0, "trucks": 0, "total": 0, "predicted_total_1h": 0},
             "density": "Unknown",
             "predicted_density_1h": "Unknown",
             "trend": "Unknown",
             "status": "failed",
             "error_msg": data["error"],
             "location": location
        }
    
    # Save to database only if successful
    record = models.TrafficRecord(
        location=location,
        cars=data["counts"]["cars"],
        bikes=data["counts"]["bikes"],
        buses=data["counts"]["buses"],
        trucks=data["counts"]["trucks"],
        total=data["counts"]["total"],
        density=data["density"],
        emergency_vehicles=data["counts"]["emergency_vehicles"]
    )
    db.add(record)
    
    if data.get("alpr_data"):
        alpr_record = models.AlprRecord(
            plate_number=data["alpr_data"]["plate_number"],
            speed=data["alpr_data"]["speed"],
            violation=data["alpr_data"]["violation"],
            location=data["alpr_data"]["location"]
        )
        db.add(alpr_record)
        
    db.commit()
    db.refresh(record)
    
    return data
