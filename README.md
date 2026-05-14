# 💄 Hasaki MIS - Hệ thống Thương mại Điện tử Mỹ phẩm & Quản trị Thông minh (BI)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Hasaki MIS là một hệ sinh thái thương mại điện tử full-stack hiện đại, được thiết kế chuyên biệt cho ngành mỹ phẩm. Không chỉ dừng lại ở một trang web bán hàng thông thường, dự án còn tích hợp hệ thống **Quản trị Thông minh (MIS)** với các công cụ **Business Intelligence (BI)** mạnh mẽ, giúp doanh nghiệp tối ưu hóa vận hành dựa trên dữ liệu thực tế.

---

## 📝 Tổng quan dự án

- **Tên dự án:** Hasaki MIS (Cosmetics E-commerce)
- **Mô tả:** Nền tảng thương mại điện tử theo kiến trúc Monorepo, kết hợp giữa giao diện mua sắm tối ưu và bảng điều khiển quản trị chuyên sâu.
- **Mục tiêu:** Giải quyết bài toán quản lý bán hàng và phân tích dữ liệu kinh doanh, từ phân khúc khách hàng tự động đến dự báo tồn kho.
- **Đối tượng người dùng:** Khách hàng mua sắm mỹ phẩm trực tuyến và Nhà quản lý doanh nghiệp (Admins).

---

## 🌐 Demo & Deployment

