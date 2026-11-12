// API Base URL - cấu hình theo môi trường
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const CHAT_TOKEN_LEVELS = [
  { label: 'Ngắn gọn', value: 512 },
  { label: 'Vừa phải', value: 1024 },
  { label: 'Chi tiết', value: 2048 },
  { label: 'Mở rộng', value: 4096 },
]
