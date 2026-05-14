"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../../components/Protected";
import { EmptyState, ErrorMessage, Field, PageHeader, inputClass } from "../../../components/ui";
import { api, type Submission, type SubmissionStatus } from "../../../lib/api";

const filterStatuses = ["", "PENDING", "GRADED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ chấm",
  GRADED: "Đã chấm điểm"
};

function AdminSubmissionsContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const load = async () => {
    setError("");
    try {
      const result = await api.getAdminSubmissions({ status, page, limit: 10 });
      setSubmissions(result.data || []);
      if (result.meta) {
        setMeta({
          page: result.meta.page,
          totalPages: result.meta.totalPages || 1,
          total: result.meta.total
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách bài tập");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <div>
      <PageHeader title="Chấm điểm bài tập" description="Xem danh sách bài nộp của học sinh và chấm điểm." />
      <ErrorMessage message={error} />
      <div className="mb-4 max-w-xs">
        <Field label="Lọc theo trạng thái">
          <select
            className={inputClass}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            value={status}
          >
            {filterStatuses.map((value) => (
              <option key={value || "all"} value={value}>
                {value ? STATUS_LABELS[value] : "Tất cả"}
              </option>
            ))}
          </select>
        </Field>
      </div>
      
      {submissions.length === 0 ? (
        <EmptyState message="Không có bài nộp nào." />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:border-primary/30 transition-colors" key={sub.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-pearl rounded-full text-[10px] font-bold text-primary tracking-wider uppercase">
                      Bài nộp
                    </span>
                    <span className="text-xs font-medium text-stone-500">
                      {new Date(sub.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-stone-900">{sub.assignment?.title || "Bài tập không xác định"}</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    <span className="font-medium text-stone-800">Học sinh:</span> {sub.user?.fullName || sub.user?.email}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={sub.status} />
                  {sub.score != null && (
                    <div className="px-4 py-1.5 bg-sage/30 border border-sage/50 text-stone-900 font-extrabold rounded-full">
                      {sub.score} / 10
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-md hover:bg-primary/90 transition-colors"
                  >
                    {sub.status === "PENDING" ? "Chấm bài" : "Sửa điểm"}
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-sm text-stone-700 line-clamp-3 bg-stone-50 p-4 rounded-xl border border-stone-200/60 font-serif italic">
                  {sub.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
      
      <div className="mt-8 flex items-center justify-between">
        <button
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold disabled:opacity-50 hover:bg-stone-50"
          disabled={meta.page <= 1}
          onClick={() => setPage(meta.page - 1)}
          type="button"
        >
          Trang trước
        </button>
        <span className="text-sm font-medium text-stone-600">
          Trang {meta.page} / {meta.totalPages} · {meta.total} bài nộp
        </span>
        <button
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold disabled:opacity-50 hover:bg-stone-50"
          disabled={meta.page >= meta.totalPages}
          onClick={() => setPage(meta.page + 1)}
          type="button"
        >
          Trang sau
        </button>
      </div>

      {selectedSubmission && (
        <GradingModal 
          submission={selectedSubmission} 
          onClose={() => setSelectedSubmission(null)}
          onSave={() => {
            setSelectedSubmission(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function GradingModal({ submission, onClose, onSave }: { submission: Submission, onClose: () => void, onSave: () => void }) {
  const [score, setScore] = useState(submission.score?.toString() || "");
  const [teacherComment, setTeacherComment] = useState(submission.teacherComment || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || isNaN(Number(score)) || Number(score) < 0 || Number(score) > 10) {
      setError("Điểm số phải từ 0 đến 10");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await api.gradeSubmission(submission.id, Number(score), teacherComment);
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div>
            <h3 className="font-bold text-lg text-primary">Chấm điểm bài nộp</h3>
            <p className="text-xs text-stone-500 mt-1">Học sinh: {submission.user?.fullName || submission.user?.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Left: Student Content */}
          <div className="flex-1 space-y-4">
            <h4 className="font-bold text-stone-800 border-b border-stone-100 pb-2">Nội dung bài làm</h4>
            <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl whitespace-pre-wrap font-serif text-stone-800 leading-relaxed min-h-[300px]">
              {submission.content}
            </div>
          </div>

          {/* Right: Grading Form */}
          <div className="w-full md:w-80 flex-shrink-0">
            <form onSubmit={handleGrade} className="space-y-6 sticky top-0">
              <h4 className="font-bold text-stone-800 border-b border-stone-100 pb-2">Đánh giá</h4>
              
              {error && <ErrorMessage message={error} />}

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Điểm số (0 - 10)</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  max="10"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl font-bold text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="VD: 8.5"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Nhận xét của giáo viên</label>
                <textarea 
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all h-32"
                  placeholder="Nhập nhận xét chi tiết cho học sinh..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl font-bold text-sm text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Lưu điểm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string, bg: string }> = {
    'GRADED': { label: 'Đã chấm', color: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' },
    'PENDING': { label: 'Chờ chấm', color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-200' },
  };

  const config = configs[status] || { label: status, color: 'text-stone-600', bg: 'bg-stone-100' };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bg}`}>
      <span className={`font-bold text-[10px] uppercase tracking-wide ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

export default function AdminSubmissionsPage() {
  return (
    <Protected adminOnly>
      <AdminSubmissionsContent />
    </Protected>
  );
}
