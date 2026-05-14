"use client";

import { useEffect, useState, Suspense } from "react";
import { api, User, Submission, Course, formatPrice, Assignment } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ErrorMessage, EmptyState } from "@/components/ui";

import { useAuth } from "@/components/AuthProvider";

type TabType = "dashboard" | "assignments" | "profile" | "favorites";

export default function LearningProgressPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <LearningProgressContent />
    </Suspense>
  );
}

function LearningProgressContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tab = searchParams.get("tab") as TabType;
    if (tab && ["dashboard", "assignments", "profile", "favorites"].includes(tab)) {
      setActiveTab(tab);
    }
    
    // If ID is present, we might want to auto-open assignment in assignments tab
    const id = searchParams.get("id");
    if (id) {
      setActiveTab("assignments");
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [userData, subData, courseData] = await Promise.all([
        api.getProfile(),
        api.getMySubmissions(),
        api.getMyCourses()
      ]);
      setUser(userData);
      setSubmissions(subData);
      setCourses(courseData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">Vui lòng đăng nhập để xem tiến độ</h2>
        <button onClick={() => router.push("/login")} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg">Đăng nhập ngay</button>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
    { id: "assignments", label: "Làm bài tập", icon: "edit_note" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: "person" },
    { id: "favorites", label: "Bài học đã lưu", icon: "bookmark" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-stone-200/50 border border-stone-50 sticky top-32">
            <div className="flex items-center gap-4 mb-8 p-2">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-white shadow-md">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-stone-900 truncate text-sm">{user.fullName || "Học sinh"}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest truncate">{user.role}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    router.push(`/learning-progress?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-stone-500 hover:bg-stone-50 hover:text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-stone-50">
              <button 
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
              >
                <span className="material-symbols-outlined">logout</span>
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && <DashboardSection user={user} submissions={submissions} courses={courses} onTabChange={setActiveTab} />}
          {activeTab === "assignments" && <AssignmentsSection submissions={submissions} onRefresh={loadData} />}
          {activeTab === "profile" && <ProfileSection user={user} onRefresh={loadData} />}
          {activeTab === "favorites" && <FavoritesSection />}
        </main>
      </div>
    </div>
  );
}

// --- SUB-SECTIONS ---

function DashboardSection({ user, submissions, courses, onTabChange }: any) {
  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / submissions.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Card */}
      <div className="bg-stone-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-stone-900/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full -mr-40 -mt-40 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">Ga Tàu Văn Học</p>
          <h1 className="text-3xl md:text-5xl font-black mb-6">Chào mừng trở lại, <br/>{user.fullName || "Học sinh"}!</h1>
          <p className="text-stone-400 max-w-md mb-8 leading-relaxed">Tiếp tục hành trình chinh phục kiến thức và hoàn thành các bài tập còn dang dở bạn nhé.</p>
          
          <div className="flex gap-4">
             <button onClick={() => onTabChange("assignments")} className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">Làm bài ngay</button>
             <button onClick={() => onTabChange("profile")} className="px-8 py-3 bg-white/10 backdrop-blur-md text-white rounded-full font-bold hover:bg-white/20 transition-all border border-white/10">Sửa hồ sơ</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard icon="auto_stories" label="Khóa học" value={courses.length} color="bg-blue-500" />
        <StatCard icon="task_alt" label="Bài nộp" value={submissions.length} color="bg-emerald-500" />
        <StatCard icon="stars" label="Điểm trung bình" value={avgScore} color="bg-amber-500" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl shadow-stone-200/30">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">history</span>
          Hoạt động nộp bài gần đây
        </h2>
        
        <div className="space-y-4">
          {submissions.slice(0, 5).map((sub: any) => (
            <div key={sub.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-all border border-transparent hover:border-stone-100 group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <span className="material-symbols-outlined">{sub.status === 'GRADED' ? 'check_circle' : 'pending'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-stone-800 text-sm truncate">{sub.assignment?.title || "Bài tập"}</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              {sub.score != null && (
                <div className="text-right">
                  <p className="text-lg font-black text-stone-900">{sub.score}</p>
                  <p className="text-[10px] text-stone-400 font-bold uppercase">Điểm</p>
                </div>
              )}
            </div>
          ))}
          {submissions.length === 0 && <p className="text-center py-10 text-stone-400 italic">Chưa có hoạt động nào.</p>}
        </div>
      </div>
    </div>
  );
}

