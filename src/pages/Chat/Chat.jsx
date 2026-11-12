import { useEffect, useMemo, useRef, useState } from 'react'
import ConversationList, { ConversationCost } from '../../components/Chat/ConversationList'
import MessageList from '../../components/Chat/MessageList'
import ChatComposer from '../../components/Chat/ChatComposer'
import ModelSelect from '../../components/Chat/ModelSelect'
import StudioTabs from '../../components/CreateStudio/StudioTabs'
import { usePriceQuote } from '../CreateStudio/usePriceQuote'
import { CHAT_TOKEN_LEVELS } from '../../lib/constants'
import '../../components/Aurora/aurora.css'
import '../../components/CreateStudio/studio.css'
import {
  createConversation,
  getAiCatalog,
  getConversationMessages,
  getConversations,
  streamChatMessage,
  uploadChatDocument,
} from '../../services/aiPlatform.service'

export default function Chat() {
  const [models, setModels] = useState([])
  const [catalogLoaded, setCatalogLoaded] = useState(false)
  const [modelSlug, setModelSlug] = useState('')
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const uploadRequest = useRef(0)
  const [outputTokenBudget, setMaxOutputTokens] = useState(1024)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)
  const selectedModel = useMemo(() => models.find((item) => item.id === modelSlug), [models, modelSlug])
  const modelLimit = Number(selectedModel?.maxOutputTokens)
  const maxModelTokens = Number.isFinite(modelLimit) && modelLimit > 0 ? Math.floor(modelLimit) : 16384
  const availableBudget = Math.min(outputTokenBudget, maxModelTokens)
  const maxOutputTokens = [...CHAT_TOKEN_LEVELS].reverse().find((level) => level.value <= availableBudget)?.value || availableBudget
  const unavailableModel = catalogLoaded && !!active && !selectedModel
  const activeConversation = conversations.find((item) => item.id === active?.id) || active
  const prompt = draft.trim() || (documents.length ? 'Hãy tóm tắt tài liệu đính kèm.' : '')
  const quoteOptions = useMemo(() => ({ maxOutputTokens, documents, conversationId: active?.id }), [maxOutputTokens, documents, active?.id])
  const { quote, quoteError, clearQuote } = usePriceQuote({
    modality: 'chat', modelSlug, prompt, options: quoteOptions,
    enabled: !!selectedModel && !uploading && !sending,
  })

  const refreshConversations = async () => setConversations(await getConversations())

  useEffect(() => {
    getAiCatalog('chat').then((items) => {
      setModels(items)
      setModelSlug((current) => current || items[0]?.id || '')
      setCatalogLoaded(true)
    }).catch((err) => setError(err.response?.data?.message || err.message))
    refreshConversations().catch(() => {})
  }, [])

  useEffect(() => {
    if (!active) { setMessages([]); return }
    setModelSlug(active.modelSlug)
    getConversationMessages(active.id).then(setMessages).catch(() => setMessages([]))
  }, [active])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const attachDocuments = async (files) => {
    if (sending || uploading || !files.length) return
    if (documents.length + files.length > 3) { setError('Đính kèm tối đa 3 tài liệu mỗi tin nhắn'); return }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) { setError('Mỗi tài liệu tối đa 5 MB'); return }
    const request = ++uploadRequest.current
    clearQuote()
    setError('')
    setUploading(true)
    try {
      const added = await Promise.all(files.map(uploadChatDocument))
      if (request !== uploadRequest.current) return
      const next = [...documents, ...added]
      if (next.reduce((size, doc) => size + new TextEncoder().encode(doc.text).length, 0) > 60000)
        throw new Error('Tổng nội dung tài liệu vượt 60 KB. Hãy chia nhỏ tài liệu.')
      setDocuments(next)
    } catch (err) {
      if (request === uploadRequest.current) setError(err.response?.data?.message || err.message)
    } finally {
      if (request === uploadRequest.current) setUploading(false)
    }
  }

  const removeDocument = (index) => {
    clearQuote()
    setError('')
    setDocuments((items) => items.filter((_, position) => position !== index))
  }

  const selectConversation = (conversation = null) => {
    if (sending) return
    uploadRequest.current += 1
    setUploading(false)
    setDocuments([])
    clearQuote()
    setActive(conversation)
    setModelSlug(conversation?.modelSlug || models[0]?.id || '')
    if (!conversation || conversation.id !== active?.id) setMessages([])
    setDraft('')
    setError('')
  }

  const send = async () => {
    if (!prompt || !quote || sending || uploading || !selectedModel) return
    setSending(true)
    setError('')
    const content = prompt
    const sentDocuments = documents
    setDraft('')
    setDocuments([])
    clearQuote()
    let conversation = active
    try {
      if (!conversation) {
        conversation = await createConversation({ modelSlug, title: content.slice(0, 60) })
        setActive(conversation)
        await refreshConversations()
      }
      setMessages((items) => [...items, { id: `local-user-${Date.now()}`, role: 'user', content, documents: sentDocuments }, { id: 'streaming', role: 'assistant', content: '' }])
      await streamChatMessage(conversation.id, { quoteId: quote.quoteId, content }, {
        delta: ({ text }) => setMessages((items) => items.map((item) => item.id === 'streaming' ? { ...item, content: item.content + text } : item)),
        done: ({ message, chargedVnd }) => setMessages((items) => items.map((item) => item.id === 'streaming' ? { ...message, chargedVnd } : item)),
        error: ({ message }) => setError(message),
      })
    } catch (err) {
      setDraft(content)
      setDocuments(sentDocuments)
      setMessages((items) => items.filter((item) => item.id !== 'streaming'))
      setError(err.response?.data?.message || err.message)
    } finally {
      setSending(false)
      if (conversation) await refreshConversations().catch(() => {})
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
          onNew={() => selectConversation()}
          onSelect={selectConversation}
        />

        <section className="au-card st-chat">
          {activeConversation && <div className="st-conversation-header">
            <span className="st-conversation-title">{activeConversation.title}</span>
            <ConversationCost conversation={activeConversation} summary />
          </div>}
          <MessageList
            messages={messages}
            selectedModel={selectedModel}
            sending={sending}
            endRef={endRef}
          />
          <ChatComposer
            draft={draft}
            documents={documents}
            uploading={uploading}
            onAttachDocuments={attachDocuments}
            onRemoveDocument={removeDocument}
            onDraftChange={setDraft}
            maxOutputTokens={maxOutputTokens}
            maxModelTokens={maxModelTokens}
            onMaxOutputTokensChange={setMaxOutputTokens}
            quote={quote}
            sending={sending}
            error={unavailableModel
              ? 'Model của hội thoại này không còn được hỗ trợ. Hãy tạo hội thoại mới với model OpenAI hoặc Google.'
              : error || quoteError || (catalogLoaded && !models.length ? 'Hiện chưa có model chat OpenAI hoặc Google khả dụng.' : '')}
            disabled={!selectedModel}
            onSend={send}
          />
        </section>
      </div>
    </div>
  )
}
