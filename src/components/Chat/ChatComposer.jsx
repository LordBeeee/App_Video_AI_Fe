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
    <div className="mx-auto w-full max-w-4xl px-5 pb-6">
      {error && (
        <p className="mb-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <div className="rounded-2xl border border-outline-variant bg-white p-3 shadow-[0_10px_30px_rgba(92,55,24,0.08)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          rows={3}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn…"
          className="w-full resize-none bg-transparent px-2 text-sm leading-6 outline-none placeholder:text-slate-600"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Tối đa
            <select
              value={maxOutputTokens}
              onChange={(event) => onMaxOutputTokensChange(Number(event.target.value))}
              className="rounded-lg bg-surface-variant px-2 py-1 text-on-surface"
            >
              {[512, 1024, 2048, 4096].map((value) => (
                <option key={value} value={value}>{value} tokens</option>
              ))}
            </select>
          </label>
          <button
            onClick={onSend}
            disabled={!quote || sending}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-hover disabled:bg-surface-container-highest disabled:text-outline"
          >
            {quote ? `${money(quote.minPriceVnd)} – ${money(quote.maxPriceVnd)}` : 'Đang ước tính'}
            <span className="material-symbols-outlined text-lg">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
