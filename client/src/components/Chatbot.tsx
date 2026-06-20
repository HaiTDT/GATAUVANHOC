"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const zaloUrl = process.env.NEXT_PUBLIC_ZALO_URL || "https://zalo.me/0325831185";
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL || "https://www.facebook.com/profile.php?id=61550663735955";

  // Close widget when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={widgetRef} className="relative">
      {/* Floating Contact Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-brand text-brand-dark rounded-full shadow-xl hover:scale-110 hover:bg-stone-50 transition-all duration-300 z-50 flex items-center justify-center border-2 border-brand-dark/15"
        title="Liên hệ hỗ trợ"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <span className="material-symbols-outlined text-[24px] md:text-[28px] animate-pulse">forum</span>
        )}
      </button>

      {/* Floating Contact Options Card */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[320px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden z-50 border border-stone-200/50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-brand p-6 text-brand-dark relative border-b border-brand-dark/10">
            <h3 className="font-extrabold text-base leading-tight">Liên hệ hỗ trợ</h3>
            <p className="text-brand-dark/70 text-[11px] mt-1 font-medium">Trò chuyện trực tiếp cùng Ga Tàu Văn Học</p>
          </div>

          {/* Contact Methods */}
          <div className="p-4 space-y-3 bg-stone-50">
            {/* Zalo Option */}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-sm hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                  <rect width="24" height="24" rx="12" fill="#0068FF" />
                  <path d="M7 17V15.5L13.5 8.5H7.5V7H17V8.5L10.5 15.5H17V17H7Z" fill="white" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-stone-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                  Nhắn tin qua Zalo
                </p>
                <p className="text-[11px] text-stone-500 font-medium">Hỗ trợ 24/7 &amp; Gửi tài liệu</p>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[18px]">
                arrow_forward
              </span>
            </a>

            {/* Messenger Option */}
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-stone-200/60 shadow-sm hover:border-pink-500 hover:shadow-md hover:shadow-pink-500/5 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="url(#messenger-gradient-float)">
                  <defs>
                    <linearGradient id="messenger-gradient-float" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00C6FF" />
                      <stop offset="50%" stopColor="#0072FF" />
                      <stop offset="100%" stopColor="#F355DA" />
                    </linearGradient>
                  </defs>
                  <path d="M12 2C6.477 2 2 6.145 2 11.25c0 2.913 1.455 5.513 3.734 7.172V22l3.435-1.884c.893.248 1.836.384 2.831.384 5.523 0 10-4.145 10-9.25S17.523 2 12 2Zm1.061 12.31-2.736-2.92-5.334 2.92 5.866-6.234 2.736 2.92 5.334-2.92-5.866 6.234Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-stone-900 text-sm group-hover:text-pink-600 transition-colors truncate">
                  Nhắn tin qua Messenger
                </p>
                <p className="text-[11px] text-stone-500 font-medium">Hỏi đáp trực tiếp qua Facebook</p>
              </div>
              <span className="material-symbols-outlined text-stone-400 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all text-[18px]">
                arrow_forward
              </span>
            </a>
          </div>

          {/* Footer Text */}
          <div className="bg-stone-100 p-3 border-t border-stone-200/50 text-center">
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
              Ga Tàu Văn Học • Đồng Hành Cùng Sĩ Tử
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
