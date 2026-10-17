import { Empty } from '../Aurora/AuroraUI'

const money = (value) => `${new Intl.NumberFormat('vi-VN').format(Number(value || 0))} ₫`

export default function MessageList({ messages, selectedModel, sending, endRef }) {
  return (
    <div className="au-scroll st-msgs">
      <div className="st-msgs-in">
        {!messages.length && (
          <Empty
            icon="chat_bubble"
            text="Bạn muốn sáng tạo điều gì?"
            hint={`Chat nhiều lượt với ${selectedModel?.name || 'model AI'} và biết trước khoảng chi phí của từng câu trả lời.`}
          />
        )}
        {messages.map((message) => (
          <div key={message.id} className={`st-b ${message.role === 'user' ? 'user' : 'bot'}`}>
            <p>{message.content || (sending ? 'Đang suy nghĩ…' : '')}</p>
            {message.chargedVnd != null && <div className="st-cost">{money(message.chargedVnd)}</div>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
