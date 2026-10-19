import { useEffect, useMemo, useRef, useState } from 'react'
import ConversationList from '../../components/Chat/ConversationList'
import MessageList from '../../components/Chat/MessageList'
import ChatComposer from '../../components/Chat/ChatComposer'
import ModelSelect from '../../components/Chat/ModelSelect'
import StudioTabs from '../../components/CreateStudio/StudioTabs'
import '../../components/Aurora/aurora.css'
import '../../components/CreateStudio/studio.css'
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
    <div className="au st">
      <header className="au-head">
        <h1 className="au-title au-fd st-ttl">Chat AI</h1>
        <div className="au-tools">
          <ModelSelect models={models} value={modelSlug} disabled={!!active} onChange={setModelSlug} />
          <StudioTabs active="chat" />
        </div>
      </header>

      <div className="st-grid chat">
        <ConversationList
          conversations={conversations}
          activeId={active?.id}
          onNew={newChat}
          onSelect={setActive}
        />

        <section className="au-card st-chat">
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
        </section>
      </div>
    </div>
  )
}
