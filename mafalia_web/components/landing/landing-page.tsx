"use client";

import { useState, useEffect } from "react";
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
  Users,
  Layers,
  TrendingUp,
  LayoutDashboard,
  Shield,
  Zap,
  Check,
  Plus,
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
    headlineLine1: "With Mafalia,",
    headlineLine2: "shift into top gear.",
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
    // Platform
    platformTitle: "Platform",
    platformHeading: "Everything you need to automate.",
    platformSubtitle: "A complete suite designed for teams that want to move fast, without sacrificing rigor.",
    f1Title: "Specialized Agents",
    f1Desc: "11 ready-to-use agents for sales, support, finance and more.",
    f2Title: "Simple Orchestration",
    f2Desc: "Connect your tools and trigger workflows in a few clicks.",
    f3Title: "Predictive Analytics",
    f3Desc: "Anticipate business trends with advanced models.",
    f4Title: "Dashboards",
    f4Desc: "Visualize the performance of each agent in real time.",
    f5Title: "Enterprise Security",
    f5Desc: "End-to-end encryption, compliance and granular access controls.",
    f6Title: "Instant Deployment",
    f6Desc: "Go live in minutes, not weeks.",
    // Stats
    stat1Label: "Specialized AI Agents",
    stat2Label: "Automated Tasks",
    stat3Label: "Faster than a team",
    stat4Label: "Continuous Availability",
    // Agents
    agentsTitle: "Agents",
    agentsHeading: "An AI team, on demand.",
    agentsSubtitle: "Activate the agents you need, pause the others. Each agent learns from your data and improves over time.",
    a1: "Analyst", a2: "Sales", a3: "Support", a4: "Finance", a5: "Marketing",
    a6: "Recruitment", a7: "Operations", a8: "Data", a9: "Strategy", a10: "Research", a11: "Compliance",
    // Africa
    africaTag: "Entrepreneurs using Mafalia",
    africaBuilt: "Built in Africa",
    africaHeading: "A platform designed for African entrepreneurs.",
    africaDesc: "Mafalia supports merchants, SMEs and startups in Dakar, Abidjan, Lagos or Nairobi. Mobile payments, local languages, business context: all integrated.",
    testimonialQuote: "Mafalia manages my sales while I sleep. My team can finally focus on what matters.",
    testimonialAuthor: "Aïssa Diallo — Founder, Bamako",
    // Pricing
    pricingTitle: "Pricing",
    pricingHeading: "Simple, transparent.",
    popularBadge: "Popular",
    starterName: "Starter", starterPrice: "Free", starterDesc: "Discover the platform.",
    starterF1: "3 active agents", starterF2: "1,000 requests / month", starterF3: "Basic dashboard",
    starterCta: "Get Started",
    proName: "Pro", proPrice: "29,000 FCFA", proPeriod: "/month", proDesc: "For growing teams.",
    proF1: "11 active agents", proF2: "50,000 requests / month", proF3: "Advanced integrations", proF4: "Priority support",
    proCta: "Try Pro",
    entName: "Enterprise", entPrice: "Custom", entDesc: "Security and unlimited volume.",
    entF1: "Custom agents", entF2: "99.99% SLA", entF3: "SSO & advanced controls", entF4: "Dedicated account manager",
    entCta: "Contact Us",
    // FAQ
    faqTitle: "FAQ",
    faqHeading: "Frequently asked questions.",
    faq1Q: "How long does it take to get started?",
    faq1A: "You can be up and running in under 5 minutes. Connect your data sources, activate the agents you need, and your first workflows are ready to go — no code required.",
    faq2Q: "Is my data secure?",
    faq2A: "Yes. All data is encrypted end-to-end, hosted on secure infrastructure, and never shared with third parties. Enterprise plans include SSO and granular access controls.",
    faq3Q: "Can I customize an agent?",
    faq3A: "Absolutely. Every agent can be tuned with your own prompts, data, and business rules. Enterprise customers can also build fully custom agents with our team.",
    faq4Q: "Is there a free trial?",
    faq4A: "The Starter plan is completely free — no credit card required. You get 3 active agents and 1,000 requests per month to explore the platform at your own pace.",
  },
  fr: {
    badgeNew: "Nouveau",
    badgeDiscover: "Découvrez les possibilités",
    headlineLine1: "Avec Mafalia,",
    headlineLine2: "passez à la vitesse supérieure.",
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
    // Platform
    platformTitle: "Plateforme",
    platformHeading: "Tout ce qu'il faut pour automatiser.",
    platformSubtitle: "Une suite complète conçue pour les équipes qui veulent aller vite, sans renoncer à la rigueur.",
    f1Title: "Agents spécialisés",
    f1Desc: "11 agents prêts à l'emploi pour ventes, support, finance et plus.",
    f2Title: "Orchestration simple",
    f2Desc: "Connectez vos outils et déclenchez des workflows en quelques clics.",
    f3Title: "Analyse prédictive",
    f3Desc: "Anticipez les tendances de votre activité avec des modèles avancés.",
    f4Title: "Tableaux de bord",
    f4Desc: "Visualisez les performances de chaque agent en temps réel.",
    f5Title: "Sécurité d'entreprise",
    f5Desc: "Chiffrement bout-en-bout, conformité et contrôles d'accès granulaires.",
    f6Title: "Déploiement instantané",
    f6Desc: "Mettez en production en quelques minutes, pas en semaines.",
    // Stats
    stat1Label: "Agents IA spécialisés",
    stat2Label: "Tâches automatisées",
    stat3Label: "Plus rapide qu'une équipe",
    stat4Label: "Disponibilité continue",
    // Agents
    agentsTitle: "Agents",
    agentsHeading: "Une équipe IA, à la demande.",
    agentsSubtitle: "Activez les agents dont vous avez besoin, mettez les autres en pause. Chaque agent apprend de vos données et s'améliore avec le temps.",
    a1: "Analyste", a2: "Vendeur", a3: "Support", a4: "Finance", a5: "Marketing",
    a6: "Recrutement", a7: "Opérations", a8: "Données", a9: "Stratégie", a10: "Recherche", a11: "Conformité",
    // Africa
    africaTag: "Entrepreneurs utilisant Mafalia",
    africaBuilt: "Conçu en Afrique",
    africaHeading: "Une plateforme pensée pour les entrepreneurs africains.",
    africaDesc: "Mafalia accompagne commerçants, PME et startups à Dakar, Abidjan, Lagos ou Nairobi. Paiements mobiles, langues locales, contexte business : tout est intégré.",
    testimonialQuote: "« Mafalia gère mes ventes pendant que je dors. Mon équipe se concentre enfin sur l'essentiel. »",
    testimonialAuthor: "Aïssa Diallo — Fondatrice, Bamako",
    // Pricing
    pricingTitle: "Tarifs",
    pricingHeading: "Simple, transparent.",
    popularBadge: "Populaire",
    starterName: "Starter", starterPrice: "Gratuit", starterDesc: "Pour découvrir la plateforme.",
    starterF1: "3 agents actifs", starterF2: "1 000 requêtes / mois", starterF3: "Tableau de bord de base",
    starterCta: "Commencer",
    proName: "Pro", proPrice: "29 000 FCFA", proPeriod: "/mois", proDesc: "Pour les équipes en croissance.",
    proF1: "11 agents actifs", proF2: "50 000 requêtes / mois", proF3: "Intégrations avancées", proF4: "Support prioritaire",
    proCta: "Essayer Pro",
    entName: "Entreprise", entPrice: "Sur mesure", entDesc: "Sécurité et volume illimités.",
    entF1: "Agents personnalisés", entF2: "SLA 99,99%", entF3: "SSO & contrôles avancés", entF4: "Account manager dédié",
    entCta: "Nous contacter",
    // FAQ
    faqTitle: "FAQ",
    faqHeading: "Questions fréquentes.",
    faq1Q: "Combien de temps pour démarrer ?",
    faq1A: "Moins de 5 minutes suffisent. Connectez vos sources de données, activez les agents dont vous avez besoin et vos premiers workflows sont prêts — sans aucune ligne de code.",
    faq2Q: "Mes données sont-elles sécurisées ?",
    faq2A: "Oui. Toutes les données sont chiffrées de bout en bout, hébergées sur une infrastructure sécurisée et jamais partagées avec des tiers. Les plans Entreprise incluent SSO et des contrôles d'accès granulaires.",
    faq3Q: "Puis-je personnaliser un agent ?",
    faq3A: "Absolument. Chaque agent peut être configuré avec vos propres instructions, données et règles métier. Les clients Entreprise peuvent également créer des agents entièrement sur mesure avec notre équipe.",
    faq4Q: "Y a-t-il un essai gratuit ?",
    faq4A: "Le plan Starter est entièrement gratuit — sans carte bancaire. Vous disposez de 3 agents actifs et 1 000 requêtes par mois pour explorer la plateforme à votre rythme.",
  },
  ar: {
    badgeNew: "جديد",
    badgeDiscover: "اكتشف ما هو ممكن",
    headlineLine1: "مع Mafalia،",
    headlineLine2: "انتقل إلى مستوى أعلى.",
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
    // Platform
    platformTitle: "المنصة",
    platformHeading: "كل ما تحتاجه للأتمتة.",
    platformSubtitle: "مجموعة كاملة مصممة للفرق التي تريد التحرك بسرعة دون التنازل عن الدقة.",
    f1Title: "وكلاء متخصصون",
    f1Desc: "11 وكيلًا جاهزًا للاستخدام في المبيعات والدعم والمالية والمزيد.",
    f2Title: "تنسيق بسيط",
    f2Desc: "قم بتوصيل أدواتك وتشغيل سير العمل ببضع نقرات.",
    f3Title: "تحليل تنبؤي",
    f3Desc: "توقع اتجاهات نشاطك التجاري بنماذج متقدمة.",
    f4Title: "لوحات التحكم",
    f4Desc: "تصور أداء كل وكيل في الوقت الفعلي.",
    f5Title: "أمان المؤسسات",
    f5Desc: "تشفير شامل والامتثال وضوابط وصول دقيقة.",
    f6Title: "نشر فوري",
    f6Desc: "انطلق في دقائق، لا أسابيع.",
    // Stats
    stat1Label: "وكيل ذكاء اصطناعي متخصص",
    stat2Label: "المهام المؤتمتة",
    stat3Label: "أسرع من فريق بشري",
    stat4Label: "توافر مستمر",
    // Agents
    agentsTitle: "الوكلاء",
    agentsHeading: "فريق ذكاء اصطناعي، عند الطلب.",
    agentsSubtitle: "فعّل الوكلاء الذين تحتاجهم، وأوقف الآخرين. كل وكيل يتعلم من بياناتك ويتحسن مع الوقت.",
    a1: "محلل", a2: "مبيعات", a3: "دعم", a4: "مالية", a5: "تسويق",
    a6: "توظيف", a7: "عمليات", a8: "بيانات", a9: "استراتيجية", a10: "بحث", a11: "امتثال",
    // Africa
    africaTag: "رواد أعمال يستخدمون Mafalia",
    africaBuilt: "صُنع في أفريقيا",
    africaHeading: "منصة مصممة لرواد الأعمال الأفارقة.",
    africaDesc: "تدعم Mafalia التجار والشركات الصغيرة والناشئة في داكار وأبيدجان ولاغوس ونيروبي. المدفوعات عبر الهاتف واللغات المحلية وسياق الأعمال: كل شيء متكامل.",
    testimonialQuote: "« تدير Mafalia مبيعاتي بينما أنام. يمكن لفريقي الآن التركيز على الأهم. »",
    testimonialAuthor: "عائشة ديالو — مؤسِّسة، باماكو",
    // Pricing
    pricingTitle: "الأسعار",
    pricingHeading: "بسيط وشفاف.",
    popularBadge: "الأكثر شيوعًا",
    starterName: "Starter", starterPrice: "مجاني", starterDesc: "لاكتشاف المنصة.",
    starterF1: "3 وكلاء نشطون", starterF2: "1,000 طلب / شهر", starterF3: "لوحة تحكم أساسية",
    starterCta: "ابدأ الآن",
    proName: "Pro", proPrice: "29,000 فرنك", proPeriod: "/شهر", proDesc: "للفرق في طور النمو.",
    proF1: "11 وكيلًا نشطًا", proF2: "50,000 طلب / شهر", proF3: "تكاملات متقدمة", proF4: "دعم ذو أولوية",
    proCta: "جرّب Pro",
    entName: "المؤسسات", entPrice: "مخصص", entDesc: "أمان وحجم غير محدود.",
    entF1: "وكلاء مخصصون", entF2: "SLA 99.99%", entF3: "SSO وضوابط متقدمة", entF4: "مدير حساب مخصص",
    entCta: "تواصل معنا",
    // FAQ
    faqTitle: "الأسئلة الشائعة",
    faqHeading: "أسئلة متكررة.",
    faq1Q: "كم من الوقت يستغرق البدء؟",
    faq1A: "يمكنك البدء في أقل من 5 دقائق. قم بتوصيل مصادر بياناتك وتفعيل الوكلاء الذين تحتاجهم وستكون سير عملك الأولى جاهزة — دون أي كود.",
    faq2Q: "هل بياناتي آمنة؟",
    faq2A: "نعم. جميع البيانات مشفرة من طرف إلى طرف ومستضافة على بنية تحتية آمنة ولا تُشارك مع أطراف ثالثة. تشمل خطط المؤسسات SSO وضوابط وصول دقيقة.",
    faq3Q: "هل يمكنني تخصيص وكيل؟",
    faq3A: "بالتأكيد. يمكن ضبط كل وكيل بتعليماتك وبياناتك وقواعد عملك الخاصة. يمكن لعملاء المؤسسات أيضًا بناء وكلاء مخصصين بالكامل مع فريقنا.",
    faq4Q: "هل هناك نسخة تجريبية مجانية؟",
    faq4A: "خطة Starter مجانية تمامًا — دون الحاجة إلى بطاقة ائتمانية. تحصل على 3 وكلاء نشطين و1,000 طلب شهريًا لاستكشاف المنصة بالسرعة التي تناسبك.",
  },
} as const;

