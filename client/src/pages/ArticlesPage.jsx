import PublicNavbar from '../components/layout/PublicNavbar';
import { FileText, Clock, Calendar, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ArticlesPage() {
  const articles = [
    {
      title: 'How to Write a Stellar Scholarship SOP',
      desc: 'Discover key elements that corporate funders look for. Learn how to draft your personal background, financial need, and career objectives.',
      category: 'Writing Guides',
      readTime: '5 min read',
      date: 'May 20, 2026',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
    },
    {
      title: 'State Scholarship Document Checklist',
      desc: 'Avoid cancellation of your scholarship! Here is the complete checklist of verified files like domicile certificates, income sheets, and Aadhaar linking steps.',
      category: 'Documentation Help',
      readTime: '8 min read',
      date: 'May 15, 2026',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
    {
      title: 'Top Corporate Scholarships for Engineering Students',
      desc: 'A comprehensive review of high-value private scholarships from Siemens, Tata, and Rolls-Royce, offering up to ₹1,00,000 annual funding.',
      category: 'Scholarship Lists',
      readTime: '6 min read',
      date: 'May 10, 2026',
      badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
    },
    {
      title: 'Understanding Income Thresholds and BPL Status',
      desc: 'Clear explanation of how state welfare bodies compute family income limit thresholds, and what BPL ration card holders should know.',
      category: 'Policy Updates',
      readTime: '4 min read',
      date: 'May 05, 2026',
      badgeColor: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
    },
  ];

  const handleRead = (title) => {
    toast.success(`Opening "${title}"... (Mock article viewer)`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Knowledge Hub</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Articles & Study Guides
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Get the latest news on welfare rules, document verification methodologies, state timelines, and tips to increase your scholarship selection rate.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                  <span className={`px-2.5 py-1 rounded-full ${art.badgeColor}`}>{art.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {art.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {art.date}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {art.desc}
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleRead(art.title)}
                  className="btn btn-ghost text-xs text-primary-600 dark:text-primary-400 font-extrabold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Read Article <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
