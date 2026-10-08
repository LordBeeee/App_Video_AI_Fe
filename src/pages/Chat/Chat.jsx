import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createConversation,
  createPriceQuote,
  getAiCatalog,
  getConversationMessages,
  getConversations,
  streamChatMessage,
} from '../../services/aiPlatform.service'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

export default function Chat() {
  const [models, setModels] = useState([])
  const [modelSlug, setModelSlug] = useState('')
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [maxOutputTokens, setMaxOutputTokens] = useState(1024)
  const [quote, setQuote] = useState(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const selectedModel = useMemo(() => models.find((item) => item.id === modelSlug), [models, modelSlug])

  const refreshConversations = async () => setConversations(await getConversations())

  useEffect(() => {
    getAiCatalog('chat').then((items) => {
      setModels(items)
      if (items[0]) setModelSlug(items[0].id)
    }).catch((err) => setError(err.response?.data?.message || err.message))
    refreshConversations().catch(() => {})
  }, [])

  useEffect(() => {
    if (!active) { setMessages([]); return }
    setModelSlug(active.modelSlug)
    getConversationMessages(active.id).then(setMessages).catch(() => setMessages([]))
  }, [active])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    setQuote(null)
    if (!draft.trim() || !modelSlug) return
    const timer = setTimeout(() => {
      createPriceQuote({
        modality: 'chat', modelSlug, prompt: draft, options: { maxOutputTokens },
      }).then(setQuote).catch(() => setQuote(null))
    }, 450)
    return () => clearTimeout(timer)
  }, [draft, modelSlug, maxOutputTokens])

  const newChat = () => {
    setActive(null)
    setMessages([])
    setDraft('')
    setError('')
  }

  const send = async () => {
    if (!draft.trim() || !quote || sending) return
    setSending(true)
    setError('')
    const content = draft.trim()
    setDraft('')
    setQuote(null)
    let conversation = active
    try {
      if (!conversation) {
        conversation = await createConversation({ modelSlug, title: content.slice(0, 60) })
        setActive(conversation)
        await refreshConversations()
      }
      setMessages((items) => [...items, { id: `local-user-${Date.now()}`, role: 'user', content }, { id: 'streaming', role: 'assistant', content: '' }])
      await streamChatMessage(conversation.id, { quoteId: quote.quoteId, content }, {
        delta: ({ text }) => setMessages((items) => items.map((item) => item.id === 'streaming' ? { ...item, content: item.content + text } : item)),
        done: ({ message, chargedVnd }) => setMessages((items) => items.map((item) => item.id === 'streaming' ? { ...message, chargedVnd } : item)),
        error: ({ message }) => setError(message),
      })
    } catch (err) {
      setMessages((items) => items.filter((item) => item.id !== 'streaming'))
      setError(err.response?.data?.message || err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#111418] text-white">
      <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#14171b] p-4 xl:flex xl:flex-col">
        <button onClick={newChat} className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 font-semibold hover:bg-white/[0.08]">
          <span className="material-symbols-outlined">add</span> Cuộc trò chuyện mới
        </button>
        <div className="custom-scrollbar mt-5 flex-1 space-y-2 overflow-y-auto">
          {conversations.map((item) => (
            <button key={item.id} onClick={() => setActive(item)} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${active?.id === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
              <p className="truncate font-medium">{item.title}</p>
              <p className="mt-1 truncate text-xs text-slate-600">{item.modelSlug}</p>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex gap-2">
            <Link to="/create/image" className="rounded-xl px-4 py-2 text-slate-400 hover:bg-white/5">Image</Link>
            <Link to="/create/video" className="rounded-xl px-4 py-2 text-slate-400 hover:bg-white/5">Video</Link>
            <Link to="/create/audio" className="rounded-xl px-4 py-2 text-slate-400 hover:bg-white/5">Audio</Link>
            <span className="rounded-xl bg-[#2a2e34] px-4 py-2">Chat</span>
          </div>
          <select value={modelSlug} disabled={!!active} onChange={(event) => setModelSlug(event.target.value)}
            className="max-w-xs rounded-xl border border-white/10 bg-[#1b1f24] px-4 py-2 text-sm outline-none disabled:opacity-60">
            {models.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </header>

        <div className="custom-scrollbar mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 overflow-y-auto px-5 py-8">
          {!messages.length && (
            <div className="m-auto max-w-xl text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]"><span className="material-symbols-outlined text-4xl text-violet-300">chat_bubble</span></div>
              <h1 className="text-2xl font-semibold">Bạn muốn sáng tạo điều gì?</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">Chat nhiều lượt với {selectedModel?.name || 'model AI'} và biết trước khoảng chi phí của từng câu trả lời.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-white text-black' : 'border border-white/10 bg-[#1a1e23] text-slate-200'}`}>
                <p className="whitespace-pre-wrap">{message.content || (sending ? 'Đang suy nghĩ…' : '')}</p>
                {message.chargedVnd != null && <p className="mt-2 text-right text-[11px] text-emerald-400">{money(message.chargedVnd)}</p>}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="mx-auto w-full max-w-4xl px-5 pb-6">
          {error && <p className="mb-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</p>}
          <div className="rounded-2xl border border-white/10 bg-[#1a1e23] p-3 shadow-2xl focus-within:border-white/25">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }}
              placeholder="Nhập tin nhắn…" className="w-full resize-none bg-transparent px-2 text-sm leading-6 outline-none placeholder:text-slate-600" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-500">Tối đa
                <select value={maxOutputTokens} onChange={(event) => setMaxOutputTokens(Number(event.target.value))} className="rounded-lg bg-white/5 px-2 py-1 text-slate-300">
                  {[512, 1024, 2048, 4096].map((value) => <option key={value} value={value}>{value} tokens</option>)}
                </select>
              </label>
              <button onClick={send} disabled={!quote || sending} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:bg-white/10 disabled:text-slate-500">
                {quote ? `${money(quote.minPriceVnd)} – ${money(quote.maxPriceVnd)}` : 'Đang ước tính'}
                <span className="material-symbols-outlined text-lg">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
