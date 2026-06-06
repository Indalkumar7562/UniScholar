import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { BookOpen, GraduationCap, MapPin, Search, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnlineDegrees() {
  const [tab, setTab] = useState('ug');
  const [search, setSearch] = useState('');

  const courses = [
    {
      id: 'bca',
      title: 'Online Bachelor of Computer Applications (BCA)',
      university: 'Manipal University Online',
      duration: '3 Years',
      eligibility: '12th Pass',
      fees: '₹1,20,000 Total',
      level: 'ug',
      logo: '🎓',
    },
    {
      id: 'bba',
      title: 'Online Bachelor of Business Administration (BBA)',
      university: 'Amity University Online',
      duration: '3 Years',
      eligibility: '12th Pass',
      fees: '₹1,50,000 Total',
      level: 'ug',
      logo: '💼',
    },
    {
      id: 'mca',
      title: 'Online Master of Computer Applications (MCA)',
      university: 'LPU Online',
      duration: '2 Years',
      eligibility: 'Graduation in BCA/BSc',
      fees: '₹90,000 Total',
      level: 'pg',
      logo: '💻',
    },
    {
      id: 'mba',
      title: 'Online Master of Business Administration (MBA)',
      university: 'Sikkim Manipal University Online',
      duration: '2 Years',
      eligibility: 'Graduation (Any Stream)',
      fees: '₹1,80,000 Total',
      level: 'pg',
      logo: '📊',
    },
  ];

  const filtered = courses.filter(
    (c) =>
      c.level === tab &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.university.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInquire = (courseTitle) => {
    toast.success(`Inquiry logged for "${courseTitle}"! Program coordinators will share the detailed syllabus PDF.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Distance Education</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Partnered Online Degrees
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Pursue remote degree courses from India's top NAAC A+ accredited universities, complete with study materials and virtual examinations.
          </p>
        </div>

        {/* Filter and search bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('ug')}
              className={`chip px-5 py-2.5 text-xs font-bold ${tab === 'ug' ? 'chip-active' : ''}`}
            >
              Undergraduate Programs
            </button>
            <button
              onClick={() => setTab('pg')}
              className={`chip px-5 py-2.5 text-xs font-bold ${tab === 'pg' ? 'chip-active' : ''}`}
            >
              Postgraduate Programs
            </button>
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="Search courses or universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Grid layout */}
        {filtered.length === 0 ? (
          <div className="card py-16 text-center text-xs text-gray-400 dark:text-slate-500">
            No courses match the criteria. Try updating the filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center text-xl shrink-0">
                      {c.logo}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{c.university}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] bg-gray-50/50 dark:bg-slate-900/40 p-2.5 rounded-xl">
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[8px]">Duration</span>
                      <span className="font-extrabold text-gray-700 dark:text-slate-200">{c.duration}</span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[8px]">Eligibility</span>
                      <span className="font-bold text-gray-700 dark:text-slate-200 truncate block px-1" title={c.eligibility}>
                        {c.eligibility}
                      </span>
                    </div>
                    <div>
                      <span className="block text-gray-400 font-bold uppercase text-[8px]">Program Fee</span>
                      <span className="font-extrabold text-primary-600 font-mono">{c.fees}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleInquire(c.title)}
                    className="btn btn-primary text-xs py-2 px-4 flex-1 flex items-center justify-center gap-1 font-bold shadow-md"
                  >
                    Request Brochure <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="https://www.education.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost text-xs py-2 px-3 border border-gray-200 dark:border-slate-750 flex items-center justify-center gap-1 hover:bg-gray-50"
                  >
                    Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
