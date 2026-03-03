import { useState } from 'react'
import CartPanel from './CartPanel'

/**
 * Mobile bottom-sheet cart — slides up from bottom on mobile (<768px).
 * Shows a sticky mini-bar at the bottom with item count + CTA.
 * Tap to expand full cart.
 */
export default function MobileCartSheet({
  cartItems,
  restaurantId,
  onUpdateQuantity,
  onGetRecommendations,
  isLoading,
  hasRecommendations = false,
}) {
  const [open, setOpen] = useState(false)
  const total    = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0)
  const itemCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0)
  const hasItems = cartItems.length > 0

  if (!hasItems) return null

  return (
    <>
      {/* ── Collapsed mini-bar ─────────────────────────────────────────── */}
      {!open && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3"
          style={{ background: 'linear-gradient(to top, #F5F3F1 60%, transparent)' }}
        >
          <button
            onClick={() => setOpen(true)}
            className="w-full h-14 rounded-btn bg-[#E23744] text-white flex items-center justify-between px-5 z-shadow focus:outline-none"
            style={{ boxShadow: '0 4px 20px rgba(226,55,68,0.4)' }}
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold">
                {itemCount}
              </span>
              <span className="text-[14px] font-bold">items added</span>
            </span>
            <span className="flex items-center gap-2 text-[14px] font-bold">
              Rs. {total}
              <span className="text-lg">↑</span>
            </span>
          </button>
        </div>
      )}

      {/* ── Open overlay + sheet ───────────────────────────────────────── */}
      {open && (
        <>
          <div
            className="cart-sheet-overlay"
            onClick={() => setOpen(false)}
          />
          <div className="cart-sheet pb-safe">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E8E8E8]" />
            </div>

            <div className="px-4 pb-4">
              <CartPanel
                cartItems={cartItems}
                restaurantId={restaurantId}
                onUpdateQuantity={onUpdateQuantity}
                onGetRecommendations={() => { setOpen(false); onGetRecommendations() }}
                isLoading={isLoading}
                hasRecommendations={hasRecommendations}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}
