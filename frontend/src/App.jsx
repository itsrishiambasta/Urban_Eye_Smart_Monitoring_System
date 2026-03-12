import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Activity, Users, Car, Wind, MapPin } from 'lucide-react';
import TrafficMonitor from './components/TrafficMonitor';
import CrowdMonitor from './components/CrowdMonitor';
import PollutionChart from './components/PollutionChart';
import AlertSystem from './components/AlertSystem';
import CityMap from './components/CityMap';
import AqiPredictor from './components/AqiPredictor';
import CorrelationInsight from './components/CorrelationInsight';
import VideoFeed from './components/VideoFeed';
import AlprFeed from './components/AlprFeed';

const API_BASE = '/api';

function App() {
  const [data, setData] = useState({
    traffic: null,
    crowd: null,
    pollution: null,
    alerts: []
  });
  
  // Lifted state from CityMap so we can use it to fetch localized data
  const [searchLocation, setSearchLocation] = useState("New Delhi, India");

  const fetchData = async () => {
    try {
      const locationQuery = `?location=${encodeURIComponent(searchLocation)}`;
      const [trafficRes, crowdRes, pollutionRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}/traffic-data${locationQuery}`),
        axios.get(`${API_BASE}/crowd-data${locationQuery}`),
        // Pollution relies on the custom predictor, we'll leave it unchanged for dashboard background
        axios.get(`${API_BASE}/pollution-prediction`), 
        axios.get(`${API_BASE}/alerts${locationQuery}`)
      ]);
      setData({
        traffic: trafficRes.data,
        crowd: crowdRes.data,
        pollution: pollutionRes.data,
        alerts: alertsRes.data.active_alerts,
        engineRaw: alertsRes.data.engine_raw
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleClearLogs = async () => {
    if (window.confirm("Are you sure you want to delete all database logs? This action cannot be undone.")) {
      try {
        const response = await axios.delete('http://localhost:8000/data-viewer/clear');
        alert(response.data.message);
        // Refresh the components that might show historical data if needed, or just let them auto-poll
      } catch (error) {
        console.error("Error clearing logs:", error);
        alert("Failed to clear database logs.");
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [searchLocation]); // Re-fetch immediately when location changes

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-800 shadow-md z-10">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            UrbanEye
          </h1>
          <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400 border border-gray-700 ml-4 hidden sm:block">
            Smart City Control Center
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={handleClearLogs} className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center space-x-1 border border-red-500/30 px-3 py-1 bg-red-500/10 rounded-lg">
             <span>Clear Logs</span>
          </button>
          <a href="http://localhost:8000/data-viewer" target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1">
            <span>View Logs</span>
          </a>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>System Online</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Column - Stats */}
        <div className="lg:col-span-3 flex flex-col space-y-6 overflow-y-auto pr-2 pb-10">
          <TrafficMonitor data={data.traffic} />
          <CrowdMonitor data={data.crowd} />
          <AlertSystem alerts={data.alerts} />
          <AlprFeed alprData={data.traffic?.alpr_data} />
        </div>

        {/* Center Column - Map and Predictor */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden flex flex-col relative h-[500px]">
            <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-700 text-sm font-medium flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>Live City Monitoring</span>
            </div>
            <CityMap data={data} locationName={searchLocation} onLocationChange={setSearchLocation} />
          </div>
          
          <div className="flex-grow min-h-[400px]">
            <VideoFeed />
          </div>
        </div>

        {/* Right Column - Pollution & Analytics */}
        <div className="lg:col-span-3 flex flex-col space-y-6 overflow-y-auto pl-2 pb-10">
          <PollutionChart data={data.pollution} />
          
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg">
             <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold">Engine Analytics</h2>
             </div>
             {data.engineRaw ? (
                <div className="space-y-4">
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Overall Status</p>
                    <p className={`font-semibold ${data.engineRaw.insights.overall_status.includes('Critical') ? 'text-red-400' : 'text-green-400'}`}>
                      {data.engineRaw.insights.overall_status}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400 mb-1">Pollution Trends</p>
                    <p className="font-semibold text-blue-400">
                      {data.engineRaw.insights.pollution_trends}
                    </p>
                  </div>
                </div>
             ) : (
                <div className="h-24 flex items-center justify-center text-gray-500">
                  <span className="w-5 h-5 border-2 border-gray-600 border-t-purple-500 rounded-full animate-spin"></span>
                </div>
             )}
          </div>

          {/* New ML Feature: Traffic vs Pollution Correlation */}
          {data.engineRaw && data.engineRaw.insights && (
            <CorrelationInsight data={data.engineRaw.insights} />
          )}
        </div>

      </main>
    </div>
  );
}

export default App;
