import cv2
import threading
import time
import os
from dotenv import load_dotenv

load_dotenv()

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
            if self.running:
                return

            # 👉 FIX: safer camera source handling
            camera_source = os.getenv("CAMERA_SOURCE")

            if camera_source is None:
                camera_source = 1   # 👈 DEFAULT external webcam
            elif camera_source.isdigit():
                camera_source = int(camera_source)

            print(f"Using camera source: {camera_source}")

            self.cap = cv2.VideoCapture(camera_source)

            # fallback for Windows
            if not self.cap.isOpened() and isinstance(camera_source, int):
                print("Trying DSHOW backend...")
                self.cap = cv2.VideoCapture(camera_source, cv2.CAP_DSHOW)

            if not self.cap.isOpened():
                print("❌ Camera not opened. Check index or connection.")
                return

            # resolution fix
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

            self.running = True

        # background thread
        t = threading.Thread(target=self._update, daemon=True)
        t.start()

        # wait for first frame
        for _ in range(50):
            if self.get_frame() is not None:
                print("✅ Camera started successfully")
                break
            time.sleep(0.1)

    def _update(self):
        while self.running:
            try:
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    with self.read_lock:
                        self.frame = frame.copy()
                else:
                    print("⚠️ Frame not received")
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
