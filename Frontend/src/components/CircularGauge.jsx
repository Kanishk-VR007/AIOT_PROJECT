// A reusable circular progress ring for metrics
export const CircularGauge = ({ value, max = 100, label, unit = "%" }) => {
  return (
    <div className="relative w-40 h-40 flex flex-col items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <circle
          className="gauge-track"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="12"
        />
        <circle
          className="gauge-fill"
          cx="50"
          cy="50"
          r="40"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="251.2"
          strokeDashoffset={251.2 - (value / max) * 251.2}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
        <span className="text-4xl font-bold text-on-surface leading-none">
          {value}
          <span className="text-[20px] text-on-surface-variant">{unit}</span>
        </span>
      </div>
    </div>
  );
};
