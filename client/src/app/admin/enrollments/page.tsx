"use client";

import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { ErrorMessage } from "@/components/ui";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái thành ${status === 'PAID' ? 'ĐÃ THANH TOÁN' : status}?`)) return;
    
    try {
      await api.updateEnrollmentStatus(id, status);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === "ALL") return true;
    return e.status === filter;
  });

  if (loading) return <div className="p-8 text-center text-stone-500">Đang tải danh sách đăng ký...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-stone-900">Phê duyệt Học viên</h1>
          <p className="text-sm text-stone-500 mt-1">Quản lý trạng thái thanh toán và quyền truy cập khóa học.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
          {['ALL', 'PENDING', 'PAID', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f ? "bg-primary text-white shadow-md" : "text-stone-500 hover:bg-stone-50"
              }`}
            >
              {f === 'ALL' ? 'Tất cả' : f === 'PENDING' ? 'Chờ duyệt' : f === 'PAID' ? 'Đã thanh toán' : 'Đã hủy'}
            </button>
          ))}
        </div>
      </header>

      <ErrorMessage message={error} />

      <div className="bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Học viên</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Khóa học</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Số tiền</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Ngày đăng ký</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pearl flex items-center justify-center text-primary font-bold text-[10px]">
                        {e.user.fullName?.charAt(0) || 'H'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900">{e.user.fullName || 'Học viên ẩn danh'}</p>
                        <p className="text-[10px] text-stone-500">{e.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-800 line-clamp-1">{e.course.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-primary">{formatPrice(e.amount)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-stone-500">{new Date(e.createdAt).toLocaleDateString('vi-VN')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      e.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      e.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                         e.status === 'PAID' ? 'bg-emerald-500' :
                         e.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                      }`}></span>
                      {e.status === 'PAID' ? 'Đã thanh toán' : e.status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {e.status === 'PENDING' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(e.id, 'PAID')}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                            title="Phê duyệt"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(e.id, 'CANCELLED')}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                            title="Hủy bỏ"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      )}
                      {e.status === 'PAID' && (
                        <button 
                          onClick={() => handleUpdateStatus(e.id, 'PENDING')}
                          className="px-3 py-1.5 border border-stone-200 text-stone-500 rounded-lg text-[10px] font-bold hover:bg-stone-50"
                        >
                          Hoàn tác
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-stone-400">
               <span className="material-symbols-outlined text-5xl mb-4 opacity-20">history_edu</span>
               <p>Không tìm thấy lượt đăng ký nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
