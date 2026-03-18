import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { MapPin } from 'lucide-react';

function SearchField({ onLocationChange, setLat, setLng }) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
            provider: provider,
            style: 'bar', // use bar instead of button
            showMarker: false, // Don't show the default marker
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Search for a city or exact street...'
        });

        map.addControl(searchControl);

        // Listen to map movements to update HUD coordinates
        const onMove = () => {
            const center = map.getCenter();
            setLat(center.lat);
            setLng(center.lng);
        };

        map.on('move', onMove);

        // Listen to search selections
        map.on('geosearch/showlocation', (result) => {
            if (onLocationChange) {
                onLocationChange(result.location.label);
            }
            setLat(result.location.y);
            setLng(result.location.x);
        });

        return () => {
            map.off('move', onMove);
            map.removeControl(searchControl);
        };
    }, [map, onLocationChange, setLat, setLng]);

    return null;
}

// Custom Red Cross DivIcon for Emergency
const createRedCrossIcon = () => {
    return new L.DivIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-ping">
                 <span class="text-red-500 font-bold text-xl drop-shadow-md pb-0.5">✚</span>
               </div>`,
        className: '', // Removes default leaflet styling
        iconSize: [32, 32],
        iconAnchor: [16, 16] // Center the icon
    });
};

function EmergencyHandler({ isEmergency, setLat, setLng, onLocationChange }) {
    const map = useMap();
    const [hasFired, setHasFired] = useState(false);

    useEffect(() => {
        if (isEmergency && !hasFired) {
            setHasFired(true);

            // 1. Voice Alert
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance("Emergency. Emergency. Immediate attention required.");
                utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US' && v.name.includes('Google')) || null;
                utterance.rate = 1.0;
                utterance.pitch = 1.1; // Slightly urgent pitch
                utterance.volume = 1.0;
                window.speechSynthesis.speak(utterance);
            }

            // 2. Fetch PC Live Geolocation and Jump Map
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setLat(latitude);
                        setLng(longitude);
                        map.flyTo([latitude, longitude], 16, { animate: true, duration: 2 });

                        // Optionally update HUD to show it's PC Location
                        if (onLocationChange) {
                            onLocationChange("Live Tracker");
                        }
                    },
                    (error) => {
                        console.error("Geolocation failed:", error);
                        // Fallback: just speak, but don't jump map if permission denied
                    },
                    { enableHighAccuracy: true }
                );
            }

        } else if (!isEmergency && hasFired) {
            // Reset the lock when emergency is over so it can trigger again later
            setHasFired(false);
        }
    }, [isEmergency, hasFired, map, setLat, setLng, onLocationChange]);

    return null;
}

export default function CityMap({ data, locationName, onLocationChange }) {
    const [lng, setLng] = useState(77.2090); // default new delhi
    const [lat, setLat] = useState(28.6139);

    return (
        <div className="w-full h-full min-h-[500px] bg-[#0d1117] relative z-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-gray-800">

            {/* Search Bar Mapbox Replacement using React-Leaflet */}
            <div className="absolute inset-0 z-0 pointer-events-auto">
                <MapContainer
                    center={[lat, lng]}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', background: '#0d1117' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <SearchField onLocationChange={onLocationChange} setLat={setLat} setLng={setLng} />

                    {/* Dynamic Data Overlay UI elements using React Leaflet Layers */}

                    {/* Simulated heat map blob for traffic */}
                    {data?.traffic?.density === 'High' && (
                        <Circle
                            center={[lat, lng]}
                            pathOptions={{ fillColor: 'red', color: 'red', fillOpacity: 0.2, stroke: false }}
                            radius={800} // 800 meters radius
                            className="pulsate-circle-red"
                        />
                    )}

                    {/* Simulated point for crowd */}
                    {data?.crowd?.alert_triggered && (
                        <Circle
                            center={[lat, lng]}
                            pathOptions={{ fillColor: '#eab308', color: '#eab308', fillOpacity: 0.3, stroke: false }}
                            radius={400} // 400 meters radius
                            className="pulsate-circle-yellow"
                        />
                    )}

                    {/* Handle Emergency Actions (Voice, Map FlyTo, Location override) */}
                    <EmergencyHandler
                        isEmergency={data?.traffic?.counts?.emergency_vehicles > 0}
                        setLat={setLat}
                        setLng={setLng}
                        onLocationChange={onLocationChange}
                    />

                    {/* Dynamic Emergency Vehicle Location Alert (Red Cross) */}
                    {data?.traffic?.counts?.emergency_vehicles > 0 && (
                        <Marker position={[lat, lng]} icon={createRedCrossIcon()} />
                    )}
                </MapContainer>
            </div>

            {/* Custom glowing epicenter marker (kept as static overlay to always show exact crosshair) */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -mt-4 -ml-4 flex items-center justify-center w-8 h-8 pointer-events-none">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] border-2 border-white"></div>
                </div>

                {/* Teacher Demo Location Plate HUD */}
                <div className="absolute bottom-6 left-6 flex flex-col space-y-2 pointer-events-auto">
                    <div className="bg-gray-900/90 backdrop-blur-md px-4 py-3 rounded-lg border border-gray-700 shadow-xl max-w-sm">
                        <div className="flex items-center space-x-2 text-gray-300 mb-1">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300">Target Acquired</h3>
                        </div>
                        <p className="font-medium text-white text-md truncate" title={locationName}>
                            {locationName || "New Delhi, India"}
                        </p>
                        <div className="mt-3 flex space-x-3">
                            <span className="px-2 py-1 bg-black/60 rounded text-xs border border-gray-700 font-mono text-indigo-400">
                                LAT: {lat.toFixed(6)}
                            </span>
                            <span className="px-2 py-1 bg-black/60 rounded text-xs border border-gray-700 font-mono text-purple-400">
                                LNG: {lng.toFixed(6)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Style overrides for Leaflet GeoSearch */}
            <style dangerouslySetInnerHTML={{
                __html: `
            .leaflet-control-geosearch {
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                left: auto !important;
                z-index: 1000 !important;
                width: 300px;
            }
            .leaflet-control-geosearch form {
                background-color: rgba(17, 24, 39, 0.9) !important;
                border: 1px solid rgba(55, 65, 81, 1) !important;
                border-radius: 0.5rem !important;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5) !important;
                padding: 0 !important;
            }
            .leaflet-control-geosearch input {
                color: white !important;
                background: transparent !important;
                border: none !important;
                padding: 10px 10px 10px 35px !important;
                border-radius: 0.5rem !important;
            }
            .leaflet-control-geosearch input:focus {
                outline: none !important;
            }
            
            /* Leaflet Circle Animations */
            .pulsate-circle-red {
                animation: pulse-red 2s infinite;
            }
            .pulsate-circle-yellow {
                animation: pulse-yellow 2s infinite;
            }
            .pulsate-circle-blue {
                animation: pulse-blue 1s infinite; /* Faster pulse for emergencies */
            }
            @keyframes pulse-red {
                0% { opacity: 0.4; }
                50% { opacity: 0.8; }
                100% { opacity: 0.4; }
            }
            @keyframes pulse-yellow {
                0% { opacity: 0.5; }
                50% { opacity: 0.9; }
                100% { opacity: 0.5; }
            }
            @keyframes pulse-blue {
                0% { opacity: 0.6; transform: scale(0.9); }
                50% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 0.6; transform: scale(0.9); }
            }

            /* Hide the annoying search icon that leaflet uses by default since it looks bad, we use placeholder instead */
            .leaflet-control-geosearch a.reset {
                color: #9CA3AF !important;
                background: transparent !important;
                top: 8px !important;
            }
            .leaflet-control-geosearch .results {
                background-color: rgba(17, 24, 39, 0.95) !important;
                border: 1px solid rgba(55, 65, 81, 1) !important;
                border-radius: 0.5rem !important;
                margin-top: 5px !important;
                color: white !important;
            }
            .leaflet-control-geosearch .results > * {
                border-bottom: 1px solid rgba(55, 65, 81, 0.5) !important;
                padding: 8px 12px !important;
            }
            .leaflet-control-geosearch .results > *:hover {
                background-color: rgba(55, 65, 81, 0.5) !important;
                color: white !important;
            }
            .leaflet-control-geosearch form input::placeholder {
                color: #9CA3AF !important;
            }
            .leaflet-container .leaflet-control-attribution {
                background: rgba(0, 0, 0, 0.5) !important;
                color: #9CA3AF !important;
            }
            .leaflet-container .leaflet-control-attribution a {
                color: #60A5FA !important;
            }
      `}} />

        </div>
    );
}
