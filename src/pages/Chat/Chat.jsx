import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ConversationList from '../../components/Chat/ConversationList'
import MessageList from '../../components/Chat/MessageList'
import ChatComposer from '../../components/Chat/ChatComposer'
import {
  createConversation,
  createPriceQuote,
  getAiCatalog,
  getConversationMessages,
  getConversations,
  streamChatMessage,
} from '../../services/aiPlatform.service'

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
  const quoteRequest = useRef(0)
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
    const request = ++quoteRequest.current
    setQuote(null)
    if (!draft.trim() || !modelSlug) return
    const timer = setTimeout(() => {
      createPriceQuote({
        modality: 'chat', modelSlug, prompt: draft, options: { maxOutputTokens },
      }).then((next) => {
        if (request === quoteRequest.current) setQuote(next)
      }).catch(() => {
        if (request === quoteRequest.current) setQuote(null)
      })
    }, 450)
    return () => {
      clearTimeout(timer)
      quoteRequest.current += 1
    }
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
    quoteRequest.current += 1
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
    <div className="flex h-screen overflow-hidden bg-background text-on-background">
      <ConversationList
        conversations={conversations}
        activeId={active?.id}
        onNew={newChat}
        onSelect={setActive}
      />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-outline-variant bg-white px-5 py-4">
          <div className="flex gap-2">
            <Link to="/create/image" className="rounded-xl px-4 py-2 text-on-surface-variant hover:bg-primary-container hover:text-primary">Image</Link>
            <Link to="/create/video" className="rounded-xl px-4 py-2 text-on-surface-variant hover:bg-primary-container hover:text-primary">Video</Link>
            <Link to="/create/audio" className="rounded-xl px-4 py-2 text-on-surface-variant hover:bg-primary-container hover:text-primary">Audio</Link>
            <span className="rounded-xl bg-primary-container px-4 py-2 font-medium text-primary-hover">Chat</span>
          </div>
          <select value={modelSlug} disabled={!!active} onChange={(event) => setModelSlug(event.target.value)}
            className="max-w-xs rounded-xl border border-outline-variant bg-white px-4 py-2 text-sm outline-none focus:border-primary disabled:opacity-60">
            {models.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </header>

        <MessageList
          messages={messages}
          selectedModel={selectedModel}
          sending={sending}
          endRef={endRef}
        />
        <ChatComposer
          draft={draft}
          onDraftChange={setDraft}
          maxOutputTokens={maxOutputTokens}
          onMaxOutputTokensChange={setMaxOutputTokens}
          quote={quote}
          sending={sending}
          error={error}
          onSend={send}
        />
      </main>
    </div>
  )
}
