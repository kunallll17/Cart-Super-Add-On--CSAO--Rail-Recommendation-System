import { useEffect, useRef, useState } from 'react'
import VegIndicator from './VegIndicator'
import QuantityStepper from './QuantityStepper'
import CompletenessBar from './CompletenessBar'
import { RESTAURANTS } from '../data/mockData'

function CartItemRow({ item, onIncrement, onDecrement }) {
  const [exiting, setExiting] = useState(false)

  function handleDecrement() {
    if (item.quantity <= 1) {
      setExiting(true)
      setTimeout(() => onDecrement(), 180)
    } else {
      onDecrement()
    }
  }

  return (
    <div className={`flex items-center gap-3 py-2.5 ${exiting ? 'cart-item-exit' : 'cart-item-enter'}`}>
      <VegIndicator veg={item.veg !== false} size="sm" />
      <span className="flex-1 text-[13px] text-[#1C1C1C] font-medium leading-snug">
        {item.name}
      </span>
      <QuantityStepper
        quantity={item.quantity || 1}
        onAdd={onIncrement}
        onIncrement={onIncrement}
        onDecrement={handleDecrement}
        compact
      />
      <span className="text-[13px] font-semibold text-[#1C1C1C] tabular-nums w-16 text-right flex-shrink-0">
        Rs. {(item.price * (item.quantity || 1))}
      </span>
    </div>
  )
}

export default function CartPanel({
  cartItems,
  restaurantId,
  onUpdateQuantity,
  onGetRecommendations,
  isLoading,
  hasRecommendations = false,
}) {
  const listRef  = useRef(null)
  const prevLen  = useRef(cartItems.length)
  const restaurant = RESTAURANTS.find(r => r.id === restaurantId)
  const total    = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0)
  const hasItems = cartItems.length > 0

  useEffect(() => {
    if (cartItems.length > prevLen.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
    prevLen.current = cartItems.length
  }, [cartItems.length])

  return (
    <div className="bg-white rounded-card z-shadow overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#1C1C1C]">Your Order</h2>
          {hasItems && (
            <span className="bg-[#E23744] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.reduce((s, i) => s + (i.quantity || 1), 0)}
            </span>
          )}
        </div>
        {restaurant && (
          <p className="text-[13px] text-[#686B78] mt-0.5">{restaurant.name}</p>
        )}
      </div>

      <hr className="z-divider" />

      {/* ── Items list ───────────────────────────────────────────────────── */}
      <div
        ref={listRef}
        className="overflow-y-auto scrollbar-thin px-4"
        style={{ maxHeight: 240 }}
      >
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center py-8 text-[#686B78]">
            <span className="text-4xl mb-2">🛒</span>
            <p className="text-[13px] font-medium">Your cart is empty</p>
            <p className="text-[12px] mt-0.5">Add items from the menu</p>
          </div>
        ) : (
          <div className="py-1 divide-y divide-[#F5F3F1]">
            {cartItems.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                onDecrement={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
              />
            ))}
          </div>
        )}
      </div>

      {hasItems && (
        <>
          <hr className="z-divider" />

          {/* ── Meal completeness ───────────────────────────────────────── */}
          <div className="px-4 py-3">
            <CompletenessBar cartItems={cartItems} />
          </div>

          <hr className="z-divider" />

          {/* ── Bill breakdown ──────────────────────────────────────────── */}
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-[13px] text-[#686B78]">
              <span>Item total</span>
              <span className="tabular-nums">Rs. {total}</span>
            </div>
            <hr className="z-divider" />
            <div className="flex justify-between text-[14px] font-bold text-[#1C1C1C]">
              <span>To Pay</span>
              <span className="tabular-nums">Rs. {total}</span>
            </div>
          </div>
        </>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-2">
        <button
          onClick={onGetRecommendations}
          disabled={!hasItems || isLoading}
          className={`
            w-full h-12 rounded-btn font-bold text-[14px] flex items-center justify-center gap-2
            transition-all duration-200 focus:outline-none
            ${!hasItems
              ? 'bg-[#E8E8E8] text-[#686B78] cursor-not-allowed'
              : isLoading
                ? 'bg-[#E23744]/75 text-white cursor-wait'
                : 'bg-[#E23744] text-white hover:bg-[#c9313d] cta-active'}
          `}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Getting recommendations...
            </>
          ) : hasRecommendations ? (
            <>
              REFRESH RECOMMENDATIONS
              <span className="text-[16px] leading-none">↻</span>
            </>
          ) : (
            <>
              SEE RECOMMENDED ADD-ONS
              <span className="text-[16px] leading-none">→</span>
            </>
          )}
        </button>
      </div>

    </div>
  )
}
