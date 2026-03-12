import React from 'react';
import { Leaf, ArrowDown } from 'lucide-react';

export default function CorrelationInsight({ data }) {
  if (!data || !data.traffic_pollution_correlation) return null;

  const { coefficient, insight_text, reduction_potential, action } = data.traffic_pollution_correlation;

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Leaf className="w-5 h-5 text-emerald-400" />
        <h2 className="text-lg font-semibold text-gray-100">AI Correlation Insight</h2>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-start mb-2">
             <p className="text-sm font-medium text-gray-300">Traffic-Pollution Match</p>
             <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20 font-mono">
               r = {coefficient.toFixed(2)}
             </span>
          </div>
          <p className="text-xl font-bold text-white mb-1">{insight_text}</p>
        </div>

        <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-lg flex items-start space-x-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
             <ArrowDown className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-300">Actionable Data</p>
            <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">{action}</p>
            <div className="mt-2 inline-flex items-center space-x-1 text-xs font-mono bg-black/30 px-2 py-1 rounded text-emerald-200">
               <span>Potential AQI Drop:</span>
               <span className="font-bold text-white">-{reduction_potential} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
