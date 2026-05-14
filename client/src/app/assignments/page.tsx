"use client";

import { useEffect, useState } from "react";
import { Protected } from "../../components/Protected";
import { EmptyState, ErrorMessage } from "../../components/ui";
import { api, type Submission, type User, type FavoriteLesson, type Assignment } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";
import { LessonCard } from "../../components/LessonCard";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Section = "assignments" | "profile" | "favorites";

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500">Đang tải...</div>}>
      <Protected>
        <AssignmentsContent />
      </Protected>
    </Suspense>
  );
}

function AssignmentsContent() {
  const [activeSection, setActiveSection] = useState<Section>("assignments");
  const { user, refreshUser, logout } = useAuth();
  
  const sections = [
    { id: "assignments", label: "Bài tập của tôi", icon: "assignment" },
    { id: "profile", label: "Quản lý tài khoản", icon: "person" },
    { id: "favorites", label: "Bài học đã lưu", icon: "bookmark" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-pearl flex items-center justify-center text-primary overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName || ""} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl">account_circle</span>
                )}
              </div>
              <div>
                <p className="font-bold text-stone-900 truncate max-w-[140px]">{user?.fullName || "Học sinh"}</p>
                <p className="text-xs text-stone-500 truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as Section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-primary text-white shadow-md"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-stone-100">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeSection === "assignments" && <AssignmentsSection />}
          {activeSection === "profile" && <ProfileSection user={user} onUpdate={refreshUser} />}
          {activeSection === "favorites" && <FavoritesSection />}
        </main>
      </div>
    </div>
  );
}

