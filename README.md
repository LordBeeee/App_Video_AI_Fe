# Video AI frontend

Giao diện React, Vite và Tailwind cho Video AI. FE gọi API backend qua
`VITE_API_BASE_URL`; phiên đăng nhập dùng cookie do backend cấp.

## Chạy từ bản clone mới

Cần Node.js `^20.19.0` hoặc `>=22.12.0` và npm. Chạy backend trước theo README
của repo `be_video-ai`; API mặc định ở `http://localhost:3000`.

```bash
npm ci
cp .env.example .env
npm run dev
```

Trên PowerShell, dùng `Copy-Item .env.example .env` để sao chép file cấu hình.
Mở `http://localhost:5173`. Nếu API chạy ở địa chỉ khác, sửa
`VITE_API_BASE_URL` trong `.env` rồi khởi động lại Vite. Backend cần cho phép
origin của FE qua `FRONTEND_URL`. Các biến `VITE_*` sẽ xuất hiện trong bundle
trình duyệt, vì vậy không đặt API key hoặc mật khẩu vào đây.

Tài khoản quản trị đầu tiên được tạo bằng lệnh `db:create-admin` của backend.

## Lệnh kiểm tra

```bash
npm run lint
npm run build
```

`npm run preview` phục vụ bản build tại máy. Khi triển khai FE, cấu hình
`VITE_API_BASE_URL` trên môi trường build và cho phép origin của trang trong
backend. `vercel.json` đã chuyển các URL của SPA về `index.html`.

## Vị trí code

- `src/pages/`: các màn hình theo route; page ghép component và điều phối dữ liệu.
- `src/components/`: các khối giao diện, chia theo màn hình hoặc nhóm dùng chung.
- `src/services/`: lời gọi API; `api.ts` là Axios client dùng chung.
- `src/store/`: trạng thái phiên đăng nhập.
- `src/utils/`, `src/types/`, `src/constants/`: hàm thuần, kiểu dữ liệu và hằng số.
- `src/layouts/`: bố cục chung của các trang sau đăng nhập.

Luồng tạo nội dung nằm ở `src/pages/CreateStudio/` và
`src/components/CreateStudio/`. Khi thêm một chức năng, đặt UI cạnh các
component cùng màn hình; chỉ chuyển thành component dùng chung khi có nơi khác
cần dùng lại.
