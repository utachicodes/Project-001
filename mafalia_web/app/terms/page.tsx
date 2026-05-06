import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Fustat, Inter } from "next/font/google";

const fustat = Fustat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function TermsPage() {
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
          Terms of Service
        </h1>
        
        <div className="space-y-6 text-[#505050] text-[15px] leading-relaxed">
          <p>
            Last updated: May 2026
          </p>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Mafalia Intelligence ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>2. Service Description</h2>
            <p>
              Mafalia Intelligence provides AI-powered business operations orchestration, including specialized agents for data analysis, trend prediction, and automation. We reserve the right to modify, suspend, or discontinue any part of the service at any time.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>4. Data & Privacy</h2>
            <p>
              Your use of the Platform is also governed by our Privacy Policy. By using the Platform, you consent to the collection and use of your data as outlined in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className={`${fustat.className} text-[24px] font-bold text-black mb-4 mt-8 tracking-tight`}>5. Limitations of Liability</h2>
            <p>
              Mafalia Intelligence shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
