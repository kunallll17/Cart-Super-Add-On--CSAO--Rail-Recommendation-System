import { useState, useCallback, useEffect, useRef } from 'react'
import Header from './components/Header'
import CartBuilder from './components/CartBuilder'
import CartPanel from './components/CartPanel'
import RecommendationRail from './components/RecommendationRail'
import StatsPanel from './components/StatsPanel'
import MobileCartSheet from './components/MobileCartSheet'
import { useRecommendations } from './hooks/useRecommendations'
import { RESTAURANTS } from './data/mockData'

export default function App() {
  const [mode, setMode] = useState('mock')
  const [cartItems, setCartItems] = useState([])
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(RESTAURANTS[0].id)

  const {
    recommendations,
    latency,
    isLoading,
    error,
    getRecommendations,
    requestCount,
  } = useRecommendations(mode)

  const debounceRef = useRef(null)
  const cartRef = useRef(cartItems)
  const restaurantRef = useRef(selectedRestaurantId)
  cartRef.current = cartItems
  restaurantRef.current = selectedRestaurantId

  useEffect(() => {
    if (cartItems.length === 0) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getRecommendations(restaurantRef.current, cartRef.current)
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [cartItems.length, selectedRestaurantId, getRecommendations])

  function handleGetRecommendations() {
    getRecommendations(selectedRestaurantId, cartItems)
  }

  function handleCartChange(newCart) {
    setCartItems(newCart)
  }

  function handleUpdateQuantity(itemId, newQty) {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== itemId))
    } else {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i))
    }
  }

  const handleAddRecommendedItem = useCallback((recItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === recItem.item_id)
      if (existing) {
        return prev.map(i =>
          i.id === recItem.item_id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        id: recItem.item_id,
        name: recItem.item_name,
        category: recItem.category,
        price: recItem.base_price,
        veg: true,
        quantity: 1,
        emoji: recItem.emoji || '🍽️',
        restaurantId: selectedRestaurantId,
      }]
    })
  }, [selectedRestaurantId])

  function handleCartBuilderChange(newCart) {
    setCartItems(newCart)
  }

  function handleRestaurantChange(id) {
    setSelectedRestaurantId(id)
    setCartItems([])
  }

  return (
    <div className="min-h-screen" style={{ background: '#F5F3F1' }}>
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 py-6">

        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <CartBuilderWithSync
              cartItems={cartItems}
              onCartChange={handleCartBuilderChange}
              onRestaurantChange={handleRestaurantChange}
              selectedRestaurantId={selectedRestaurantId}
            />
          </div>
          <div
            className="hidden md:flex flex-col gap-4 flex-shrink-0"
            style={{ width: 360, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}
          >
            <CartPanel
              cartItems={cartItems}
              restaurantId={selectedRestaurantId}
              onUpdateQuantity={handleUpdateQuantity}
              onGetRecommendations={handleGetRecommendations}
              isLoading={isLoading}
              hasRecommendations={recommendations.length > 0}
            />
            <RecommendationRail
              recommendations={recommendations}
              latency={latency}
              isLoading={isLoading}
              error={error}
              onAddToCart={handleAddRecommendedItem}
              mode={mode}
              hasCartItems={cartItems.length > 0}
            />
            <details className="group">
              <summary className="cursor-pointer bg-white rounded-card z-shadow px-4 py-3 flex items-center justify-between text-[14px] font-bold text-[#1C1C1C] select-none list-none [&::-webkit-details-marker]:hidden">
                <span>📊 Model Performance & Stats</span>
                <span className="text-[#686B78] text-[12px] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2">
                <StatsPanel
                  mode={mode}
                  onModeChange={setMode}
                  requestCount={requestCount}
                  cartItems={cartItems}
                />
              </div>
            </details>
          </div>

        </div>
      </main>
      <div className="md:hidden">
        <MobileCartSheet
          cartItems={cartItems}
          restaurantId={selectedRestaurantId}
          onUpdateQuantity={handleUpdateQuantity}
          onGetRecommendations={handleGetRecommendations}
          isLoading={isLoading}
          hasRecommendations={recommendations.length > 0}
        />
      </div>
      <div className="md:hidden px-4 pb-24">
        <RecommendationRail
          recommendations={recommendations}
          latency={latency}
          isLoading={isLoading}
          error={error}
          onAddToCart={handleAddRecommendedItem}
          mode={mode}
          hasCartItems={cartItems.length > 0}
        />
      </div>

    </div>
  )
}

function CartBuilderWithSync({
  cartItems,
  onCartChange,
  onRestaurantChange,
  selectedRestaurantId,
}) {
  return (
    <CartBuilder
      cartItems={cartItems}
      onCartChange={onCartChange}
      onRestaurantChange={onRestaurantChange}
      selectedRestaurantId={selectedRestaurantId}
    />
  )
}
