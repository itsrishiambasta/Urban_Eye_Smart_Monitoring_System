# Task Execution Commands

This guide provides step-by-step instructions for running the **UrbanEye Smart City Monitoring System**. To run the project successfully, you need to start both the backend server and the frontend development server simultaneously in separate terminal windows.

## Prerequisites
* **Python 3.9+** installed on your system.
* **Node.js 18+** installed on your system.

---

## 1. Running the Backend (Python FastAPI)

The backend manages the AI/ML models, video processing, and serves the JSON API for the frontend.

1. Open a new terminal window.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Create a Python virtual environment to manage dependencies (only needed the first time):
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   * **Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   * **Mac/Linux:**
     ```bash
     source venv/bin/activate
     ```
5. Install the required external Python libraries:
   ```bash
   pip install -r requirements.txt
   ```
6. Start the FastAPI local server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
> **Success:** The backend API will be live at `http://localhost:8000`. Keep this terminal window open.

---

## 2. Running the Frontend (React Dashboard)

The frontend is a React application built with Vite and Tailwind CSS. It communicates with the backend to display real-time smart city insights.

1. Open a **new, separate terminal** window.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Install the necessary Node packages (only needed the first time or if packages are updated):
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
> **Success:** The frontend dashboard will be available at `http://localhost:5173`. Open this URL in your web browser to view the system.

---

### Important Notes
* **Keep Both Servers Running:** Ensure both terminal windows (one for the backend, one for the frontend) remain open while you test the application.
* **Environment Variables:** If there are API keys required (like for maps), make sure the appropriate `.env` files are configured according to the project setup.
