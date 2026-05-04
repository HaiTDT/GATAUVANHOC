"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  // Dynamically import ReactQuill to avoid SSR issues
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill-new"), { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-lg border border-slate-200" /> }),
    []
  );

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

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

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-surface-variant focus-within:border-primary transition-colors">
      <ReactQuill
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
