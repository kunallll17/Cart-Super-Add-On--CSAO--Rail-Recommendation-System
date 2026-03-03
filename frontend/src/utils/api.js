import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

function getSlot(hour) {
  if (hour >= 6  && hour < 11) return 'Breakfast'
  if (hour >= 11 && hour < 16) return 'Lunch'
  if (hour >= 16 && hour < 18) return 'Tea-Time'
  if (hour >= 18 && hour < 23) return 'Dinner'
  return 'Late-Night'
}

export async function fetchLiveRecommendations(restaurantId, cartItems, topK = 5) {
  const now       = new Date()
  const hour      = now.getHours()
  const dayOfWeek = now.getDay()

  const payload = {
    user_id:              'U0001',
    restaurant_id:        restaurantId,
    cart_items:           cartItems.map(item => ({
      item_id:    item.id,
      item_name:  item.name,
      quantity:   1,
      unit_price: item.price,
    })),
    order_hour:           hour,
    is_weekend:           dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0,
    slot:                 getSlot(hour),
    user_lifetime_orders: 10,
    user_is_cold_start:   0,
    top_k:                topK,
  }

  const response = await apiClient.post('/recommend', payload)
  return response.data
}

export async function checkBackendHealth() {
  try {
    const response = await apiClient.get('/health', { timeout: 3000 })
    return response.data?.status === 'healthy'
  } catch {
    return false
  }
}
