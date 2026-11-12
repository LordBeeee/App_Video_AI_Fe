import { Empty } from '../Aurora/AuroraUI'
import { formatVND } from '../../utils/expense.utils'

export function ChatDocuments({ documents = [], disabled, onRemove }) {
  if (!documents.length) return null
  return <div className="st-chat-documents">
    {documents.map((document, index) => <div className="st-chat-document" key={`${document.name}-${index}`}>
      <span className="material-symbols-outlined" aria-hidden="true">description</span>
      <span title={document.name}>{document.name}</span>
      {onRemove && <button type="button" aria-label={`Bỏ ${document.name}`} disabled={disabled} onClick={() => onRemove(index)}>
        <span className="material-symbols-outlined" aria-hidden="true">close</span>
      </button>}
    </div>)}
  </div>
}

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
            <ChatDocuments documents={message.documents} />
            <p>{message.content || (sending ? 'Đang suy nghĩ…' : '')}</p>
            {message.chargedVnd != null && <div className="st-cost">{formatVND(message.chargedVnd)}</div>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
