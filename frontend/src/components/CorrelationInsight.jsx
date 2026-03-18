import React from 'react';
import { Leaf, ArrowDown } from 'lucide-react';

export default function CorrelationInsight({ data }) {
  if (!data || !data.traffic_pollution_correlation) return null;

  const [simulatedDrop, setSimulatedDrop] = React.useState(0);
  const [isSimulating, setIsSimulating] = React.useState(false);

  const { coefficient, insight_text, reduction_potential, action } = data.traffic_pollution_correlation;

  // Determine severity colors dynamically
  let barColor, bgLight, iconColor, textColor;
  if (coefficient >= 0.75) {
      barColor = 'bg-red-500'; bgLight = 'bg-red-500/20'; iconColor = 'text-red-400'; textColor = 'text-red-300';
  } else if (coefficient >= 0.55) {
      barColor = 'bg-yellow-500'; bgLight = 'bg-yellow-500/20'; iconColor = 'text-yellow-400'; textColor = 'text-yellow-300';
  } else {
      barColor = 'bg-emerald-500'; bgLight = 'bg-emerald-500/20'; iconColor = 'text-emerald-400'; textColor = 'text-emerald-300';
  }

  const handleSimulate = () => {
      setIsSimulating(true);
      setSimulatedDrop(reduction_potential);
      setTimeout(() => setIsSimulating(false), 2000);
      
      // Auto-reset simulation after 10 seconds for demo purposes
      setTimeout(() => setSimulatedDrop(0), 10000);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg mt-6 relative overflow-hidden group">
      {/* Subtle background glow effect based on correlation severity */}
      <div className={`absolute -inset-1 opacity-10 blur-xl transition duration-1000 ${barColor}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-4">
          <Leaf className={`w-5 h-5 ${iconColor}`} />
          <h2 className="text-lg font-semibold text-gray-100">AI Correlation Insight</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-800/80 p-4 rounded-lg border border-gray-700">
            <div className="flex text-sm font-medium text-gray-300 items-baseline mb-2">
               <span>Traffic-Pollution Match</span>
               <span className="ml-auto font-mono text-xs">{Math.round(coefficient * 100)}%</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-3 overflow-hidden">
                <div 
                    className={`${barColor} h-2 rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${coefficient * 100}%` }}
                ></div>
            </div>
            
            <p className="text-sm font-semibold text-gray-200 mb-1 leading-snug">{insight_text}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg flex items-start space-x-3 border border-gray-700 shadow-inner">
            <div className={`p-2 ${bgLight} rounded-lg shrink-0`}>
               <ArrowDown className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="flex-grow">
              <p className={`text-sm font-semibold ${textColor}`}>Actionable Data</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{action}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className={`text-xs font-mono font-bold ${isSimulating ? 'text-green-400' : 'text-gray-300'} transition-colors duration-500`}>
                  Est. Drop: -{reduction_potential} pts
                </div>
                <button 
                  onClick={handleSimulate}
                  disabled={isSimulating || simulatedDrop > 0}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    simulatedDrop > 0 
                      ? 'bg-green-600/30 text-green-400 border border-green-500/30' 
                      : 'bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 cursor-pointer hover:shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                  }`}
                >
                  {simulatedDrop > 0 ? "Tracking Impact..." : "Simulate Output"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
