import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Sparkles, GraduationCap, Users, MapPin, Star } from 'lucide-react';

const FEATURES = [
  { icon: '🎯', title: 'Easy Eligibility Check',        desc: 'Enter your profile once and instantly discover every scheme you qualify for.', color: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-100 dark:border-blue-900/30' },
  { icon: '✨', title: 'Personalized Recommendations',   desc: 'AI-powered matching tailored to your category, income, education & state.', color: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-100 dark:border-violet-900/30' },
  { icon: '🔒', title: 'Secure & Private',               desc: 'Bank-grade encryption protects your data. We never share your information.', color: 'from-emerald-500/10 to-emerald-600/5', border: 'border-emerald-100 dark:border-emerald-900/30' },
];

const STATS = [
  { value: '500+',  label: 'Scholarships Listed',  icon: GraduationCap },
  { value: '2.5L+', label: 'Students Helped',       icon: Users },
  { value: '28',    label: 'States Covered',         icon: MapPin },
  { value: '94%',   label: 'Success Rate',           icon: Star },
];

const STEPS = [
  { n: '01', title: 'Create Profile',   desc: 'Enter your age, income, category, education & state.' },
  { n: '02', title: 'Check Eligibility', desc: 'Our engine scans all active schemes in seconds.' },
  { n: '03', title: 'Apply & Track',     desc: 'View details, required docs, and apply directly.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 dark:text-white text-base">
              USS <span className="text-primary-600 font-medium text-sm">Portal</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost text-sm py-2 px-4 hidden sm:flex" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn btn-primary text-sm py-2 px-4" onClick={() => navigate('/register')}>
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden py-24 lg:py-32 px-4">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            🇮🇳 Government of India · Scholarship Portal
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 text-balance">
            Find Scholarships<br />
            <span className="gradient-text">You Are Eligible For</span>
          </h1>
          <p className="text-lg text-blue-200/80 max-w-xl mx-auto mb-10 leading-relaxed">
            India's most comprehensive scholarship discovery platform. Enter your profile once and get matched to hundreds of government schemes instantly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="btn btn-lg bg-white text-primary-700 hover:bg-blue-50 shadow-xl shadow-black/20 font-bold" onClick={() => navigate('/register')}>
              🚀 Check My Eligibility
            </button>
            <button className="btn btn-lg glass text-white border border-white/20 hover:bg-white/10" onClick={() => navigate('/login')}>
              Browse Schemes
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <section className="bg-primary-600 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-3xl font-extrabold text-white">{value}</div>
              <div className="text-xs text-blue-200 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-3 text-xs">Why Choose Us</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Everything You Need</h2>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
              We simplify the complex world of government scholarships into a fast, clean, personalized experience.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 bg-gradient-to-br ${f.color} border ${f.border} animate-fade-up`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">How It Works</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-14 text-sm">3 simple steps to find your scholarship</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg mb-4 shadow-lg shadow-primary-600/30">
                  {s.n}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{s.title}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="hero-gradient py-20 px-4 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Find Your Scholarship?</h2>
        <p className="text-blue-200/70 mb-8 text-sm">Join 2.5 lakh+ students already using the platform.</p>
        <button className="btn btn-lg bg-white text-primary-700 font-bold shadow-xl shadow-black/20 hover:bg-blue-50" onClick={() => navigate('/register')}>
          Get Started for Free <ArrowRight className="w-5 h-5" />
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Universal Scholarship System · Government of India Initiative
      </footer>
    </div>
  );
}
