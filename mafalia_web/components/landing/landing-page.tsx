"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Schibsted_Grotesk, Inter, Noto_Sans, Fustat } from "next/font/google";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Star,
  Sparkles,
  Paperclip,
  Mic,
  Search,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Load required fonts
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const fustat = Fustat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Dictionary for translations
const dict = {
  en: {
    badgeNew: "New",
    badgeDiscover: "Discover what's possible",
    headline: "Orchestrate Your AI Agents",
    subtitle: "Deploy 11 specialized AI agents to analyze data, predict trends, and automate your business operations instantly.",
    agentsActive: "11/11 Agents Active",
    upgrade: "Upgrade",
    poweredBy: "Powered by GPT-4o",
    placeholder: "Ask your agents to analyze your data...",
    attach: "Attach",
    voice: "Voice",
    prompts: "Prompts",
    logIn: "Log In",
    dashboard: "Dashboard",
    signOut: "Sign Out",
  },
  fr: {
    badgeNew: "Nouveau",
    badgeDiscover: "Découvrez les possibilités",
    headline: "Orchestrez vos agents IA",
    subtitle: "Déployez 11 agents IA spécialisés pour analyser les données, prédire les tendances et automatiser vos opérations commerciales instantanément.",
    agentsActive: "11/11 Agents Actifs",
    upgrade: "Mise à jour",
    poweredBy: "Propulsé par GPT-4o",
    placeholder: "Demandez à vos agents d'analyser vos données...",
    attach: "Joindre",
    voice: "Voix",
    prompts: "Prompts",
    logIn: "Connexion",
    dashboard: "Tableau de bord",
    signOut: "Déconnexion",
  },
  ar: {
    badgeNew: "جديد",
    badgeDiscover: "اكتشف ما هو ممكن",
    headline: "قم بتنسيق عملاء الذكاء الاصطناعي الخاص بك",
    subtitle: "قم بنشر 11 عميلًا متخصصًا في الذكاء الاصطناعي لتحليل البيانات والتنبؤ بالاتجاهات وأتمتة عمليات عملك على الفور.",
    agentsActive: "11/11 عملاء نشطون",
    upgrade: "ترقية",
    poweredBy: "مدعوم من GPT-4o",
    placeholder: "اطلب من عملائك تحليل بياناتك...",
    attach: "إرفاق",
    voice: "صوت",
    prompts: "مطالبات",
    logIn: "تسجيل الدخول",
    dashboard: "لوحة التحكم",
    signOut: "تسجيل الخروج",
  },
} as const;

type Language = keyof typeof dict;

