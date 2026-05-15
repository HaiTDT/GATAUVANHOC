"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { ErrorMessage, PageHeader } from "@/components/ui";
import {
  api,
  type StudentSegmentationResponse,
  type StudentRFM
} from "@/lib/api";

ChartJS.register(ArcElement, Tooltip, Legend);

const SEGMENT_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string; desc: string }
> = {
  Champions: {
    label: "Học sinh xuất sắc",
    icon: "emoji_events",
    color: "#059669",
    bgColor: "bg-emerald-50",
    desc: "Nộp bài gần đây, thường xuyên, điểm cao"
  },
  Loyal: {
    label: "Học sinh chăm chỉ",
    icon: "favorite",
    color: "#2563EB",
    bgColor: "bg-blue-50",
    desc: "Tần suất nộp bài cao, tiến độ tốt"
  },
  PotentialLoyalist: {
    label: "Học sinh tiềm năng",
    icon: "trending_up",
    color: "#7C3AED",
    bgColor: "bg-violet-50",
    desc: "Mới tham gia, nộp bài đều đặn"
  },
  NewCustomers: {
    label: "Học sinh mới",
    icon: "person_add",
    color: "#0891B2",
    bgColor: "bg-cyan-50",
    desc: "Mới đăng ký và bắt đầu học"
  },
  AtRisk: {
    label: "Cần chú ý",
    icon: "warning",
    color: "#D97706",
    bgColor: "bg-amber-50",
    desc: "Trước học đều, nay bỏ dở"
  },
  Hibernating: {
    label: "Đang tạm nghỉ",
    icon: "bedtime",
    color: "#DC2626",
    bgColor: "bg-red-50",
    desc: "Lâu không nộp bài, tần suất thấp"
  },
  Lost: {
    label: "Đã ngừng học",
    icon: "person_off",
    color: "#6B7280",
    bgColor: "bg-gray-50",
    desc: "Không hoạt động trong thời gian dài"
  }
};

export default function StudentAnalyticsPage() {
  const [data, setData] = useState<StudentSegmentationResponse | null>(null);
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

  const totalStudents = useMemo(
    () => data?.segmentSummary.reduce((sum, s) => sum + s.count, 0) ?? 0,
    [data]
  );

  const RFMBadge = ({ score, max = 5 }: { score: number; max?: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-sm transition-all ${
            i < score ? "bg-primary" : "bg-stone-200"
          }`}
        />
      ))}
    </div>
  );

  const SegmentBadge = ({ segment }: { segment: string }) => {
    const config = SEGMENT_CONFIG[segment];
    if (!config) return <span className="text-xs text-stone-500">{segment}</span>;
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{
          backgroundColor: config.color + "18",
          color: config.color
        }}
      >
        <span className="material-symbols-outlined text-sm">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Phân loại & Theo dõi Học sinh" 
        description="Phân tích mức độ chuyên cần và hiệu quả học tập của học sinh"
      />

      <ErrorMessage message={error} />

      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-stone-500 font-medium">Đang phân tích dữ liệu học sinh...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Summary KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-xs text-stone-400 uppercase tracking-widest font-bold">Tổng học sinh</h3>
              <p className="text-3xl font-bold text-stone-900 mt-2">{totalStudents}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-xs text-stone-400 uppercase tracking-widest font-bold">Điểm trung bình hệ thống</h3>
              <p className="text-3xl font-bold text-stone-900 mt-2">
                {(data.segmentSummary.reduce((sum, s) => sum + (s.avgGrade || 0) * s.count, 0) / (totalStudents || 1)).toFixed(1)}
              </p>
            </div>
            <div className="bg-primary p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-xs text-white/70 uppercase tracking-widest font-bold">Phân khúc hoạt động</h3>
              <p className="text-3xl font-bold mt-2">
                {data.segmentSummary.filter((s) => s.count > 0).length}
              </p>
            </div>
          </section>

          {/* Segment Cards + Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2">
              <h2 className="text-lg font-bold text-stone-800 mb-4">Các nhóm học sinh</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.keys(SEGMENT_CONFIG).map((key) => {
                  const config = SEGMENT_CONFIG[key];
                  const summary = data.segmentSummary.find((s) => s.segment === key);
                  const count = summary?.count ?? 0;
                  const isActive = selectedSegment === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSegmentClick(key)}
                      className={`text-left p-4 rounded-xl transition-all border-2 ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-white hover:border-stone-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-lg" style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-xs font-bold" style={{ color: config.color }}>{config.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-stone-900">{count}</p>
                      <p className="text-[10px] text-stone-400 mt-1">{config.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-stone-800 mb-6 self-start">Tỷ lệ phân bổ</h2>
              <div className="w-56 h-56">
                {segmentChartData && (
                  <Doughnut
                    data={segmentChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "70%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { font: { size: 10, weight: 'bold' }, boxWidth: 10 }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Student Table */}
          <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-stone-800">Danh sách học sinh</h2>
                <p className="text-xs text-stone-400">
                  {selectedSegment ? `Đang xem: ${SEGMENT_CONFIG[selectedSegment]?.label}` : "Tất cả học sinh"}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-6 py-3">Học sinh</th>
                    <th className="px-4 py-3 text-center">Gần đây (R)</th>
                    <th className="px-4 py-3 text-center">Tần suất (F)</th>
                    <th className="px-4 py-3 text-center">Kết quả (M)</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3 text-center">Đã nộp</th>
                    <th className="px-4 py-3 text-center">Điểm TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(data.students?.data || data.customers?.data || []).map((student: any) => (
                    <tr key={student.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-stone-900">{student.fullName || "—"}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{student.email}</p>
                      </td>
                      <td className="px-4 py-4"><div className="flex justify-center"><RFMBadge score={student.rScore} /></div></td>
                      <td className="px-4 py-4"><div className="flex justify-center"><RFMBadge score={student.fScore} /></div></td>
                      <td className="px-4 py-4"><div className="flex justify-center"><RFMBadge score={student.mScore} /></div></td>
                      <td className="px-4 py-4"><SegmentBadge segment={student.segment} /></td>
                      <td className="px-4 py-4 text-center font-bold text-stone-600">{student.totalSubmissions || student.frequency || 0}</td>
                      <td className="px-4 py-4 text-center font-bold text-primary">{student.avgGrade || student.monetary / 1000000 || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
