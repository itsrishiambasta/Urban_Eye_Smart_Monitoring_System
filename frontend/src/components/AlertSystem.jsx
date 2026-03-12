import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function AlertSystem({ alerts }) {
  if (!alerts) return null;

  const getIcon = (severity) => {
    switch (severity) {
      case 'Critical': return <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'High': return <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />;
      case 'Moderate': return <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      default: return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getBgClass = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 border-red-500/20';
      case 'High': return 'bg-orange-500/10 border-orange-500/20';
      case 'Moderate': return 'bg-yellow-500/10 border-yellow-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg flex flex-col overflow-hidden max-h-64">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/30">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3">
            {alerts.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${alerts.length > 0 ? 'bg-red-500' : 'bg-gray-500'}`}></span>
          </div>
          <h2 className="text-lg font-semibold text-gray-200">Live Alerts</h2>
        </div>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full border border-gray-700">
          {alerts.length} Active
        </span>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No active alerts in the city. All systems nominal.
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div key={idx} className={`flex items-start space-x-3 p-3 rounded-lg border ${getBgClass(alert.severity)} transition-all duration-300 hover:bg-opacity-20`}>
              {getIcon(alert.severity)}
              <div>
                <p className="text-sm font-medium text-gray-200 mb-0.5">{alert.type} Alert</p>
                <p className="text-xs text-gray-400 leading-snug">{alert.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
