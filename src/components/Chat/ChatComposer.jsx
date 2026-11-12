import { useEffect, useRef, useState } from 'react'
import { CHAT_TOKEN_LEVELS } from '../../lib/constants'
import { formatVND } from '../../utils/expense.utils'
import { ChatDocuments } from './MessageList'

export default function ChatComposer({
  draft,
  documents = [],
  uploading,
  onAttachDocuments,
  onRemoveDocument,
  onDraftChange,
  maxOutputTokens,
  maxModelTokens,
  onMaxOutputTokensChange,
  quote,
  sending,
  disabled,
  error,
  onSend,
}) {
  const [open, setOpen] = useState(false)
  const pickerRef = useRef(null)
  const triggerRef = useRef(null)
  const fileRef = useRef(null)
  const levels = CHAT_TOKEN_LEVELS.map((level, index) => ({
    ...level, value: index === 0 ? Math.min(level.value, maxModelTokens) : level.value,
  })).filter((level) => level.value <= maxModelTokens)
  const selectedIndex = Math.max(0, levels.findIndex((level) => level.value === maxOutputTokens))
  const selected = levels[selectedIndex]
  const locked = disabled || sending || uploading
  const hasContent = !!draft.trim() || documents.length > 0

  useEffect(() => {
    if (!open) return undefined
    const onDown = (event) => { if (!pickerRef.current?.contains(event.target)) setOpen(false) }
    const onKey = (event) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="st-cmp-w">
      <div className="st-cmp-in">
        {error && <p className="st-err">{error}</p>}
        <div className="st-cmp">
          <ChatDocuments documents={documents} disabled={locked} onRemove={onRemoveDocument} />
          {uploading && <p className="st-chat-uploading" role="status">Đang đọc tài liệu…</p>}
          <textarea
            disabled={locked}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            rows={3}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn…"
            aria-label="Tin nhắn cho AI"
            className="st-ta custom-scrollbar"
          />
          <div className="st-cmp-f">
            <input ref={fileRef} type="file" hidden multiple accept=".pdf,.txt,.md,.docx,.xlsx"
              disabled={locked} onChange={(event) => {
                const files = Array.from(event.target.files || [])
                event.target.value = ''
                onAttachDocuments(files)
              }} />
            <button type="button" className="st-attach-document" aria-label="Đính kèm tài liệu" title="PDF, TXT, Markdown, Word, Excel · tối đa 3 file, 5 MB/file"
              disabled={locked || documents.length >= 3} onClick={() => fileRef.current?.click()}>
              <span className="material-symbols-outlined" aria-hidden="true">attach_file</span>
            </button>
            <div className="st-answer-length" ref={pickerRef} onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
            }}>
              <button ref={triggerRef} type="button" className="st-token-trigger" disabled={locked}
                aria-expanded={open && !locked} aria-controls="chat-token-panel"
                aria-label={`Giới hạn trả lời: ${selected.label}, ${maxOutputTokens} token`}
                onClick={() => setOpen((value) => !value)}>
                {selected.label}
                <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
              </button>
              {open && !locked && (
                <div id="chat-token-panel" className="st-token-panel" role="group" aria-label="Chọn giới hạn token">
                  <div className="st-token-panel-head">
                    <div><strong>{selected.label}</strong><span>Tối đa {maxOutputTokens.toLocaleString('vi-VN')} token</span></div>
                    <button type="button" aria-label="Đặt lại mức vừa phải" title="Đặt lại mức vừa phải"
                      onClick={() => onMaxOutputTokensChange([...levels].reverse().find((level) => level.value <= 1024)?.value || levels[0].value)}>
                      <span className="material-symbols-outlined" aria-hidden="true">restart_alt</span>
                    </button>
                  </div>
                  <div className="st-token-slider" style={{ '--token-progress': `${levels.length > 1 ? selectedIndex / (levels.length - 1) * 100 : 0}%` }}>
                    <input type="range" min="0" max={Math.max(1, levels.length - 1)} step="1" value={selectedIndex}
                      disabled={levels.length === 1} aria-label="Giới hạn token trả lời"
                      aria-valuetext={`${selected.label}, tối đa ${maxOutputTokens} token`}
                      onChange={(event) => onMaxOutputTokensChange(levels[Number(event.target.value)].value)} />
                    <div className="st-token-ticks" aria-hidden="true">{levels.map((level) => <span key={level.value} />)}</div>
                  </div>
                  <p>Giới hạn gồm cả token suy luận nếu model sử dụng.</p>
                </div>
              )}
            </div>
            <div className="st-chat-submit">
              {quote && hasContent && !locked && <p className="st-chat-estimate" role="status" aria-label="Chi phí dự kiến">
                {formatVND(quote.minPriceVnd)} – {formatVND(quote.maxPriceVnd)}
              </p>}
              <button type="button" className="au-btn solid st-go" onClick={onSend} disabled={locked || !hasContent || !quote}>
                {sending ? 'Đang gửi…' : 'Gửi'}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_upward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
