import { Link } from "react-router-dom";

const TABS = [
  { id: "image", to: "/create/image", label: "Ảnh", icon: "image" },
  { id: "video", to: "/create/video", label: "Video", icon: "smart_display" },
  { id: "audio", to: "/create/audio", label: "Giọng nói", icon: "graphic_eq" },
  { id: "chat", to: "/chat", label: "Chat", icon: "chat_bubble" },
];

export default function StudioTabs({ active }) {
  return (
    <nav className="au-pills st-tabs">
      {TABS.map((tab) => (
        <Link key={tab.id} to={tab.to} className={`au-pill${active === tab.id ? " on" : ""}`}>
          <span className="material-symbols-outlined">{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
