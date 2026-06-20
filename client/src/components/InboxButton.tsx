"use client";

import { useState } from "react";

export function InboxButton() {
  const [isOpen, setIsOpen] = useState(false);

  const zaloUrl = process.env.NEXT_PUBLIC_ZALO_URL || "https://zalo.me/0325831185";
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL || "https://www.facebook.com/profile.php?id=61550663735955";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto text-center bg-white text-brand-dark px-8 py-3 md:py-4 rounded-full font-bold text-xs md:text-sm shadow-xl hover:scale-105 hover:bg-stone-50 transition-all inline-flex items-center justify-center gap-2 border-2 border-brand-dark/20"
      >
        <span className="material-symbols-outlined text-[18px] md:text-[20px] animate-pulse">chat</span>
        INBOX CHO GA TÀU VĂN HỌC
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="fixed inset-0"
            onClick={() => setIsOpen(false)}
          />

          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/20 z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="bg-brand p-8 text-center text-brand-dark relative border-b border-brand-dark/10">
              <div className="w-16 h-16 bg-brand-dark/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-3xl text-brand-dark">forum</span>
              </div>
              <h3 className="text-xl font-extrabold font-headline">Inbox Liên Hệ</h3>
              <p className="text-xs text-brand-dark/70 mt-1">Chọn nền tảng bạn muốn trò chuyện cùng Ga Tàu Văn Học</p>

              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-brand-dark/10 flex items-center justify-center hover:bg-brand-dark/20 transition-all text-brand-dark"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 bg-stone-50">
              {/* Zalo Card */}
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-sm hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  {/* Zalo Icon */}
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                    <rect width="24" height="24" rx="12" fill="#0068FF" />
                    <path d="M7 17V15.5L13.5 8.5H7.5V7H17V8.5L10.5 15.5H17V17H7Z" fill="white" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-stone-900 text-sm md:text-base group-hover:text-blue-600 transition-colors">
                    Nhắn tin qua Zalo
                  </p>
                  <p className="text-xs text-stone-500 font-medium">Hỗ trợ nhanh chóng &amp; Gửi tài liệu</p>
                </div>
                <span className="material-symbols-outlined text-stone-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all text-[20px]">
                  arrow_forward
                </span>
              </a>

              {/* Messenger Card */}
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200/60 shadow-sm hover:border-pink-500 hover:shadow-md hover:shadow-pink-500/5 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  {/* Messenger Icon */}
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="url(#messenger-gradient-btn)">
                    <defs>
                      <linearGradient id="messenger-gradient-btn" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00C6FF" />
                        <stop offset="50%" stopColor="#0072FF" />
                        <stop offset="100%" stopColor="#F355DA" />
                      </linearGradient>
                    </defs>
                    <path d="M12 2C6.477 2 2 6.145 2 11.25c0 2.913 1.455 5.513 3.734 7.172V22l3.435-1.884c.893.248 1.836.384 2.831.384 5.523 0 10-4.145 10-9.25S17.523 2 12 2Zm1.061 12.31-2.736-2.92-5.334 2.92 5.866-6.234 2.736 2.92 5.334-2.92-5.866 6.234Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-stone-900 text-sm md:text-base group-hover:text-pink-600 transition-colors">
                    Nhắn tin qua Messenger
                  </p>
                  <p className="text-xs text-stone-500 font-medium">Hỏi đáp trực tiếp trên Facebook</p>
                </div>
                <span className="material-symbols-outlined text-stone-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all text-[20px]">
                  arrow_forward
                </span>
              </a>
            </div>

            {/* Footer text */}
            <div className="bg-stone-100 p-4 border-t border-stone-200/50 text-center">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Ga Tàu Văn Học • Đồng Hành Cùng Sĩ Tử
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
