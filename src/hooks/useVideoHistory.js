import { useState, useEffect, useCallback } from 'react'
import { getVideoHistoryApi } from '../services/videoGeneration.service'

export function useVideoHistory() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getVideoHistoryApi()
      setHistory(data)
    } catch (err) {
      console.error('Lỗi fetch history:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, refetch: fetchHistory }
}