import api from './api'

export const getModelsByProvider = async (providerCode: string) => {
  const response = await api.get('/ai-models', {
    params: { providerCode }
  });
  return response.data;
};