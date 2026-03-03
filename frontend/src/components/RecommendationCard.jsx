/**
 * Compact Zomato-style recommendation card (140px wide, vertical layout).
 * - Food emoji placeholder image (rounded top)
 * - Item name bold 13px
 * - Price Rs.XX grey 12px
 * - Thin green relevance bar (score × 100%)
 * - Info icon with tooltip showing "Why?" reasoning
 * - Small green ADD button
 */
export default function RecommendationCard({ item, onAddToCart, rank }) {
  const emoji      = item.emoji || '🍽️'
  const scoreWidth = Math.min(Math.max(item.score * 100, 0), 100)

  return (
    <div
      className="rec-card bg-white rounded-xl overflow-hidden flex-shrink-0 flex flex-col"
      style={{
        width:     140,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        border:    '1px solid #E8E8E8',
      }}
    >
      {/* Rank badge */}
      <div
        className="absolute"
        style={{
          position: 'relative',
        }}
      />

      {/* Image / emoji area */}
      <div
        className="w-full flex items-center justify-center flex-shrink-0 relative"
        style={{
          height:     84,
          background: 'linear-gradient(135deg, #F5F3F1 0%, #EBE9E7 100%)',
          fontSize:   36,
        }}
      >
        {emoji}

        {/* Rank badge */}
        <span
          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: '#E23744' }}
        >
          {rank}
        </span>

        {/* Why tooltip — info icon top-right */}
        {item.why && (
          <div className="tooltip-wrap absolute top-1.5 right-1.5">
            <button
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.85)', color: '#686B78' }}
              aria-label="Why this recommendation?"
            >
              ⓘ
            </button>
            <div className="tooltip-body" style={{ right: 0, left: 'auto', transform: 'none' }}>
              {item.why}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-2.5 pt-2.5 pb-1 flex flex-col gap-1 flex-1">
        <p className="text-[13px] font-bold text-[#1C1C1C] leading-snug line-clamp-2">
          {item.item_name}
        </p>
        <p className="text-[12px] text-[#686B78]">Rs. {item.base_price}</p>
      </div>

      {/* Score bar */}
      <div className="px-2.5 pb-2">
        <div className="score-bar-track">
          <div
            className="score-bar-fill"
            style={{ width: `${scoreWidth}%` }}
          />
        </div>
        <p className="text-[10px] text-[#686B78] mt-0.5 tabular-nums text-right">
          {item.score.toFixed(3)}
        </p>
      </div>

      {/* ADD button */}
      <div className="px-2.5 pb-3">
        <button
          onClick={() => onAddToCart(item)}
          className="w-full py-1.5 rounded-lg text-[12px] font-bold text-white transition-all
            hover:opacity-90 active:scale-95 focus:outline-none"
          style={{ background: '#60B246' }}
        >
          + Add
        </button>
      </div>
    </div>
  )
}
