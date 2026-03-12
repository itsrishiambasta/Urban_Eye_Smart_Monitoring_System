import cv2
import time
from ultralytics import YOLO

class CrowdDetectionModel:
    def __init__(self, model_path="yolov8n.pt"): # Use base model since yolov8n_crowd.pt might not exist
        self.model_path = model_path
        try:
            self.model = YOLO(model_path)
            print(f"✅ Loaded Crowd Detection Model: {self.model_path}")
        except Exception as e:
            print(f"❌ Failed to load YOLO Model: {e}")
            self.model = None

    def analyze_frame(self, location="Live Camera"):
        """
        Live inference for crowd detection using webcam.
        Returns actual count of 'person' objects and density alerts.
        """
        if self.model is None:
            return {"error": "Model not loaded", "status": "failed"}

        # Read from shared camera singleton instead of opening a new capture
        from camera import camera_stream
        frame = camera_stream.get_frame()
        
        if frame is None:
            return {"error": "Failed to read frame from webcam", "status": "failed"}

        # Run YOLO inference
        results = self.model(frame, verbose=False)[0]
        
        # YOLOv8 COCO Class ID for person: 0
        people_count = sum(1 for box in results.boxes if int(box.cls[0].item()) == 0)
        
        # Adjust density thresholds for a small webcam FOV vs a large street
        density = "Low"
        alert = False
        if people_count > 10:
            density = "Critical"
            alert = True
        elif people_count > 6:
            density = "High"
            alert = True
        elif people_count > 3:
            density = "Moderate"
            
        return {
            "count": people_count,
            "density": density,
            "alert_triggered": alert,
            "status": "success",
            "location": location
        }
