"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const quillRef = useRef<any>(null);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file quá lớn (Tối đa 5MB)");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) {
        alert("Chưa cấu hình NEXT_PUBLIC_IMGBB_API_KEY trong file .env.local");
        return;
      }

      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Lỗi khi tải ảnh lên ImgBB");
        }

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          if (range) {
            quill.insertEmbed(range.index, "image", data.data.url);
            quill.setSelection(range.index + 1);
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert(err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải ảnh lên");
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ color: [] }, { background: [] }],
        ["blockquote", "code-block"],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "blockquote",
    "code-block",
    "align",
  ];

  const ReactQuill = useMemo(
    () =>
      dynamic(
        async () => {
          const { default: RQ } = await import("react-quill-new");
          const Component = ({ forwardedRef, ...props }: any) => <RQ ref={forwardedRef} {...props} />;
          Component.displayName = "ReactQuillWithRef";
          return Component;
        },
        {
          ssr: false,
          loading: () => (
            <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" />
          ),
        }
      ),
    []
  );

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-surface-variant focus-within:border-primary transition-colors">
      <ReactQuill
        forwardedRef={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Nhập nội dung bài viết..."}
        className="min-h-[400px] h-auto"
      />
      <style jsx global>{`
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          min-height: 350px;
        }
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          background-color: #f8fafc;
        }
        .ql-editor {
          min-height: 350px;
        }
        .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
