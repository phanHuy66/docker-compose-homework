
# Docker Compose - PostgreSQL, Restify, React

## 1. Cấu hình môi trường

Liên hệ leader để nhận thông tin cấu hình.

Tạo file `.env` dựa trên `.env.sample` và điền đầy đủ các biến môi trường:

- NODE_ENV
- POSTGRES_HOST
- POSTGRES_PORT
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD

Không đưa file `.env` lên GitHub.

## 2. Khởi động hệ thống lần đầu

Tại thư mục gốc project, chạy:

```bash
docker compose up --build
```

Hệ thống gồm 3 dịch vụ:
- db: PostgreSQL
- api: Node.js Restify
- frontend: React

## 3. Khởi tạo database lần đầu

Mở Terminal mới, truy cập container API:

```bash
docker exec -it api_1 /bin/bash
```

Chạy Migration để tạo cấu trúc bảng:

```bash
knex migrate:latest
```

Chạy Seeding để thêm dữ liệu mẫu:

```bash
knex seed:run
```

Thoát container:

```bash
exit
```

## 4. Truy cập ứng dụng

- Frontend React: cổng 3000
- Backend API: cổng 8080
- Danh sách phòng: endpoint /room

Nếu dùng GitHub Codespaces, cần cập nhật URL API trong
`frontend-react/src/App.js` theo địa chỉ cổng 8080
của Codespace hiện tại.

Để frontend gọi API qua URL Codespaces theo cấu hình
hiện tại, cổng 8080 cần cho phép truy cập phù hợp.
Chỉ đặt Public cho API dữ liệu mẫu khi cần thiết.

## 5. Khi thêm package mới

Ví dụ thêm một thư viện cho Frontend:

```bash
cd frontend-react
npm install --save TenPackage
rm -rf node_modules
cd ..
```

Build lại dịch vụ Frontend:

```bash
docker compose up --build frontend
```

Nếu thêm thư viện cho Backend, thực hiện tương tự
trong `api-server` và build lại dịch vụ `api`.
