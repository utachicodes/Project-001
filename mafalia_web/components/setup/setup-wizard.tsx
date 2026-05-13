"use client";
import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Rocket, CheckCircle2, AlertCircle, Database } from "lucide-react";
import type { Config } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { translations, type Language } from "@/lib/i18n";
import { ProviderSelector, ALL_PROVIDERS } from "./provider-selector";
import { cn } from "@/lib/utils";

interface SetupWizardProps {
  open: boolean;
  config: Config | null;
  language: Language;
  onSave: (config: Config) => void;
  onClose: () => void;
}

const getSteps = (lang: Language) => [
  {
    num: 1,
    title: lang === "en" ? "Provider" : lang === "fr" ? "Fournisseur" : "المزود",
    desc: lang === "en" ? "Choose model" : lang === "fr" ? "Choisir le modèle" : "اختر النموذج",
  },
  {
    num: 2,
    title: lang === "en" ? "API Key" : lang === "fr" ? "Clé API" : "مفتاح API",
    desc: lang === "en" ? "Credentials" : lang === "fr" ? "Identifiants" : "بيانات الاعتماد",
  },
  {
    num: 3,
    title: lang === "en" ? "Review" : lang === "fr" ? "Révision" : "مراجعة",
    desc: lang === "en" ? "Confirm" : lang === "fr" ? "Confirmer" : "تأكيد",
  },
];

