"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ErrorMessage } from "../../../components/ui";
import {
  api,
  formatPrice,
  type CustomerSegmentationResponse,
  type CustomerRFM,
  type SegmentSummary
} from "../../../lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const SEGMENT_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string; desc: string }
> = {
  Champions: {
    label: "Champions",
    icon: "emoji_events",
    color: "#059669",
    bgColor: "bg-emerald-50",
    desc: "Mua gần đây, thường xuyên, chi tiêu cao"
  },
  Loyal: {
    label: "Loyal Customers",
    icon: "diamond",
    color: "#2563EB",
    bgColor: "bg-blue-50",
    desc: "Tần suất cao, chi tiêu cao"
  },
  PotentialLoyalist: {
    label: "Potential Loyalists",
    icon: "trending_up",
    color: "#7C3AED",
    bgColor: "bg-violet-50",
    desc: "Mua gần đây, tần suất trung bình"
  },
  NewCustomers: {
    label: "New Customers",
    icon: "person_add",
    color: "#0891B2",
    bgColor: "bg-cyan-50",
    desc: "Mới mua lần đầu gần đây"
  },
  AtRisk: {
    label: "At Risk",
    icon: "warning",
    color: "#D97706",
    bgColor: "bg-amber-50",
    desc: "Trước đây mua thường, nay giảm"
  },
  Hibernating: {
    label: "Hibernating",
    icon: "bedtime",
    color: "#DC2626",
    bgColor: "bg-red-50",
    desc: "Lâu không mua, tần suất thấp"
  },
  Lost: {
    label: "Lost",
    icon: "person_off",
    color: "#6B7280",
    bgColor: "bg-gray-50",
    desc: "Không hoạt động trong thời gian dài"
  }
};

const SEGMENT_KEYS = Object.keys(SEGMENT_CONFIG);

