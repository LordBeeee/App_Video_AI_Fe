import { useState, useEffect, useCallback } from 'react'
import { getVideoHistoryApi, getVideoGenHistoryApi, getMotionControlHistoryApi } from '../services/videoGeneration.service'

export function useVideoHistory(type = 'standard') {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const data = type === 'motion_control'
        ? await getMotionControlHistoryApi()
        : await getVideoGenHistoryApi()
      setHistory(data)
    } catch (err) {
      console.error('Lỗi fetch history:', err)
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, refetch: fetchHistory }
}