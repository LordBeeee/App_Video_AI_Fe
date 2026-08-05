import api from './api'

export const getModelsByProvider = async (providerCode: string) => {
  const response = await api.get('/ai-models', {
    params: { providerCode }
  });
  return response.data;
};

export const getModelsByType = async (modelType: string) => {
  const response = await api.get('/ai-models', {
    params: { modelType },
  })
  return response.data
}

export const getMotionControlModels = async () => {
  const response = await api.get('/ai-models', {
    params: { supportsMotionControl: true },
  });
  return response.data;
};

export const getElementModels = async () => {
  const response = await api.get('/ai-models', {
    params: { supportsElements: true },
  });
  return response.data;
};