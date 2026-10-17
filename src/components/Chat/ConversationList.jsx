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
          </button>
        ))}
      </div>
    </aside>
  )
}
