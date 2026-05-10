"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import { ErrorMessage } from "../../../components/ui";
import {
  api,
  formatPrice,
  type RevenueAnalytics
} from "../../../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "365d", label: "1 năm" }
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  PAID: "#3B82F6",
  PROCESSING: "#8B5CF6",
  SHIPPED: "#06B6D4",
  DELIVERED: "#10B981",
  COMPLETED: "#059669",
  CANCELLED: "#EF4444",
  REFUNDED: "#6B7280"
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền"
};

const CATEGORY_COLORS = [
  "#106A42", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#06B6D4", "#EC4899", "#10B981",
  "#F97316", "#6366F1", "#14B8A6", "#D946EF"
];

export default function RevenueDashboardPage() {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [period, setPeriod] = useState("30d");
  const [province, setProvince] = useState("");
  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch((err) => console.error("Failed to fetch provinces", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getRevenueAnalytics({ period, province })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu")
      )
      .finally(() => setLoading(false));
  }, [period, province]);

  const trendChartData = useMemo(() => {
    if (!data) return null;
    const labels = data.revenueTrend.map((p) => {
      const d = new Date(p.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu (₫)",
          data: data.revenueTrend.map((p) => Number(p.revenue)),
          borderColor: "#106A42",
          backgroundColor: "rgba(16, 106, 66, 0.08)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#106A42",
          borderWidth: 2.5
        }
      ]
    };
  }, [data]);

  const categoryChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.revenueByCategory.map((c) => c.categoryName),
      datasets: [
        {
          data: data.revenueByCategory.map((c) => Number(c.revenue)),
          backgroundColor: CATEGORY_COLORS.slice(
            0,
            data.revenueByCategory.length
          ),
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    };
  }, [data]);

  const brandChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.revenueByBrand.map((b) => b.brand),
      datasets: [
        {
          label: "Doanh thu (₫)",
          data: data.revenueByBrand.map((b) => Number(b.revenue)),
          backgroundColor: "rgba(16, 106, 66, 0.75)",
          borderRadius: 6,
          borderSkipped: false as const,
          barPercentage: 0.6
        }
      ]
    };
  }, [data]);

  const statusChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.orderStatusDistribution.map(
        (s) => STATUS_LABELS[s.status] ?? s.status
      ),
      datasets: [
        {
          data: data.orderStatusDistribution.map((s) => s.count),
          backgroundColor: data.orderStatusDistribution.map(
            (s) => STATUS_COLORS[s.status] ?? "#9CA3AF"
          ),
          borderWidth: 0,
          hoverOffset: 8
        }
      ]
    };
  }, [data]);

  const GrowthBadge = ({ value }: { value: number }) => {
    const positive = value >= 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
          positive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        <span className="material-symbols-outlined text-sm">
          {positive ? "trending_up" : "trending_down"}
        </span>
        {positive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitoring
            </span>
            Doanh thu & Tăng trưởng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phân tích chi tiết doanh thu, xu hướng và hiệu suất kinh doanh
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="px-4 py-2 pr-10 text-xs font-semibold rounded-lg bg-surface-container-low text-slate-600 appearance-none cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-2 focus:ring-primary/20 border-none w-full sm:w-48"
            >
              <option value="">Tất cả Tỉnh/Thành phố</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">
              expand_more
            </span>
          </div>

          <div className="flex bg-surface-container-low rounded-xl p-1 gap-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  period === opt.value
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:bg-surface-container-high"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    payments
                  </span>
                </div>
                <GrowthBadge value={data.summary.growthRate} />
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Doanh thu kỳ hiện tại
              </h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-1">
                {formatPrice(data.summary.currentRevenue)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Kỳ trước: {formatPrice(data.summary.previousRevenue)}
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-7xl">trending_up</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    shopping_bag
                  </span>
                </div>
                <GrowthBadge value={data.summary.orderGrowthRate} />
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Tổng đơn hàng
              </h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-1">
                {data.summary.totalOrders}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Kỳ trước: {data.summary.previousOrders}
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-7xl">receipt_long</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    groups
                  </span>
                </div>
                <GrowthBadge value={data.summary.customerGrowthRate} />
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Tổng khách hàng
              </h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-1">
                {data.summary.totalCustomers}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Kỳ trước: {data.summary.previousCustomers}
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-7xl">people</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow relative overflow-hidden group">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    avg_pace
                  </span>
                </div>
              </div>
              <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                Giá trị đơn TB (AOV)
              </h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-1">
                {formatPrice(data.summary.averageOrderValue)}
              </p>
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <span className="material-symbols-outlined text-7xl">calculate</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-emerald-700 p-6 rounded-xl shadow-lg relative overflow-hidden group text-white">
              <div className="flex justify-between items-start mb-3">
                <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span
                    className="material-symbols-outlined text-2xl text-white"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    speed
                  </span>
                </div>
              </div>
              <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Tăng trưởng
              </h3>
              <p className="text-2xl font-bold font-headline mt-1">
                {data.summary.growthRate >= 0 ? "+" : ""}
                {data.summary.growthRate.toFixed(1)}%
              </p>
              <p className="text-[10px] text-white/50 mt-1">
                So với kỳ trước
              </p>
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            </div>
          </section>

          {/* Revenue Trend */}
          <section className="bg-surface-container-lowest p-8 rounded-xl organic-shadow">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold font-headline text-on-surface">
                  Xu hướng Doanh thu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biến động doanh thu theo ngày
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
              >
                Xem đơn hàng
                <span className="material-symbols-outlined text-sm">
                  open_in_new
                </span>
              </Link>
            </div>
            <div className="h-[340px]">
              {trendChartData && (
                <Line
                  data={trendChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: "#1e293b",
                        cornerRadius: 8,
                        padding: 12,
                        titleFont: { size: 12 },
                        bodyFont: { size: 13 },
                        callbacks: {
                          label: (ctx) =>
                            `Doanh thu: ${formatPrice(ctx.parsed.y ?? 0)}`
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: "#94a3b8" }
                      },
                      y: {
                        grid: { color: "rgba(0,0,0,0.04)" },
                        ticks: {
                          font: { size: 10 },
                          color: "#94a3b8",
                          callback: (v) =>
                            formatPrice(Number(v)).replace("₫", "")
                        }
                      }
                    },
                    interaction: {
                      intersect: false,
                      mode: "index" as const
                    }
                  }}
                />
              )}
            </div>
          </section>

          {/* Category & Brand breakdown */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue by Category */}
            <section className="bg-surface-container-lowest p-8 rounded-xl organic-shadow">
              <h2 className="text-lg font-bold font-headline text-on-surface mb-1">
                Doanh thu theo Danh mục
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Phân bố doanh thu theo nhóm sản phẩm
              </p>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-56 h-56">
                  {categoryChartData && (
                    <Doughnut
                      data={categoryChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: "65%",
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) =>
                                `${ctx.label}: ${formatPrice(ctx.parsed ?? 0)}`
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-0">
                  {data.revenueByCategory.slice(0, 6).map((cat, i) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center gap-3 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                        }}
                      />
                      <span className="truncate flex-1 text-slate-700">
                        {cat.categoryName}
                      </span>
                      <span className="font-semibold text-on-surface text-xs whitespace-nowrap">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Revenue by Brand */}
            <section className="bg-surface-container-lowest p-8 rounded-xl organic-shadow">
              <h2 className="text-lg font-bold font-headline text-on-surface mb-1">
                Top Thương hiệu
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Top 10 thương hiệu theo doanh thu
              </p>
              <div className="h-[280px]">
                {brandChartData && (
                  <Bar
                    data={brandChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: "y" as const,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) =>
                              `Doanh thu: ${formatPrice(ctx.parsed.x ?? 0)}`
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: { color: "rgba(0,0,0,0.04)" },
                          ticks: {
                            font: { size: 10 },
                            color: "#94a3b8",
                            callback: (v) =>
                              formatPrice(Number(v)).replace("₫", "")
                          }
                        },
                        y: {
                          grid: { display: false },
                          ticks: { font: { size: 11 }, color: "#475569" }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </section>
          </div>

          {/* Order Status Distribution */}
          <section className="bg-surface-container-lowest p-8 rounded-xl organic-shadow">
            <h2 className="text-lg font-bold font-headline text-on-surface mb-1">
              Phân bố Trạng thái Đơn hàng
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Tổng hợp trạng thái đơn hàng trong kỳ
            </p>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-52 h-52">
                {statusChartData && (
                  <Doughnut
                    data={statusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "60%",
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data.orderStatusDistribution.map((s) => (
                  <div
                    key={s.status}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          STATUS_COLORS[s.status] ?? "#9CA3AF"
                      }}
                    />
                    <span className="text-slate-600">
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    <span className="font-bold text-on-surface ml-auto">
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
