const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

export default function ChatComposer({
  draft,
  onDraftChange,
  maxOutputTokens,
  onMaxOutputTokensChange,
  quote,
  sending,
  error,
  onSend,
}) {
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
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            rows={3}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn…"
            className="st-ta"
          />
          <div className="st-cmp-f">
            <label>
              Tối đa (tokens)
              <span className="au-pills">
                {[512, 1024, 2048, 4096].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`au-pill${maxOutputTokens === value ? ' on' : ''}`}
                    onClick={() => onMaxOutputTokensChange(value)}
                  >
                    {value}
                  </button>
                ))}
              </span>
            </label>
            <button type="button" className="au-btn solid st-go" onClick={onSend} disabled={!quote || sending}>
              {quote ? `${money(quote.minPriceVnd)} – ${money(quote.maxPriceVnd)}` : 'Đang ước tính'}
              <span className="material-symbols-outlined">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
