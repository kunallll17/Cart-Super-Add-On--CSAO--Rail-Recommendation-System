import { useState, useCallback } from 'react'
import { fetchLiveRecommendations } from '../utils/api'
import { MOCK_RECOMMENDATIONS, RESTAURANTS } from '../data/mockData'

async function fetchMockRecommendations(restaurantId, cartItems) {
  const delay = 300 + Math.random() * 150
  await new Promise(resolve => setTimeout(resolve, delay))

  const hasMain = cartItems.some(item => item.category === 'mains')
  const pool = MOCK_RECOMMENDATIONS[restaurantId]

  const recs = pool
    ? (hasMain ? pool.withMain : pool.fallback)
    : []

  const cartIds = new Set(cartItems.map(i => i.id))
  const filtered = recs.filter(r => !cartIds.has(r.id))

  const faissMs = parseFloat((0.18 + Math.random() * 0.08).toFixed(3))
  const lgbmMs = parseFloat((0.42 + Math.random() * 0.12).toFixed(3))
  const totalMs = parseFloat((faissMs + lgbmMs + 3.2 + Math.random() * 0.8).toFixed(3))

  const restaurantMeta = RESTAURANTS.find(rest => rest.id === restaurantId)
  const cuisineLabel = restaurantMeta ? restaurantMeta.cuisine : 'Mixed'

  return {
    recommendations: filtered.slice(0, 5).map((r, i) => ({
      rank: i + 1,
      item_id: r.id,
      item_name: r.name,
      category: r.category,
      cuisine: cuisineLabel,
      base_price: r.price,
      score: r.score,
      why: r.why,
    })),
    retrieval_ms: faissMs,
    ranking_ms: lgbmMs,
    total_ms: totalMs,
    candidates_pool: 50,
  }
}

export function useRecommendations(mode) {
  const [recommendations, setRecommendations] = useState([])
  const [latency, setLatency] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [requestCount, setRequestCount] = useState(0)

  const getRecommendations = useCallback(async (restaurantId, cartItems) => {
    if (!cartItems || cartItems.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      let result

      if (mode === 'live') {
        result = await fetchLiveRecommendations(restaurantId, cartItems)
      } else {
        result = await fetchMockRecommendations(restaurantId, cartItems)
      }

      setRecommendations(result.recommendations || [])
      setLatency({
        total: result.total_ms,
        faiss: result.retrieval_ms,
        lgbm: result.ranking_ms,
        pool: result.candidates_pool,
      })
      setRequestCount(prev => prev + 1)
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Unknown error'
      setError(message)
      setRecommendations([])
    } finally {
      setIsLoading(false)
    }
  }, [mode])

  const clearRecommendations = useCallback(() => {
    setRecommendations([])
    setLatency(null)
    setError(null)
  }, [])

  return {
    recommendations,
    latency,
    isLoading,
    error,
    getRecommendations,
    clearRecommendations,
    requestCount,
  }
}
