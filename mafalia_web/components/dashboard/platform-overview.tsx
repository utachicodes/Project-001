"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Search, 
  Clock, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, translations } from "@/lib/i18n";
import type { KpiData } from "@/lib/metrics-fetch";
import Image from "next/image";

interface PlatformOverviewProps {
  language: Language;
  kpiData: KpiData | null;
  onNavigateToFiles: () => void;
  onNavigateToChat: () => void;
}

export function PlatformOverview({ 
  language, 
  kpiData,
  onNavigateToFiles,
  onNavigateToChat 
}: PlatformOverviewProps) {
  const t = translations[language || "en"];

  const recentFiles = [
    { name: "Annual Financial Report 2025.xlsx", size: "213KB", type: "excel" },
    { name: "Market Research Q4.pdf", size: "1.2MB", type: "pdf" },
    { name: "Agent Configuration.json", size: "45KB", type: "code" },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F9F9F9] dark:bg-[#0A0A0A] p-8 scrollbar-none">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-foreground">Intelligence Platform</h1>
            <p className="text-muted-foreground font-medium">Control center for your AI operations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">System Live</span>
            </div>
          </div>
        </div>

        {/* Intelligence Layer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={TrendingUp} 
            label="Revenue Growth" 
            value={kpiData?.revenue.value || "$0.00"} 
            trend="+12.5%" 
            color="primary"
          />
          <StatCard 
            icon={Database} 
            label="Data Processed" 
            value="1.2 TB" 
            trend="+5.2%" 
            color="blue"
          />
          <StatCard 
            icon={ShieldCheck} 
            label="Security Guard" 
            value="Active" 
            subValue="3 Layers" 
            color="emerald"
          />
        </div>

        {/* Recent Activity & Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Files Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-tight">Recent Data</h2>
              <button 
                onClick={onNavigateToFiles}
                className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recentFiles.map((file, i) => (
                <div 
                  key={i}
                  className="group p-4 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                >
                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                    <FileText className="size-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <p className="text-[13px] font-bold truncate mb-1">{file.name}</p>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase">{file.size}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Intelligence Monitor Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-bold tracking-tight">Intelligence Monitor</h2>
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-primary animate-pulse" />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
              <div className="p-4 space-y-4">
                <LogEntry agent="SANA" action="Analyzing Q4 Revenue" time="2m ago" />
                <LogEntry agent="RAVI" action="Optimizing Workflow" time="15m ago" />
                <LogEntry agent="IDRIS" action="Inventory Check" time="45m ago" />
              </div>
              <div className="bg-secondary/30 p-3 border-t border-border flex justify-center">
                <button className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
                  View Full Trace
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* Quick Commands Bar */}
        <div className="p-6 rounded-2xl bg-primary text-primary-foreground shadow-xl relative overflow-hidden group cursor-pointer" onClick={onNavigateToChat}>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-bold mb-1">Open Intelligence Command</h3>
              <p className="opacity-80 text-[14px]">Communicate with your 11 specialized agents directly.</p>
            </div>
            <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
              <Search className="size-6" />
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute -right-10 -bottom-10 size-40 bg-white/10 rounded-full blur-3xl" />
        </div>

      </div>
    </div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  subValue, 
  color 
}: { 
  icon: any, 
  label: string, 
  value: string, 
  trend?: string, 
  subValue?: string,
  color: "primary" | "blue" | "emerald"
}) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10"
  };

  return (
    <div className="p-5 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("size-10 rounded-xl flex items-center justify-center", colorMap[color])}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-[24px] font-bold tabular-nums tracking-tight">{value}</h3>
        {subValue && <span className="text-[13px] font-medium text-muted-foreground">{subValue}</span>}
      </div>
    </div>
  );
}

function LogEntry({ agent, action, time }: { agent: string, action: string, time: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-black text-primary tracking-tighter">
          {agent}
        </div>
        <span className="text-[13px] font-medium text-foreground">{action}</span>
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums font-medium">{time}</span>
    </div>
  );
}
