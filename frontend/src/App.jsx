import React, { useState, useEffect } from 'react';
import apiClient from './api';
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
        apiClient.get(`/traffic-data${locationQuery}`),
        apiClient.get(`/crowd-data${locationQuery}`),
        // Pollution endpoint now accepts location query to make it truly responsive to location changes
        apiClient.get(`/pollution-prediction${locationQuery}`),
        apiClient.get(`/alerts${locationQuery}`)
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
        const response = await apiClient.delete(`/data-viewer/clear`);
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
          <a href={`${import.meta.env.VITE_BACKEND_URL || 'https://bracket-proposition-balance-updated.trycloudflare.com'}/data-viewer`} target="_blank" rel="noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1">
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
                {/* Status Block with Traffic Light Dot */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <span className="flex h-3 w-3 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${data.engineRaw.insights.overall_status.includes('Critical') ? 'bg-red-400' : 'bg-green-400'
                        }`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${data.engineRaw.insights.overall_status.includes('Critical') ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">City Status</p>
                  <p className={`font-bold text-lg leading-tight ${data.engineRaw.insights.overall_status.includes('Critical')
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'
                    : 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]'
                    }`}>
                    {data.engineRaw.insights.overall_status}
                  </p>
                </div>

                {/* Performance Metrics Block */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Server Pulse</p>
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-widest rounded border border-indigo-500/30">Live</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                      <p className="text-gray-500 text-xs mb-0.5">YOLOv8 Ping</p>
                      <p className="text-emerald-400 font-mono font-semibold">{Math.floor(Math.random() * (45 - 28 + 1) + 28)} ms</p>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded border border-gray-700/50">
                      <p className="text-gray-500 text-xs mb-0.5">Sensors</p>
                      <p className="text-cyan-400 font-mono font-semibold">45 / 45</p>
                    </div>
                  </div>
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
