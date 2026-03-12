import React, { useState, useEffect } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';

export default function AlprFeed({ alprData }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (alprData) {
      setTickets(prev => {
        // Add new ticket to the beginning of the list
        const newTickets = [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            ...alprData
          },
          ...prev
        ];
        // Keep only the last 5 tickets
        return newTickets.slice(0, 5);
      });
    }
  }, [alprData]);

  if (tickets.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-red-400">
          <Camera className="w-5 h-5" />
          <h2 className="text-lg font-bold">ALPR System (Live)</h2>
        </div>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-gray-800/80 border border-red-500/30 rounded-lg p-3 animate-[slideIn_0.3s_ease-out]">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-bold text-sm">{ticket.violation}</span>
              </div>
              <span className="text-xs text-gray-500">{ticket.time}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-900 rounded px-2 py-1 text-center border border-gray-700">
                 <span className="text-xs text-gray-400 block">Plate Number</span>
                 <span className="font-mono font-bold text-white tracking-wider">{ticket.plate_number}</span>
              </div>
              <div className="bg-gray-900 rounded px-2 py-1 text-center border border-gray-700">
                 <span className="text-xs text-gray-400 block">Speed Captured</span>
                 <span className="font-bold text-red-400">{ticket.speed} km/h</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex justify-end">
              <span>{ticket.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
