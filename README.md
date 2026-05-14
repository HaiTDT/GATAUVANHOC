# 🚆 Ga Tàu Văn Học - Nền tảng Học tập & Chinh phục Ngữ Văn trực tuyến

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue?style=flat-square&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**Ga Tàu Văn Học** là một hệ sinh thái giáo dục trực tuyến hiện đại, được thiết kế chuyên biệt để truyền cảm hứng và hỗ trợ học sinh chinh phục môn Ngữ Văn. Với giao diện cao cấp, trải nghiệm người dùng tối ưu và hệ thống quản trị thông minh, dự án mang đến một "trạm dừng chân" lý tưởng cho hành trình khám phá tri thức văn học.

---

## 📝 Tổng quan dự án

- **Tên dự án:** Ga Tàu Văn Học (Educational Platform)
- **Mô tả:** Nền tảng học tập trực tuyến theo kiến trúc Monorepo, tích hợp giữa Dashboard học tập cá nhân hóa và bảng điều khiển quản lý nội dung chuyên sâu.
- **Mục tiêu:** Hiện đại hóa cách tiếp cận môn Văn, từ việc cung cấp bài học chất lượng đến việc chấm điểm và nhận xét bài làm thời gian thực.
- **Đối tượng người dùng:** Học sinh đang ôn luyện Ngữ Văn và Giáo viên/Quản trị viên (Admins).

---

## ✨ Chức năng chính

### 🎓 Dành cho Học viên (Student)
- **Xác thực:** Đăng nhập truyền thống hoặc qua Google OAuth 2.0.
- **Hành trình học tập:** Khám phá bài học, blog kiến thức và đăng ký các khóa học chuyên sâu.
- **Thanh toán thông minh:** Quy trình đăng ký khóa học mượt mà, tự động mở khóa nội dung với các khóa học miễn phí.
- **Super Dashboard (Tiến độ học tập):** 
  - **Tổng quan:** Theo dõi điểm số, số lượng khóa học và hoạt động gần đây.
  - **Trung tâm Bài tập:** Làm trắc nghiệm (Quiz) và viết bài tự luận (Essay) ngay trong Dashboard.
  - **Quản lý tài khoản:** Cập nhật hồ sơ cá nhân và bài học yêu thích.
- **Truy cập:** Nội dung bài tập được bảo vệ, chỉ mở khóa sau khi Admin phê duyệt thanh toán.

### 🛡️ Dành cho Quản trị viên & Giáo viên (Admin)
- **Dashboard Quản trị:** Theo dõi số lượng học viên, doanh thu và thống kê bài nộp.
- **Quản lý nội dung:** Hệ thống quản lý Khóa học, Bài học, Bài tập và Banner chuyên nghiệp.
- **Phê duyệt học viên:** Quy trình xác nhận thanh toán chỉ với một cú nhấp chuột để mở khóa quyền học tập.
- **Chấm điểm thông minh:** Chấm điểm bài nộp, thêm nhận xét chi tiết để định hướng cho học sinh.
- **Phân tích học tập:** Theo dõi tiến độ và xếp hạng học viên dựa trên kết quả bài làm.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend (Client)
- **Framework:** Next.js 15 (App Router)
- **UI & Logic:** React 19, Google OAuth 2.0 Integration
- **Styling:** Vanilla CSS & Tailwind (Giao diện Premium, Material Design 3, Glassmorphism)
- **Icons:** Google Material Symbols & Lucide React

### Backend (Server)
- **Runtime:** Node.js & TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Bảo mật:** JWT Authentication (sub-based), Bcrypt, CORS, Helmet

### Hạ tầng & Cơ sở dữ liệu
- **Database:** PostgreSQL (Hosted trên Neon Serverless)
- **Kiến trúc:** Monorepo sử dụng `npm workspaces`

---

## 📂 Cấu trúc thư mục

```text
.
├── client/                 # Frontend Next.js 15
│   ├── src/
│   │   ├── app/            # App Router (Pages, Layouts)
│   │   ├── components/     # UI Components (Header, Footer, Protected)
│   │   ├── lib/            # API Client (Axios-like wrapper), Utils
│   │   └── styles/         # Toàn bộ CSS định danh phong cách
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Định tuyến API (Auth, Courses, User, Admin)
│   │   ├── controllers/    # Xử lý logic nghiệp vụ
│   │   ├── middlewares/    # Bảo mật, Auth, Optional Auth
│   │   └── lib/            # Prisma Client config
└── prisma/                 # Schema cơ sở dữ liệu & Migrations
```

---

## 🚀 Hướng dẫn cài đặt (Local)

1. **Clone dự án:**
   ```bash
   git clone <your-repo-url>
   cd MIS_HASAKI_SRC_CODE
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình môi trường:**
   - Tạo file `.env` trong thư mục `server/`:
     ```env
     PORT=4000
     DATABASE_URL=postgresql://...
     JWT_SECRET=your_secure_secret
     CLIENT_URL=http://localhost:3000
     ```

4. **Khởi động dự án:**
   ```bash
   npm run dev
   ```
   - Frontend sẽ chạy tại: `http://localhost:3000`
   - Backend sẽ chạy tại: `http://localhost:4000`

---

## 🌐 Hướng dẫn Deployment

### Backend (Render)
- **Root Directory:** `server`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/index.js`
- **Envs:** `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (Link Vercel).

### Frontend (Vercel)
- **Root Directory:** `client`
- **Build Command:** `next build`
- **Envs:** `NEXT_PUBLIC_API_URL` (Link Render).

---

## ⚖️ License
Dự án được phát triển cho mục đích giáo dục và thương mại hóa nội dung số. Bản quyền thuộc về **Ga Tàu Văn Học**.
