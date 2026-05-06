import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Fustat, Inter } from "next/font/google";

const fustat = Fustat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function PrivacyPage() {
  return (
    <main className={`min-h-screen bg-[#f8f8f8] px-4 md:px-[120px] py-12 ${inter.className}`}>
      <nav className="w-full mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-medium text-black hover:opacity-70 transition-opacity">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        <h1 className={`${fustat.className} text-[40px] font-bold tracking-[-2.4px] text-[#000000] mb-8`}>
          Privacy Policy
        </h1>
        
        <div className="space-y-6 text-[#505050] text-[15px] leading-relaxed">
          <p>
            Last updated: May 2026
          </p>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, connect data sources, or communicate with our support team. This may include your name, email address, and business data processed by our AI agents.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>2. How We Use Your Information</h2>
            <p>
              We use the information we collect to operate and improve our AI orchestration platform, provide personalized insights, process your transactions, and communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data. All data transmitted to and from our platform is encrypted. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>4. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share your information with trusted third-party service providers who assist us in operating our platform, subject to strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>5. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data at any time. You may also export your data or request restriction of processing by contacting our privacy team.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
