from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import cv2
import time
from ultralytics import YOLO

router = APIRouter(prefix="/video", tags=["Video Feed"])

# Load the YOLOv8 model for the video stream
try:
    model = YOLO("yolov8n.pt")
except Exception as e:
    print(f"Failed to load YOLO model: {e}")
    model = None

def generate_frames():
    """
    Generator function to read live images from the shared camera stream, run YOLO inference, 
    draw bounding boxes, and yield valid MJPEG bytes to the dashboard.
    """
    from camera import camera_stream
    
    # Loop infinitely to stream the live feed
    try:
        while True:
            frame = camera_stream.get_frame()
            if frame is None:
                time.sleep(0.1)
                continue

            # Run YOLO inference if model is loaded
            if model is not None:
                # Predict on frame (we use verbose=False to keep server logs clean)
                results = model(frame, verbose=False)
                # Plot the bounding boxes directly on the frame
                annotated_frame = results[0].plot()
            else:
                annotated_frame = frame
                
            # Add a "LIVE" overlay to look cool on the dashboard
            cv2.putText(annotated_frame, "LIVE WEB CAM : YOLOv8 Smart Vision", (20, 40), 
                        cv2.FONT_HERSHEY_DUPLEX, 0.7, (0, 255, 0), 2)
            cv2.circle(annotated_frame, (15, 33), 8, (0, 255, 0), -1)

            # Encode the frame in JPEG format
            ret, buffer = cv2.imencode('.jpg', annotated_frame)
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            
            # Yield the frame in multipart format for the browser <img> tag
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                   
            # Limit the stream framerate to avoid maxing out the network
            time.sleep(0.04)
    except Exception as e:
        print(f"Error in video feed: {e}")

@router.get("/feed")
def video_feed():
    """
    Returns the live webcam MJPEG streaming response
    """
    return StreamingResponse(
        generate_frames(), 
        media_type="multipart/x-mixed-replace; boundary=frame"
    )
