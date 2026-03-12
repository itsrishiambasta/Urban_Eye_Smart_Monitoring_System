import React from 'react';
import { Car } from 'lucide-react';

export default function TrafficMonitor({ data }) {
  if (!data) return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg min-h-[200px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  const { counts, density, predicted_density_1h, trend, emergency_alert } = data;

  const getTrendColor = (t) => {
    if (t === "Increasing") return "text-orange-400";
    if (t === "Decreasing") return "text-green-400";
    return "text-blue-400";
  };

  return (
    <div className={`bg-gray-900 rounded-xl p-5 border shadow-lg relative overflow-hidden group transition-all duration-300 ${emergency_alert ? 'border-red-500 shadow-red-500/20' : 'border-gray-800'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 text-blue-400">
          <Car className="w-6 h-6" />
          <h2 className="text-xl font-bold">Traffic Monitor</h2>
          {emergency_alert && (
            <span className="flex h-3 w-3 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {emergency_alert && (
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide border bg-red-600/20 text-red-500 border-red-500/50 animate-pulse flex items-center">
              AMBULANCE DETECTED
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border 
          ${density === 'High' || density === 'Severe' ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' : 
            density === 'Moderate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
            'bg-green-500/10 text-green-500 border-green-500/30'}`}>
            {density} Density
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm mb-1">Live Vehicles</p>
          <p className="text-3xl font-bold text-white tracking-tight">{counts.total}</p>
          
          {counts.predicted_total_1h && (
             <div className="mt-3 text-center border-t border-gray-700/50 pt-2 w-full">
               <p className="text-xs text-gray-400">1 Hr Forecast</p>
               <div className="flex items-center justify-center space-x-2 mt-1">
                 <p className="text-lg font-bold text-gray-200">{counts.predicted_total_1h}</p>
                 <span className={`text-xs font-medium ${getTrendColor(trend)}`}>
                   ({trend})
                 </span>
               </div>
             </div>
          )}
        </div>
        <div className="space-y-3 flex flex-col justify-center">
          <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
            <span className="text-sm text-gray-400">Cars</span>
            <span className="font-semibold">{counts.cars}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
            <span className="text-sm text-gray-400">Bikes/Buses</span>
            <span className="font-semibold">{counts.bikes + counts.buses}</span>
          </div>
          {predicted_density_1h && (
            <div className="flex justify-between items-center bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-500/30">
              <span className="text-xs text-indigo-300">Est. Density</span>
              <span className={`text-xs font-bold ${predicted_density_1h === 'Severe' || predicted_density_1h === 'High' ? 'text-red-400' : 'text-indigo-400'}`}>
                {predicted_density_1h}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
