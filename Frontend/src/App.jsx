import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Atmosphere from './pages/Atmosphere';
import Gardens from './pages/Gardens';
import Insights from './pages/Insights';

export default function App() {
  const [displayData, setDisplayData] = useState({
    temperature: 24.5,
    humidity: 45.0,
    soil_moisture_percent: 65,
    soil_ph: 6.8,
    water_level_percent: 82,
    led_brightness: 75,
    pump_status: false,
    occupancy: 3,
    rain_detected: false,
    ai_suggestion: "Soil nitrogen levels are optimal for current growth phase. Recommendation: Maintain current irrigation schedule."
  });

  const latestDataRef = useRef(null);

  useEffect(() => {
    // Connect to Backend WebSocket
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('Connected to AIoT Backend WS');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received real-time data:', data);
        latestDataRef.current = data;
      } catch (err) {
        console.error('Error parsing WS message', err);
      }
    };

    ws.onclose = () => {
      console.log('WS Connection closed');
    };

    const interval = setInterval(() => {
      if (latestDataRef.current) {
        setDisplayData(latestDataRef.current);
      }
    }, 1000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  // Pass displayData to all Outlet components (Dashboard, Atmosphere, etc.)
  return (
    <Routes>
      <Route path="/" element={<Layout displayData={displayData} />}>
        <Route index element={<Dashboard />} />
        <Route path="atmosphere" element={<Atmosphere />} />
        <Route path="gardens" element={<Gardens />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  );
}