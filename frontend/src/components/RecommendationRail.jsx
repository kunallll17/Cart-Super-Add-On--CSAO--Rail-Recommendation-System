import RecommendationCard from './RecommendationCard'

function SkeletonCard() {
  return (
    <div
      className="flex-shrink-0 rounded-xl overflow-hidden bg-white"
      style={{ width: 140, border: '1px solid #E8E8E8' }}
    >
      <div className="skeleton" style={{ height: 84 }} />
      <div className="p-2.5 space-y-2">
        <div className="skeleton h-3 rounded w-4/5" />
        <div className="skeleton h-3 rounded w-2/5" />
        <div className="skeleton h-2 rounded w-full mt-2" />
        <div className="skeleton h-7 rounded-lg w-full mt-1" />
      </div>
    </div>
  )
}

function LatencyBadge({ latency, mode }) {
  if (!latency) return null
  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#686B78] mt-3">
      <span className="flex items-center gap-1">
        ⚡
        <span className="font-semibold text-[#1C1C1C]">
          Recommended in {latency.total.toFixed(2)}ms
        </span>
      </span>
      <span className="text-[#E8E8E8]">|</span>
      <span>FAISS: <span className="font-medium text-blue-500">{latency.faiss.toFixed(3)}ms</span></span>
      <span className="text-[#E8E8E8]">|</span>
      <span>LightGBM: <span className="font-medium text-purple-500">{latency.lgbm.toFixed(3)}ms</span></span>
      <span className="text-[#E8E8E8]">|</span>
      <span className="ml-auto">Pool: <span className="font-medium text-[#1C1C1C]">{latency.pool}</span> candidates</span>
    </div>
  )
}

export default function RecommendationRail({
  recommendations,
  latency,
  isLoading,
  error,
  onAddToCart,
  mode,
  hasCartItems = false,
}) {
  const hasResults = recommendations && recommendations.length > 0
  const isEmpty = !isLoading && !hasResults && !error

  return (
    <div className="rail-slide-in bg-white rounded-card z-shadow overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[16px] font-bold text-[#1C1C1C]">
            Pairs Well With 🍽️
          </h3>
          {mode === 'live' && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: '#F0FBF0', color: '#60B246', border: '1px solid #D4EDDA' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#60B246' }} />
              LIVE
            </span>
          )}
        </div>
        {hasResults && <span className="text-[12px] text-[#686B78]">Scroll →</span>}
      </div>

      <hr className="z-divider" />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-4">

        {/* Empty state — always show so user knows where recs appear */}
        {isEmpty && (
          <div className="flex flex-col items-center py-6 gap-2 text-center">
            <span className="text-4xl">🍽️</span>
            <p className="text-[13px] font-semibold text-[#1C1C1C]">Recommendations appear here</p>
            <p className="text-[12px] text-[#686B78] max-w-[260px]">
              {hasCartItems
                ? 'Loading your picks…'
                : 'Add items to your cart — recommendations will show here automatically (or use the button in the cart).'}
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center py-6 gap-2 text-center">
            <span className="text-3xl">⚠️</span>
            <p className="text-[13px] font-semibold text-[#E23744]">API Error</p>
            <p className="text-[12px] text-[#686B78] max-w-[220px]">{error}</p>
            {mode === 'live' && (
              <p className="text-[11px] text-[#686B78] mt-1">
                Make sure the FastAPI server is running on{' '}
                <code className="bg-[#F5F3F1] px-1 py-0.5 rounded text-[10px]">localhost:8000</code>
              </p>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <>
            <p className="text-[12px] text-[#686B78] mb-3 animate-pulse">Fetching recommendations...</p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </>
        )}

        {/* Results */}
        {hasResults && !isLoading && (
          <>
            <p className="text-[12px] text-[#686B78] mb-3">
              Top {recommendations.length} add-ons for your cart
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {recommendations.map((item, idx) => (
                <RecommendationCard
                  key={item.item_id || item.id || idx}
                  item={item}
                  rank={item.rank || idx + 1}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </>
        )}

      </div>

      {/* ── Latency badge ────────────────────────────────────────────────── */}
      {latency && !isLoading && (
        <div className="px-4 pb-4">
          <LatencyBadge latency={latency} mode={mode} />
        </div>
      )}

    </div>
  )
}
