from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
import datetime
from database import Base

class TrafficRecord(Base):
    __tablename__ = "traffic_records"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    cars = Column(Integer)
    bikes = Column(Integer)
    buses = Column(Integer)
    trucks = Column(Integer)
    total = Column(Integer)
    density = Column(String)
    emergency_vehicles = Column(Integer, default=0)

class AlprRecord(Base):
    __tablename__ = "alpr_records"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    plate_number = Column(String, index=True)
    speed = Column(Integer)
    violation = Column(String)
    location = Column(String)

class PollutionRecord(Base):
    __tablename__ = "pollution_records"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    current_aqi = Column(Float)
    level = Column(String)

class CrowdRecord(Base):
    __tablename__ = "crowd_records"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    count = Column(Integer)
    density = Column(String)
    alert_triggered = Column(Boolean)

class AlertRecord(Base):
    __tablename__ = "alert_records"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    location = Column(String, index=True)
    type = Column(String)
    message = Column(String)
    severity = Column(String)
