from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ai_models.crowd_detection import CrowdDetectionModel
import models
from database import get_db

router = APIRouter(prefix="/crowd-data", tags=["Crowd"])
model = CrowdDetectionModel()

@router.get("/")
def get_crowd_data(location: str = "New Delhi, India", db: Session = Depends(get_db)):
    """
    Returns the latest crowd count and density alerts for a specific location,
    and saves the data to the SQLite database.
    """
    data = model.analyze_frame(location)
    
    # If the webcam failed to open or another error occurred, don't crash the server
    if "error" in data:
        # Return a safe fallback since the dashboard expects this structure
        return {
            "count": 0,
            "density": "Unknown",
            "alert_triggered": False,
            "status": "failed",
            "error_msg": data["error"],
            "location": location
        }
    
    # Save to database only if successful
    record = models.CrowdRecord(
        location=location,
        count=data["count"],
        density=data["density"],
        alert_triggered=data["alert_triggered"]
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return data
