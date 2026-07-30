import { useOutletContext } from 'react-router-dom';
import { CircularGauge } from '../components/CircularGauge';


export default function Dashboard() {
  const { displayData } = useOutletContext();

  return (
    <div className="flex flex-col gap-section-margin w-full">
      {/* Bento Grid Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {/* Atmosphere Card (Large) */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-card-gap soft-shadow card-border relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute inset-0 bg-primary-container/5 opacity-50 z-0"></div>
          <div className="relative z-10 flex justify-between items-start w-full">
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-primary">thermostat</span>
              <h2 className="font-label-caps text-label-caps uppercase text-outline">Atmosphere</h2>
            </div>
            <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Stable
            </div>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mt-8">
            <div>
              <div className="font-display-metric text-display-metric text-on-surface mb-2">{displayData.temperature.toFixed(1)}°C</div>
              <div className="flex gap-4 text-sm text-outline">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">target</span> Target: 22.0°C
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">water_drop</span> Humidity: {displayData.humidity.toFixed(1)}%
                </span>
              </div>
            </div>
            {/* Sparkline graphic placeholder */}
            <div className="w-full md:w-1/2 h-24 mt-6 md:mt-0 flex items-end">
              <svg className="w-full h-full preserve-aspect-ratio-none" fill="none" stroke="currentColor" viewBox="0 0 100 30">
                <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,10 T100,5" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                <path d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,10 T100,5 L100,30 L0,30 Z" fill="#10b981" fillOpacity="0.1" stroke="none"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Presence & Illumination Stack */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-gutter">
          {/* Presence Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">sensor_occupied</span>
              <h2 className="font-label-caps text-label-caps uppercase text-outline">Presence</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-headline-lg text-headline-lg text-on-surface">{displayData.occupancy} Active</div>
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-surface-dim border-2 border-white flex items-center justify-center text-xs text-outline">Z1</div>
                <div className="w-8 h-8 rounded-full bg-surface-dim border-2 border-white flex items-center justify-center text-xs text-outline">Z2</div>
                {displayData.occupancy > 0 && (
                  <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-white flex items-center justify-center text-xs text-white">Z4</div>
                )}
              </div>
            </div>
          </div>

          {/* Illumination Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h2 className="font-label-caps text-label-caps uppercase text-outline">Illumination</h2>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold text-on-surface">{displayData.led_brightness}%</div>
              <div className="text-sm text-outline">Auto-dimming active</div>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2.5 mt-2">
              <div className="bg-primary-container h-2.5 rounded-full transition-all duration-1000" style={{ width: `${displayData.led_brightness}%` }}></div>
            </div>
          </div>
        </div>

        {/* Reservoir Circular Gauge */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-card-gap soft-shadow card-border flex flex-col items-center justify-center text-center">
          <div className="w-full flex justify-start items-center gap-2 mb-6 text-outline">
            <span className="material-symbols-outlined text-primary">water</span>
            <h2 className="font-label-caps text-label-caps uppercase text-outline">Reservoir</h2>
          </div>
          <CircularGauge value={displayData.water_level_percent} />
          <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold mt-4 uppercase">
            {displayData.pump_status ? 'Active' : 'Standby'}
          </div>
        </div>

        {/* Garden Dual Metrics */}
        <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-card-gap soft-shadow card-border flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">local_florist</span>
            <h2 className="font-label-caps text-label-caps uppercase text-outline">Garden Zone Alpha</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
            {/* Soil Moisture Gauge */}
            <div className="flex items-center gap-6">
              <div className="scale-75 origin-left">
                 <CircularGauge value={displayData.soil_moisture_percent} />
              </div>
              <div className="-ml-4">
                <div className="text-sm text-outline mb-1">Soil Moisture</div>
                <div className="text-sm font-medium text-primary">Irrigation Armed</div>
              </div>
            </div>

            {/* Soil pH Card */}
            <div className="bg-surface p-6 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
              <div className="text-sm text-outline mb-2">Soil pH</div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-on-surface">{displayData.soil_ph.toFixed(1)}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 tracking-wider ${displayData.soil_ph >= 6.0 && displayData.soil_ph <= 7.0 ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {displayData.soil_ph >= 6.0 && displayData.soil_ph <= 7.0 ? 'Optimal' : 'Needs Attention'}
                </span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-1 mt-2">
                <div className="bg-primary-container h-1 rounded-full relative transition-all duration-1000" style={{ width: '20%', left: `${(displayData.soil_ph / 14) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Neural Insights Area */}
      <section className="w-full bg-slate-50 border border-dashed border-primary rounded-xl p-6 relative overflow-hidden soft-shadow mt-4">
        <div className="absolute top-4 right-4">
          <span className="material-symbols-outlined text-primary animate-pulse">temp_preferences_custom</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-label-caps text-label-caps uppercase text-primary">Llama-3 Neural Insights</h2>
        </div>
        <div className="font-neural-insight text-neural-insight text-on-surface-variant font-mono">
          &gt;_ {displayData.ai_suggestion}
          <span className="inline-block w-2 h-4 bg-primary ml-2 animate-pulse align-middle"></span>
        </div>
      </section>


    </div>
  );
}
