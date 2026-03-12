import cv2
import threading
import time

class SingletonCamera:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._initialize()
            return cls._instance

    def _initialize(self):
        self.cap = None
        self.frame = None
        self.running = False
        self.read_lock = threading.Lock()

    def start(self):
        with self.read_lock:
            if self.running: return
            
            # Try default backend first without CAP_DSHOW as it causes black frames on some Windows drivers
            self.cap = cv2.VideoCapture(0)
            
            # If default fails, fallback to DSHOW
            if not self.cap.isOpened():
                print("Default backend failed, trying DSHOW...")
                self.cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                
            if not self.cap.isOpened():
                print("Failed to start singleton camera")
                return
                
            # Set standard resolution to prevent driver glitches
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            
            self.running = True
        
        # Start background thread to read frames continuously
        t = threading.Thread(target=self._update, daemon=True)
        t.start()
        
        # Wait until first frame is successfully read
        for _ in range(50):
            if self.get_frame() is not None:
                break
            time.sleep(0.1)

    def _update(self):
        while self.running:
            try:
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    with self.read_lock:
                        self.frame = frame.copy()
            except Exception as e:
                print(f"Error reading frame: {e}")
            time.sleep(0.01)

    def get_frame(self):
        if not self.running:
            self.start()
            
        with self.read_lock:
            if self.frame is not None:
                return self.frame.copy()
        return None

camera_stream = SingletonCamera()
