import { useState } from 'react'

/**
 * Zomato-style quantity stepper: shows an ADD button that transitions
 * to a [-] [qty] [+] control on first click.
 *
 * Props:
 *   quantity    {number}   current quantity (0 = not in cart)
 *   onAdd       {fn}       called when ADD is clicked (sets qty to 1)
 *   onIncrement {fn}       called when + is clicked
 *   onDecrement {fn}       called when - is clicked (removes at 0)
 *   compact     {boolean}  smaller size for recommendation cards
 */
export default function QuantityStepper({
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  compact = false,
}) {
  const [justAdded, setJustAdded] = useState(false)

  function handleAdd() {
    setJustAdded(true)
    onAdd()
    setTimeout(() => setJustAdded(false), 220)
  }

  if (quantity === 0 || quantity == null) {
    return (
      <button
        onClick={handleAdd}
        className={`
          add-btn-appear bg-white border-2 border-[#60B246] text-[#60B246]
          font-bold rounded-lg flex items-center gap-0.5 transition-colors
          hover:bg-[#60B246] hover:text-white active:scale-95
          focus:outline-none
          ${compact
            ? 'text-[11px] px-2.5 py-1'
            : 'text-[13px] px-3 py-1.5'}
        `}
        style={{ fontWeight: 700, letterSpacing: '0.02em' }}
      >
        <span style={{ fontSize: compact ? 14 : 16, lineHeight: 1 }}>+</span>
        <span>ADD</span>
      </button>
    )
  }

  return (
    <div
      className={`
        flex items-center bg-[#E23744] rounded-lg overflow-hidden
        ${justAdded ? 'add-btn-appear' : ''}
        ${compact ? 'h-7' : 'h-8'}
      `}
    >
      <button
        onClick={onDecrement}
        className={`
          text-white font-black flex items-center justify-center
          hover:bg-red-700 transition-colors active:scale-90
          focus:outline-none
          ${compact ? 'w-7 text-base' : 'w-8 text-lg'}
        `}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`
          text-white font-bold tabular-nums select-none
          ${compact ? 'w-5 text-[12px]' : 'w-6 text-[13px]'}
          text-center
        `}
      >
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        className={`
          text-white font-black flex items-center justify-center
          hover:bg-red-700 transition-colors active:scale-90
          focus:outline-none
          ${compact ? 'w-7 text-base' : 'w-8 text-lg'}
        `}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
