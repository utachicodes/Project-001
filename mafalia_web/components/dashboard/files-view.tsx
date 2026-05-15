"use client";

import * as React from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  MoreVertical, 
  Download, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  FileCode,
  FileBox,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Language, translations } from "@/lib/i18n";

interface FilesViewProps {
  language: Language;
}

export function FilesView({ language }: FilesViewProps) {
  const t = translations[language || "en"];
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const files = [
    { id: 1, name: "Q4_Revenue_Forecast.xlsx", type: "excel", size: "2.4 MB", date: "2 hours ago", agent: "SANA" },
    { id: 2, name: "Market_Intelligence_Report.pdf", type: "pdf", size: "1.8 MB", date: "5 hours ago", agent: "LUNA" },
    { id: 3, name: "Customer_Segments_2025.csv", type: "csv", size: "850 KB", date: "Yesterday", agent: "OMAR" },
    { id: 4, name: "Automation_Workflow.json", type: "code", size: "12 KB", date: "2 days ago", agent: "RAVI" },
    { id: 5, name: "Brand_Identity_Brief.docx", type: "doc", size: "120 KB", date: "3 days ago", agent: "NALA" },
    { id: 6, name: "Operations_Audit.pdf", type: "pdf", size: "4.2 MB", date: "1 week ago", agent: "KOFI" },
  ];

  return (
    <div className="flex-1 h-full flex flex-col bg-[#F9F9F9] dark:bg-[#0A0A0A] overflow-hidden">
      
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-border bg-background/50 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">{t.filesManager}</h1>
            <p className="text-muted-foreground font-medium">{t.filesSubtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn("p-2 rounded-xl border transition-all", viewMode === "grid" ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border hover:bg-secondary")}
              aria-label={t.viewGrid}
            >
              <LayoutGrid className="size-4" aria-hidden="true" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn("p-2 rounded-xl border transition-all", viewMode === "list" ? "bg-primary text-white border-primary shadow-lg" : "bg-background border-border hover:bg-secondary")}
              aria-label={t.viewList}
            >
              <List className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={t.searchDocuments} 
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-[14px] outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-secondary text-[13px] font-bold transition-all">
            <Filter className="size-4" aria-hidden="true" />
            {t.filter}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-none">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
             <table className="w-full text-left text-[13px]">
               <thead className="bg-secondary/30 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                 <tr>
                   <th className="px-6 py-3">{t.name}</th>
                   <th className="px-6 py-3">{t.size}</th>
                   <th className="px-6 py-3">{t.modified}</th>
                   <th className="px-6 py-3">{t.agent}</th>
                   <th className="px-6 py-3 text-right">{t.actions}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {files.map((file) => (
                   <tr key={file.id} className="hover:bg-secondary/20 transition-colors group">
                     <td className="px-6 py-4 flex items-center gap-3 font-bold">
                       <FileText className="size-4 text-primary" />
                       {file.name}
                     </td>
                     <td className="px-6 py-4 text-muted-foreground font-medium">{file.size}</td>
                     <td className="px-6 py-4 text-muted-foreground font-medium">{file.date}</td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-black text-[9px]">
                          {file.agent}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <button className="p-1 rounded hover:bg-secondary">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: any }) {
  return (
    <div className="group p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all hover:shadow-xl cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="size-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
          <FileText className="size-6 text-primary" />
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-secondary transition-opacity">
          <MoreVertical className="size-4 text-muted-foreground" />
        </button>
      </div>
      
      <h3 className="text-[14px] font-bold truncate mb-1 pr-2" title={file.name}>{file.name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase">{file.size}</span>
        <span className="size-1 rounded-full bg-border" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase">{file.date}</span>
      </div>

      <div className="pt-4 border-t border-border/50 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <span className="px-2 py-0.5 rounded bg-secondary text-[9px] font-black text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
             {file.agent}
           </span>
         </div>
         <div className="flex items-center gap-2">
            <Download className="size-3.5 text-muted-foreground hover:text-foreground" />
            <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
         </div>
      </div>
    </div>
  );
}