function AssignmentsSection({ submissions, onRefresh }: any) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getAssignments();
        setAssignments(data);
        
        // Auto-select from URL if present
        const id = searchParams.get("id");
        if (id) {
          const found = data.find(a => a.id === id);
          if (found) setSelectedAssignment(found);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [searchParams]);

  if (loading) return <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-black text-stone-900">Bài tập của tôi</h2>
           <p className="text-sm text-stone-500 mt-1">Hoàn thành và theo dõi tiến độ các bài tập được giao.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((a) => {
          const sub = submissions.find((s: any) => s.assignmentId === a.id);
          return (
            <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  !sub ? 'bg-stone-100 text-stone-500' : sub.status === 'GRADED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {!sub ? 'Chưa làm' : sub.status === 'GRADED' ? 'Đã chấm' : 'Đang chấm'}
                </div>
                {sub?.score != null && (
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shadow-md">
                    {sub.score}
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors">{a.title}</h3>
              <p className="text-xs text-stone-500 line-clamp-2 mb-6 h-8">{a.description || "Không có mô tả."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <div className="flex items-center gap-2 text-stone-400">
                   <span className="material-symbols-outlined text-sm">{a.type === 'QUIZ' ? 'quiz' : 'essay'}</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">{a.type === 'QUIZ' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                </div>
                <button 
                  onClick={() => setSelectedAssignment(a)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    sub ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-primary text-white shadow-md hover:bg-primary/90'
                  }`}
                >
                  {sub ? 'Xem kết quả' : 'Làm bài ngay'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAssignment && (
        <AssignmentDetailModal 
          assignment={selectedAssignment}
          submission={submissions.find((s: any) => s.assignmentId === selectedAssignment.id)}
          onClose={() => setSelectedAssignment(null)}
          onSave={() => {
            setSelectedAssignment(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function ProfileSection({ user, onRefresh }: any) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    birthday: user.birthday?.split('T')[0] || "",
    gender: user.gender || "other"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(formData);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-stone-100 shadow-xl shadow-stone-200/30 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-black text-stone-900 mb-8">Thông tin hồ sơ</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Họ và tên</label>
            <input 
              className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-stone-900"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              placeholder="Nhập họ và tên..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Số điện thoại</label>
            <input 
              className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-stone-900"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="0xxxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Ngày sinh</label>
            <input 
              type="date"
              className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-stone-900"
              value={formData.birthday}
              onChange={e => setFormData({...formData, birthday: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Giới tính</label>
            <select 
              className="w-full px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium text-stone-900 appearance-none"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
        </div>

        <div className="pt-6">
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-stone-900/10 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Đang lưu..." : "Cập nhật hồ sơ"}
            {success && <span className="material-symbols-outlined text-green-400">check_circle</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

function FavoritesSection() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFavoriteLessons().then(setFavorites).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-black text-stone-900">Bài học đã lưu</h2>
      {favorites.length === 0 ? (
        <div className="bg-stone-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-stone-200">
           <span className="material-symbols-outlined text-6xl text-stone-300 mb-4">bookmark_add</span>
           <p className="text-stone-500 font-medium">Bạn chưa lưu bài học nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map(f => (
            <div key={f.id} className="bg-white p-4 rounded-3xl border border-stone-100 flex gap-4 items-center group">
               <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
                  {f.lesson.imageUrl && <img src={f.lesson.imageUrl} className="w-full h-full object-cover" />}
               </div>
               <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-800 truncate group-hover:text-primary transition-colors">{f.lesson.title}</h4>
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{f.lesson.category?.name || "Bài học"}</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SHARED COMPONENTS ---

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/20 hover:scale-[1.02] transition-all">
      <div className={`w-14 h-14 ${color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-3xl font-black text-stone-900">{value}</p>
    </div>
  );
}

function AssignmentDetailModal({ assignment, submission, onClose, onSave }: any) {
  const [content, setContent] = useState(submission?.content || "");
  const [answers, setAnswers] = useState<Record<string, string>>(
    submission?.answers?.reduce((acc: any, ans: any) => ({ ...acc, [ans.questionId]: ans.optionId || ans.answerText || "" }), {}) || {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
        const q = assignment.questions?.find((q: any) => q.id === qId);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-stone-100 animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-stone-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-black text-2xl text-stone-900">{assignment.title}</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
              {assignment.type === 'QUIZ' ? 'Bài tập trắc nghiệm' : 'Bài tập tự luận'}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-stone-50 transition-colors">
            <span className="material-symbols-outlined text-stone-400">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           {assignment.content && (
             <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 prose prose-stone max-w-none">
                <div dangerouslySetInnerHTML={{ __html: assignment.content }} />
             </div>
           )}

           {submission?.score != null && (
             <div className="p-6 bg-primary/5 rounded-3xl border-2 border-primary/10 flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary text-white flex flex-col items-center justify-center shadow-lg">
                   <span className="text-2xl font-black">{submission.score}</span>
                   <span className="text-[8px] font-bold uppercase">Điểm số</span>
                </div>
                <div className="flex-1">
                   <p className="text-sm font-bold text-stone-900 mb-1">Nhận xét của giáo viên:</p>
                   <p className="text-sm text-stone-600 italic">"{submission.teacherComment || "Tuyệt vời! Tiếp tục phát huy nhé."}"</p>
                </div>
             </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-10">
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>}

              {assignment.type === 'ESSAY' ? (
                <div className="space-y-4">
                  <label className="text-sm font-black text-stone-900 ml-1">Phần bài làm của bạn</label>
                  <textarea
                    className="w-full h-64 rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-stone-900 leading-relaxed"
                    placeholder="Viết nội dung bài làm của bạn vào đây..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={!!submission && submission.status === 'GRADED'}
                  />
                </div>
              ) : (
                <div className="space-y-10">
                  {assignment.questions?.map((q: any, i: number) => (
                    <div key={q.id} className="space-y-6">
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-md">
                          {i + 1}
                        </span>
                        <p className="font-bold text-stone-900 text-lg">{q.text}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 ml-12">
                        {q.options.map((opt: any) => {
                          const isSelected = answers[q.id] === opt.id;
                          const isCorrect = opt.isCorrect;
                          const showResult = !!submission && submission.status === 'GRADED';
                          
                          return (
                            <label key={opt.id} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected 
                                ? showResult 
                                  ? isCorrect ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-red-50 border-red-500 text-red-900'
                                  : 'bg-primary/5 border-primary text-stone-900'
                                : 'bg-white border-stone-100 hover:border-stone-200'
                            }`}>
                              <input type="radio" checked={isSelected} onChange={() => !showResult && setAnswers({...answers, [q.id]: opt.id})} className="hidden" disabled={showResult} />
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary' : 'border-stone-200'}`}>
                                {isSelected && <div className="w-3 h-3 rounded-full bg-primary" />}
                              </div>
                              <span className="font-bold text-sm">{opt.text}</span>
                              {showResult && isCorrect && <span className="material-symbols-outlined text-emerald-500 ml-auto">check_circle</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!submission || submission.status === 'PENDING') && (
                <div className="flex justify-end gap-4 pt-8 border-t border-stone-50">
                   <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-sm text-stone-500 hover:bg-stone-50 transition-all">Đóng</button>
                   <button type="submit" disabled={loading} className="px-12 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50">
                      {loading ? "Đang nộp..." : "Nộp bài ngay"}
                   </button>
                </div>
              )}
           </form>
        </div>
      </div>
    </div>
  );
}
