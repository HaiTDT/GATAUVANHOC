"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorMessage } from "../../../../../../components/ui";
import { api, type Assignment, type Lesson } from "../../../../../../lib/api";
import RichTextEditor from "../../../../../../components/admin/RichTextEditor";

export default function AdminLessonAssignmentsPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [lessonRes, assignRes] = await Promise.all([
        api.getLesson(id),
        api.getAdminLessonAssignments(id)
      ]);
      setLesson(lessonRes);
      setAssignments(assignRes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleDelete = async (assignId: string) => {
    if (!window.confirm("Xác nhận xóa bài tập này?")) return;
    try {
      await api.deleteAdminAssignment(assignId);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Đang tải...</div>;

  return (
    <div className="max-w-5xl">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/lessons" className="text-stone-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined mt-1">arrow_back</span>
          </Link>
          <div>
            <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Bài tập</h2>
            <p className="text-sm text-stone-500">Bài học: {lesson?.title}</p>
          </div>
        </div>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-opacity-90 transition shadow-md"
          >
            <span className="material-symbols-outlined text-sm">add</span> Thêm bài tập
          </button>
        )}
      </header>

      <ErrorMessage message={error} />

      {showAdd ? (
        <AddAssignmentForm 
          lessonId={id} 
          onCancel={() => setShowAdd(false)} 
          onSuccess={() => { setShowAdd(false); load(); }} 
        />
      ) : (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 border-dashed">
               <span className="material-symbols-outlined text-4xl text-stone-300 mb-2">assignment_late</span>
               <p className="text-stone-500">Chưa có bài tập nào cho bài học này.</p>
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      a.type === 'QUIZ' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {a.type === 'QUIZ' ? 'Trắc nghiệm' : 'Tự luận'}
                    </span>
                    <h3 className="font-bold text-stone-900">{a.title}</h3>
                  </div>
                  <p className="text-xs text-stone-500">{a.questions?.length || 0} câu hỏi • {a.points} điểm tối đa</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AddAssignmentForm({ lessonId, onCancel, onSuccess }: { lessonId: string, onCancel: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    type: "ESSAY" as "ESSAY" | "QUIZ",
    points: 10,
    questions: [] as any[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setForm(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        { text: "", type: "MULTIPLE_CHOICE", points: 1, options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false }
        ]}
      ]
    }));
  };

  const updateQuestion = (index: number, data: any) => {
    const newQuestions = [...form.questions];
    newQuestions[index] = { ...newQuestions[index], ...data };
    setForm({ ...form, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setForm({ ...form, questions: form.questions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.createAdminAssignment(lessonId, form);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-stone-700 mb-2">Tiêu đề bài tập</label>
            <input 
              type="text" 
              required
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm"
              placeholder="Ví dụ: Kiểm tra 15 phút - Bài 1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Loại bài tập</label>
            <select 
              value={form.type}
              onChange={e => setForm({...form, type: e.target.value as any})}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm"
            >
              <option value="ESSAY">Tự luận (Nộp bài text)</option>
              <option value="QUIZ">Trắc nghiệm (Hệ thống chấm)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Thang điểm</label>
            <input 
              type="number" 
              value={form.points}
              onChange={e => setForm({...form, points: Number(e.target.value)})}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-stone-700 mb-2">Nội dung / Yêu cầu</label>
            <RichTextEditor 
              value={form.content}
              onChange={val => setForm({...form, content: val})}
              placeholder="Nhập đề bài hoặc hướng dẫn làm bài..."
            />
          </div>
        </div>

        {form.type === 'QUIZ' && (
          <div className="pt-6 border-t border-stone-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900">Danh sách câu hỏi</h3>
              <button 
                type="button" 
                onClick={addQuestion}
                className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span> Thêm câu hỏi
              </button>
            </div>
            
            {form.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 relative group">
                <button 
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase mb-2 block">Câu hỏi {qIndex + 1}</label>
                    <input 
                      type="text"
                      required
                      value={q.text}
                      onChange={e => updateQuestion(qIndex, { text: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi..."
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase block">Các lựa chọn (Tích chọn đáp án đúng)</label>
                    {q.options.map((opt: any, oIndex: number) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`correct-${qIndex}`}
                          checked={opt.isCorrect}
                          onChange={() => {
                            const newOptions = q.options.map((o: any, i: number) => ({ ...o, isCorrect: i === oIndex }));
                            updateQuestion(qIndex, { options: newOptions });
                          }}
                          className="w-4 h-4 text-primary"
                        />
                        <input 
                          type="text"
                          required
                          value={opt.text}
                          onChange={e => {
                            const newOptions = [...q.options];
                            newOptions[oIndex].text = e.target.value;
                            updateQuestion(qIndex, { options: newOptions });
                          }}
                          placeholder={`Lựa chọn ${oIndex + 1}`}
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm"
                        />
                        {q.options.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => {
                              const newOptions = q.options.filter((_: any, i: number) => i !== oIndex);
                              if (opt.isCorrect) newOptions[0].isCorrect = true;
                              updateQuestion(qIndex, { options: newOptions });
                            }}
                            className="text-stone-300 hover:text-red-500"
                          >
                            <span className="material-symbols-outlined text-sm">remove_circle</span>
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => updateQuestion(qIndex, { options: [...q.options, { text: "", isCorrect: false }] })}
                      className="text-[10px] font-bold text-stone-400 hover:text-primary mt-1"
                    >
                      + Thêm lựa chọn
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-6 border-t border-stone-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-stone-300 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu bài tập"}
          </button>
        </div>
      </form>
    </section>
  );
}