export function SetupWizard({ open, config, language, onSave, onClose }: SetupWizardProps) {
  const t = translations[language || "en"];
  const [step, setStep] = React.useState(1);
  const [provider, setProvider] = React.useState(config?.provider || "openrouter");
  const [model, setModel] = React.useState(config?.model || "z-ai/glm-4.5-air:free");
  const [apiKey, setApiKey] = React.useState(config?.apiKey || "");
  const [baseUrl, setBaseUrl] = React.useState(config?.baseUrl || "");
  const [isSaving, setIsSaving] = React.useState(false);

  const currentProvider = ALL_PROVIDERS.find((p) => p.id === provider);
  const selectedModel =
    currentProvider?.freeModels.find((m) => m.id === model) ||
    currentProvider?.paidModels.find((m) => m.id === model);
  const needsApiKey = currentProvider?.requiresApiKey !== false;
  const isFree = selectedModel?.isFree ?? false;

  const handleSave = async () => {
    if (needsApiKey && !apiKey.trim()) {
      setStep(2);
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    let resolvedBaseUrl = baseUrl.trim();
    if (!resolvedBaseUrl && provider === "ollama") resolvedBaseUrl = "http://localhost:11434/v1";
    onSave({
      provider,
      model,
      apiKey: apiKey.trim() || (provider === "ollama" ? "ollama" : ""),
      baseUrl: resolvedBaseUrl,
      maxTokens: 4096,
      temperature: 0.4,
      language,
    });
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" hideClose>
        <div className="h-1 bg-primary" />
        <div className="px-7 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-1">
            <Image src="/mafalia-logo.png" alt="Mafalia" width={36} height={36} />
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                {language === "en" ? "Configure" : language === "fr" ? "Configurer" : "تكوين"} <span className="text-primary">Mafalia Intelligence</span>
              </DialogTitle>
              <DialogDescription className="text-[12.5px] text-muted-foreground">
                {language === "en" ? "Activate your business agents" : language === "fr" ? "Activez vos agents d'entreprise" : "تنشيط عملاء عملك"}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            {getSteps(language).map((s, i, arr) => {
              const done = step > s.num;
              const active = step === s.num;
              return (
                <React.Fragment key={s.num}>
                  <button
                    type="button"
                    onClick={() => done && setStep(s.num)}
                    className="flex items-center gap-2"
                    disabled={!done}
                  >
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors",
                        done
                          ? "bg-primary text-primary-foreground"
                          : active
                          ? "bg-primary/15 text-primary border border-primary"
                          : "bg-secondary text-muted-foreground",
                      )}
                    >
                      {done ? <CheckCircle2 className="size-3.5" /> : s.num}
                    </div>
                    <span
                      className={cn(
                        "text-[10.5px] font-bold uppercase tracking-wider hidden sm:block",
                        active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s.title}
                    </span>
                  </button>
                  {i < arr.length - 1 && (
                    <div
                      className={cn(
                        "w-8 h-px mx-1 transition-colors",
                        step > s.num ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: "calc(90vh - 220px)" }}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 flex items-center justify-center">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold">{t.providerSettings}</h3>
                  <p className="text-[12px] text-muted-foreground">
                    {language === "en" ? "Select from free and premium models" : language === "fr" ? "Choisissez parmi des modèles gratuits et premium" : "اختر من بين النماذج المجانية والمميزة"}
                  </p>
                </div>
              </div>
              <ProviderSelector
                selectedProvider={provider}
                selectedModel={model}
                apiKey={apiKey}
                onProviderChange={setProvider}
                onModelChange={setModel}
                onApiKeyChange={setApiKey}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 flex items-center justify-center">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold">
                    {needsApiKey ? "API Key Required" : "Connection Setup"}
                  </h3>
                  <p className="text-[12px] text-muted-foreground">
                    {needsApiKey
                      ? "Stored locally in your browser, never on our servers"
                      : "Configure your local AI connection"}
                  </p>
                </div>
              </div>

              {!needsApiKey ? (
                <div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-md bg-emerald-500/8 border border-emerald-500/20"
                  >
                    <h4 className="text-[12.5px] font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-2">
                      <CheckCircle2 className="size-3.5" /> No API key needed
                    </h4>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">
                      {provider === "ollama"
                        ? "Ollama runs locally. Make sure it's installed and running: ollama serve"
                        : "This provider uses a custom endpoint. Enter the base URL below."}
                    </p>
                  </motion.div>
                  <div>
                    <label className="text-[11.5px] font-medium text-muted-foreground mb-1.5 block">
                      Base URL{" "}
                      {provider === "ollama" && (
                        <span className="text-muted-foreground/70">
                          (default: http://localhost:11434/v1)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder={
                        provider === "ollama"
                          ? "http://localhost:11434/v1"
                          : "http://your-server:port/v1"
                      }
                      className="w-full text-[13px] bg-background border border-border rounded-md px-3 py-2 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11.5px] font-medium text-muted-foreground mb-1.5 block">
                      {currentProvider?.name} API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="w-full text-[13px] bg-background border border-border rounded-md px-3 py-2 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
                    />
                    <div
                      className={cn(
                        "flex items-center gap-1.5 mt-1.5 text-[11.5px]",
                        apiKey.trim()
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {apiKey.trim() ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <AlertCircle className="size-3" />
                      )}
                      {apiKey.trim() ? "Looks good!" : "API key required to continue"}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-500/8 border border-emerald-500/20">
                    <h4 className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                      <Sparkles className="size-3" /> Free options available
                    </h4>
                    <ul className="space-y-1 text-[11.5px] text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> OpenRouter:
                        Gemini, Llama, DeepSeek (free tier)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Google AI Studio:
                        Gemini 2.0 Flash & Pro (free tier)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-emerald-500" /> Ollama: Run any
                        model locally for free
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-8 flex items-center justify-center">
                  <Database className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold">Ready to launch</h3>
                  <p className="text-[12px] text-muted-foreground">
                    Review your configuration before activating
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary border border-border space-y-2">
                {[
                  ["Provider", currentProvider?.name],
                  ["Model", selectedModel?.name || model],
                  ["Cost", isFree ? "✓ FREE" : "Paid"],
                ].map(([key, val]) => (
                  <div key={key as string} className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground">{key}</span>
                    <span
                      className={cn(
                        "font-semibold",
                        key === "Cost" && (isFree ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"),
                      )}
                    >
                      {val || "—"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-md bg-primary/5 border border-primary/15 text-[11.5px] text-muted-foreground">
                Your API key is stored only in this browser&apos;s local storage. It is never sent
                to Mafalia servers.
              </div>
            </div>
          )}
        </div>

        <div className="px-7 py-4 flex justify-between items-center bg-secondary/50 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            {t.back}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              {t.cancel}
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>{t.next}</Button>
            ) : (
              <Button
                variant="mafalia"
                onClick={handleSave}
                disabled={(needsApiKey && !apiKey.trim()) || isSaving}
              >
                {isSaving ? (
                  <>
                    <Sparkles className="size-3.5 animate-spin" /> ...
                  </>
                ) : (
                  <>
                    <Rocket className="size-3.5" /> {t.finish}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
