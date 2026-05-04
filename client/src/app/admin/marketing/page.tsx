"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { ErrorMessage } from "../../../components/ui";
import { api, formatPrice } from "../../../lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CHANNEL_CONFIG: Record<string, { color: string; icon: string }> = {
  "Facebook Ads": { color: "#1877F2", icon: "facebook" },
  "Google Search": { color: "#EA4335", icon: "search" },
  "TikTok Ads": { color: "#000000", icon: "music_note" },
};

export default function MarketingDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getMarketingAnalytics()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : "Cannot load marketing data"))
      .finally(() => setLoading(false));
  }, []);

  const channelChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.channels.map((c: any) => c.channel),
      datasets: [
        {
          label: "Chi phí (₫)",
          data: data.channels.map((c: any) => c.spend),
          backgroundColor: "rgba(16, 106, 66, 0.2)",
          borderColor: "#106A42",
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: "Doanh thu (₫)",
          data: data.channels.map((c: any) => c.revenue),
          backgroundColor: "#106A42",
          borderColor: "#106A42",
          borderWidth: 1,
          borderRadius: 8,
        }
      ]
    };
  }, [data]);

  const roasChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.channels.map((c: any) => c.channel),
      datasets: [
        {
          data: data.channels.map((c: any) => (c.revenue / c.spend).toFixed(2)),
          backgroundColor: data.channels.map((c: any) => CHANNEL_CONFIG[c.channel]?.color || "#9CA3AF"),
          borderWidth: 0,
          hoverOffset: 10
        }
      ]
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            Marketing Performance
          </h1>
          <p className="text-sm text-slate-500 mt-1">Hiệu quả quảng cáo và tỷ lệ chuyển đổi trong 30 ngày qua</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {data && (
        <>
          {/* KPI Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Chi phí quảng cáo</h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-2">{formatPrice(data.summary.spend)}</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tỷ lệ chuyển đổi (CR)</h3>
              <p className="text-2xl font-bold font-headline text-emerald-600 mt-2">{data.summary.conversionRate}%</p>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl organic-shadow">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider font-medium">Chi phí / KH (CAC)</h3>
              <p className="text-2xl font-bold font-headline text-on-surface mt-2">{formatPrice(data.summary.cac)}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-xl shadow-lg text-white">
              <h3 className="text-xs text-white/70 uppercase tracking-wider font-medium">Chỉ số ROAS</h3>
              <p className="text-2xl font-bold font-headline mt-2">{data.summary.roas}x</p>
              <p className="text-[10px] text-white/50 mt-1">Doanh thu / Chi phí</p>
            </div>
          </section>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl organic-shadow">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6">So sánh Chi phí & Doanh thu theo kênh</h3>
              <div className="h-[300px]">
                {channelChartData && (
                  <Bar 
                    data={channelChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                      scales: {
                        y: { 
                          ticks: { callback: (v) => formatPrice(v as number).replace('₫', '') }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </section>

            <section className="bg-surface-container-lowest p-8 rounded-xl organic-shadow flex flex-col">
              <h3 className="text-lg font-bold font-headline text-on-surface mb-6">Tỷ trọng ROAS theo kênh</h3>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-56 h-56">
                  {roasChartData && <Doughnut data={roasChartData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />}
                </div>
              </div>
            </section>
          </div>

          {/* Channel Table */}
          <section className="bg-surface-container-lowest rounded-xl organic-shadow overflow-hidden border border-outline-variant/30">
            <div className="px-8 py-5 border-b border-surface-container">
              <h3 className="text-lg font-bold font-headline text-on-surface">Chi tiết hiệu suất kênh</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Kênh quảng cáo</th>
                    <th className="px-8 py-4 text-right">Chi phí</th>
                    <th className="px-8 py-4 text-right">Doanh thu</th>
                    <th className="px-8 py-4 text-center">Conversions</th>
                    <th className="px-8 py-4 text-center">ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-sm">
                  {data.channels.map((c: any) => (
                    <tr key={c.channel} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: CHANNEL_CONFIG[c.channel]?.color }}>
                            <span className="material-symbols-outlined text-lg">{CHANNEL_CONFIG[c.channel]?.icon}</span>
                          </div>
                          <span className="font-bold">{c.channel}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-medium text-slate-600">{formatPrice(c.spend)}</td>
                      <td className="px-8 py-5 text-right font-bold text-on-surface">{formatPrice(c.revenue)}</td>
                      <td className="px-8 py-5 text-center font-mono">{c.conversions}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          {(c.revenue / c.spend).toFixed(2)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
