"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorMessage } from "@/components/ui";
import { api, type FlashSaleCampaign } from "@/lib/api";

export default function AdminFlashSalesPage() {
  const [campaigns, setCampaigns] = useState<FlashSaleCampaign[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminFlashSales();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách Flash Sale");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa chiến dịch này?")) return;
    try {
      await api.deleteFlashSale(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa chiến dịch");
    }
  };

  const toggleFeatured = async (campaign: FlashSaleCampaign) => {
    try {
      await api.updateFlashSale(campaign.id, { isFeatured: !campaign.isFeatured });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (campaign: FlashSaleCampaign) => {
    const now = new Date();
    const start = new Date(campaign.startTime);
    const end = new Date(campaign.endTime);

    if (!campaign.isActive) {
      return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold uppercase">Đã tắt</span>;
    }

    if (now < start) {
      return <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-bold uppercase">Sắp diễn ra</span>;
    }

    if (now > end) {
      return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs font-bold uppercase">Đã kết thúc</span>;
    }

    return <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full text-xs font-bold uppercase">Đang diễn ra</span>;
  };

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-bold font-headline text-2xl text-primary">Quản lý Chiến dịch Flash Sale</h2>
          <p className="text-sm text-slate-500 mt-1">Tạo và quản lý các chương trình khuyến mãi chớp nhoáng</p>
        </div>
        <button
          onClick={async () => {
            const name = window.prompt("Nhập tên chiến dịch mới:");
            if (!name) return;
            try {
              const now = new Date();
              const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 hours
              await api.createFlashSale({
                name,
                startTime: now.toISOString(),
                endTime: end.toISOString(),
                isActive: true
              });
              await load();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Không thể tạo chiến dịch");
            }
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-opacity-90 transition organic-shadow"
        >
          <span className="material-symbols-outlined text-sm">add</span> Tạo chiến dịch mới
        </button>
      </header>

      <ErrorMessage message={error} />

      <section className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden organic-shadow border border-outline-variant/30">
        <div className="overflow-x-auto no-scrollbar">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-container-low" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8">
              <EmptyState message="Chưa có chiến dịch Flash Sale nào." />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4 border-b border-surface-container">Tên chiến dịch</th>
                  <th className="px-6 py-4 border-b border-surface-container">Thời gian</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Trạng thái</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Sản phẩm</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Nổi bật</th>
                  <th className="px-6 py-4 border-b border-surface-container text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-sm">
                {campaigns.map((c) => (
                  <tr className="hover:bg-surface-container-low/50 transition-colors" key={c.id}>
                    <td className="px-6 py-4 font-semibold text-on-surface">
                      {c.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">play_circle</span>
                          {formatDateTime(c.startTime)}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                          {formatDateTime(c.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(c)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-secondary">
                      {c._count?.items || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleFeatured(c)}
                        className={`p-2 rounded-full transition-colors ${c.isFeatured ? 'text-orange-500 bg-orange-50' : 'text-slate-300 hover:text-slate-400'}`}
                        title={c.isFeatured ? "Bỏ nổi bật" : "Đặt làm nổi bật trên trang chủ"}
                      >
                        <span className="material-symbols-outlined font-icon-fill">star</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/flash-sales/${c.id}`} title="Chỉnh sửa sản phẩm" className="p-2 hover:bg-primary/10 text-primary rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                        </Link>
                        <button onClick={() => remove(c.id)} title="Xóa" className="p-2 hover:bg-error-container text-error rounded transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