type Language = keyof typeof dict;


export default function LandingPage() {
  const [lang, setLang] = useState<Language>(() => {
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
  const [user, setUser] = useState<any>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const t = dict[lang];

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("mafalia_config");
      const config = raw ? JSON.parse(raw) : {};
      localStorage.setItem("mafalia_config", JSON.stringify({ ...config, language: newLang }));
    }
  };

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

  const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.55, ease: "easeOut" as const } },
  };

  const staggerGrid = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };

  const staggerSlow = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`bg-white ${lang === "ar" ? "font-sans" : notoSans.className}`}
    >

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
              onClick={() => changeLang("en")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                lang === "en" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLang("fr")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                lang === "fr" ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              FR
            </button>
            <button
              onClick={() => changeLang("ar")}
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
      <main
        className="px-4 md:px-[120px] w-full flex flex-col items-center pt-[72px] pb-[96px] relative"
        style={{
          backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center w-full"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className={`inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#E2E8F0]/50 rounded-full p-1 ${
              lang === "ar" ? "pl-4" : "pr-4"
            } shadow-sm ${inter.className} text-[14px]`}
          >
            <div className="flex items-center gap-1 bg-[#0F172A] text-white px-2.5 py-1 rounded-full text-xs font-medium">
              <Star className="w-3 h-3 fill-white" />
              {t.badgeNew}
            </div>
            <span className="text-gray-800 font-medium">{t.badgeDiscover}</span>
          </motion.div>

          <div className="h-[40px]" />

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className={`${fustat.className} font-bold text-[52px] md:text-[80px] leading-[1.05] tracking-[-2px] md:tracking-[-4px] text-[#0F172A]`}
          >
            {t.headlineLine1}<br />{t.headlineLine2}
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
            className="w-full max-w-[728px] md:h-[200px] rounded-[18px] bg-[rgba(15,23,42,0.88)] backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl border border-[rgba(225,29,72,0.2)]"
          >
            {/* Top Row: Credit info */}
            <div
              className={`flex flex-wrap gap-2 items-center justify-between ${schibsted.className} font-medium text-[12px] text-white`}
            >
              <div className="flex items-center gap-3">
                <span className="opacity-90">{t.agentsActive}</span>
                <button className="bg-[rgba(225,29,72,0.92)] text-white px-3 py-1 rounded-full hover:bg-[rgba(225,29,72,1)] hover:scale-105 transition-all shadow-sm">
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

      {/* ── Platform Section ── */}
      <section id="plateforme" className={`px-4 md:px-[120px] py-[96px] bg-white ${notoSans.className}`}>
        <div className="max-w-[1160px] mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={staggerSlow}
            className="text-center mb-[64px]"
          >
            <motion.span variants={fadeUp} className={`text-[#E11D48] font-semibold text-[13px] tracking-[0.1em] uppercase ${schibsted.className}`}>
              {t.platformTitle}
            </motion.span>
            <motion.h2 variants={fadeUp} className={`${fustat.className} font-bold text-[36px] md:text-[52px] text-[#0F172A] mt-3 tracking-[-1.5px] leading-tight`}>
              {t.platformHeading}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#505050] text-[17px] mt-4 max-w-[560px] mx-auto leading-relaxed">
              {t.platformSubtitle}
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerGrid}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              { icon: <Users className="w-5 h-5" />, title: t.f1Title, desc: t.f1Desc },
              { icon: <Layers className="w-5 h-5" />, title: t.f2Title, desc: t.f2Desc },
              { icon: <TrendingUp className="w-5 h-5" />, title: t.f3Title, desc: t.f3Desc },
              { icon: <LayoutDashboard className="w-5 h-5" />, title: t.f4Title, desc: t.f4Desc },
              { icon: <Shield className="w-5 h-5" />, title: t.f5Title, desc: t.f5Desc },
              { icon: <Zap className="w-5 h-5" />, title: t.f6Title, desc: t.f6Desc },
            ].map((f, i) => (
              <motion.div
                key={i} variants={fadeUp}
                className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-[10px] bg-[#FFF1F4] flex items-center justify-center text-[#E11D48] mb-4">
                  {f.icon}
                </div>
                <h3 className={`${fustat.className} font-bold text-[17px] text-[#0F172A] mb-2`}>{f.title}</h3>
                <p className="text-[#707070] text-[14px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
            variants={staggerGrid}
            className="mt-[72px] grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-[#F1F5F9] pt-[56px]"
          >
            {[
              { value: "11", label: t.stat1Label },
              { value: "98%", label: t.stat2Label },
              { value: "10×", label: t.stat3Label },
              { value: "24/7", label: t.stat4Label },
            ].map((s, i) => (
              <motion.div key={i} variants={scaleIn} className="text-center">
                <div className={`${fustat.className} font-bold text-[44px] text-[#E11D48] leading-none tracking-tight`}>{s.value}</div>
                <div className="text-[#707070] text-[13px] mt-2 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Agents Section ── */}
      <section id="agents" className={`px-4 md:px-[120px] py-[96px] bg-[#F9FAFB] ${notoSans.className}`}>
        <div className="max-w-[1160px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">

            {/* Left — intro panel */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
              variants={staggerSlow}
              className="lg:w-[340px] flex-shrink-0 lg:sticky lg:top-24"
            >
              <motion.span variants={fadeUp} className={`text-[#E11D48] font-semibold text-[13px] tracking-[0.1em] uppercase ${schibsted.className}`}>
                {t.agentsTitle}
              </motion.span>
              <motion.h2 variants={fadeUp} className={`${fustat.className} font-bold text-[36px] md:text-[48px] text-[#0F172A] mt-3 mb-5 tracking-[-1.5px] leading-tight`}>
                {t.agentsHeading}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#64748B] text-[16px] leading-relaxed mb-8">
                {t.agentsSubtitle}
              </motion.p>
              <motion.div variants={fadeUp} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
                <span className={`${schibsted.className} text-[13px] text-[#64748B] font-medium`}>{t.agentsActive}</span>
              </motion.div>
            </motion.div>

            {/* Right — agent list */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
              variants={staggerGrid}
              className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-0"
            >
              {[t.a1, t.a2, t.a3, t.a4, t.a5, t.a6, t.a7, t.a8, t.a9, t.a10, t.a11].map((name, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  className={`flex items-center gap-4 px-5 py-4 border-b border-[#E2E8F0] hover:bg-white transition-colors duration-200 group cursor-default
                    ${i % 2 === 0 ? "sm:border-r sm:border-[#E2E8F0]" : ""}
                  `}
                >
                  <span className={`${schibsted.className} text-[13px] font-bold text-[#E11D48] w-7 flex-shrink-0`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`${fustat.className} font-semibold text-[15px] text-[#0F172A] flex-1`}>{name}</span>
                  <span className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className={`${schibsted.className} text-[11px] text-[#64748B] font-medium`}>Active</span>
                  </span>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Africa Section ── */}
      <section className={`px-4 md:px-[120px] py-[96px] bg-white ${notoSans.className}`}>
        <div className="max-w-[960px] mx-auto text-center">

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow}
            className="flex flex-col items-center"
          >
            <motion.span variants={fadeUp} className={`inline-flex items-center gap-1.5 bg-[#FFF1F4] text-[#E11D48] text-[12px] font-semibold px-4 py-1.5 rounded-full mb-4 ${schibsted.className}`}>
              {t.africaBuilt}
            </motion.span>

            <motion.h2 variants={fadeUp} className={`${fustat.className} font-bold text-[36px] md:text-[52px] text-[#0F172A] tracking-[-1.8px] leading-tight mb-5`}>
              {t.africaHeading}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-[#64748B] text-[17px] leading-relaxed max-w-[580px] mb-10">
              {t.africaDesc}
            </motion.p>

            {/* City tags */}
            <motion.div variants={staggerGrid} className="flex flex-wrap justify-center gap-2 mb-14">
              {["Dakar", "Abidjan", "Lagos", "Nairobi"].map((city, i) => (
                <motion.span
                  key={i} variants={scaleIn}
                  className={`${schibsted.className} flex items-center gap-1.5 bg-white border border-[#E2E8F0] text-[#334155] text-[13px] font-medium px-4 py-2 rounded-full shadow-sm`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] flex-shrink-0" />
                  {city}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Quote card */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
            variants={staggerSlow}
            className="relative bg-[#F9FAFB] border border-[#E2E8F0] rounded-[24px] px-8 md:px-16 pt-14 pb-10"
          >
            <motion.div
              variants={fadeIn}
              className={`${fustat.className} absolute -top-7 left-1/2 -translate-x-1/2 text-[#E11D48] text-[88px] leading-none select-none`}
            >
              "
            </motion.div>

            <motion.p
              variants={fadeUp}
              className={`${fustat.className} text-[#0F172A] text-[20px] md:text-[26px] font-medium leading-relaxed mb-8 tracking-[-0.4px]`}
            >
              {t.testimonialQuote}
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E11D48] flex items-center justify-center flex-shrink-0">
                <span className={`${schibsted.className} text-white text-[14px] font-bold`}>A</span>
              </div>
              <div className="text-left">
                <div className={`${schibsted.className} text-[#0F172A] font-semibold text-[14px]`}>Aïssa Diallo</div>
                <div className={`${schibsted.className} text-[#94A3B8] text-[12px]`}>Fondatrice, Bamako</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className={`${schibsted.className} text-[#CBD5E1] text-[12px] mt-8 tracking-wide`}
          >
            {t.africaTag}
          </motion.p>

        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="tarifs" className={`px-4 md:px-[120px] py-[96px] bg-[#F9FAFB] ${notoSans.className}`}>
        <div className="max-w-[1160px] mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={staggerSlow}
            className="text-center mb-[56px]"
          >
            <motion.span variants={fadeUp} className={`text-[#E11D48] font-semibold text-[13px] tracking-[0.1em] uppercase ${schibsted.className}`}>
              {t.pricingTitle}
            </motion.span>
            <motion.h2 variants={fadeUp} className={`${fustat.className} font-bold text-[36px] md:text-[52px] text-[#0F172A] mt-3 tracking-[-1.5px]`}>
              {t.pricingHeading}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={staggerGrid}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {/* Starter */}
            <motion.div variants={fadeUp} className="bg-white border border-[#F1F5F9] rounded-[20px] p-8 flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className={`${fustat.className} font-bold text-[18px] text-[#0F172A] mb-1`}>{t.starterName}</div>
              <div className={`${fustat.className} font-bold text-[40px] text-[#0F172A] leading-none mb-1`}>{t.starterPrice}</div>
              <p className="text-[#707070] text-[14px] mb-6">{t.starterDesc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[t.starterF1, t.starterF2, t.starterF3].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-[#404040]">
                    <Check className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`${schibsted.className} w-full text-center py-3 rounded-[10px] border border-[#0F172A] text-[#0F172A] text-[14px] font-semibold hover:bg-[#0F172A] hover:text-white transition-colors`}>
                {t.starterCta}
              </Link>
            </motion.div>

            {/* Pro — highlighted */}
            <motion.div variants={scaleIn} className="bg-[#E11D48] border border-[#E11D48] rounded-[20px] p-8 flex flex-col relative overflow-hidden shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className={`absolute top-4 ${lang === "ar" ? "left-4" : "right-4"} bg-white text-[#E11D48] text-[11px] font-bold px-3 py-1 rounded-full ${schibsted.className}`}>
                {t.popularBadge}
              </div>
              <div className={`${fustat.className} font-bold text-[18px] text-white mb-1`}>{t.proName}</div>
              <div className="flex items-end gap-1 mb-1">
                <span className={`${fustat.className} font-bold text-[40px] text-white leading-none`}>{t.proPrice}</span>
                <span className="text-white/70 text-[15px] mb-1">{t.proPeriod}</span>
              </div>
              <p className="text-white/75 text-[14px] mb-6">{t.proDesc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[t.proF1, t.proF2, t.proF3, t.proF4].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-white">
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`${schibsted.className} w-full text-center py-3 rounded-[10px] bg-white text-[#E11D48] text-[14px] font-semibold hover:bg-white/90 transition-colors`}>
                {t.proCta}
              </Link>
            </motion.div>

            {/* Enterprise */}
            <motion.div variants={fadeUp} className="bg-white border border-[#F1F5F9] rounded-[20px] p-8 flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className={`${fustat.className} font-bold text-[18px] text-[#0F172A] mb-1`}>{t.entName}</div>
              <div className={`${fustat.className} font-bold text-[40px] text-[#0F172A] leading-none mb-1`}>{t.entPrice}</div>
              <p className="text-[#707070] text-[14px] mb-6">{t.entDesc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[t.entF1, t.entF2, t.entF3, t.entF4].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-[14px] text-[#404040]">
                    <Check className="w-4 h-4 text-[#E11D48] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:hello@mafalia.com" className={`${schibsted.className} w-full text-center py-3 rounded-[10px] border border-[#0F172A] text-[#0F172A] text-[14px] font-semibold hover:bg-[#0F172A] hover:text-white transition-colors`}>
                {t.entCta}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className={`px-4 md:px-[120px] py-[96px] bg-white ${notoSans.className}`}>
        <div className="max-w-[720px] mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={staggerSlow}
            className="text-center mb-[48px]"
          >
            <motion.span variants={fadeUp} className={`text-[#E11D48] font-semibold text-[13px] tracking-[0.1em] uppercase ${schibsted.className}`}>
              {t.faqTitle}
            </motion.span>
            <motion.h2 variants={fadeUp} className={`${fustat.className} font-bold text-[36px] md:text-[48px] text-[#0F172A] mt-3 tracking-[-1.2px]`}>
              {t.faqHeading}
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
            variants={staggerSlow}
            className="space-y-3"
          >
            {([
              { q: t.faq1Q, a: t.faq1A },
              { q: t.faq2Q, a: t.faq2A },
              { q: t.faq3Q, a: t.faq3A },
              { q: t.faq4Q, a: t.faq4A },
            ] as { q: string; a: string }[]).map(({ q, a }, i) => (
              <motion.div key={i} variants={fadeUp} className="border border-[#E2E8F0] rounded-[14px] overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${faqOpen === i ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]"} ${schibsted.className}`}
                >
                  <span className="font-semibold text-[15px] text-[#0F172A] pr-4">{q}</span>
                  <motion.div animate={{ rotate: faqOpen === i ? 45 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                    <Plus className="w-5 h-5 text-[#E11D48]" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: faqOpen === i ? "auto" : 0, opacity: faqOpen === i ? 1 : 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className={`px-6 pb-5 text-[15px] text-[#64748B] leading-relaxed ${notoSans.className}`}>{a}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={`px-4 md:px-[120px] py-8 bg-white border-t border-[#E2E8F0] ${schibsted.className}`}>
        <div className="max-w-[1160px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/mafalia-logo.png" alt="Mafalia" width={36} height={36} className="object-contain" />
          </Link>
          <p className="text-[#94A3B8] text-[13px]">© {new Date().getFullYear()} Mafalia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
