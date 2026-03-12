import React, { useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export default function VideoFeed() {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use relative URL to leverage Vite proxy, avoiding 127.0.0.1 IP mismatches
  const videoUrl = "/api/video/feed";

  return (
    <div className="bg-gray-900 rounded-xl p-0 border border-gray-800 shadow-lg overflow-hidden flex flex-col h-[500px]">
      <div className="flex items-center justify-between p-4 bg-gray-800/80 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-red-500 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-100">Live Traffic Feed (YOLOv8)</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>REC</span>
        </div>
      </div>
      
      <div className="flex-grow bg-black relative flex items-center justify-center overflow-hidden">
        {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10 bg-gray-900/50 backdrop-blur-sm">
                <span className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-3"></span>
                <span className="font-mono text-sm">Connecting to MJPEG stream...</span>
            </div>
        )}

        {hasError ? (
          <div className="flex flex-col items-center justify-center text-red-400 p-6 text-center">
            <AlertCircle className="w-12 h-12 mb-3 opacity-80" />
            <p className="font-semibold text-lg">Connection Lost</p>
            <p className="text-sm opacity-70 mt-1 max-w-sm">
              Unable to reach the live feed at <span className="font-mono">/video/feed</span>. 
              Please ensure the backend server and YOLOv8 inferencing engine are running.
            </p>
          </div>
        ) : (
          <img 
            src={videoUrl}
            alt="Live Traffic Video Feed"
            className="w-full h-full object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
