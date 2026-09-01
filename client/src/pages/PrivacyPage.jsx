import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
              <div className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Privacy Policy</div>
            </div>
          </Link>

          <Link to="/login" className="btn btn-outline text-xs px-4 py-2 flex items-center gap-2 text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Authentication
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-8 rounded-3xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-3 text-emerald-400 font-bold">
            <Lock className="w-6 h-6" />
            <h1 className="text-2xl font-black text-white">UniScholar Privacy Policy</h1>
          </div>
          
          <p className="text-xs text-slate-400">Last updated: September 1, 2026</p>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h2 className="text-base font-extrabold text-white">1. Information We Collect</h2>
            <p>
              UniScholar collects student profile information (name, email, educational qualification, income range, category, state) and uploaded document credentials (marksheets, income certificates) strictly to perform eligibility matching and application tracking.
            </p>

            <h2 className="text-base font-extrabold text-white">2. How Information is Used</h2>
            <p>
              Your data is utilized exclusively for matching you with verified government and corporate scholarships, assessing eligibility requirements, and assisting with your scholarship applications.
            </p>

            <h2 className="text-base font-extrabold text-white">3. Data Security & Encryption</h2>
            <p>
              All stored credentials, passwords (hashed with bcrypt), and uploaded documents are encrypted. Document files stored in the private Document Vault are accessible only to verified student account holders and authorized administrators.
            </p>

            <h2 className="text-base font-extrabold text-white">4. Your Rights</h2>
            <p>
              You have full control over your data. You may inspect, update, or remove your uploaded documents and profile information at any time via the <Link to="/profile" className="text-primary-400 hover:underline">My Profile</Link> and Document Vault interfaces.
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
