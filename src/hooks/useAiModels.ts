import { useState, useEffect } from 'react';
import { getModelsByProvider, getModelsByType  } from '../services/aiModel.service';

// export function useAiModels(providerCode: string) {
//   const [models, setModels] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getModelsByProvider(providerCode)
//       .then((data) => {
//         const list = Array.isArray(data) ? data : data?.data ?? [];
//         setModels(list);
//       })
//       .catch((err) => {
//         console.error('Lỗi fetch models:', err);
//         setModels([]);
//       })
//       .finally(() => setLoading(false));
//   }, [providerCode]);

//   return { models, loading };
// }

export function useAiModels(
  options: { modelType?: string; providerCode?: string } | string = {},
) {
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
 
  // Backward-compat: nếu truyền string thì coi là providerCode
  const opts =
    typeof options === 'string' ? { providerCode: options } : options
 
  const { modelType, providerCode } = opts
 
  useEffect(() => {
    setLoading(true)
 
    const fetcher = modelType
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
  }, [modelType, providerCode])
 
  return { models, loading }
}