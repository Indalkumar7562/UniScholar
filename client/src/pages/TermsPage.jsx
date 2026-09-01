import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-black text-base text-white">UniScholar</div>
              <div className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Terms & Conditions</div>
            </div>
          </Link>

          <Link to="/login" className="btn btn-outline text-xs px-4 py-2 flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Authentication
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-8 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3 text-primary-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">UniScholar Platform Terms & Conditions</h1>
          </div>
          
          <p className="text-xs text-slate-400">Last updated: September 1, 2026</p>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-base font-extrabold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the UniScholar platform (Universal Scholarship System), you agree to be bound by these Terms & Conditions. UniScholar provides scholarship discovery, AI-assisted eligibility verification, document management, and application tracking services for students.
            </p>

            <h2 className="text-base font-extrabold text-white">2. User Account & Security</h2>
            <p>
              Students are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to provide accurate, complete, and truthful information regarding your academic, financial, and personal background.
            </p>

            <h2 className="text-base font-extrabold text-white">3. Document Uploads & Data Integrity</h2>
            <p>
              All academic marksheets, income certificates, identity documents, and credentials uploaded to the UniScholar Document Vault must be authentic and accurate. Submitting forged or misleading documents will result in account suspension and disqualification from scholarship matching.
            </p>

            <h2 className="text-base font-extrabold text-white">4. Scholarship Information & Application Status</h2>
            <p>
              While UniScholar continuously verifies government and corporate scholarship listings, final awards and disbursement decisions rest solely with the respective scholarship providers and government ministries.
            </p>

            <h2 className="text-base font-extrabold text-white">5. Privacy & Data Protection</h2>
            <p>
              Your personal data is encrypted and handled in strict accordance with our <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link>. We never sell your personal information to third parties.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pt-4">
          🔒 Encrypted & Secure • © 2026 UniScholar. All rights reserved.
        </div>

      </div>
    </div>
  );
}
