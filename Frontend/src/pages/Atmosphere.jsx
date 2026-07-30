import { useOutletContext } from 'react-router-dom';

export default function Atmosphere() {
  const { displayData } = useOutletContext();

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Atmosphere Detail</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Real-time climatic conditions and predictive forecasting.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-[11px]">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Live Sync
          </span>
          <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors border card-border">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-card-gap">
        
        {/* Primary Metrics (Left Column) */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-card-gap">
          {/* Temperature Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,30 L0,15 C20,10 40,25 60,10 C80,-5 100,20 100,20 L100,30 Z" fill="#10B981"></path>
              </svg>
            </div>
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary-container">thermostat</span>
                <span className="font-label-caps text-label-caps">Current Temp</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded bg-secondary-container/50 text-secondary font-label-caps text-[10px]">
                Ideal
              </span>
            </div>
            <div className="z-10 relative mt-4">
              <div className="font-display-metric text-display-metric gradient-text">{displayData.temperature.toFixed(1)}°</div>
              <div className="font-body-md text-on-surface-variant mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">arrow_drop_down</span>
                0.5° from yesterday
              </div>
            </div>
          </div>

          {/* Humidity Circular Gauge Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex flex-col items-center justify-center relative min-h-[260px]">
            <div className="w-full flex justify-between items-start absolute top-6 left-6 right-6">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary">water_drop</span>
                <span className="font-label-caps text-label-caps">Humidity</span>
              </div>
            </div>
            <div className="relative w-40 h-40 mt-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="emerald-gradient-humid" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <circle className="gauge-track" cx="50" cy="50" r="45" fill="none" strokeWidth="10" strokeLinecap="round"></circle>
                <circle className="gauge-fill" cx="50" cy="50" r="45" fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray="282.7" strokeDashoffset={282.7 - (displayData.humidity / 100) * 282.7}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-metric text-[32px] font-bold text-on-surface leading-none">{displayData.humidity.toFixed(0)}<span className="text-[20px] text-on-surface-variant">%</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart & Forecast (Right Column) */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-card-gap">
          {/* 24h Trend Chart */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined">timeline</span>
                <span className="font-label-caps text-label-caps">24 Hour Trend</span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-surface-container-high text-on-surface font-label-caps text-[11px] hover:bg-surface-container transition-colors">Temp</button>
                <button className="px-3 py-1 rounded text-on-surface-variant font-label-caps text-[11px] hover:bg-surface-container transition-colors">Humidity</button>
              </div>
            </div>
            {/* SVG Chart Area */}
            <div className="w-full flex-1 relative min-h-[200px]">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="emerald-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="50" x2="600" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <path className="chart-area" d="M0,120 C100,140 200,80 300,100 C400,120 500,40 600,60 L600,200 L0,200 Z"></path>
                <path className="chart-line" d="M0,120 C100,140 200,80 300,100 C400,120 500,40 600,60"></path>
                <circle cx="300" cy="100" r="5" fill="#ffffff" stroke="#10B981" strokeWidth="2"></circle>
                <circle cx="500" cy="40" r="5" fill="#ffffff" stroke="#10B981" strokeWidth="2"></circle>
              </svg>
              <div className="absolute bottom-[-24px] left-0 w-full flex justify-between font-label-caps text-[10px] text-outline">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>Now</span>
              </div>
            </div>
          </div>
          
          {/* Neural Insight: Rain Forecast */}
          <div className="bg-[#F8FAFC] rounded-xl p-5 border border-dashed border-primary-container relative flex gap-4">
            <div className="absolute top-4 right-4">
              <span className="material-symbols-outlined text-primary-container text-[18px]">auto_awesome</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[24px]">rainy</span>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface mb-1">Precipitation Forecast</h4>
              <p className="font-neural-insight text-neural-insight text-on-surface-variant leading-relaxed">
                {displayData.rain_detected ? 'Current status indicates rain is actively falling. ' : 'Atmospheric pressure is dropping slightly. '}
                Models predict a <strong>65% chance of light rain</strong> beginning around 14:00 local time, expected to yield approximately 2.5mm of precipitation over a 3-hour window. Ideal conditions for garden soil absorption without causing runoff.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
