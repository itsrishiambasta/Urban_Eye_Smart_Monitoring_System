import React from 'react';
import { Users } from 'lucide-react';

export default function CrowdMonitor({ data }) {
  if (!data) return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg min-h-[160px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-700 border-t-teal-500 rounded-full animate-spin"></div>
    </div>
  );

  const { count, density, alert_triggered } = data;

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 text-teal-400">
          <Users className="w-6 h-6" />
          <h2 className="text-xl font-bold">Crowd Density</h2>
        </div>
        {alert_triggered && (
          <span className="flex items-center space-x-1.5 text-xs text-red-400 font-semibold bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20 animate-pulse">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span>ALERT</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-gray-400 text-sm mb-1">Detected Persons</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
              {count}
            </p>
            <span className="text-sm text-gray-500 font-medium">people</span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className={`font-semibold tracking-wide ${
            density === 'Critical' ? 'text-red-500' :
            density === 'High' ? 'text-orange-400' :
            density === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'
          }`}>
            {density}
          </p>
        </div>
      </div>
    </div>
  );
}
