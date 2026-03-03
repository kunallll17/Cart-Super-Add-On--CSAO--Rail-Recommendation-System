import { useEffect, useRef, useState } from 'react'
import ModeToggle from './ModeToggle'
import { MODEL_METRICS } from '../data/mockData'

const BASELINE_AOV  = 380
const AOV_PER_ADDON = 21.6

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const start = prevRef.current
    const end   = value
    if (start === end) return
    const duration  = 600
    const startTime = performance.now()
    function tick(now) {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prevRef.current = end
    }
    requestAnimationFrame(tick)
  }, [value])

  return <>{display}</>
}

/**
 * Zomato "Restaurant info" styled panel:
 * - AOV tracker (animated)
 * - Model metrics as key-value rows
 * - Mode toggle at bottom
 */
export default function StatsPanel({ mode, onModeChange, requestCount, cartItems }) {
  const [aovKey,  setAovKey]  = useState(0)
  const prevLen = useRef(0)

  const cartTotal  = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0)
  const addonCount = cartItems.length
  const sessionAov = BASELINE_AOV + (addonCount > 0 ? AOV_PER_ADDON * Math.min(addonCount * 0.18, 1.2) : 0)
  const aovDelta   = +(sessionAov - BASELINE_AOV).toFixed(1)

  useEffect(() => {
    if (cartItems.length !== prevLen.current) {
      setAovKey(k => k + 1)
      prevLen.current = cartItems.length
    }
  }, [cartItems.length])

  return (
    <div className="flex flex-col gap-4">

      {/* ── Request counter ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-card z-shadow px-4 py-4 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: '#FFF0F1' }}
        >
          📊
        </div>
        <div>
          <div className="text-[24px] font-black text-[#E23744] tabular-nums leading-none">
            <AnimatedNumber value={requestCount} />
          </div>
          <div className="text-[12px] text-[#686B78] mt-0.5">
            recommendations served this session
          </div>
        </div>
      </div>

      {/* ── Session AOV tracker ─────────────────────────────────────────── */}
      <div className="bg-white rounded-card z-shadow px-4 py-4">
        <h3 className="text-[12px] font-semibold text-[#686B78] uppercase tracking-wide mb-3">
          Session AOV Tracker
        </h3>
        <div className="flex items-end gap-3 mb-2">
          <div>
            <p className="text-[11px] text-[#686B78] mb-0.5">Baseline</p>
            <p className="text-[17px] font-bold text-[#686B78] tabular-nums">
              Rs. {BASELINE_AOV}
            </p>
          </div>
          <span className="text-[#E8E8E8] font-bold pb-1 text-lg">→</span>
          <div>
            <p className="text-[11px] text-[#686B78] mb-0.5">Session</p>
            <p className="text-[22px] font-black text-[#1C1C1C] tabular-nums leading-none">
              Rs. <AnimatedNumber value={Math.round(sessionAov)} />
            </p>
          </div>
        </div>

        {aovDelta > 0 && (
          <div
            key={aovKey}
            className="aov-delta-animate inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg mt-1"
            style={{ background: '#F0FBF0', border: '1px solid #D4EDDA' }}
          >
            <span className="text-[#60B246] font-black text-sm">↑</span>
            <span className="text-[13px] font-bold text-[#60B246] tabular-nums">
              +Rs. {aovDelta}
            </span>
            <span className="text-[11px] text-[#60B246]">from add-ons</span>
          </div>
        )}

        {cartItems.length > 0 && (
          <p className="text-[12px] text-[#686B78] mt-2">
            Cart: <span className="font-semibold text-[#1C1C1C]">Rs. {cartTotal}</span>
            {' '}· {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Model Performance ───────────────────────────────────────────── */}
      <div className="bg-white rounded-card z-shadow overflow-hidden">
        {/* Card header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <h3 className="text-[15px] font-bold text-[#1C1C1C]">Model Performance</h3>
        </div>
        <hr className="z-divider" />

        {/* Key-value rows */}
        <div className="divide-y divide-[#F5F3F1]">
          {MODEL_METRICS.map(m => (
            <div key={m.label} className="flex items-center justify-between px-4 py-3">
              <div>
                <span className="text-[13px] text-[#686B78] font-medium">{m.label}</span>
                {m.note && (
                  <span className="ml-1.5 text-[11px] text-[#686B78]">· {m.note}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[14px] font-bold tabular-nums"
                  style={{ color: m.highlight ? '#60B246' : '#1C1C1C' }}
                >
                  {m.value}
                </span>
                {m.check && (
                  <span className="text-[#60B246] text-[13px]">✓</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture tag */}
        <div className="px-4 py-3 border-t border-[#F5F3F1]">
          <span className="text-[11px] text-[#686B78]">
            FAISS + LightGBM LambdaRank · 43 features · 21 trees
          </span>
        </div>
      </div>

      {/* ── Mode toggle ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-card z-shadow px-4 py-4">
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>

    </div>
  )
}