export default function CustomerSegmentationPage() {
  const [data, setData] = useState<CustomerSegmentationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError("");
    const params: Record<string, string | number | undefined> = { page, limit: 15 };
    if (selectedSegment) params.segment = selectedSegment;
    api
      .getCustomerSegmentation(params)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
      )
      .finally(() => setLoading(false));
  }, [page, selectedSegment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSegmentClick = (segment: string) => {
    setSelectedSegment((prev) => (prev === segment ? "" : segment));
    setPage(1);
  };

  const segmentChartData = useMemo(() => {
    if (!data) return null;
    const filtered = data.segmentSummary.filter((s) => s.count > 0);
    return {
      labels: filtered.map(
        (s) => SEGMENT_CONFIG[s.segment]?.label ?? s.segment
      ),
      datasets: [
        {
          data: filtered.map((s) => s.count),
          backgroundColor: filtered.map(
            (s) => SEGMENT_CONFIG[s.segment]?.color ?? "#9CA3AF"
          ),
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    };
  }, [data]);

  const totalRevenue = useMemo(
    () =>
      data?.segmentSummary.reduce(
        (sum, s) => sum + Number(s.totalRevenue),
        0
      ) ?? 0,
    [data]
  );

  const totalCustomers = useMemo(
    () => data?.segmentSummary.reduce((sum, s) => sum + s.count, 0) ?? 0,
    [data]
  );

  const RFMBadge = ({ score, max = 5 }: { score: number; max?: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm transition-all ${
            i < score ? "bg-primary" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );

  const SegmentBadge = ({ segment }: { segment: string }) => {
    const config = SEGMENT_CONFIG[segment];
    if (!config) return <span className="text-xs text-slate-500">{segment}</span>;
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
          backgroundColor: config.color + "18",
          color: config.color
        }}
      >
        <span
          className="material-symbols-outlined text-sm"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {config.icon}
        </span>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            groups
          </span>
          Phân khúc Khách hàng & RFM
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Phân tích hành vi khách hàng theo mô hình Recency – Frequency –
          Monetary
        </p>
      </div>

      <ErrorMessage message={error} />

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Đang phân tích dữ liệu...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Tổng khách hàng
              </h3>
              <p className="text-3xl font-bold font-headline text-on-surface mt-2">
                {totalCustomers}
              </p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                Tổng doanh thu từ KH
              </h3>
              <p className="text-3xl font-bold font-headline text-on-surface mt-2">
                {formatPrice(totalRevenue)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary to-emerald-700 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
              <h3 className="text-xs text-white/70 uppercase tracking-wider font-medium">
                Số phân khúc
              </h3>
              <p className="text-3xl font-bold font-headline mt-2">
                {data.segmentSummary.filter((s) => s.count > 0).length}
              </p>
              <p className="text-[10px] text-white/50 mt-1">Phân khúc hoạt động</p>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/5 rounded-full blur-2xl" />
            </div>
          </section>

          {/* Segment Cards + Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Segment Cards */}
            <div className="xl:col-span-2">
              <h2 className="text-lg font-bold font-headline text-on-surface mb-4">
                Phân khúc Khách hàng
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SEGMENT_KEYS.map((key) => {
                  const config = SEGMENT_CONFIG[key];
                  const summary = data.segmentSummary.find(
                    (s) => s.segment === key
                  );
                  const count = summary?.count ?? 0;
                  const pct = summary?.percentage ?? 0;
                  const isActive = selectedSegment === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSegmentClick(key)}
                      className={`text-left p-4 rounded-xl transition-all duration-200 border-2 ${
                        isActive
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-transparent bg-surface-container-lowest hover:border-slate-200 organic-shadow"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: config.color + "18" }}
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{
                              color: config.color,
                              fontVariationSettings: "'FILL' 1"
                            }}
                          >
                            {config.icon}
                          </span>
                        </div>
                        <span
                          className="text-xs font-bold"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold font-headline text-on-surface">
                        {count}
                        <span className="text-xs text-slate-400 font-normal ml-1">
                          ({pct.toFixed(1)}%)
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {config.desc}
                      </p>
                      {summary && Number(summary.totalRevenue) > 0 && (
                        <p className="text-xs font-semibold text-slate-600 mt-2">
                          DT: {formatPrice(summary.totalRevenue)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-surface-container-lowest p-8 rounded-xl organic-shadow flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold font-headline text-on-surface mb-6 self-start">
                Phân bố phân khúc
              </h2>
              <div className="w-56 h-56">
                {segmentChartData && (
                  <Doughnut
                    data={segmentChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "60%",
                      plugins: {
                        legend: {
                          position: "bottom" as const,
                          labels: { font: { size: 10 }, boxWidth: 12 }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <section className="bg-surface-container-lowest rounded-xl organic-shadow overflow-hidden border border-outline-variant/30">
            <div className="px-8 py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-surface-container">
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface">
                  Chi tiết Khách hàng
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSegment
                    ? `Lọc: ${SEGMENT_CONFIG[selectedSegment]?.label ?? selectedSegment}`
                    : "Tất cả phân khúc"}{" "}
                  — {data.customers.meta.total} khách hàng
                </p>
              </div>
              {selectedSegment && (
                <button
                  onClick={() => {
                    setSelectedSegment("");
                    setPage(1);
                  }}
                  className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">
                    filter_alt_off
                  </span>
                  Bỏ lọc
                </button>
              )}
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-4 py-3 text-center">R</th>
                    <th className="px-4 py-3 text-center">F</th>
                    <th className="px-4 py-3 text-center">M</th>
                    <th className="px-4 py-3">Phân khúc</th>
                    <th className="px-4 py-3 text-right">Tổng chi tiêu</th>
                    <th className="px-4 py-3 text-center">Đơn hàng</th>
                    <th className="px-4 py-3 text-center">Gần nhất (ngày)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-sm">
                  {data.customers.data.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-on-surface truncate max-w-[180px]">
                          {customer.fullName || "—"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {customer.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <RFMBadge score={customer.rScore} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <RFMBadge score={customer.fScore} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <RFMBadge score={customer.mScore} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SegmentBadge segment={customer.segment} />
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-on-surface">
                        {formatPrice(customer.monetary)}
                      </td>
                      <td className="px-4 py-4 text-center font-mono">
                        {customer.frequency}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {customer.recencyDays < 9999 ? (
                          <span
                            className={`font-mono text-xs ${
                              customer.recencyDays <= 7
                                ? "text-emerald-600 font-bold"
                                : customer.recencyDays <= 30
                                ? "text-blue-600"
                                : "text-slate-500"
                            }`}
                          >
                            {customer.recencyDays}d
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.customers.data.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Không có khách hàng nào trong phân khúc này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.customers.meta.totalPages > 1 && (
              <div className="px-6 py-4 flex justify-between items-center border-t border-surface-container bg-surface-container-low/30">
                <p className="text-xs text-slate-500">
                  Trang {data.customers.meta.page} /{" "}
                  {data.customers.meta.totalPages} — Tổng{" "}
                  {data.customers.meta.total}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Trước
                  </button>
                  <button
                    disabled={page >= data.customers.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface hover:bg-primary hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Tiếp →
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* RFM Legend */}
          <section className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
            <h3 className="text-sm font-bold font-headline text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                info
              </span>
              Giải thích Mô hình RFM
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-emerald-50 rounded-lg p-4">
                <p className="font-bold text-emerald-700 mb-1">
                  R — Recency (Gần đây)
                </p>
                <p className="text-xs text-emerald-600">
                  Khách hàng mua hàng gần đây bao lâu? Số ngày càng nhỏ → điểm
                  càng cao.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="font-bold text-blue-700 mb-1">
                  F — Frequency (Tần suất)
                </p>
                <p className="text-xs text-blue-600">
                  Khách hàng mua bao nhiêu lần? Số đơn hàng càng nhiều → điểm
                  càng cao.
                </p>
              </div>
              <div className="bg-violet-50 rounded-lg p-4">
                <p className="font-bold text-violet-700 mb-1">
                  M — Monetary (Chi tiêu)
                </p>
                <p className="text-xs text-violet-600">
                  Tổng giá trị đơn hàng bao nhiêu? Chi tiêu càng cao → điểm
                  càng cao.
                </p>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
