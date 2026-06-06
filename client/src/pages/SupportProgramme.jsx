import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { Sparkles, Trophy, HeartHandshake, FileBadge, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupportProgramme() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [need, setNeed] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success('Application received! Our scholarship counselor will reach out on your mobile shortly.');
      setName('');
      setMobile('');
      setNeed('');
      setSubmitting(false);
    }, 800);
  };

  const perks = [
    { icon: Trophy, title: 'Dedicated Scholarship Search', desc: 'Our team will handpick corporate and state schemes that perfectly fit your credentials.' },
    { icon: HeartHandshake, title: 'Document Rectification Support', desc: 'Struggling with income certificate issues or caste certificate spell errors? We help resolve them.' },
    { icon: FileBadge, title: 'Mock Verification Audits', desc: 'Pre-check your documents with our AI verification systems to ensure a 100% selection record.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
        
        {/* Banner Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-8 md:p-12 text-slate-950 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-9xl font-mono select-none pointer-events-none">
            2026
          </div>
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <span className="inline-block text-[9px] font-black tracking-widest bg-slate-950 text-amber-400 px-3 py-1 rounded-full uppercase">
              Exclusive Welfare Programme
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase">
              USS Scholarship Support Programme 2026-27
            </h1>
            <p className="text-xs md:text-sm font-semibold text-slate-800 leading-relaxed">
              Struggling to find or apply for scholarships? Join our comprehensive support initiative. We provide end-to-end guidance, documentation audits, and application tracking to maximize your approval rates.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-lg text-2xl animate-bounce-slow">
            🎗️
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {perks.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div key={idx} className="card p-5 space-y-3 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">{perk.title}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{perk.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-3 card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 shadow-md">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide border-b border-gray-150 dark:border-slate-800 pb-3 mb-5 flex items-center gap-1.5">
              <HeartHandshake className="w-5 h-5 text-amber-500" />
              Apply for Support Programme
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input text-xs font-semibold"
                    placeholder="e.g. Priya Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="label">Active Mobile Number *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="input text-xs font-semibold"
                    placeholder="e.g. +91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Describe Your Financial Need / Academic Background *</label>
                <textarea
                  rows="4"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  className="textarea text-xs font-semibold"
                  placeholder="Explain why you require scholarship funding and mentorship support..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn bg-amber-400 hover:bg-amber-500 text-slate-950 w-full py-3 text-xs font-bold gap-2 flex items-center justify-center shadow-lg"
              >
                {submitting ? 'Submitting Application...' : 'Apply for Support Programme'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick FAQ Box */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card space-y-4">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide">Frequently Asked Questions</h3>
              
              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-gray-800 dark:text-slate-200">Is this programme free of charge?</span>
                  <p className="text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Yes, the base consultancy and search guidance is entirely free. Premium services like essay drafting or translation carry small service fees.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-slate-200">Who is eligible to register?</span>
                  <p className="text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Any student pursuing secondary, graduation, or polytechnic diploma courses in India with a annual household income under ₹4 Lakhs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
