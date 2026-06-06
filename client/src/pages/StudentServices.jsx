import PublicNavbar from '../components/layout/PublicNavbar';
import { ShieldCheck, BookOpen, Users, Compass, ArrowRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentServices() {
  const services = [
    {
      title: 'Direct Scholar Mentorship',
      desc: 'One-on-one session with past scholarship winners to guide you through application strategies.',
      icon: Users,
      price: 'Free',
      color: 'from-violet-500/10 to-violet-600/5',
      border: 'border-violet-100 dark:border-violet-900/30',
      badge: 'Highly Popular',
    },
    {
      title: 'Application Verification Pre-Audit',
      desc: 'Let our AI and verification team review your family income certificate and caste details before submission to avoid rejections.',
      icon: ShieldCheck,
      price: '₹199',
      color: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      badge: 'Recommended',
    },
    {
      title: 'Scholarship Essay & SOP Drafting',
      desc: 'Get expert guidance on writing compelling Statements of Purpose for premium corporate scholarship applications.',
      icon: BookOpen,
      price: '₹349',
      color: 'from-blue-500/10 to-blue-600/5',
      border: 'border-blue-100 dark:border-blue-900/30',
      badge: 'Premium',
    },
    {
      title: 'Caste & Income Certificate Assistance',
      desc: 'Step-by-step assistance in gathering paperwork and submitting applications to state revenue bodies.',
      icon: Compass,
      price: 'Free',
      color: 'from-amber-500/10 to-amber-600/5',
      border: 'border-amber-100 dark:border-amber-900/30',
      badge: 'Essential',
    },
  ];

  const handleInquire = (serviceName) => {
    toast.success(`Inquiry sent for "${serviceName}"! Our coordinator will contact you shortly.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">USS Services</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Premium Student Services
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Maximize your application approval odds. We provide counseling, documentation audits, and mentoring to ease your welfare journey.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div 
                key={idx} 
                className={`card bg-gradient-to-br ${svc.color} border ${svc.border} flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 bg-white dark:bg-slate-800 text-primary-600 rounded-full shadow-sm">
                      {svc.badge}
                    </span>
                    <span className="text-sm font-black text-gray-900 dark:text-white font-mono">
                      {svc.price}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => handleInquire(svc.title)}
                    className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md hover:scale-105 transition-all duration-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Book Service <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ banner */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-850 border border-gray-150 dark:border-slate-800 shadow-md text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">Need Custom Assistance?</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            Our support experts are available 24/7. Ask us about educational aid programs, document uploads, or college validation rules.
          </p>
          <button 
            onClick={() => handleInquire('Custom Help Desk Support')}
            className="btn btn-secondary text-xs px-5 py-2.5 font-bold"
          >
            Chat with an Expert Counselor
          </button>
        </div>
      </main>
    </div>
  );
}
