"use client";
import * as React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
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
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Image src="/mafalia-logo.png" alt="Mafalia" width={48} height={48} />
            <div className="text-left">
              <p className="text-[20px] font-bold tracking-tight leading-none">Mafalia</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.18em] mt-1">
                Intelligence
              </p>
            </div>
          </div>
          <h1 className="text-[26px] font-bold tracking-tight">
            Sign in to <span className="text-primary">Mafalia Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-[14px]">
            Enter your email — we&apos;ll send you a secure magic link.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="size-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-[16px] font-bold mb-1">Check your inbox</h2>
              <p className="text-[13px] text-muted-foreground">
                We sent a magic link to{" "}
                <span className="font-semibold text-foreground">{email}</span>. Click the link to
                sign in.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="mt-4 text-[12px] text-primary hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="pl-9 h-10"
                  />
                </div>
              </div>
              {error && (
                <p className="text-[12px] text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                variant="mafalia"
                size="lg"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? "Sending…" : "Send magic link"}
                {!loading && <ArrowRight className="size-4" />}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-5">
          By continuing, you agree to Mafalia&apos;s privacy policy. API keys stay in your browser.
        </p>
      </motion.div>
    </main>
  );
}
