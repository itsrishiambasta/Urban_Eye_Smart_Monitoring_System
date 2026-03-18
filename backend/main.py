import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from routers import traffic, crowd, pollution, alerts, video
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UrbanEye API", description="Smart City Monitoring System Backend")

origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(traffic.router)
app.include_router(crowd.router)
app.include_router(pollution.router)
app.include_router(alerts.router)
app.include_router(video.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to UrbanEye API. Go to /docs to test endpoints, or /data-viewer to see saved database records."}

@app.get("/data-viewer")
def view_all_saved_data(db: Session = Depends(get_db)):
    """
    Returns all the saved data from the SQLite database.
    """
    traffic_data = db.query(models.TrafficRecord).order_by(models.TrafficRecord.timestamp.desc()).limit(20).all()
    pollution_data = db.query(models.PollutionRecord).order_by(models.PollutionRecord.timestamp.desc()).limit(20).all()
    crowd_data = db.query(models.CrowdRecord).order_by(models.CrowdRecord.timestamp.desc()).limit(20).all()
    alerts_data = db.query(models.AlertRecord).order_by(models.AlertRecord.timestamp.desc()).limit(20).all()
    
    return {
        "latest_traffic_records": traffic_data,
        "latest_pollution_records": pollution_data,
        "latest_crowd_records": crowd_data,
        "latest_alerts": alerts_data
    }
@app.delete("/data-viewer/clear")
def clear_all_saved_data(db: Session = Depends(get_db)):
    """
    Clears all saved data from the SQLite database.
    """
    db.query(models.TrafficRecord).delete()
    db.query(models.PollutionRecord).delete()
    db.query(models.CrowdRecord).delete()
    db.query(models.AlertRecord).delete()
    db.query(models.AlprRecord).delete()
    db.commit()
    return {"message": "All database logs have been successfully cleared."}
