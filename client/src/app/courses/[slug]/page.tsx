"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Course, type Assignment, type Submission, formatPrice } from "../../../lib/api";
import { useAuth } from "../../../components/AuthProvider";
import { ErrorMessage } from "../../../components/ui";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<(Course & { isEnrolled?: boolean; enrollment?: any }) | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const courseData = await api.getCourse(slug);
      setCourse(courseData);

      if (courseData.isEnrolled) {
        const assignData = await api.getCourseAssignments(courseData.id);
        setAssignments(assignData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) load();
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    console.log("Attempting to enroll in course:", course?.id);
    setEnrolling(true);
    try {
      await api.enrollInCourse(course!.id);
      console.log("Enrollment successful!");
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Enrollment error:", err);
      setError(err.message || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Đang tải khóa học...</div>;
  if (!course) return <div className="p-20 text-center"><ErrorMessage message="Không tìm thấy khóa học" /></div>;

  const isPaid = course.isEnrolled;
  const isPending = course.enrollment?.status === 'PENDING';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
      {error && <ErrorMessage message={error} />}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="bg-amber-500 p-8 text-center text-white relative">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                <span className="material-symbols-outlined text-4xl animate-bounce">check_circle</span>
              </div>
              <h2 className="text-2xl font-extrabold font-headline">Đăng Ký Thành Công!</h2>
              <p className="text-amber-50 opacity-90 mt-2">Cảm ơn bạn đã tin tưởng lựa chọn khóa học.</p>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  load();
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-bold text-stone-400 uppercase tracking-widest text-center">Thông tin thanh toán</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Ngân hàng</p>
                    <p className="text-sm font-bold text-stone-900">MB BANK</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                    <p className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Số tiền</p>
                    <p className="text-sm font-bold text-primary">{formatPrice(course.price)}</p>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 relative group">
                  <p className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Số tài khoản</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-stone-900 tracking-wider">0325831185</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("0123456789");
                        alert("Đã sao chép số tài khoản!");
                      }}
                      className="text-primary text-xs font-bold hover:underline"
                    >
                      Sao chép
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-bold mb-1 uppercase">Nội dung chuyển khoản</p>
                  <div className="flex items-center justify-between">
                    <code className="text-primary font-bold text-xs bg-white px-2 py-1 rounded">
                      {user?.fullName || 'User'} - {course.id.slice(0, 8).toUpperCase()}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${user?.fullName || 'User'} - ${course.id.slice(0, 8).toUpperCase()}`);
                        alert("Đã sao chép nội dung!");
                      }}
                      className="text-stone-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  load();
                }}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-stone-900/20 transition-all transform active:scale-95"
              >
                Tôi đã hiểu, quay lại trang khóa học
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 font-headline leading-tight">
              {course.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-stone-500 font-medium">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">calendar_today</span> {new Date(course.createdAt).toLocaleDateString('vi-VN')}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">assignment</span> {assignments.length || '0'} bài tập</span>
            </div>
          </div>

          <div className="prose prose-stone max-w-none">
            <div dangerouslySetInnerHTML={{ __html: course.content || course.description || "Nội dung khóa học đang được cập nhật..." }} />
          </div>

          {isPending && (
            <div className="p-8 bg-amber-50 rounded-[2rem] border-2 border-amber-200 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Hướng dẫn thanh toán</h3>
                  <p className="text-sm text-stone-600">Vui lòng hoàn tất thanh toán để truy cập khóa học.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/50 p-4 rounded-xl border border-amber-100">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Ngân hàng</p>
                  <p className="font-bold text-stone-900">MB BANK (Quân Đội)</p>
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-amber-100">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Số tài khoản</p>
                  <p className="font-bold text-primary text-lg">0123456789</p>
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-amber-100">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Chủ tài khoản</p>
                  <p className="font-bold text-stone-900 uppercase">TRAN DUY HAI</p>
                </div>
                <div className="bg-white/50 p-4 rounded-xl border border-amber-100">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Số tiền</p>
                  <p className="font-bold text-primary text-lg">{formatPrice(course.price)}</p>
                </div>
              </div>

              <div className="bg-stone-900/5 p-4 rounded-xl border border-stone-200">
                <p className="text-xs text-stone-500 mb-1 font-medium">Nội dung chuyển khoản:</p>
                <div className="flex items-center justify-between">
                  <code className="text-brand-dark font-bold text-sm bg-white px-3 py-1 rounded shadow-sm">
                    {user?.fullName || 'User'} - {course.id.slice(0, 8).toUpperCase()}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${user?.fullName || 'User'} - ${course.id.slice(0, 8).toUpperCase()}`);
                      alert("Đã sao chép nội dung chuyển khoản!");
                    }}
                    className="text-primary text-xs font-bold hover:underline"
                  >
                    Sao chép
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/10">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Gửi bill qua Zalo
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-all">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                  Hotline hỗ trợ
                </button>
              </div>

              <p className="text-[11px] text-center text-stone-400 italic">
                Sau khi chuyển khoản, hệ thống sẽ phê duyệt tự động trong 5-15 phút.
              </p>
            </div>
          )}

          <div className="space-y-6 pt-8 border-t border-stone-100">
            <h3 className="text-2xl font-bold text-stone-900">Nội dung học tập</h3>
            {!isPaid ? (
              <div className="p-8 bg-stone-50 rounded-3xl text-center border-2 border-dashed border-stone-200">
                <span className="material-symbols-outlined text-5xl text-stone-300 mb-3">lock</span>
                <p className="text-stone-600 font-medium mb-1">Nội dung này chỉ dành cho học viên của khóa học.</p>
                <p className="text-stone-400 text-sm">Vui lòng đăng ký tham gia để truy cập hệ thống bài tập.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.length > 0 ? assignments.map((a, i) => (
                  <div key={a.id} className="p-5 bg-white rounded-2xl border border-stone-100 shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-primary/5 text-primary flex items-center justify-center font-bold text-sm">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-stone-900 group-hover:text-primary transition-colors">{a.title}</h4>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{a.type === 'QUIZ' ? 'Trắc nghiệm' : 'Tự luận'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/learning-progress?tab=assignments&id=${a.id}`)}
                      className="p-2 text-stone-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">play_circle</span>
                    </button>
                  </div>
                )) : (
                  <p className="text-stone-500 text-center py-10 bg-stone-50 rounded-2xl">Khóa học này hiện chưa có bài tập nào.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-50 sticky top-32">
            <div className="relative aspect-video rounded-3xl overflow-hidden mb-6">
              {course.imageUrl ? (
                <img src={course.imageUrl} className="w-full h-full object-cover" alt={course.title} />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-stone-200">image</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Giá khóa học</p>
                <p className="text-3xl font-extrabold text-primary">
                  {course.price === 0 ? "MIỄN PHÍ" : formatPrice(course.price)}
                </p>
              </div>

              {!course.enrollment ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-stone-900/10 disabled:opacity-50"
                >
                  {enrolling ? "Đang xử lý..." : course.price === 0 ? "Tham gia ngay" : "Đăng ký mua khóa học"}
                </button>
              ) : isPaid ? (
                <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3 text-emerald-700">
                  <span className="material-symbols-outlined">check_circle</span>
                  <span className="text-sm font-bold">Bạn đã sở hữu khóa học này</span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl flex items-center gap-3 text-amber-700">
                  <span className="material-symbols-outlined animate-pulse">pending</span>
                  <span className="text-sm font-bold">Đang chờ thanh toán...</span>
                </div>
              )}

              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                  Truy cập trọn đời
                </li>
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                  Hệ thống bài tập chuyên sâu
                </li>
                <li className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                  Có giáo viên hướng dẫn
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
