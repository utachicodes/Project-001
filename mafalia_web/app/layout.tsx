import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mafalia Intelligence",
  description:
    "Mafalia Intelligence — AI-powered business operations platform. Orchestrate 10 specialized agents to analyze data, predict trends, and automate operations.",
  icons: { icon: "/mafalia-logo.png", apple: "/mafalia-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="mafalia-theme">
          {children}
          <Toaster position="top-center" richColors closeButton duration={6000} />
        </ThemeProvider>
      </body>
    </html>
  );
}
