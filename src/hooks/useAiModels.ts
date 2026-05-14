import { useState, useEffect } from 'react';
import { getModelsByProvider } from '../services/aiModel.service';

export function useAiModels(providerCode: string) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelsByProvider(providerCode)
      .then((data) => {
        console.log('API response:', data); // xem BE trả về gì
        // Tuỳ BE trả về dạng nào
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setModels(list);
      })
      .catch((err) => {
        console.error('Lỗi fetch models:', err);
        setModels([]);
      })
      .finally(() => setLoading(false));
  }, [providerCode]);

  return { models, loading };
}