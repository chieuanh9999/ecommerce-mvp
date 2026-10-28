
# Ecommerce MVP - Monolithic RESTful API

## 1. Giới thiệu

Dự án RESTful API cho hệ thống thương mại điện tử MVP.

Kiến trúc: Monolithic.

## 2. Công nghệ sử dụng

- Node.js 24
- Express.js 5
- Prisma ORM 6
- PostgreSQL 17
- JWT Authentication
- bcryptjs
- Docker và Docker Compose

## 3. Chức năng

### Authentication
- Đăng ký tài khoản CUSTOMER
- Đăng nhập và nhận JWT
- Phân quyền ADMIN và CUSTOMER

### Product
- Xem danh sách sản phẩm
- Xem chi tiết sản phẩm
- Thêm sản phẩm (ADMIN)
- Cập nhật sản phẩm (ADMIN)
- Xóa sản phẩm (ADMIN)

### Order
- CUSTOMER tạo đơn hàng
- Kiểm tra và trừ số lượng tồn kho
- Tính tổng tiền
- Xem danh sách và chi tiết đơn hàng
- Phân quyền truy cập đơn hàng

### Shipment
- ADMIN tạo thông tin giao hàng
- ADMIN xem danh sách giao hàng
- Xem chi tiết giao hàng theo quyền
- ADMIN cập nhật trạng thái giao hàng

## 4. Database

Hệ thống sử dụng 7 bảng:

1. Role
2. User
3. MemberShip
4. Product
5. Order
6. OrderDetail
7. Shipment

## 5. Cấu hình môi trường

Sao chép .env.example thành .env:

cp .env.example .env

Sau đó thiết lập:
- POSTGRES_PASSWORD
- DATABASE_URL
- PORT
- JWT_SECRET
- JWT_EXPIRES_IN

Không commit file .env lên GitHub.

## 6. Chạy dự án bằng Docker

docker compose up --build -d

Kiểm tra trạng thái:

docker compose ps

## 7. Health Check

Ứng dụng Docker:

http://localhost:3002/health

Kết quả mong đợi:

{
  "status": "healthy",
  "database": "connected"
}

## 8. API Endpoints

### Authentication
POST /api/auth/register
POST /api/auth/login

### Products
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

### Orders
GET  /api/orders
GET  /api/orders/:id
POST /api/orders

### Shipments
GET  /api/shipments
GET  /api/shipments/:id
POST /api/shipments
PUT  /api/shipments/:id

## 9. Bảo mật

- Mật khẩu được băm bằng bcryptjs.
- JWT dùng để xác thực người dùng.
- Middleware kiểm tra vai trò ADMIN/CUSTOMER.
- File .env không được đưa vào Git.
- API Health Check kiểm tra kết nối PostgreSQL.

## 10. Ghi chú

Dự án được xây dựng nhằm phục vụ bài thực hành
PROMPT 2 - Monolithic, môn Lập trình hướng dịch vụ.
