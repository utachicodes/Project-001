"use client";
import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  Mic,
  MicOff,
  type LucideIcon,
} from "lucide-react";
import type { Message } from "@/lib/types";
import { Markdown } from "./markdown";
import { uploadFile, type UploadedFile } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";
import { translations, type Language } from "@/lib/i18n";
import { voiceService, type VoiceLanguage } from "@/lib/voice";
import { VocalVisualizer } from "./vocal-visualizer";

const getQuickActions = (lang: Language) => {
  const t = translations[lang];
  return [
    { label: t.bizHealth, cmd: "/summary", icon: BarChart3 },
    { label: t.revPulse, cmd: "/analyze revenue", icon: TrendingUp },
    { label: t.campForge, cmd: "/create campaign", icon: Wand2 },
    { label: t.marketIntel, cmd: "/research trends", icon: Compass },
    { label: t.growthOracle, cmd: "/predict growth", icon: TrendingUp },
    { label: t.bossView, cmd: "/boss", icon: Crown },
  ];
};

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  currentModel?: string;
  userId?: string;
  pendingInput?: string;
  onSendMessage: (content: string, attachments?: UploadedFile[]) => void;
  onCommandPaletteOpen: () => void;
  onPendingInputConsumed?: () => void;
  language: Language;
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
  language,
}: ChatAreaProps) {
  const t = translations[language || "en"];
  const [input, setInput] = React.useState("");
  const [attachments, setAttachments] = React.useState<UploadedFile[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isVocalMode, setIsVocalMode] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const isWelcome =
    messages.length === 0 || (messages.length === 1 && !messages[0].content);

  // Sync voice language with app language
  const getVoiceLang = (lang: Language): VoiceLanguage => {
    switch (lang) {
      case "fr": return "fr-FR";
      case "ar": return "ar-SA";
      default: return "en-US";
    }
  };

  // Speak AI response if vocal mode is on
  React.useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (isVocalMode && lastMsg && lastMsg.role === "assistant" && !isLoading) {
      setIsSpeaking(true);
      voiceService.speak(lastMsg.content, getVoiceLang(language), () => {
        setIsSpeaking(false);
        // Automatically start listening again after speaking
        if (isVocalMode) startVoiceRecording();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, isVocalMode]);

  const startVoiceRecording = () => {
    if (!voiceService.isSupported()) {
      console.warn("Speech recognition not supported");
      toast.error(language === "en" ? "Speech recognition is not supported in your browser." : "La reconnaissance vocale n'est pas supportée par votre navigateur.");
      setIsVocalMode(false);
      return;
    }
    console.log("Starting voice recording...");
    setIsListening(true);
    voiceService.startListening(
      getVoiceLang(language),
      (result) => {
        console.log("Voice Result:", result);
        setInput(result.transcript);
        if (result.isFinal) {
          console.log("Final Transcript:", result.transcript);
          setIsListening(false);
          // Wait a bit before sending to let the user see the result
          setTimeout(() => {
            onSendMessage(result.transcript);
            setInput("");
          }, 500);
        }
      },
      () => {
        console.log("Voice listening ended");
        setIsListening(false);
      },
      (error) => {
        console.error("Voice Error:", error);
        setIsListening(false);
        if (error === 'not-allowed') {
          toast.error(language === "en" ? "Microphone access denied." : "Accès au microphone refusé.");
        }
      }
    );
  };

  const toggleVocalMode = () => {
    const next = !isVocalMode;
    setIsVocalMode(next);
    if (next) {
      toast.info(language === "en" ? "Vocal mode enabled. I'm listening..." : "Mode vocal activé. Je vous écoute...");
      startVoiceRecording();
    } else {
      voiceService.stopListening();
      voiceService.stopSpeaking();
      setIsListening(false);
      setIsSpeaking(false);
    }
  };

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
        "flex-1 flex flex-col h-full relative overflow-hidden bg-[#F9F9F9] dark:bg-[#0A0A0A] transition-colors",
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
          <div className="rounded-[32px] border-2 border-dashed border-primary px-12 py-10 text-center bg-card shadow-2xl">
            <Paperclip className="mx-auto size-10 text-primary mb-4" />
            <p className="text-[18px] font-bold text-foreground">Drop data to ingest</p>
            <p className="text-[13px] text-muted-foreground mt-2">
              Processing via Intelligence Layer (max 20 MB)
            </p>
          </div>
        </div>
      )}

      {/* Top Header - Platform Status */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-center px-6 z-20 pointer-events-none">
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md border border-border px-4 py-1.5 rounded-full shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {currentModel ? currentModel.split("/").pop() : "Intelligence Core"}
            </span>
          </div>
          {(isListening || isSpeaking) && (
            <>
              <div className="w-[1px] h-3 bg-border" />
              <VocalVisualizer isListening={isListening} isSpeaking={isSpeaking} />
            </>
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto pt-24 pb-40 px-6 scrollbar-none">
        <div className="max-w-4xl mx-auto">
          {isWelcome ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[50vh]"
            >
              <div className="size-20 bg-primary/10 rounded-[28px] flex items-center justify-center mb-8 border border-primary/20">
                <Sparkles className="size-10 text-primary" />
              </div>
              <h2 className="text-[28px] font-bold tracking-tight mb-3">Intelligence Command</h2>
              <p className="text-muted-foreground text-[15px] mb-12 max-w-md text-center font-medium">
                Execute complex business logic through our modular agent network.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {getQuickActions(language).slice(0, 4).map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.cmd}
                      onClick={() => onSendMessage(action.cmd)}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-lg transition-all group text-left"
                    >
                      <div className="size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon className="size-5 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-foreground">{action.label}</p>
                        <p className="text-[12px] font-medium text-muted-foreground opacity-70">Execute platform command</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-4">
                   <div className="size-10 rounded-xl bg-secondary animate-pulse" />
                   <div className="space-y-2 pt-2">
                     <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
                     <div className="h-4 w-32 bg-secondary rounded animate-pulse opacity-60" />
                   </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-8 inset-x-0 px-6 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="bg-background/90 backdrop-blur-xl rounded-[28px] border border-border shadow-2xl overflow-hidden focus-within:border-primary/40 transition-all">
            
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-4">
                {attachments.map((a) => (
                  <div key={a.path} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-[12px] font-bold">
                    <FileText className="size-3.5 text-primary" />
                    <span className="truncate max-w-[120px]">{a.name}</span>
                    <button onClick={() => setAttachments(prev => prev.filter(x => x.path !== a.path))} className="hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end px-2 py-2">
              <div className="flex-1 flex flex-col">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask the intelligence core..."
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground/60 text-[15px] font-medium px-4 py-3 resize-none outline-none leading-relaxed"
                  style={{ minHeight: "52px", maxHeight: "160px" }}
                  rows={1}
                />
              </div>
              <div className="flex items-center gap-1.5 pb-2 pr-2">
                 <InputToolBtn icon={Paperclip} onClick={() => fileInputRef.current?.click()} active={uploading} />
                 <InputToolBtn icon={Slash} onClick={onCommandPaletteOpen} />
                 <InputToolBtn icon={isVocalMode ? Mic : MicOff} onClick={toggleVocalMode} active={isVocalMode} />
                 <div className="w-[1px] h-6 bg-border mx-1" />
                 <button
                   onClick={handleSubmit}
                   disabled={(!input.trim() && attachments.length === 0) || isLoading}
                   className="size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                 >
                   <Send className="size-4" />
                 </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-4 select-none">
            Authorized Intelligence Access Only
          </p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
    </div>
  );
}

function InputToolBtn({ icon: Icon, onClick, active }: { icon: any, onClick: () => void, active?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "size-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all",
        active && "text-primary bg-primary/10"
      )}
    >
      <Icon className="size-4.5" />
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-6", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar / Icon */}
      <div className={cn(
        "size-10 rounded-2xl flex items-center justify-center flex-shrink-0 border",
        isUser ? "bg-background border-border" : "bg-primary/10 border-primary/20"
      )}>
        {isUser ? (
          <span className="text-[14px] font-bold text-foreground">U</span>
        ) : (
          <Sparkles className="size-5 text-primary" />
        )}
      </div>

      <div className={cn("flex flex-col space-y-2", isUser ? "items-end" : "items-start")}>
        <div className="flex items-center gap-3">
          {!isUser && (
             <span className="text-[11px] font-black text-primary uppercase tracking-tighter bg-primary/10 px-1.5 py-0.5 rounded">
               {msg.agentTag?.replace("[", "").replace("]", "") || "INTEL"}
             </span>
          )}
          <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className={cn(
          "max-w-[85%] text-[15px] leading-relaxed font-medium",
          isUser ? "text-foreground bg-white dark:bg-white/5 px-5 py-4 rounded-[24px] rounded-tr-none border border-border" : "text-foreground"
        )}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <Markdown content={msg.content} />
          )}

          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {msg.attachments.map((a) => (
                <div key={a.url} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-[12px] font-bold">
                  <FileText className="size-4 text-primary" />
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
