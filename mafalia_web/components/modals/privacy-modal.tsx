"use client";
import * as React from "react";
import { Shield, Database, Globe, FileText, Lock, KeyRound, HardDrive } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/i18n";

interface PrivacyModalProps {
  open: boolean;
  language: Language;
  onClose: () => void;
}

const ITEMS = [
  {
    icon: KeyRound,
    title: "API keys stay in your browser",
    desc: "Stored in localStorage only. Never sent to Mafalia servers.",
  },
  {
    icon: HardDrive,
    title: "Files in your private workspace",
    desc: "Uploads go to a Supabase bucket scoped to your account, with row-level security.",
  },
  {
    icon: FileText,
    title: "Chat history",
    desc: "Stored locally per browser. Optional cloud sync to your authenticated account.",
  },
  {
    icon: Globe,
    title: "Network via your AI provider",
    desc: "Queries are sent directly to the provider you configure (OpenAI, OpenRouter, Anthropic, Ollama, etc.).",
  },
  {
    icon: Database,
    title: "Supabase Auth",
    desc: "We use Supabase for sign-in and per-user storage. No third-party tracking or analytics.",
  },
  {
    icon: Lock,
    title: "Sign out anytime",
    desc: "Signing out clears your session and revokes server access for this device.",
  },
];

export function PrivacyModal({ open, language, onClose }: PrivacyModalProps) {
  const t = translations[language || "en"];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-9 rounded-md flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <DialogTitle>{t.privacy}</DialogTitle>
            <DialogDescription>
              {language === "en"
                ? "How Mafalia treats your data"
                : language === "fr"
                ? "Comment Mafalia traite vos données"
                : "كيف تعالج مفاليا بياناتك"}
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="size-7 rounded-md flex items-center justify-center bg-secondary border border-border flex-shrink-0 mt-0.5">
                  <Icon className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold">{item.title}</p>
                  <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>
            {language === "en" ? "Got it" : language === "fr" ? "Compris" : "موافق"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
