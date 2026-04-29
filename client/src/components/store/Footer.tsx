import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-stone-950 w-full pt-16 pb-8 border-none mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto px-8 mb-16">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-50 mb-6">Botanical Atelier</div>
          <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">Vẻ đẹp bắt nguồn từ sự thấu hiểu
            thiên nhiên và khoa học làn da.</p>
          <div className="flex gap-4">
            <a className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              href="#">
              <span className="material-symbols-outlined text-sm">social_leaderboard</span>
            </a>
            <a className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
              href="#">
              <span className="material-symbols-outlined text-sm">camera</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-6">Về chúng tôi</h4>
          <ul className="space-y-4">
            <li><Link
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block font-semibold"
                href="/">Trang chủ</Link></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Câu chuyện thương hiệu</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Hệ thống cửa hàng</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Tuyển dụng</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Liên hệ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-6">Chính sách</h4>
          <ul className="space-y-4">
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Chính sách bảo mật</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Điều khoản dịch vụ</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Chính sách đổi trả</a></li>
            <li><a
                className="text-stone-500 dark:text-stone-400 hover:text-emerald-700 hover:translate-x-1 transition-transform inline-block"
                href="#">Giao hàng & Thanh toán</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-6">Đăng ký bản tin</h4>
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">Nhận ngay voucher 50k cho đơn hàng đầu tiên!</p>
          <div className="flex">
            <input className="bg-white border-none rounded-l-md px-4 py-3 text-sm flex-1 focus:ring-0 text-on-surface"
              placeholder="Email của bạn" type="email" />
            <button className="bg-primary text-white px-4 py-3 rounded-r-md hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
      <div
        className="max-w-7xl mx-auto px-8 pt-8 border-t border-stone-300 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 dark:text-stone-400 text-sm">© 2026 Botanical Atelier. Tất cả quyền được bảo lưu.</p>
        <div className="flex gap-6">
          <img alt="Visa" className="h-4 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6uJOmPmZRevàCNfjxZb1COSKq6m_yAMWBbIvàxYRKRzQUMgGgX9DVZJlclleaDnMiB32edUz2A6kdaRpESL6lDdPZQ9xXvà0zVT7xCbuGLHhEdWLnyXvàuyo-XI09Ynhe9__DGiáYJuQ0t6fyeKkqHbFwZH8rt254Kgxy2bwru204U6zEpFQz-vàD8EYGkWYax8e94N-77q9mIUzhqEunnbeGhtRJsz_psMbInmYbI2lSrq9_At2zEYqiaiPiYcQV4dpvà-PwxJG5gfixBk-" />
          <img alt="Mastercard" className="h-4 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoo9R1YhHjD-TrAzkvàS1xxqbVH1zu_nQhZVfK75gDjriUDx5oHGQgXHjU-qHCwahWohADLAodUTPgNnE70U1B5RRyYqoVQtYImuDIul2B9gZynUGJSEWCtP_f74d0daqNvàWj2DLb2BO0HjTqqMHfwjDPDhW4m0tjsE4LlUpgaNJ_2k0g2qD9qf_BZMuCDrnrjCM-J7LsMQT_2ZOxiL3AbodzyJKYMIs_yEyTW0mIyIlXiA_G6mBBeCvàUwAj_HfR-slEgxWl9xtrSed" />
          <img alt="Momo" className="h-4 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVh-rg6aPrzWgwEZvàfFc-ZCX7b8MKabz3whH5XE5MlCdBKwoUo3Nhj9wWYgGu6lx7oT-5f6-ocVRpT5sWcEKasYIZZS-HeewoKqeNu3jc0aplfxko5r1UgbgFbt1yJiZKAx2FxC9wsEEGTYHMGB7W8qcxsAIf5gyvàcerS_0BDhxgrOQ2qvàzEOy1mX9B3N4xBQ5tsHUInVmo19ZAcVquKvàru8Z4NAOvàP-và5GS4FJJ4nx41RIrXI3lTsrHjOFdw4yh5m0Bfl3DI1B_Iz" />
        </div>
      </div>
    </footer>
  );
}
