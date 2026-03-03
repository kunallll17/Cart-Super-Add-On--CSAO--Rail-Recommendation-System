/**
 * Zomato-style filter pill toggle: [Mock Data] / [Live API]
 */
export default function ModeToggle({ mode, onChange }) {
  const isLive = mode === 'live'

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold text-[#686B78] uppercase tracking-wide">
        Data Source
      </span>

      <div className="flex gap-2">
        <PillBtn active={!isLive} onClick={() => onChange('mock')}>
          Mock Data
        </PillBtn>
        <PillBtn active={isLive} onClick={() => onChange('live')}>
          <span className="flex items-center gap-1.5">
            {isLive && (
              <span className="w-1.5 h-1.5 bg-[#60B246] rounded-full animate-pulse" />
            )}
            Live API
          </span>
        </PillBtn>
      </div>

      <p className="text-[11px] text-[#686B78] leading-snug">
        {isLive
          ? 'Calling localhost:8000/recommend — ensure the FastAPI server is running'
          : 'Realistic mock data with 300–450ms simulated latency'}
      </p>
    </div>
  )
}

function PillBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-semibold
        border transition-all duration-200 focus:outline-none
        ${active
          ? 'bg-[#E23744] text-white border-[#E23744]'
          : 'bg-white text-[#686B78] border-[#E8E8E8] hover:border-[#E23744] hover:text-[#E23744]'}
      `}
    >
      {children}
    </button>
  )
}
