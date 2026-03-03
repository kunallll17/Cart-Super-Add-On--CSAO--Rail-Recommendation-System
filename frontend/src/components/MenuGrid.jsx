import VegIndicator from './VegIndicator'
import QuantityStepper from './QuantityStepper'
import { CATEGORY_META } from '../data/mockData'

const CATEGORY_ORDER = ['mains', 'sides', 'starters', 'beverages', 'desserts']

const EMOJI_FALLBACK = {
  mains:     '🍽️',
  beverages: '🥤',
  sides:     '🥗',
  desserts:  '🍮',
  starters:  '🥙',
}

function MenuItemRow({ item, quantity, onAdd, onIncrement, onDecrement }) {
  const inCart = quantity > 0
  const emoji  = item.emoji || EMOJI_FALLBACK[item.category] || '🍽️'

  return (
    <div
      className={`menu-row flex items-center gap-4 py-4 px-5 transition-colors cursor-default
        ${inCart ? 'in-cart' : ''}`}
    >
      {/* ── Left: Info ───────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <VegIndicator veg={item.veg} />
          <span className="text-[15px] font-semibold text-[#1C1C1C] leading-snug">
            {item.name}
          </span>
        </div>

        {item.description && (
          <p className="text-[13px] text-[#686B78] leading-snug line-clamp-2 mt-0.5">
            {item.description}
          </p>
        )}

        <p className="text-[15px] font-bold text-[#1C1C1C] mt-1">
          Rs. {item.price}
        </p>
      </div>

      {/* ── Right: Image placeholder + ADD button ───────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: 90, height: 90 }}>
        {/* Image placeholder */}
        <div
          className="w-full h-full rounded-xl flex items-center justify-center select-none"
          style={{
            background: 'linear-gradient(135deg, #F5F3F1 0%, #E8E8E8 100%)',
            fontSize: 36,
          }}
        >
          {emoji}
        </div>

        {/* ADD / Stepper overlay — pinned to bottom-right of image */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <QuantityStepper
            quantity={quantity}
            onAdd={onAdd}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        </div>
      </div>
    </div>
  )
}

export default function MenuGrid({ items, cartItems, onAddItem, onUpdateQuantity }) {
  const cartMap = {}
  cartItems.forEach(i => { cartMap[i.id] = i.quantity || 1 })

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const group = items.filter(i => i.category === cat)
    if (group.length) acc.push({ cat, items: group })
    return acc
  }, [])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#686B78]">
        <span className="text-5xl mb-3">🍽️</span>
        <p className="text-sm font-medium">Select a restaurant to see the menu</p>
      </div>
    )
  }

  return (
    <div>
      {grouped.map(({ cat, items: group }) => {
        const meta = CATEGORY_META[cat]
        return (
          <div key={cat} className="mb-2">
            {/* Category header */}
            <div className="px-5 pt-5 pb-3">
              <h3 className="text-[16px] font-bold text-[#1C1C1C]">
                {meta.label}s
                <span className="text-[#686B78] font-medium ml-1">({group.length})</span>
              </h3>
              <hr className="z-divider mt-2" />
            </div>

            {/* Items */}
            <div>
              {group.map((item, idx) => (
                <div key={item.id}>
                  <MenuItemRow
                    item={item}
                    quantity={cartMap[item.id] || 0}
                    onAdd={() => onAddItem(item)}
                    onIncrement={() => onUpdateQuantity(item.id, (cartMap[item.id] || 1) + 1)}
                    onDecrement={() => onUpdateQuantity(item.id, (cartMap[item.id] || 1) - 1)}
                  />
                  {idx < group.length - 1 && (
                    <hr className="z-divider mx-5" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {/* Spacer to avoid stepper overlap at bottom */}
      <div style={{ height: 20 }} />
    </div>
  )
}
