"use client";
import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  Slash,
  BarChart3,
  TrendingUp,
  Wand2,
  Compass,
  Paperclip,
  Crown,
  Cpu,
  X,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { Message } from "@/lib/types";
import { Markdown } from "./markdown";
import { uploadFile, type UploadedFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { label: "Business Health", cmd: "/summary", icon: BarChart3 },
  { label: "Revenue Pulse", cmd: "/analyze revenue", icon: TrendingUp },
  { label: "Campaign Forge", cmd: "/create campaign", icon: Wand2 },
  { label: "Market Intel", cmd: "/research trends", icon: Compass },
  { label: "Growth Oracle", cmd: "/predict growth", icon: TrendingUp },
  { label: "Boss View", cmd: "/boss", icon: Crown },
];

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  currentModel?: string;
  userId?: string;
  pendingInput?: string;
  onSendMessage: (content: string, attachments?: UploadedFile[]) => void;
  onCommandPaletteOpen: () => void;
  onPendingInputConsumed?: () => void;
}

export function ChatArea({
  messages,
  isLoading,
  currentModel,
  userId,
  pendingInput,
  onSendMessage,
  onCommandPaletteOpen,
  onPendingInputConsumed,
}: ChatAreaProps) {
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isWelcome =
    messages.length === 0 || (messages.length === 1 && !messages[0].content);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (pendingInput) {
      setInput(pendingInput + " ");
      onPendingInputConsumed?.();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingInput]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(input, attachments.length > 0 ? attachments : undefined);
    setInput("");
    setAttachments([]);
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val === "/" && input === "") {
      onCommandPaletteOpen();
      return;
    }
    setInput(val);
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!userId) {
      alert("Sign in required to upload files.");
      return;
    }
    setUploading(true);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          alert(`${file.name} exceeds 20 MB limit.`);
          continue;
        }
        const result = await uploadFile(file, userId);
        uploaded.push(result);
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        "flex-1 flex flex-col h-full relative overflow-hidden bg-background transition-colors",
        dragOver && "bg-primary/5",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm pointer-events-none">
          <div className="rounded-2xl border-2 border-dashed border-primary px-10 py-8 text-center bg-card shadow-xl">
            <Paperclip className="mx-auto size-8 text-primary mb-3" />
            <p className="text-[15px] font-bold text-foreground">Drop files to upload</p>
            <p className="text-[12px] text-muted-foreground mt-1">
              Stored in your Mafalia workspace (max 20 MB each)
            </p>
          </div>
        </div>
      )}

      {/* Active model badge */}
      <AnimatePresence>
        {currentModel && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute top-5 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border shadow-md">
              <Cpu className="size-3.5 text-primary" />
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-foreground">
                {currentModel.split("/").pop()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-6 py-10 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {isWelcome ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center justify-center min-h-[60vh] pt-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", damping: 22 }}
                className="mb-5"
              >
                <div className="size-[88px] rounded-2xl border border-border shadow-sm flex items-center justify-center bg-background">
                  <Image
                    src="/mafalia-logo.png"
                    alt="Mafalia"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-[30px] font-bold mb-1.5 tracking-tight text-center text-foreground"
              >
                Mafalia <span className="text-primary">Intelligence</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="text-muted-foreground text-[14px] mb-8 max-w-lg text-center leading-relaxed"
              >
                Orchestrate 10 specialized agents to analyze business data, predict trends, and
                automate operations across West Africa.
              </motion.p>

              <div className="grid grid-cols-3 gap-2.5 w-full max-w-[560px]">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.cmd}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, type: "spring", damping: 26 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSendMessage(action.cmd)}
                      className="flex flex-col items-center gap-2.5 px-3 py-4 rounded-xl border border-border bg-background hover:border-primary/40 hover:shadow-md hover:bg-secondary/40 transition-all cursor-pointer"
                    >
                      <div className="size-9 rounded-lg flex items-center justify-center bg-primary/8 border border-primary/15">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <span className="text-[11.5px] font-semibold text-foreground text-center leading-tight">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6 pb-8">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="size-7 rounded-lg flex items-center justify-center bg-secondary border border-border">
                      <Sparkles className="size-3.5 text-primary animate-pulse-soft" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-background border border-border shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="px-6 py-4 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {attachments.map((a) => (
                <div
                  key={a.path}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-[12px]"
                >
                  <FileText className="size-3.5 text-primary" />
                  <span className="font-medium truncate max-w-[180px]">{a.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {(a.size / 1024).toFixed(0)}KB
                  </span>
                  <button
                    onClick={() => setAttachments((prev) => prev.filter((x) => x.path !== a.path))}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove attachment"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl overflow-hidden border border-border bg-background focus-within:border-primary/50 transition-colors shadow-sm">
            <div className="flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Execute command or ask anything…"
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-[14px] font-medium px-4 py-3.5 resize-none outline-none leading-relaxed"
                style={{ minHeight: "52px", maxHeight: "160px" }}
                rows={1}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0) || isLoading}
                className="mr-2.5 mb-2.5 size-9 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 bg-primary text-white shadow-sm hover:bg-primary/90 hover:shadow-md"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 px-2.5 pb-2.5 pt-0 border-t border-border/50">
              <Chip
                icon={Paperclip}
                label={uploading ? "Uploading…" : "Attach"}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              />
              <Chip icon={Slash} label="Actions" onClick={onCommandPaletteOpen} />
              <div className="flex-1" />
              <span className="text-[10px] font-bold text-muted-foreground tabular-nums select-none px-2">
                {input.length > 0 ? input.length : ""}
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          <p className="mt-2 text-center text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.2em] select-none">
            Mafalia Intelligence Platform
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const tagShort = msg.agentTag?.replace("[", "").replace("]", "") || "MAFALIA";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-end"
      >
        <div className="flex items-center gap-2 mb-1.5 px-1">
          <span className="text-[10px] text-muted-foreground tabular-nums">{time}</span>
          <span className="text-[11.5px] font-bold text-foreground">You</span>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] bg-primary text-primary-foreground shadow-sm">
          <p className="text-[14px] leading-relaxed">{msg.content}</p>
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {msg.attachments.map((a) => (
                <span
                  key={a.url}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/20 text-[11px] font-medium"
                >
                  <FileText className="size-3" />
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-start"
    >
      <div className="flex items-center gap-2.5 mb-1.5 px-1">
        <div className="size-6 rounded-lg flex items-center justify-center bg-primary/8 border border-primary/20">
          {msg.agentTag === "[MAF]" || !msg.agentTag ? (
            <Sparkles className="size-3 text-primary" />
          ) : (
            <span className="text-[9.5px] font-bold text-primary">{msg.agentTag.slice(1, 4)}</span>
          )}
        </div>
        <span className="text-[12px] font-bold text-primary">{tagShort}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">{time}</span>
      </div>
      <div className="px-5 py-4 rounded-2xl rounded-tl-sm max-w-[92%] bg-background border border-border border-l-[3px] border-l-primary shadow-sm">
        <div className="text-[14px] text-foreground leading-relaxed">
          <Markdown content={msg.content} />
        </div>
      </div>
    </motion.div>
  );
}

function Chip({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-[11.5px] font-semibold border border-transparent hover:border-border disabled:opacity-50"
    >
      <Icon className="size-3.5 opacity-70" />
      <span>{label}</span>
    </button>
  );
}
