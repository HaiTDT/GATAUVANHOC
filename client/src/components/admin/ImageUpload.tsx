"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB for free ImgBB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file quá lớn (Tối đa 5MB)");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error("Bạn cần đổi tên IMGBB_API_KEY thành NEXT_PUBLIC_IMGBB_API_KEY trong file .env.local");
      }

      // Gọi trực tiếp từ trình duyệt sẽ không bị dính lỗi UND_ERR_CONNECT_TIMEOUT của Node.js
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Lỗi khi tải ảnh lên");
      }

      onChange(data.data.url);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 text-sm transition-all outline-none"
          placeholder="Dán đường dẫn URL hoặc chọn ảnh từ máy..."
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="px-4 py-2 bg-stone-200 text-stone-700 hover:bg-stone-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap min-w-[130px]"
        >
          {uploading ? (
            <span className="material-symbols-outlined animate-spin text-lg">sync</span>
          ) : (
            <span className="material-symbols-outlined text-lg">upload_file</span>
          )}
          {uploading ? "Đang tải..." : "Tải ảnh lên"}
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/gif, image/webp"
        className="hidden"
      />
      
      {error && <p className="text-red-500 text-xs font-medium mt-1">{error}</p>}
    </div>
  );
}
