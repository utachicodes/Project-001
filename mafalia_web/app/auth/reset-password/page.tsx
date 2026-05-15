"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loadConfig } from "@/lib/config-store";
import { translations, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Fustat, Inter } from "next/font/google";

const fustat = Fustat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const VideoBackground = () => {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-[#f8f8f8]">
      <video
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-1/2 -translate-x-1/2 object-cover object-top pointer-events-none opacity-50"
        style={{ width: "115%", height: "115%" }}
      />
    </div>
  );
};

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<Language>("en");

  React.useEffect(() => {
    const cfg = loadConfig();
    if (cfg?.language) setLang(cfg.language);
  }, []);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} className={`min-h-screen flex flex-col relative overflow-hidden px-4 md:px-[120px] pt-8 ${inter.className}`}>
      <VideoBackground />

      <nav className="w-full mb-12 relative z-20">
        <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-medium text-black hover:opacity-70 transition-opacity">
          <ChevronLeft className={cn("w-4 h-4", lang === "ar" && "rotate-180")} />
          {t.backToLogin}
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] flex flex-col items-center"
        >
          <div className="mb-6">
            <Image src="/mafalia-logo.png" alt="Mafalia" width={64} height={64} className="object-contain" />
          </div>

          <h1 className={`${fustat.className} text-[40px] font-bold tracking-[-2.4px] text-[#000000] mb-2 leading-tight text-center`}>
            {t.resetPassword}
          </h1>
          <p className={`${fustat.className} text-[18px] tracking-[-0.4px] text-[#505050] mb-8 text-center`}>
            {lang === "en" ? "Enter your new password below." : lang === "fr" ? "Entrez votre nouveau mot de passe." : "أدخل كلمة المرور الجديدة أدناه."}
          </p>

          <div className="w-full rounded-[18px] bg-[rgba(0,0,0,0.24)] backdrop-blur-md p-6 shadow-2xl border border-white/10">
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="size-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-7 text-emerald-400" />
                </div>
                <h2 className={`${fustat.className} text-[20px] font-bold text-white mb-2`}>{t.passwordUpdated}</h2>
                <Link href="/login" className="mt-6 inline-flex items-center gap-2 h-[48px] px-8 rounded-[12px] bg-black text-white font-medium hover:bg-gray-800 transition-colors">
                  {t.login}
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[13px] font-medium text-gray-200 ml-1">
                    {t.newPassword}
                  </label>
                  <div className="relative group bg-white rounded-[12px] p-1 flex items-center shadow-inner">
                    <Lock className={cn("absolute size-4.5 text-gray-400 group-focus-within:text-black transition-colors", lang === "ar" ? "right-4" : "left-4")} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "w-full h-[44px] bg-transparent text-[16px] text-black placeholder:text-[rgba(0,0,0,0.6)] focus:outline-none",
                        lang === "ar" ? "pr-10 pl-12" : "pl-10 pr-12"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? t.hidePassword : t.showPassword}
                      className={cn("absolute text-gray-400 hover:text-black transition-colors p-2", lang === "ar" ? "left-2" : "right-2")}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[13px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="w-full h-[48px] relative flex items-center justify-center rounded-[12px] bg-black text-[15px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t.updatePassword}
                      <ArrowRight className={cn("ml-2 size-4", lang === "ar" && "rotate-180 mr-2 ml-0")} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
