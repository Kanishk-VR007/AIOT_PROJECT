import { useOutletContext } from 'react-router-dom';
import { CircularGauge } from '../components/CircularGauge';

export default function Gardens() {
  const { displayData } = useOutletContext();

  // Dynamic Y calculation for the pH graph dot
  // Maps pH 5.25-8.25 to SVG Y 200-0
  const phY = Math.max(0, Math.min(200, 200 - ((displayData.soil_ph - 5.25) * 66.6)));

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Garden Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Zone health, irrigation status, and soil analytics.</p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-card-gap">
        
        {/* Left Column: Gauges and Status */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-card-gap">
          
          {/* Crop Info Pill */}
          <div className="bg-primary-container/10 border border-primary-container/20 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center">
                <span className="material-symbols-outlined">potted_plant</span>
              </div>
              <div>
                <div className="text-xs text-outline font-label-caps uppercase">Current Crop</div>
                <div className="font-bold text-primary">{displayData.planted_crop}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-outline">Light (LDR)</div>
              <div className="font-bold text-on-surface">{displayData.ldr_value}</div>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex flex-col items-center justify-center min-h-[240px] relative">
            <div className="w-full flex justify-start absolute top-6 left-6">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary-container">water_drop</span>
                <span className="font-label-caps text-label-caps">Soil Moisture</span>
              </div>
            </div>
            <div className="mt-8 scale-90 origin-center">
              <CircularGauge value={displayData.soil_moisture_percent} />
            </div>
          </div>

          {/* Water Reservoir */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex flex-col items-center justify-center min-h-[240px] relative">
            <div className="w-full flex justify-between absolute top-6 left-6 right-6">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-blue-500">water_full</span>
                <span className="font-label-caps text-label-caps">Reservoir</span>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${displayData.pump_status ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                Pump {displayData.pump_status ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="mt-8 scale-90 origin-center">
              <CircularGauge value={displayData.water_level_percent} />
            </div>
          </div>
        </div>

        {/* Right Column: pH Graph and Details */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-card-gap">
          {/* pH Trend Chart */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex-1 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-emerald-500">science</span>
                <span className="font-label-caps text-label-caps">Soil pH Trend (24h)</span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-on-surface">{displayData.soil_ph.toFixed(1)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 tracking-wider ${displayData.soil_ph >= 6.0 && displayData.soil_ph <= 7.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {displayData.soil_ph >= 6.0 && displayData.soil_ph <= 7.0 ? 'Optimal' : 'Needs Attention'}
                </span>
              </div>
            </div>
            
            {/* SVG Chart Area */}
            <div className="w-full flex-1 relative min-h-[250px]">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="ph-area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Y-Axis lines (pH levels) */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <text x="0" y="45" fill="#94a3b8" fontSize="10">pH 7.5</text>
                
                <line x1="0" y1="100" x2="600" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <text x="0" y="95" fill="#94a3b8" fontSize="10">pH 6.8</text>
                
                <line x1="0" y1="150" x2="600" y2="150" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4,4"></line>
                <text x="0" y="145" fill="#94a3b8" fontSize="10">pH 6.0</text>
                
                {/* Dynamic Trend Path connecting historical points to the live point */}
                <path d={`M 0,110 C 75,110 75,115 150,115 C 225,115 225,105 300,105 C 375,105 375,110 450,110 C 525,110 525,${phY} 600,${phY} L 600,200 L 0,200 Z`} fill="url(#ph-area-gradient)"></path>
                <path d={`M 0,110 C 75,110 75,115 150,115 C 225,115 225,105 300,105 C 375,105 375,110 450,110 C 525,110 525,${phY} 600,${phY}`} stroke="#10B981" strokeWidth="3" fill="none"></path>
                
                {/* Historical Data Points */}
                <circle cx="150" cy="115" r="4" fill="#ffffff" stroke="#10B981" strokeWidth="2"></circle>
                <circle cx="300" cy="105" r="4" fill="#ffffff" stroke="#10B981" strokeWidth="2"></circle>
                <circle cx="450" cy="110" r="4" fill="#ffffff" stroke="#10B981" strokeWidth="2"></circle>
                
                {/* Live Data Point Indicator */}
                <circle cx="600" cy={phY} r="6" fill="#10B981" stroke="#ffffff" strokeWidth="2" className="animate-pulse"></circle>
              </svg>
              <div className="absolute bottom-[-24px] left-0 w-full flex justify-between font-label-caps text-[10px] text-outline">
                <span>Yesterday</span>
                <span>Midnight</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>Now</span>
              </div>
            </div>
          </div>
          
          {/* Garden AI Insight */}
          <div className="bg-[#F8FAFC] rounded-xl p-6 border border-dashed border-primary-container relative flex gap-5 mt-auto">
            <div className="absolute top-4 right-4">
              <span className="material-symbols-outlined text-primary-container text-[18px]">auto_awesome</span>
            </div>
            <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center shrink-0 shadow-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-[28px]">psychology</span>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface mb-2">Neural Recommendation</h4>
              <p className="font-neural-insight text-neural-insight text-on-surface-variant leading-relaxed">
                {displayData.ai_suggestion}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
