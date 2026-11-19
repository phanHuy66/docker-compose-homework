
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


## 3. Khởi tạo database tự động

Khi chạy:

```bash
docker compose up
```

Docker Compose sẽ thực hiện theo thứ tự:

1. Khởi động PostgreSQL và đợi database healthy.
2. Backend tự động chạy:
   - `knex migrate:latest`: Tạo các bảng chưa tồn tại.
   - `knex seed:run`: Thêm dữ liệu mẫu nếu bảng đang trống.
   - `npm start`: Khởi động Backend API.
3. Frontend React khởi động sau khi Backend healthy.

Không cần chạy Migration và Seeding thủ công.

### Kiểm tra

Xem trạng thái các container:

```bash
docker compose ps
```

Kiểm tra log Backend:

```bash
docker compose logs --tail=50 api
```

**Lưu ý:** Khi thay đổi Dockerfile hoặc cài thêm thư viện,
sử dụng `docker compose up --build` để build lại image.



## 4. Truy cập ứng dụng

- Frontend React: cổng 3000
- Backend API: cổng 8080
- Danh sách phòng: endpoint `/room`

### Trên GitHub Codespaces

1. Chạy `docker compose up`.
2. Mở tab Ports trong Codespaces.
3. Truy cập cổng 3000 để xem trang React.
4. Trang chủ sẽ hiển thị danh sách phòng từ PostgreSQL.

Frontend sử dụng React Proxy để chuyển tiếp request
`/room` tới `http://api:8080/room`.

Không cần sửa URL API trong `App.js` khi chuyển sang Codespace mới.

Cổng 8080 có thể giữ ở chế độ Private.
```


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
