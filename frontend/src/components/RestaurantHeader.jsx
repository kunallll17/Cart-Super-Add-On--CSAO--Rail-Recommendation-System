const TABS = ['Menu', 'Overview', 'Reviews']

/**
 * Replicates Zomato's restaurant-page header card:
 * - Restaurant name, metadata pills (rating, cost, cuisine, time)
 * - Menu / Overview / Reviews tab bar (controlled via props)
 */
export default function RestaurantHeader({ restaurant, activeTab = 'Menu', onTabChange }) {

  if (!restaurant) return null

  return (
    <div className="bg-white rounded-card z-shadow overflow-hidden">
      {/* Top section */}
      <div className="px-5 pt-5 pb-4">
        {/* Name + rating row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-[#1C1C1C] leading-tight">
              {restaurant.name}
            </h1>
            <p className="text-sm text-[#686B78] mt-0.5">
              {restaurant.tags.join(', ')} · {restaurant.city}
            </p>
          </div>
          {/* Rating badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg flex-shrink-0"
            style={{ background: '#48C479', minWidth: 52 }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="white">
              <path d="M6 0.5l1.545 3.13 3.455.502-2.5 2.435.59 3.433L6 8.25l-3.09 1.75.59-3.433L1 4.132l3.455-.502L6 0.5z" />
            </svg>
            <span className="text-white font-bold text-[13px] leading-none">
              {restaurant.rating}
            </span>
          </div>
        </div>

        {/* Metadata pills */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <MetaPill>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#686B78" strokeWidth="1.6" />
              <path d="M10 5.5V10.5L13 13" stroke="#686B78" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {restaurant.deliveryTime}
          </MetaPill>

          <span className="w-px h-3 bg-[#E8E8E8]" />

          <MetaPill>
            Rs. {restaurant.costForTwo} for two
          </MetaPill>

          <span className="w-px h-3 bg-[#E8E8E8]" />

          <MetaPill>
            {restaurant.cuisine}
          </MetaPill>
        </div>
      </div>

      {/* Divider */}
      <hr className="z-divider" />

      {/* Tab bar */}
      <div className="flex gap-0 px-5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange?.(tab)}
            className={`
              py-3 px-1 mr-6 text-[14px] font-semibold border-b-2 transition-colors
              focus:outline-none
              ${activeTab === tab
                ? 'border-[#E23744] text-[#E23744]'
                : 'border-transparent text-[#686B78] hover:text-[#1C1C1C]'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}

function MetaPill({ children }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-[#686B78] font-medium">
      {children}
    </span>
  )
}
