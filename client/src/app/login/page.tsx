"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "../../components/AuthProvider";
import { ErrorMessage } from "../../components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0">
        <img alt="Botanical Background" className="w-full h-full object-cover opacity-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLiBgG8H4R4nEW0-xaFI6ZHQd4zBXyGlaStshdD2rxrJ8xPHNq58jBHQIcAFTF2k4B89rjW9vàNef0eV-9dVKBjK5xmNDFrWXdtD0FfWuR5-lhJKNpOGcBI0qYR_MA6VIyvàQqN_6o0aL58BS3dqmsLKLjmmPdEDgB0ssgmJ0vàlbzDPgAZnQHhn_jAf6mawQvà_7AE_dWGTm5kmxx4nVQa4DzumyYV9ZCEWzhbVlhPm8wNyRmtEL7cBAWT9nTYG-MPN-uOvàPgfhG1ovàGa" />
        <div className="absolute inset-0 bg-surface-container-low/60 backdrop-blur-sm"></div>
      </div>
      
      <div className="relative z-10 flex-grow flex items-center justify-center px-4 py-12 h-full min-h-[60vh]">
        <div className="w-full max-w-[460px] bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_rgba(0,80,47,0.06)] overflow-hidden transition-all duration-300 organic-shadow">
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="font-headline text-2xl font-extrabold tracking-tight text-primary mb-4">
              Botanical Atelier
            </div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight leading-tight">
              Đăng nhập vào tài khoản
            </h1>
            <p className="text-on-surface-variant mt-2 font-body text-sm">
              Chào mừng bạn quay trở lại với không gian làm đẹp hữu cơ.
            </p>
          </div>
          
          <div className="px-8 pb-10">
            <ErrorMessage message={error} />
            <form className="space-y-6" onSubmit={submit}>
              <div className="space-y-2 text-left">
                <label className="block text-sm font-semibold text-on-surface-variant">
                  Email
                </label>
                <input 
                  className="w-full px-4 py-3 bg-surface-variant border-none rounded-lg focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-outline/60 text-on-surface" 
                  placeholder="example@email.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-on-surface-variant">
                    Mật khẩu
                  </label>
                  <a className="text-xs font-medium text-secondary hover:opacity-80 transition-opacity" href="#">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3 bg-surface-variant border-none rounded-lg focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all duration-200 placeholder:text-outline/60 text-on-surface" 
                    placeholder="••••••••" 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <button 
                className="w-full cta-gradient text-white py-4 rounded-lg font-bold text-sm tracking-wide shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
              </button>
            </form>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-highest"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="bg-surface-container-lowest px-4 text-outline">Hoặc</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-outline-variant/30 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors group">
                <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCML0Ltf_DxxiFIBfT4OVMl9ZEQLwROtTOJ8Svà_uIQFvàCeYOskHJcR0wU1owSJKF6BBLue7BFkEqLFxlJ3mlsizCbG051FbHCFJR4jpjalKb-JGXW3EDY9wJLIdUjJQmEjzNR-vàUS7_twUISsnF5V1sQXOWgYQtnJnDmYucN-5cahGUHZweRoTM7cdJHg5axrsbTquy_ojKY1QgISbFi6GElzlvàCS7RjvàYO67BVvàrwd8OtbmiJilg4BAs1_vàeNcyWCHd6sbmJUROOGd"/>
                <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-outline-variant/30 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors group">
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
                <span className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">Facebook</span>
              </button>
            </div>
          </div>
          
          <div className="px-8 py-6 bg-surface-container-low text-center border-t border-surface-container-highest">
            <p className="text-sm text-on-surface-variant font-body">
              Chưa có tài khoản? 
              <Link className="ml-1 text-primary font-bold hover:underline" href="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
