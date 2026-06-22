import { useState, useEffect } from 'react';
import { getModelsByProvider, getModelsByType, getMotionControlModels } from '../services/aiModel.service';

export function useAiModels(
  options: { modelType?: string; providerCode?: string; supportsMotionControl?: boolean } | string = {},
) {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
 
  // Backward-compat: nếu truyền string thì coi là providerCode
  const opts =
    typeof options === 'string' ? { providerCode: options } : options
 
  const { modelType, providerCode, supportsMotionControl } = opts
 
  useEffect(() => {
    setLoading(true)
 
    const fetcher = supportsMotionControl !== undefined
      ? getMotionControlModels()
      : modelType
        ? getModelsByType(modelType)
        : getModelsByProvider(providerCode ?? '')
 
    fetcher
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? []
        setModels(list)
      })
      .catch((err) => {
        console.error('Lỗi fetch models:', err)
        setModels([])
      })
      .finally(() => setLoading(false))
  }, [modelType, providerCode, supportsMotionControl])
 
  return { models, loading }
}