from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ai_models.analytics_engine import AnalyticsEngine
import models
from database import get_db

router = APIRouter(prefix="/alerts", tags=["Alerts"])
engine = AnalyticsEngine()

@router.get("/")
def get_system_alerts(location: str = "New Delhi, India", db: Session = Depends(get_db)):
    """
    Returns alerts aggregated from all AI models via the Analytics Engine for a specific location,
    and saves the generated alerts to the SQLite database.
    """
    insights = engine.generate_city_insights(location)
    alerts_data = []
    
    for zone in insights["insights"]["traffic_congestion_zones"]:
        alerts_data.append({"type": "Traffic", "message": f"Heavy Congestion in {zone}", "severity": "High"})
        
    for alert in insights["insights"]["crowd_density_alerts"]:
        alerts_data.append({"type": "Crowd", "message": alert, "severity": "High"})
        
    if insights["insights"]["overall_status"].startswith("Critical"):
        alerts_data.append({"type": "System", "message": insights["insights"]["overall_status"], "severity": "Critical"})
        
    # Save all active alerts to database
    for alert in alerts_data:
        record = models.AlertRecord(
            location=location,
            type=alert["type"],
            message=alert["message"],
            severity=alert["severity"]
        )
        db.add(record)
    
    if alerts_data:
        db.commit()
        
    # Also just return the raw payload for dashboard use
    return {
        "active_alerts": alerts_data,
        "engine_raw": insights
    }
