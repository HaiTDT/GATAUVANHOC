# 💄 Cosmetics E-commerce Monorepo

Một nền tảng thương mại điện tử chuyên cung cấp mỹ phẩm được xây dựng theo kiến trúc Monorepo. Dự án cung cấp đầy đủ các tính năng cho khách hàng (mua sắm, giỏ hàng, thanh toán) và quản trị viên (quản lý sản phẩm, danh mục, đơn hàng).

## 🚀 Tính năng nổi bật

### Dành cho Khách hàng (Customer)
- **Xác thực & Phân quyền**: Đăng ký, đăng nhập an toàn sử dụng JWT & bcrypt.
- **Duyệt sản phẩm**: Xem danh sách sản phẩm, chi tiết sản phẩm, lọc theo danh mục.
- **Giỏ hàng (Cart)**: Thêm, sửa, xóa sản phẩm trong giỏ hàng.
- **Thanh toán (Checkout)**: Quy trình đặt hàng, nhập thông tin giao hàng.
- **Đơn hàng (Orders)**: Theo dõi lịch sử và trạng thái đơn hàng.
- **Đánh giá (Reviews)**: Đánh giá và nhận xét sản phẩm đã mua.
- **Khám phá Nội dung**: Xem các bài viết tin tức và bí quyết làm đẹp (Blog).
- **Săn Sale**: Mua sắm các sản phẩm giới hạn trong chương trình Flash Sale tại trang chủ.

### Dành cho Quản trị viên (Admin)
- Quản lý danh mục sản phẩm (Categories).
- Quản lý sản phẩm (Products) bao gồm giá cả, hình ảnh, tồn kho và thiết lập Flash Sale.
- Quản lý đơn hàng (Orders) và thay đổi trạng thái giao hàng.
- Quản lý bài viết (Blogs): Tạo và chỉnh sửa nội dung tin tức, bài viết làm đẹp hiển thị ở trang chủ.
- Bảng điều khiển quản trị (Dashboard).

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Client (Frontend)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Ngôn ngữ**: TypeScript

### Server (Backend)
- **Framework**: [Express.js](https://expressjs.com/)
- **Ngôn ngữ**: Node.js & TypeScript
- **Bảo mật**: Helmet, CORS, JWT
- **Database ORM**: [Prisma](https://www.prisma.io/)

### Database & DevOps
- **Cơ sở dữ liệu**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose
- **Workspace Manager**: npm workspaces (Monorepo)

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo dạng Monorepo với cấu trúc như sau:

```text
.
├── client/                 # Ứng dụng Next.js (Frontend)
│   ├── src/
│   │   ├── app/            # Next.js App Router (pages, layouts)
│   │   ├── components/     # Các React components dùng chung
│   │   └── lib/            # Tiện ích, hooks, API calls
│   └── package.json
├── server/                 # Ứng dụng Express.js (Backend API)
│   ├── prisma/
│   │   └── schema.prisma   # Định nghĩa cấu trúc database cho Prisma
│   ├── src/
│   │   ├── controllers/    # Xử lý logic của các API endpoints
│   │   ├── middlewares/    # Middleware xác thực, phân quyền, lỗi
│   │   ├── routes/         # Định nghĩa các endpoints (auth, products, admin, v.v.)
│   │   ├── services/       # Xử lý logic nghiệp vụ (business logic)
│   │   └── types/          # Khai báo TypeScript types/interfaces
│   └── package.json
├── docker-compose.yml      # Cấu hình container PostgreSQL
└── package.json            # Cấu hình Root Workspace và Scripts
```

## 🗄️ Cấu trúc Cơ sở dữ liệu (Database Schema)

Dự án sử dụng PostgreSQL với các Model chính:
- **User**: Lưu trữ thông tin người dùng và phân quyền (`ADMIN`, `CUSTOMER`).
- **Category**: Danh mục sản phẩm (ví dụ: Son môi, Chăm sóc da).
- **Product**: Thông tin chi tiết mỹ phẩm (tên, mô tả, giá, tồn kho, hình ảnh, trạng thái Flash Sale).
- **Cart & CartItem**: Quản lý giỏ hàng tạm thời của người dùng.
- **Order & OrderItem**: Lưu trữ thông tin đơn hàng đã đặt và trạng thái giao hàng.
- **Review**: Lưu trữ đánh giá của khách hàng về sản phẩm.
- **Blog**: Lưu trữ các bài viết, tin tức, chia sẻ bí quyết làm đẹp hiển thị trên trang chủ.

## ⚙️ Hướng dẫn cài đặt và chạy local

### Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) (phiên bản 18+ trở lên)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (để chạy database)
- Git

### 1. Cài đặt Dependencies

Tại thư mục gốc của dự án, chạy lệnh:

```bash
npm install
```

### 2. Thiết lập biến môi trường (.env)

Bạn cần copy các file môi trường mẫu thành các file `.env` thực tế để sử dụng:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env.local

# Linux/macOS
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

### 3. Khởi động Cơ sở dữ liệu (PostgreSQL)

Mở Docker Desktop, sau đó chạy lệnh sau để khởi tạo container PostgreSQL:

```bash
npm run db:up
```

*Lưu ý: Nếu muốn dừng database, sử dụng lệnh `npm run db:down`.*

### 4. Thiết lập Prisma (Database Migration)

Đảm bảo server có đầy đủ database structure:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Khởi động toàn bộ dự án

Chạy lệnh sau tại thư mục gốc để khởi động cả **Client** và **Server** đồng thời:

```bash
npm run dev
```

- 🌐 **Client (Next.js)**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Server (Express API)**: [http://localhost:4000](http://localhost:4000)
- 🏥 **API Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

## 📜 Các lệnh Script hữu ích (NPM Scripts)

Chạy các lệnh này tại thư mục gốc (root directory):

- `npm run dev`: Khởi động cả Client và Server ở chế độ development.
- `npm run dev:client`: Chỉ khởi động frontend Next.js.
- `npm run dev:server`: Chỉ khởi động backend Express.
- `npm run build`: Build cả frontend và backend để chuẩn bị deploy.
- `npm run db:up`: Khởi động container database (Postgres).
- `npm run db:down`: Dừng và xóa container database.
- `npm run prisma:migrate`: Chạy Prisma migration cập nhật DB.
- `npm run prisma:studio`: Mở giao diện quản lý database trực quan (Prisma Studio) ở cổng `5555`.
