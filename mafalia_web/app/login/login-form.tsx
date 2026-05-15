"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadConfig } from "@/lib/config-store";
import { translations, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Fustat, Inter } from "next/font/google";

const fustat = Fustat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// Custom Video Component identical to the landing page
const VideoBackground = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [currentOpacity, setCurrentOpacity] = React.useState(0);
  const opacityRef = React.useRef(0);
  const fadingOutRef = React.useRef(false);
  const animationFrameRef = React.useRef<number>();

  const updateOpacity = (val: number) => {
    opacityRef.current = val;
    setCurrentOpacity(val);
  };

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const cancelFade = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const animateFade = (
      targetOpacity: number,
      duration: number,
      callback?: () => void
    ) => {
      cancelFade();
      const startOpacity = opacityRef.current;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
        updateOpacity(newOpacity);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step);
        } else {
          if (callback) callback();
        }
      };
      animationFrameRef.current = requestAnimationFrame(step);
    };

    const handleLoadedData = () => {
      fadingOutRef.current = false;
      animateFade(1, 250);
    };

    const handleTimeUpdate = () => {
      if (!video) return;
      const timeLeft = video.duration - video.currentTime;
      if (timeLeft <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        animateFade(0, 250);
      }
    };

    const handleEnded = () => {
      if (!video) return;
      updateOpacity(0);
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        animateFade(1, 250);
      }, 100);
    };

    if (video.readyState >= 3) {
      handleLoadedData();
    }

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Force play
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      cancelFade();
    };
  }, []);

  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-[#f8f8f8]">
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
        autoPlay
        muted
        playsInline
        className="absolute top-0 left-1/2 -translate-x-1/2 object-cover object-top pointer-events-none"
        style={{
          width: "115%",
          height: "115%",
          opacity: currentOpacity,
        }}
      />
    </div>
  );
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<Language>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mafalia_config");
      if (raw) {
        try {
          return JSON.parse(raw).language || "en";
        } catch {
          return "en";
        }
      }
    }
    return "en";
  });
  const t = translations[lang];

  React.useEffect(() => {
    const cfg = loadConfig();
    if (cfg?.language) setLang(cfg.language);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      );
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        // Navigation is handled by middleware once session is detected
        window.location.href = next;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={lang === "ar" ? "rtl" : "ltr"} className={`min-h-screen flex flex-col relative overflow-hidden px-4 md:px-[120px] pt-8 ${inter.className}`}>
      <VideoBackground />

      <nav className="w-full mb-12 relative z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-medium text-black hover:opacity-70 transition-opacity">
          <ChevronLeft className={cn("w-4 h-4", lang === "ar" && "rotate-180")} />
          {t.backToHome}
        </Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 70, damping: 15 }}
          className="w-full max-w-[440px] flex flex-col items-center"
        >
          {/* Logo outside the card */}
          <div className="mb-6">
            <Image 
              src="/mafalia-logo.png" 
              alt="Mafalia" 
              width={64} 
              height={64} 
              className="object-contain" 
            />
          </div>

          <h1 className={`${fustat.className} text-[40px] font-bold tracking-[-2.4px] text-[#000000] mb-2 leading-tight text-center`}>
            {isSignUp ? t.createAccount : t.welcomeBack}
          </h1>
          <p className={`${fustat.className} text-[18px] tracking-[-0.4px] text-[#505050] mb-8 text-center`}>
            {isSignUp 
              ? (lang === "en" ? "Join us to orchestrate your AI agents." : lang === "fr" ? "Rejoignez-nous pour orchestrer vos agents IA." : "انضم إلينا لتنسيق عملاء الذكاء الاصطناعي الخاص بك.")
              : t.signInOrchestrate
            }
          </p>

          {/* Form inside glassmorphism container identical to landing page search box */}
          <div className="w-full rounded-[18px] bg-[rgba(0,0,0,0.24)] backdrop-blur-md p-6 shadow-2xl border border-white/10">
            {success && isSignUp ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="size-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-7 text-emerald-400" />
                </div>
                <h2 className={`${fustat.className} text-[20px] font-bold text-white mb-2`}>{t.checkInbox}</h2>
                <p className="text-[14px] text-gray-300 leading-relaxed mb-6">
                  {lang === "en" ? "We sent a confirmation link to " : lang === "fr" ? "Nous avons envoyé un lien de confirmation à " : "لقد أرسلنا رابط تأكيد إلى "}
                  <span className="font-semibold text-white">{email}</span>.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setIsSignUp(false);
                  }}
                  className="text-[13px] font-medium text-gray-300 hover:text-white transition-colors underline"
                >
                  {t.login}
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[13px] font-medium text-gray-200 ml-1">
                    {t.emailAddress}
                  </label>
                  <div className="relative group bg-white rounded-[12px] p-1 flex items-center shadow-inner">
                    <Mail className={cn("absolute size-4.5 text-gray-400 group-focus-within:text-black transition-colors", lang === "ar" ? "right-4" : "left-4")} />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={cn(
                        "w-full h-[44px] bg-transparent text-[16px] text-black placeholder:text-[rgba(0,0,0,0.6)] focus:outline-none",
                        lang === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"
                      )}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[13px] font-medium text-gray-200 ml-1">
                    {t.password}
                  </label>
                  <div className="relative group bg-white rounded-[12px] p-1 flex items-center shadow-inner">
                    <Lock className={cn("absolute size-4.5 text-gray-400 group-focus-within:text-black transition-colors", lang === "ar" ? "right-4" : "left-4")} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
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
                      className={cn(
                        "absolute text-gray-400 hover:text-black transition-colors p-2",
                        lang === "ar" ? "left-2" : "right-2"
                      )}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-[13px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full h-[48px] relative flex items-center justify-center rounded-[12px] bg-black text-[15px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? t.signUp : t.logInSecurely}
                      <ArrowRight className={cn("ml-2 size-4", lang === "ar" && "rotate-180 mr-2 ml-0")} />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-[13px] font-medium text-gray-200 hover:text-white transition-colors"
                  >
                    {isSignUp ? t.hasAccount : t.noAccount}
                    <span className="ml-1 underline">
                      {isSignUp ? t.login : t.signUp}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <p className="text-center text-[12px] text-[#505050] mt-6 font-medium">
            By continuing, you agree to our <Link href="/terms" className="underline hover:text-black">Terms</Link> and <Link href="/privacy" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
