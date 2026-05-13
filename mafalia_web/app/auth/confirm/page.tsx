"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Fustat } from "next/font/google";

const fustat = Fustat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = () => {
    setLoading(true);
    // Redirect to the actual callback route that exchanges the code
    const callbackUrl = `/auth/callback?code=${code}&next=${encodeURIComponent(next)}`;
    router.push(callbackUrl);
  };

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Link</h1>
          <p className="text-gray-600">This link is missing a verification code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4 ${fustat.className}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] bg-white rounded-[24px] p-8 shadow-xl border border-gray-100 text-center"
      >
        <div className="size-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="size-8 text-black" />
        </div>
        
        <h1 className="text-[32px] font-bold tracking-tight text-black mb-3 leading-tight">
          Verify your session
        </h1>
        <p className="text-[16px] text-gray-500 mb-8 leading-relaxed">
          To keep your account secure, please click the button below to complete your sign-in to Mafalia.
        </p>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full h-[56px] flex items-center justify-center gap-2 rounded-[16px] bg-black text-white font-semibold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Confirm & Sign In
              <ArrowRight className="size-5" />
            </>
          )}
        </button>

        <p className="mt-6 text-[13px] text-gray-400">
          This extra step prevents automated systems from expiring your login link.
        </p>
      </motion.div>
    </div>
  );
}