// Custom Video Component with requestAnimationFrame fade logic
const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentOpacity, setCurrentOpacity] = useState(0);
  const opacityRef = useRef(0);
  const fadingOutRef = useRef(false);
  const animationFrameRef = useRef<number>();

  const updateOpacity = (val: number) => {
    opacityRef.current = val;
    setCurrentOpacity(val);
  };

  useEffect(() => {
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
      // Fade out 0.55 seconds before end
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

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

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

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("en");
  const [user, setUser] = useState<any>(null);
  const t = dict[lang];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 70, damping: 15 },
    },
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`relative min-h-screen ${
        lang === "ar" ? "font-sans" : notoSans.className
      }`}
    >
      <VideoBackground />

      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 md:px-[120px] py-[16px] w-full relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mafalia-logo.png"
            alt="Mafalia"
            width={64}
            height={64}
            className="object-contain"
          />
        </Link>

        {/* Right Buttons & Lang Switcher */}
        <div className={`flex items-center gap-4 ${schibsted.className}`}>
          {/* Language Switcher */}
          <div className="flex items-center bg-black/5 rounded-full p-1 border border-black/5">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                lang === "en" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("fr")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                lang === "fr" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLang("ar")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                lang === "ar" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              AR
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center justify-center px-6 h-[40px] bg-black text-white font-medium text-sm rounded-full hover:bg-gray-900 hover:scale-105 transition-all shadow-lg"
              >
                {t.dashboard || "Dashboard"}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs font-bold text-gray-500 hover:text-black transition-colors"
              >
                {t.signOut || "Sign Out"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center min-w-[101px] px-6 h-[40px] bg-black text-white font-medium text-sm rounded-full hover:bg-gray-900 hover:scale-105 transition-all shadow-lg"
            >
              {t.logIn}
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Content */}
      <main className="px-4 md:px-[120px] w-full flex flex-col items-center mt-[60px] relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center -mt-[50px] w-full"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className={`inline-flex items-center gap-2 bg-[#f8f8f8]/80 backdrop-blur-sm border border-gray-200/50 rounded-full p-1 ${
              lang === "ar" ? "pl-4" : "pr-4"
            } shadow-sm ${inter.className} text-[14px]`}
          >
            <div className="flex items-center gap-1 bg-[#0e1311] text-white px-2.5 py-1 rounded-full text-xs font-medium">
              <Star className="w-3 h-3 fill-white" />
              {t.badgeNew}
            </div>
            <span className="text-gray-800 font-medium">{t.badgeDiscover}</span>
          </motion.div>

          <div className="h-[34px]" />

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className={`${fustat.className} font-bold text-[50px] md:text-[80px] leading-tight md:leading-none tracking-[-2.4px] md:tracking-[-4.8px] text-[#000000]`}
          >
            {t.headline}
          </motion.h1>

          <div className="h-[34px]" />

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className={`${fustat.className} font-medium text-[16px] md:text-[20px] tracking-[-0.4px] text-[#505050] max-w-[736px] md:w-[542px] leading-relaxed`}
          >
            {t.subtitle}
          </motion.p>

          <div className="h-[44px]" />

          {/* Search Input Box */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-[728px] md:h-[200px] rounded-[18px] bg-[rgba(0,0,0,0.24)] backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl border border-white/10"
          >
            {/* Top Row: Credit info */}
            <div
              className={`flex flex-wrap gap-2 items-center justify-between ${schibsted.className} font-medium text-[12px] text-white`}
            >
              <div className="flex items-center gap-3">
                <span className="opacity-90">{t.agentsActive}</span>
                <button className="bg-[rgba(90,225,76,0.89)] text-black px-3 py-1 rounded-full hover:bg-[rgba(90,225,76,1)] hover:scale-105 transition-all shadow-sm">
                  {t.upgrade}
                </button>
              </div>
              <div className="flex items-center gap-1.5 opacity-90">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.poweredBy}</span>
              </div>
            </div>

            {/* Main Input Area */}
            <div className="flex-1 bg-white rounded-[12px] mt-3 mb-3 p-3 flex items-start shadow-inner relative group min-h-[80px]">
              <textarea
                placeholder={t.placeholder}
                className={`w-full h-full resize-none outline-none text-[16px] placeholder:text-[rgba(0,0,0,0.6)] text-black bg-transparent ${inter.className}`}
              />
              <button className={`absolute bottom-3 ${lang === "ar" ? "left-3" : "right-3"} w-[36px] h-[36px] bg-black rounded-full flex items-center justify-center hover:bg-gray-800 hover:scale-110 transition-all shadow-md`}>
                <ArrowUp className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Bottom Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-white px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors backdrop-blur-sm border border-white/10">
                  <Paperclip className="w-3.5 h-3.5" />
                  {t.attach}
                </button>
                <button className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-white px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors backdrop-blur-sm border border-white/10">
                  <Mic className="w-3.5 h-3.5" />
                  {t.voice}
                </button>
                <button className="flex items-center gap-1.5 bg-black/30 hover:bg-black/40 text-white px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors backdrop-blur-sm border border-white/10">
                  <Search className="w-3.5 h-3.5" />
                  {t.prompts}
                </button>
              </div>
              <span
                className={`text-[12px] text-gray-300 font-medium ${inter.className}`}
              >
                0/3,000
              </span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
