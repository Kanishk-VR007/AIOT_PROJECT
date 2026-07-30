import { useOutletContext } from 'react-router-dom';

export default function Insights() {
  const { displayData } = useOutletContext();

  return (
    <div className="w-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">AI Insights</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">System logs, predictions, and automated actions.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-card-gap">
        {/* Reasoning Display */}
        <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-[28px]">psychology</span>
            <h3 className="font-headline-lg text-[20px] text-on-surface">Decision Rationale</h3>
          </div>
          
          <div className="bg-[#F8FAFC] rounded-xl p-6 border border-dashed border-primary-container relative flex-1 flex flex-col gap-4">
            <h4 className="font-label-caps text-label-caps text-on-surface mb-2">Llama-3 Explanation</h4>
            <p className="font-neural-insight text-neural-insight text-on-surface-variant leading-relaxed text-lg">
              "{displayData.ai_reasoning || "Waiting for next AI execution cycle to generate reasoning..."}"
            </p>
          </div>
        </div>

        {/* Factoring Data */}
        <div className="bg-surface-container-lowest rounded-xl p-6 soft-shadow card-border flex flex-col gap-6">
          <h3 className="font-headline-lg text-[20px] text-on-surface">Current Factoring Data</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-outline-variant/30">
              <span className="block text-xs text-outline font-label-caps uppercase mb-1">Water Level</span>
              <span className="text-xl font-bold text-on-surface">{displayData.water_level_percent}%</span>
              <span className="block text-[10px] mt-1 text-on-surface-variant">Triggers pump if &lt; 40%</span>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-outline-variant/30">
              <span className="block text-xs text-outline font-label-caps uppercase mb-1">Motion / Occupancy</span>
              <span className="text-xl font-bold text-on-surface">
                {displayData.motion_detected ? "Yes" : "No"} / {displayData.occupancy}
              </span>
              <span className="block text-[10px] mt-1 text-on-surface-variant">Controls ambient lighting</span>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-outline-variant/30">
              <span className="block text-xs text-outline font-label-caps uppercase mb-1">Light (LDR)</span>
              <span className="text-xl font-bold text-on-surface">{displayData.ldr_value}</span>
              <span className="block text-[10px] mt-1 text-on-surface-variant">Darkness threshold &gt; 400</span>
            </div>

            <div className="bg-surface rounded-lg p-4 border border-outline-variant/30">
              <span className="block text-xs text-outline font-label-caps uppercase mb-1">Current Actions</span>
              <div className="flex flex-col gap-1 mt-1">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-max ${displayData.pump_status ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>Pump: {displayData.pump_status ? 'ON' : 'OFF'}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-max ${displayData.led_brightness > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>Lights: {displayData.led_brightness}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
