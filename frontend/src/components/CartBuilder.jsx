import { useState } from 'react'
import { RESTAURANTS, MENU_ITEMS } from '../data/mockData'
import RestaurantHeader from './RestaurantHeader'
import MenuGrid from './MenuGrid'
import OverviewSection from './OverviewSection'
import ReviewsSection from './ReviewsSection'

export default function CartBuilder({
  cartItems,
  onCartChange,
  onRestaurantChange,
  selectedRestaurantId,
}) {
  const [activeTab, setActiveTab] = useState('Menu')

  const restaurant = RESTAURANTS.find(r => r.id === selectedRestaurantId)
  const menuItems  = MENU_ITEMS[selectedRestaurantId] || []

  function handleRestaurantChange(id) {
    if (id === selectedRestaurantId) return
    onRestaurantChange(id)
    setActiveTab('Menu')
  }

  function handleAddItem(item) {
    const existing = cartItems.find(i => i.id === item.id)
    if (existing) {
      onCartChange(
        cartItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      onCartChange([
        ...cartItems,
        { ...item, restaurantId: selectedRestaurantId, quantity: 1 },
      ])
    }
  }

  function handleUpdateQuantity(itemId, newQty) {
    if (newQty <= 0) {
      onCartChange(cartItems.filter(i => i.id !== itemId))
    } else {
      onCartChange(
        cartItems.map(i => i.id === itemId ? { ...i, quantity: newQty } : i)
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Restaurant selector pills ─────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {RESTAURANTS.map(r => (
          <button
            key={r.id}
            onClick={() => handleRestaurantChange(r.id)}
            className={`
              px-4 py-2 rounded-full text-[13px] font-semibold border transition-all
              focus:outline-none whitespace-nowrap
              ${selectedRestaurantId === r.id
                ? 'bg-[#E23744] text-white border-[#E23744]'
                : 'bg-white text-[#686B78] border-[#E8E8E8] hover:border-[#E23744] hover:text-[#E23744]'}
            `}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* ── Restaurant header card (with tabs) ────────────────────────── */}
      <RestaurantHeader
        restaurant={restaurant}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── Tab content ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-card z-shadow overflow-hidden">
        {activeTab === 'Menu' && (
          <div className="overflow-y-auto scrollbar-thin" style={{ maxHeight: 580 }}>
            <MenuGrid
              items={menuItems}
              cartItems={cartItems}
              onAddItem={handleAddItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </div>
        )}

        {activeTab === 'Overview' && (
          <OverviewSection restaurantId={selectedRestaurantId} />
        )}

        {activeTab === 'Reviews' && (
          <ReviewsSection restaurantId={selectedRestaurantId} />
        )}
      </div>

    </div>
  )
}
