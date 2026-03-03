import { COMPLETENESS_WEIGHTS } from '../data/mockData'

export function calcCompleteness(cartItems) {
  const present = new Set(cartItems.map(i => i.category))
  return Object.entries(COMPLETENESS_WEIGHTS).reduce((sum, [cat, weight]) => {
    return sum + (present.has(cat) ? weight : 0)
  }, 0)
}

/**
 * Compact Zomato-style completeness row:
 * Label (grey) ·  thin green progress bar  ·  percentage (right)
 */
export default function CompletenessBar({ cartItems }) {
  const score   = calcCompleteness(cartItems)
  const percent = Math.round(score * 100)

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] text-[#686B78] font-medium whitespace-nowrap flex-shrink-0">
        Meal completeness
      </span>
      <div className="flex-1 h-[3px] rounded-full bg-[#E8E8E8] overflow-hidden">
        <div
          className="completeness-fill h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span
        className="text-[13px] font-bold flex-shrink-0 tabular-nums"
        style={{ color: percent >= 75 ? '#60B246' : percent >= 40 ? '#E23744' : '#686B78' }}
      >
        {percent}%
      </span>
    </div>
  )
}
