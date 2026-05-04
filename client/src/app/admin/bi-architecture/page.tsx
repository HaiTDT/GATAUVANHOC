"use client";

import { useEffect, useState } from "react";

const BI_COMPONENTS = [
  {
    id: "sources",
    title: "1. Data Sources",
    icon: "database",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    items: ["PostgreSQL DB", "Product Catalog", "Order Transactions", "Customer Profiles"],
    desc: "Nguồn dữ liệu thô từ các hoạt động thực tế trên website TMĐT."
  },
  {
    id: "etl",
    title: "2. ETL Process",
    icon: "account_tree",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    items: ["Clean missing data", "Filter PAID status", "Calculate RFM Scores", "Time-series Aggregation"],
    desc: "Quá trình Trích xuất, Biến đổi và Nạp dữ liệu vào các cấu trúc phân tích."
  },
  {
    id: "warehouse",
    title: "3. Data Mart",
    icon: "storage",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    items: ["Revenue Mart", "Customer Segment Mart", "Inventory Snapshots"],
    desc: "Kho dữ liệu đã được tối ưu hóa cho việc truy vấn báo cáo và phân tích."
  },
  {
    id: "olap",
    title: "4. Analytics Engine",
    icon: "functions",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    items: ["Growth Rate Calc", "RFM Quintile Logic", "Sales Velocity Index"],
    desc: "Công cụ tính toán các chỉ số kinh doanh phức tạp (KPIs) dựa trên dữ liệu tổng hợp."
  },
  {
    id: "mining",
    title: "5. Advanced Analytics",
    icon: "psychology",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    items: ["Customer Behavior Trend", "Demand Forecasting", "Restock Optimization"],
    desc: "Phân tích nâng cao để tìm ra các quy luật ngầm và dự báo tương lai."
  },
  {
    id: "reporting",
    title: "6. BI Tools & Dashboard",
    icon: "monitoring",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    items: ["Revenue Dashboard", "CRM / RFM Report", "Marketing Performance"],
    desc: "Lớp hiển thị trực quan hóa dữ liệu giúp nhà quản lý ra quyết định nhanh chóng."
  }
];

export default function BIArchitecturePage() {
  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-headline text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
          BI Environment Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1">Sơ đồ và quy trình vận hành hệ thống Quản trị Thông minh (Business Intelligence)</p>
      </div>

      {/* Main Diagram Area */}
      <section className="bg-surface-container-lowest p-10 rounded-2xl organic-shadow border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[200px]">architecture</span>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BI_COMPONENTS.map((comp, idx) => (
            <div key={comp.id} className="flex flex-col h-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 ${comp.bgColor} ${comp.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{comp.icon}</span>
                </div>
                <h3 className="font-bold font-headline text-on-surface">{comp.title}</h3>
              </div>
              
              <div className="bg-surface-container-low rounded-xl p-5 flex-1 border border-transparent hover:border-primary/20 transition-all">
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{comp.desc}</p>
                <div className="space-y-2">
                  {comp.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-on-surface-variant bg-white/50 px-2 py-1 rounded">
                      <div className={`w-1 h-1 rounded-full ${comp.color.replace('text-', 'bg-')}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Connecting arrow (conceptual) */}
              {idx < BI_COMPONENTS.length - 1 && (
                <div className="hidden lg:block absolute pointer-events-none">
                   {/* Simplified visual cue for connection */}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Data Flow Summary */}
        <div className="mt-16 bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="text-lg font-bold font-headline text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">trending_flat</span>
            Quy trình luân chuyển dữ liệu thực tế
          </h3>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center">
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Giao dịch</p>
              <p className="text-xs font-bold text-on-surface">Website Sales</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 rotate-90 lg:rotate-0">arrow_forward</span>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Xử lý</p>
              <p className="text-xs font-bold text-on-surface">ETL & Clean</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 rotate-90 lg:rotate-0">arrow_forward</span>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Lưu trữ</p>
              <p className="text-xs font-bold text-on-surface">Analytical Data Mart</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 rotate-90 lg:rotate-0">arrow_forward</span>
            <div className="flex-1 bg-primary text-white p-4 rounded-xl shadow-md border border-primary">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">Quyết định</p>
              <p className="text-xs font-bold">Admin Dashboards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Explanation */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl organic-shadow">
          <h3 className="text-lg font-bold font-headline text-on-surface mb-4">Tại sao cần mô hình này?</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hệ thống TMĐT truyền thống thường chỉ quan tâm đến việc lưu trữ đơn hàng. Tuy nhiên, để phát triển bền vững, doanh nghiệp cần lớp **Business Intelligence** để biến dữ liệu thô thành thông tin có ý nghĩa. 
            <br/><br/>
            Mô hình 6 thành phần giúp đảm bảo dữ liệu được làm sạch (ETL), lưu trữ tập trung (Warehouse) và tính toán chính xác (Analytics Engine) trước khi hiển thị cho nhà quản lý.
          </p>
        </div>
        <div className="bg-surface-container-lowest p-8 rounded-2xl organic-shadow">
          <h3 className="text-lg font-bold font-headline text-on-surface mb-4">Lợi ích kinh tế</h3>
          <ul className="space-y-3">
            {[
              "Tối ưu chi phí Marketing nhờ phân khúc RFM.",
              "Giảm tồn kho đọng nhờ dự báo nhu cầu (Inventory Prediction).",
              "Tăng tỷ lệ khách hàng quay lại (Retention) thông qua phân tích hành vi.",
              "Phản ứng nhanh với biến động thị trường qua báo cáo Real-time."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