function AssignmentsSection() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assigns, subs] = await Promise.all([
        api.getAssignments(),
        api.getMySubmissions()
      ]);
      setAssignments(assigns);
      setSubmissions(subs);
      
      // Auto-select from URL if present
      const id = searchParams.get("id");
      if (id) {
        const found = assigns.find(a => a.id === id);
        if (found) setSelectedAssignment(found);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  if (loading) return <div className="py-12 text-center text-stone-500">Đang tải bài tập...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-headline text-primary">Bài tập của tôi</h1>
        <p className="text-sm text-stone-500 mt-1">Hoàn thành bài tập và nộp bài để giáo viên chấm điểm.</p>
      </header>

      <ErrorMessage message={error} />

      {assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-100 flex flex-col items-center">
          <EmptyState message="Hiện tại chưa có bài tập nào được giao." />
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const sub = getSubmission(assignment.id);
            return (
              <div key={assignment.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-stone-100 hover:border-primary/30 transition-colors">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-pearl rounded-full text-[10px] font-bold text-primary tracking-wider uppercase">
                      Bài tập
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      Bài học: {assignment.lesson?.title || "Không rõ"}
                    </span>
                  </div>
                  <SubmissionStatusBadge status={sub?.status} />
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-stone-900 text-lg mb-1">{assignment.title}</h3>
                  <p className="text-sm text-stone-600 line-clamp-2">{assignment.description || "Không có mô tả."}</p>
                </div>

                {sub?.score != null && (
                  <div className="mb-4 p-3 bg-sage/20 border border-sage/30 rounded-xl">
                    <p className="text-xs text-primary font-bold uppercase mb-1">Điểm số</p>
                    <p className="text-2xl font-headline font-extrabold text-stone-900">{sub.score} / 10</p>
                    {sub.teacherComment && (
                      <p className="text-sm text-stone-700 mt-2 italic">"{sub.teacherComment}"</p>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${sub ? "border border-stone-200 text-stone-700 hover:bg-stone-50" : "bg-primary text-white shadow-sm hover:bg-primary/90"}`}
                  >
                    {sub ? "Xem chi tiết / Sửa bài" : "Làm bài ngay"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedAssignment && (
        <AssignmentDetailModal 
          assignment={selectedAssignment}
          submission={getSubmission(selectedAssignment.id)}
          onClose={() => setSelectedAssignment(null)} 
          onSave={() => {
             setSelectedAssignment(null);
             loadData();
          }}
        />
      )}
    </div>
  );
}

function AssignmentDetailModal({ assignment, submission, onClose, onSave }: { assignment: Assignment, submission?: Submission, onClose: () => void, onSave: () => void }) {
  const [content, setContent] = useState(submission?.content || "");
  const [answers, setAnswers] = useState<Record<string, string>>(
    submission?.answers?.reduce((acc, ans) => ({ ...acc, [ans.questionId]: ans.optionId || ans.answerText || "" }), {}) || {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assignment.type === 'ESSAY' && !content.trim()) {
      setError("Nội dung bài làm không được để trống");
      return;
    }

    if (assignment.type === 'QUIZ') {
      const answeredCount = Object.keys(answers).length;
      const totalQuestions = assignment.questions?.length || 0;
      if (answeredCount < totalQuestions) {
        setError(`Vui lòng trả lời đủ ${totalQuestions} câu hỏi`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
        const q = assignment.questions?.find(q => q.id === qId);
        return {
          questionId: qId,
          optionId: q?.type === 'MULTIPLE_CHOICE' ? val : null,
          answerText: q?.type !== 'MULTIPLE_CHOICE' ? val : null
        };
      });

      await api.submitAssignment(assignment.id, content || undefined, formattedAnswers);
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden border border-stone-100 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div className="flex items-center gap-3">
             <h3 className="font-bold text-lg text-primary">
               {assignment.type === 'QUIZ' ? 'Làm bài trắc nghiệm' : 'Làm bài tập'}
             </h3>
             <SubmissionStatusBadge status={submission?.status} />
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           <div className="space-y-2">
              <h2 className="text-xl font-headline font-bold text-stone-900">{assignment.title}</h2>
              <div className="prose prose-sm md:prose-base prose-stone max-w-none text-stone-600">
                 <div dangerouslySetInnerHTML={{ __html: assignment.content }} />
              </div>
           </div>

           {submission?.score != null && (
             <div className="p-4 bg-sage/20 border border-sage/30 rounded-xl space-y-2">
                <p className="text-xs font-bold text-primary uppercase">Kết quả</p>
                <div className="flex items-center gap-3">
                   <p className="text-3xl font-extrabold text-stone-900">{submission.score} / 10</p>
                   <p className="text-sm text-stone-700 italic border-l-2 border-primary/30 pl-3">
                     {submission.status === 'GRADED' && assignment.type === 'QUIZ' 
                       ? "Hệ thống đã tự động chấm điểm bài làm của bạn."
                       : (submission.teacherComment || "Đang chờ giáo viên nhận xét.")}
                   </p>
                </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-8">
              {error && <ErrorMessage message={error} />}

              {assignment.type === 'ESSAY' ? (
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-stone-800">Phần bài làm của học sinh</label>
                  <textarea
                    className="w-full h-48 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-stone-900"
                    placeholder="Nhập nội dung bài làm của bạn vào đây..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={!!submission && submission.status === 'GRADED'}
                  />
                </div>
              ) : (
                <div className="space-y-8">
                  {assignment.questions?.map((question, index) => (
                    <div key={question.id} className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <p className="font-bold text-stone-900">{question.text}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 ml-9">
                        {question.options.map((option) => {
                          const isSelected = answers[question.id] === option.id;
                          const isCorrect = option.isCorrect;
                          const showResult = !!submission && submission.status === 'GRADED';
                          
                          return (
                            <label 
                              key={option.id} 
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                                isSelected 
                                  ? showResult 
                                    ? isCorrect ? 'bg-sage/20 border-sage text-primary' : 'bg-red-50 border-red-200 text-red-700'
                                    : 'bg-primary/5 border-primary text-primary'
                                  : 'bg-stone-50 border-stone-100 hover:border-stone-200'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={isSelected}
                                onChange={() => handleOptionChange(question.id, option.id)}
                                className="hidden"
                                disabled={showResult}
                              />
                              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-primary' : 'border-stone-300'
                              }`}>
                                {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                              </span>
                              <span className="text-sm font-medium">{option.text}</span>
                              
                              {showResult && isCorrect && (
                                <span className="material-symbols-outlined text-sage ml-auto">check_circle</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!submission || submission.status === 'PENDING') && (
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                   <button 
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl border border-stone-200 font-bold text-sm hover:bg-stone-50 transition-all text-stone-600"
                   >
                      Hủy
                   </button>
                   <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                   >
                      {loading ? "Đang nộp..." : "Nộp bài"}
                   </button>
                </div>
              )}
           </form>
        </div>
      </div>
    </div>
  );
}

function SubmissionStatusBadge({ status }: { status?: string }) {
  if (!status) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full text-stone-500 font-bold text-[10px] uppercase tracking-wide">
        Chưa làm
      </div>
    );
  }

  const configs: Record<string, { label: string, color: string, bg: string }> = {
    'PENDING': { label: 'Đã nộp (Chờ chấm)', color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-200' },
    'GRADED': { label: 'Đã chấm điểm', color: 'text-primary', bg: 'bg-sage/30 border border-sage/50' },
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


function ProfileSection({ user, onUpdate }: { user: User | null, onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    birthday: user?.birthday?.split('T')[0] || "",
    gender: user?.gender || "other",
    avatar: user?.avatar || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.updateProfile(formData);
      setSuccess("Cập nhật thông tin thành công!");
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.changePassword({ 
        currentPassword: passData.currentPassword, 
        newPassword: passData.newPassword 
      });
      setSuccess("Đổi mật khẩu thành công!");
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold font-headline text-primary">Thông tin tài khoản</h1>
        <p className="text-sm text-stone-500 mt-1">Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
      </header>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="p-4 bg-sage/20 border border-sage/30 rounded-xl text-primary text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-stone-800">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Chỉnh sửa hồ sơ
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Họ và tên</label>
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                placeholder="Nhập họ tên"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                  placeholder="0xxxxxxxxx"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Ngày sinh</label>
                <input 
                  type="date" 
                  value={formData.birthday} 
                  onChange={e => setFormData({...formData, birthday: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Giới tính</label>
              <div className="flex gap-6 mt-1 ml-1">
                {['male', 'female', 'other'].map(g => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="gender" 
                      value={g} 
                      checked={formData.gender === g}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-stone-600 group-hover:text-primary transition-colors capitalize">
                      {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        </section>

        {/* Password Change */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-stone-800">
            <span className="material-symbols-outlined text-stone-500">lock_reset</span>
            Đổi mật khẩu
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                value={passData.currentPassword}
                onChange={e => setPassData({...passData, currentPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Mật khẩu mới</label>
              <input 
                type="password" 
                value={passData.newPassword}
                onChange={e => setPassData({...passData, newPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                value={passData.confirmPassword}
                onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm text-stone-900"
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3 bg-stone-800 text-white rounded-xl font-bold text-sm shadow-md hover:bg-stone-900 transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function FavoritesSection() {
  const [favorites, setFavorites] = useState<FavoriteLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setLoading(true);
    api.getFavoriteLessons()
      .then(setFavorites)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (lessonId: string) => {
    try {
      await api.removeFromFavoriteLessons(lessonId);
      setFavorites(favorites.filter(f => f.lessonId !== lessonId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="py-12 text-center text-stone-500">Đang tải danh sách bài học...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold font-headline text-primary">Bài học đã lưu</h1>
        <p className="text-sm text-stone-500 mt-1">Những bài học quan trọng bạn đã đánh dấu để xem lại sau.</p>
      </header>

      {error && <ErrorMessage message={error} />}

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-stone-100 flex flex-col items-center">
          <EmptyState message="Chưa có bài học nào được lưu." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative group">
               <LessonCard lesson={fav.lesson} />
               <button 
                onClick={() => handleRemove(fav.lessonId)}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                title="Xóa khỏi danh sách"
               >
                 <span className="material-symbols-outlined text-lg">close</span>
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
