import api from './api'

export const getWallet = async () => (await api.get('/wallet')).data
export const getWalletTransactions = async () => (await api.get('/wallet/transactions')).data
export const getTopups = async () => (await api.get('/wallet/topups')).data
export const createTopup = async (amountVnd) => (await api.post('/wallet/topups', { amountVnd })).data