Hệ thống đã được triển khai trực tuyến tại:
- **Frontend (Vercel):** [https://mis-hasaki-client.vercel.app](https://mis-hasaki-client.vercel.app)
- **Backend API (Render):** [https://mis-hasaki.onrender.com](https://your-backend-link.onrender.com)

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (Client)
- **Framework:** Next.js 15 (App Router)
- **UI & Logic:** React 19, Google OAuth 2.0 Integration
- **Styling:** Tailwind CSS (Giao diện hiện đại, Material Design 3 influences)
- **Charts:** Chart.js 4 & react-chartjs-2 (Trực quan hóa dữ liệu BI)
- **Editor:** React Quill (Trình soạn thảo văn bản cho Blog)
- **Icons:** Google Material Symbols & Lucide React

### Backend (Server)
- **Runtime:** Node.js & TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Bảo mật:** JWT Authentication, Bcrypt, CORS, Helmet

### Hạ tầng & Cơ sở dữ liệu
- **Database:** PostgreSQL (Hosted trên Neon Serverless)
- **DevOps:** Docker & Docker Compose
- **Kiến trúc:** Monorepo sử dụng `npm workspaces`

---

## ✨ Chức năng chính

### 🛒 Dành cho Khách hàng (Customer)
- **Xác thực:** Đăng nhập truyền thống hoặc qua Google OAuth 2.0.
- **Trải nghiệm mua sắm:** Duyệt sản phẩm theo danh mục chi tiết (Toner, Serum, v.v.).
- **Flash Sales:** Hệ thống săn sale thời gian thực với đồng hồ đếm ngược.
- **Giỏ hàng & Thanh toán:** Quy trình đặt hàng tối ưu, quản lý giỏ hàng thông minh.
- **Tài khoản cá nhân:** Theo dõi lịch sử đơn hàng, quản lý sổ địa chỉ và đánh giá sản phẩm.
- **Blog làm đẹp:** Cập nhật tin tức và mẹo chăm sóc da.

### 🛡️ Dành cho Quản trị viên (Admin & MIS)
- **Dashboard BI:** Theo dõi Doanh thu, AOV (Giá trị đơn trung bình) và Tốc độ tăng trưởng thời gian thực.
- **Quản trị Kho thông minh:** Tự động tính toán "Tốc độ bán hàng" (Sales Velocity) và đưa ra gợi ý nhập hàng.
- **Phân tích CRM:** Áp dụng mô hình **RFM** (Recency, Frequency, Monetary) để phân loại khách hàng:
  - *Champions:* Khách hàng tinh hoa, trung thành.
  - *At Risk:* Khách hàng có nguy cơ rời bỏ.
  - *Lost:* Khách hàng đã mất cần kích cầu.
- **Marketing Performance:** Theo dõi các chỉ số CAC (Chi phí thu hút khách hàng) và ROAS (Lợi nhuận trên chi phí quảng cáo).

---

## 📂 Cấu trúc thư mục

```text
.
├── client/                 # Frontend Next.js 15
│   ├── src/
│   │   ├── app/            # App Router (Pages, Layouts)
│   │   ├── components/     # Các UI Components & BI Charts
│   │   ├── hooks/          # Custom React Hooks
│   │   └── lib/            # API Client & Constants
│   └── package.json
├── server/                 # Backend Express.js API
│   ├── prisma/
│   │   └── schema.prisma   # Định nghĩa Schema & Database Model
│   ├── src/
│   │   ├── controllers/    # Xử lý Logic API
│   │   ├── services/       # Xử lý nghiệp vụ BI & Analytics
│   │   ├── routes/         # Định nghĩa các Endpoint API
│   │   └── middlewares/    # Middleware xác thực & kiểm soát lỗi
│   └── package.json
├── docker-compose.yml      # Cấu hình Database Local
└── package.json            # Cấu hình Monorepo Workspace
```

---

## ⚙️ Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js 18+ & npm 9+
- PostgreSQL (Local hoặc Neon Cloud)
- Docker Desktop (Nếu muốn chạy DB local)

### 1. Clone dự án
```bash
git clone https://github.com/your-username/mis-hasaki.git
cd mis-hasaki
```

### 2. Cài đặt Dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` tại các thư mục tương ứng:

**Server (`server/.env`):**
```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/hasaki_db"
JWT_SECRET="ma_bi_mat_cua_ban"
CLIENT_URL="http://localhost:3000"
```

**Client (`client/.env.local`):**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### 4. Đồng bộ Database (Prisma)
```bash
# Chạy tại thư mục gốc
npm run prisma:generate -w server
npm run prisma:migrate -w server
```

### 5. Khởi chạy dự án
```bash
npm run dev
```
*Frontend: http://localhost:3000 | Backend: http://localhost:4000*

---

## 📊 Logic phân tích dữ liệu (BI Environment)

Hệ thống vận hành theo quy trình BI 6 thành phần:
1. **Data Sources:** Dữ liệu giao dịch thực tế từ PostgreSQL.
2. **ETL:** Xử lý, làm sạch dữ liệu tại `analytics.service.ts`.
3. **Data Mart:** Các snapshot dữ liệu đã được tính toán sẵn để tối ưu hiệu năng.
4. **Analytics Engine:** Tính toán RFM Score, Growth Rate và Sales Velocity.
5. **Advanced Analytics:** Dự báo tồn kho và phân tích xu hướng mua sắm.
6. **BI Tools:** Hiển thị Dashboard trực quan cho nhà quản trị.

---

## 🔌 Danh mục API chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/login` | Đăng nhập hệ thống |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (có lọc) |
| `GET` | `/api/analytics/revenue` | [ADMIN] Thống kê doanh thu |
| `GET` | `/api/analytics/rfm` | [ADMIN] Phân tích phân khúc khách hàng |
| `POST` | `/api/checkout` | Xử lý đặt hàng và thanh toán |

---

## 🤝 Đóng góp
Nếu bạn có ý tưởng cải thiện dự án, vui lòng:
1. Fork dự án.
2. Tạo Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`).
4. Push lên Branch (`git push origin feature/AmazingFeature`).
5. Mở một Pull Request.

---

## 📄 Giấy phép
Phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm chi tiết.

---
**Hasaki MIS** - *Powering Data-Driven Decisions in Cosmetics Retail.*
# GATAUVANHOC
