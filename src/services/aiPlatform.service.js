import api from './api'
import { API_BASE_URL } from '../lib/constants'

export const getAiCatalog = async (modality) =>
  (await api.get('/ai-catalog', { params: { modality } })).data

export const createPriceQuote = async (payload) =>
  (await api.post('/pricing/quotes', payload)).data

export const createGeneration = async (payload) =>
  (await api.post('/generations', payload)).data

export const getGeneration = async (id) =>
  (await api.get(`/generations/${id}`)).data

export const getGenerations = async (modality) =>
  (await api.get('/generations', { params: modality ? { modality } : {} })).data

export const createConversation = async (payload) =>
  (await api.post('/chat/conversations', payload)).data

export const getConversations = async () =>
  (await api.get('/chat/conversations')).data

export const getConversationMessages = async (id) =>
  (await api.get(`/chat/conversations/${id}/messages`)).data

export async function streamChatMessage(conversationId, payload, handlers = {}) {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Không thể gửi tin nhắn')
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = 'message'
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''
    for (const block of blocks) {
      let data = null
      for (const line of block.split('\n')) {
        if (line.startsWith('event:')) eventName = line.slice(6).trim()
        if (line.startsWith('data:')) {
          try { data = JSON.parse(line.slice(5).trim()) } catch { data = null }
        }
      }
      if (data && handlers[eventName]) handlers[eventName](data)
      eventName = 'message'
    }
  }
}
