const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

export default function MessageList({ messages, selectedModel, sending, endRef }) {
  return (
    <div className="custom-scrollbar mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 overflow-y-auto px-5 py-8">
      {!messages.length && (
        <div className="m-auto max-w-xl text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary-container">
            <span className="material-symbols-outlined text-4xl text-primary">chat_bubble</span>
          </div>
          <h1 className="text-2xl font-semibold">Bạn muốn sáng tạo điều gì?</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Chat nhiều lượt với {selectedModel?.name || 'model AI'} và biết trước khoảng chi phí của từng câu trả lời.
          </p>
        </div>
      )}
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'bg-primary text-on-primary' : 'border border-outline-variant bg-white text-on-surface shadow-sm'}`}>
            <p className="whitespace-pre-wrap">{message.content || (sending ? 'Đang suy nghĩ…' : '')}</p>
            {message.chargedVnd != null && (
              <p className="mt-2 text-right text-[11px] text-emerald-400">
                {money(message.chargedVnd)}
              </p>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  )
}
