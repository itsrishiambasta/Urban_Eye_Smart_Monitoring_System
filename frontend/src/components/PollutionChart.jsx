import React, { useRef, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Wind } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function PollutionChart({ data }) {
  if (!data) return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg min-h-[300px] flex items-center justify-center text-gray-500">
      <div className="w-8 h-8 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );

  const { current_aqi, predicted_aqi_tomorrow, level } = data;

  // Keep a scrolling window of the last 10 readings to make the chart look dynamic
  // When a new location is searched, this will naturally adjust as new data streams in.
  const [history, setHistory] = React.useState([]);

  React.useEffect(() => {
    setHistory(prev => {
        const newHistory = [...prev, current_aqi];
        if (newHistory.length > 7) {
            newHistory.shift(); // keep only last 7 data points (simulating week)
        }
        return newHistory;
    });
  }, [current_aqi]);

  // Generate labels dynamically based on how much history we have
  const labels = history.map((_, i) => i === history.length - 1 ? 'Now' : `T-${history.length - 1 - i}`);

  const chartData = {
    labels: [...labels, 'Tomorrow (Predicted)'],
    datasets: [
      {
        label: 'Air Quality Index',
        data: [...history, predicted_aqi_tomorrow], 
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(255, 255, 255)',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(75, 85, 99, 0.5)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.2)', borderDash: [5, 5] },
        ticks: { color: '#9ca3af' },
        suggestedMin: 0,
        suggestedMax: 200,
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' },
      }
    },
    interaction: { mode: 'index', intersect: false },
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 text-indigo-400">
          <Wind className="w-6 h-6" />
          <h2 className="text-xl font-bold">Air Pollution</h2>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-gray-800/40 p-4 rounded-lg border border-gray-700/40">
        <div>
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Current AQI</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              {current_aqi}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-wider">Condition</p>
          <span className={`text-sm font-semibold ${
            level.includes('Unhealthy') || level === 'Hazardous' ? 'text-red-400' :
            level === 'Moderate' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {level}
          </span>
        </div>
      </div>

      <div className="h-48 w-full relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
