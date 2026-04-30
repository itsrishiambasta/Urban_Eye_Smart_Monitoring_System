import React, { useState } from 'react';
import apiClient from '../api';
import { RefreshCw, Activity } from 'lucide-react';

// Default mean values based on typical dataset
const initialFeatures = {
  PM2_5: 45.0,
  PM10: 90.0,
  NO: 15.0,
  NO2: 30.0,
  NOx: 40.0,
  NH3: 20.0,
  CO: 1.0,
  SO2: 10.0,
  O3: 30.0,
  Benzene: 2.0,
  Toluene: 5.0,
  Xylene: 1.0
};

// Reasonable ranges for the sliders
const slidersConfig = [
  { key: 'PM2_5', label: 'PM2.5 (μg/m³)', max: 300 },
  { key: 'PM10', label: 'PM10 (μg/m³)', max: 500 },
  { key: 'NO2', label: 'NO2 (μg/m³)', max: 200 },
  { key: 'O3', label: 'O3 (μg/m³)', max: 200 },
  { key: 'CO', label: 'CO (mg/m³)', max: 50, step: 0.1 },
];

const getAqiColor = (level) => {
  if (level === 'Good') return 'text-green-400 border-green-400';
  if (level === 'Moderate') return 'text-yellow-400 border-yellow-400';
  if (level.includes('Unhealthy')) return 'text-orange-500 border-orange-500';
  return 'text-red-500 border-red-500'; // Very Unhealthy / Hazardous
};

function AqiPredictor() {
  const [features, setFeatures] = useState(initialFeatures);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (e, key) => {
    setFeatures({
      ...features,
      [key]: parseFloat(e.target.value)
    });
  };

  const calculateAqI = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/pollution-prediction/predict-aqi`, features);
      setPrediction(response.data);
    } catch (error) {
      console.error("Error fetching AI prediction:", error);
    } finally {
      setTimeout(() => setLoading(false), 300); // Artificial slight delay for UI feedback
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-indigo-900/50 shadow-[0_0_15px_rgba(79,70,229,0.15)] flex flex-col h-full relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Interactive ML Predictor
          </h2>
        </div>
        <button
          onClick={calculateAqI}
          className="flex items-center space-x-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors border border-indigo-400/30"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Predict</span>
        </button>
      </div>

      <div className="text-xs text-gray-400 mb-4 font-light italic relative z-10">
        Adjust pollutant levels to see real-time AQI predictions from the Random Forest model.
      </div>

      <div className="flex-grow flex flex-col space-y-4 mb-6 relative z-10 overflow-y-auto pr-2 custom-scrollbar">
        {slidersConfig.map((slider) => (
          <div key={slider.key} className="flex flex-col space-y-1 group">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium group-hover:text-indigo-300 transition-colors">{slider.label}</span>
              <span className="text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded text-xs border border-indigo-800/50">
                {features[slider.key].toFixed(slider.step ? 1 : 0)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={slider.max}
              step={slider.step || 1}
              value={features[slider.key]}
              onChange={(e) => handleSliderChange(e, slider.key)}
              className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />
          </div>
        ))}
      </div>

      <div className="mt-auto bg-gray-950/50 rounded-xl p-4 border border-gray-800 flex items-center justify-between relative z-10">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">AI Prediction</p>
          {prediction ? (
            <p className={`text-sm font-semibold ${getAqiColor(prediction.level).split(' ')[0]}`}>
              Status: {prediction.level}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Awaiting input...</p>
          )}
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">AQI</div>
          {prediction ? (
            <div className={`text-3xl font-bold font-mono tracking-tighter ${getAqiColor(prediction.level).split(' ')[0]}`}>
              {prediction.current_aqi}
            </div>
          ) : (
            <div className="text-3xl font-bold font-mono text-gray-700">--</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AqiPredictor;
