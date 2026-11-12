import { formatVND } from '../../utils/expense.utils'

export function ConversationCost({ conversation, summary = false }) {
  const amount = conversation?.totalChargedVnd
  const complete = conversation?.costComplete !== false
  const label = amount == null ? 'Đang tải chi phí…'
    : !complete && Number(amount) === 0 ? 'Chi phí chưa đầy đủ'
      : `${complete ? (summary ? 'Tổng đã trừ' : 'Đã trừ') : 'Đã ghi nhận'}: ${formatVND(amount)}`
  return <span className="st-conversation-cost" title={!complete ? 'Một số lượt chat cũ chưa có dữ liệu chi phí gắn với hội thoại này.' : 'Tiền đã trừ trong ví, không gồm tiền đang tạm giữ.'}>{label}</span>
}

export default function ConversationList({ conversations, activeId, onNew, onSelect }) {
  return (
    <aside className="au-card dark st-conv">
      <button type="button" className="au-btn solid st-go" onClick={onNew}>
        <span className="material-symbols-outlined">add</span>
        Cuộc trò chuyện mới
      </button>
      <div className="au-scroll st-list">
        {conversations.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            className={`st-li${activeId === item.id ? ' on' : ''}`}
          >
            <b>{item.title}</b>
            <small>{item.modelSlug}</small>
            <ConversationCost conversation={item} />
          </button>
        ))}
      </div>
    </aside>
  )
}
