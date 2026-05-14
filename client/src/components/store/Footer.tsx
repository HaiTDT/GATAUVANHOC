import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand w-full pt-12 md:pt-16 pb-8 border-none mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto px-6 md:px-8 mb-12 md:mb-16">
        <div className="col-span-1 text-center md:text-left">
          <div className="text-2xl font-bold text-brand-dark mb-4 md:mb-6">GA TÀU VĂN HỌC</div>
          <p className="text-brand-dark opacity-70 text-sm leading-relaxed mb-6 max-w-sm mx-auto md:mx-0">
            Nền tảng học tập chủ động, đánh thức niềm đam mê với môn Ngữ Văn qua từng bài học.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <a className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all shadow-sm text-brand-dark"
              href="#">
              <span className="material-symbols-outlined text-sm">facebook</span>
            </a>
            <a className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-all shadow-sm text-brand-dark"
              href="#">
              <span className="material-symbols-outlined text-sm">video_library</span>
            </a>
          </div>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-bold text-brand-dark mb-4 md:mb-6 uppercase tracking-wider text-xs">Về chúng tôi</h4>
          <ul className="space-y-3">
            <li><Link className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm font-semibold" href="/">Trang chủ</Link></li>
            <li><Link className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm" href="/lessons">Bài học</Link></li>
            <li><Link className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm" href="/assignments">Bài tập</Link></li>
            <li><Link className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm" href="/blogs">Blog Kiến Thức</Link></li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-bold text-brand-dark mb-4 md:mb-6 uppercase tracking-wider text-xs">Hỗ trợ học tập</h4>
          <ul className="space-y-3">
            <li><a className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm" href="#">Hướng dẫn nộp bài</a></li>
            <li><a className="text-brand-dark opacity-60 hover:text-brand-dark hover:opacity-100 transition-all inline-block text-sm" href="#">Nội quy lớp học</a></li>
          </ul>
        </div>
        <div className="text-center md:text-left">
          <h4 className="font-bold text-brand-dark mb-4 md:mb-6 uppercase tracking-wider text-xs">Đăng ký nhận tài liệu</h4>
          <p className="text-brand-dark opacity-70 text-sm mb-4">Nhận ngay bộ đề cương ôn tập môn Ngữ Văn miễn phí!</p>
          <div className="flex max-w-xs mx-auto md:mx-0">
            <input className="bg-white/80 border-none rounded-l-full px-4 py-3 text-sm flex-1 focus:ring-1 focus:ring-brand-dark outline-none text-on-surface"
              placeholder="Email của bạn" type="email" />
            <button className="bg-brand-dark text-white px-4 py-3 rounded-r-full hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="max-w-7xl mx-auto px-6 md:px-8 pt-8 border-t border-brand-dark/10 flex flex-col md:flex-row justify-center items-center gap-6">
        <p className="text-brand-dark opacity-50 text-[11px] md:text-sm text-center">© 2026 Ga Tàu Văn Học. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}

