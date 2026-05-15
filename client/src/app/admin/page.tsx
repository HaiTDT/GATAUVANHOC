"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/ui";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { api } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type Dashboard = {
  overview: Array<{ label: string; value: number }>;
  recentSubmissions: Array<{
    id: string;
    createdAt: string;
    status: string;
    user: { fullName: string; email: string };
    assignment: { title: string };
  }>;
  submissionTrend: Array<{ date: string; submissions: number }>;
};

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAdminDashboard()
      .then(setDashboard)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Cannot load dashboard")
      );
  }, []);

  const chartData = dashboard && dashboard.submissionTrend ? {
    labels: dashboard.submissionTrend.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: "Số lượng bài nộp",
        data: dashboard.submissionTrend.map(d => d.submissions),
        borderColor: "#106A42",
        backgroundColor: "rgba(16, 106, 66, 0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#106A42",
        borderWidth: 3,
      }
    ]
  } : null;

  return (
    <div className="space-y-8">
      <ErrorMessage message={error} />
      {!dashboard ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboard.overview.map((item, index) => {
              const icons = ["group", "menu_book", "pending_actions", "task_alt"];
              const colors = ["text-blue-600", "text-purple-600", "text-orange-600", "text-emerald-600"];
              const bgColors = ["bg-blue-50", "bg-purple-50", "bg-orange-50", "bg-emerald-50"];
              
              return (
                <div key={item.label} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 ${bgColors[index]} rounded-xl flex items-center justify-center ${colors[index]} group-hover:scale-110 transition-transform duration-300`}>
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icons[index]}</span>
                    </div>
                  </div>
                  <h3 className="text-stone-500 text-sm font-medium tracking-wider">{item.label}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold font-headline text-stone-900">{item.value}</span>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-[480px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold font-headline text-primary">Biểu đồ nộp bài</h2>
                  <p className="text-xs text-stone-500 mt-1">Số lượng bài tập được nộp trong 7 ngày gần nhất</p>
                </div>
                <Link href="/admin/submissions" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
                  Xem tất cả
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
              <div className="flex-1 min-h-0">
                {chartData && (
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "#1e293b",
                          padding: 12,
                          cornerRadius: 8,
                        }
                      },
                      scales: {
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 }, color: "#64748b" }
                        },
                        y: {
                          grid: { color: "rgba(0,0,0,0.05)" },
                          ticks: { 
                            font: { size: 10 }, 
                            color: "#64748b",
                            stepSize: 1
                          }
                        }
                      }
                    }} 
                  />
                )}
              </div>
            </div>

            <div className="bg-primary p-8 rounded-2xl shadow-lg flex flex-col text-white relative overflow-hidden h-[480px]">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold font-headline mb-2 leading-tight">Hoạt động<br/>Gần đây</h2>
                
                <div className="mt-6 space-y-4">
                  {dashboard.recentSubmissions.slice(0, 4).map((sub) => (
                    <div className="flex items-center justify-between border-b border-white/10 pb-3" key={sub.id}>
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold truncate text-white">{sub.user.fullName}</p>
                        <p className="text-xs text-white/70 truncate mt-0.5">{sub.assignment.title}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap ${sub.status === 'GRADED' ? 'bg-emerald-500/20 text-emerald-100' : 'bg-orange-500/20 text-orange-100'}`}>
                        {sub.status === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            </div>
          </div>

          <section className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b border-stone-100">
              <h2 className="text-xl font-bold font-headline text-stone-900">Bài nộp mới nhất</h2>
              <Link className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline" href="/admin/submissions">
                Tất cả bài nộp
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </Link>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-500 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Học sinh</th>
                    <th className="px-8 py-4">Bài tập</th>
                    <th className="px-8 py-4">Thời gian</th>
                    <th className="px-8 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {dashboard.recentSubmissions.map((sub) => (
                    <tr className="hover:bg-stone-50 transition-colors" key={sub.id}>
                      <td className="px-8 py-5">
                        <p className="font-bold text-stone-900">{sub.user.fullName}</p>
                        <p className="text-[10px] text-stone-500 italic">{sub.user.email}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-medium text-stone-700">{sub.assignment.title}</span>
                      </td>
                      <td className="px-8 py-5 text-stone-600">
                        {new Date(sub.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'GRADED' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-600'}`}>
                          {sub.status === 'GRADED' ? 'Đã chấm' : 'Chờ chấm'}
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
