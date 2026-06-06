import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { Building2, Landmark, Trophy, FileSpreadsheet, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BecomePartner() {
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [budget, setBudget] = useState('10L-50L');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Inquiry submitted! Our partnership leads will reach out within 24 hours.');
      setCompany('');
      setEmail('');
      setMessage('');
      setSubmitting(false);
    }, 800);
  };

  const benefits = [
    { icon: Trophy, title: 'Impact Branding', desc: 'Sponsor dedicated corporate scholarships named after your enterprise and increase social brand trust.' },
    { icon: Landmark, title: 'Compliance & CSR tax benefit', desc: 'Secure Section 80G tax write-offs and meet mandated corporate social responsibility regulations.' },
    { icon: FileSpreadsheet, title: 'AI-Driven Transparency', desc: 'Track fund disbursement, verify student profiles via OCR audit logs, and view performance indexes.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Partnership Hub</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Partner with UniScholar
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Collaborate with India's largest smart scholarship portal. Launch corporate schemes, fund deserving students, and manage endowments with absolute transparency.
          </p>
        </div>

        {/* Benefits cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="card p-5 space-y-3 text-center md:text-left bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 flex items-center justify-center mx-auto md:mx-0 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{b.title}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Partnership Form */}
          <div className="lg:col-span-3 card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 shadow-md">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide border-b border-gray-150 dark:border-slate-800 pb-3 mb-5 flex items-center gap-1.5">
              <Building2 className="w-5 h-5 text-primary-500" />
              Partnership Inquiry Form
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company / Foundation Name *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input text-xs font-semibold"
                    placeholder="e.g. Tata Trusts"
                    required
                  />
                </div>
                <div>
                  <label className="label">Corporate Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input text-xs font-semibold"
                    placeholder="e.g. partner@tata.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Proposed Annual Scholarship Budget *</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="select text-xs font-semibold"
                >
                  <option value="Under 10L">Under ₹10 Lakhs</option>
                  <option value="10L-50L">₹10 Lakhs - ₹50 Lakhs</option>
                  <option value="50L-2Cr">₹50 Lakhs - ₹2 Crores</option>
                  <option value="Above 2Cr">Above ₹2 Crores</option>
                </select>
              </div>

              <div>
                <label className="label">Collaboration Goals / Details *</label>
                <textarea
                  rows="4"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea text-xs font-semibold"
                  placeholder="Tell us about the students or streams you want to support..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-3 text-xs font-bold gap-2 flex items-center justify-center shadow-lg"
              >
                {submitting ? 'Sending Request...' : 'Submit Partnership Request'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Stats & Current Partners Panel */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="card space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide">Impact Snapshot</h3>
              
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                  <div className="text-gray-400 uppercase font-bold text-[9px]">Sponsorship Volume</div>
                  <div className="text-xl font-black text-primary-600 mt-0.5">₹42 Crores+</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                  <div className="text-gray-400 uppercase font-bold text-[9px]">Active Sponsoring Corporates</div>
                  <div className="text-xl font-black text-gray-800 dark:text-white mt-0.5">140+ Partners</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                  <div className="text-gray-400 uppercase font-bold text-[9px]">Eligible Student Candidates</div>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">2.5 Lakhs+</div>
                </div>
              </div>
            </div>

            <div className="card bg-gray-550 border border-dashed border-gray-200 dark:border-slate-700/80 p-4">
              <span className="text-[10px] text-gray-400 uppercase font-extrabold block">Corporate Trust Partner</span>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                By integrating your corporate grant rules directly into our AI matching filter, we ensure 100% compliant matches, eliminating candidate screen biases.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
