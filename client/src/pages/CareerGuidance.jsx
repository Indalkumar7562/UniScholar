import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { Compass, BookOpen, GraduationCap, ArrowRight, RefreshCw, Star } from 'lucide-react';

const STREAMS = ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'ITI'];
const INTERESTS = [
  { name: 'Technology & Code', key: 'tech', icon: '💻' },
  { name: 'Finance & Stocks', key: 'finance', icon: '📈' },
  { name: 'Creative Designing', key: 'creative', icon: '🎨' },
  { name: 'Research & Labs', key: 'research', icon: '🔬' },
  { name: 'Public Administration', key: 'public', icon: '🏛️' },
  { name: 'Healthcare & Nursing', key: 'medical', icon: '🩺' },
];

const MATCH_LOGIC = {
  'Science-tech': {
    title: 'Software Developer or Data Scientist',
    desc: 'Solve complex business problems by writing algorithms and building state-of-the-art tech platforms.',
    salary: '₹6L - ₹18L per annum',
    scholarships: 'Aditya Birla Scholarship, Ramanujan Tech Fellowship',
    subjects: 'Python, Calculus, Algorithms, Database Systems',
  },
  'Science-research': {
    title: 'Biotech Research Analyst',
    desc: 'Work in molecular physics or chemical laboratories developing green energy or clinical research drugs.',
    salary: '₹5L - ₹12L per annum',
    scholarships: 'KVPY Fellowships, INSPIRE Scholarship, CSIR UGC NET support',
    subjects: 'Microbiology, Genetics, Quantum Mechanics',
  },
  'Engineering-tech': {
    title: 'Full Stack Engineer or Cloud Architect',
    desc: 'Design scalable server logic, deploy AWS databases, and manage corporate software products.',
    salary: '₹8L - ₹24L per annum',
    scholarships: 'Tata Scholarship for Engineering, Siemens Tech Scholarship',
    subjects: 'Docker, Web Services, Architecture Design, Git',
  },
  'Commerce-finance': {
    title: 'Investment Banker or Chartered Accountant',
    desc: 'Audit corporate accounting papers, draft financial sheets, and direct investment assets.',
    salary: '₹7L - ₹20L per annum',
    scholarships: 'LIC Golden Jubilee Scholarship, HDFC Educational Crisis Scholarship',
    subjects: 'Auditing, Corporate Law, Valuation Metrics',
  },
  'Arts-creative': {
    title: 'UI/UX Designer or Content Director',
    desc: 'Design beautiful app interfaces, write marketing copies, and direct media visuals.',
    salary: '₹4.5L - ₹10L per annum',
    scholarships: 'CCRT Scholarship for Cultural Talents, Inlaks Shivdasani Support',
    subjects: 'Figma, Visual Arts, Creative Writing',
  },
};

const DEFAULT_MATCH = {
  title: 'Civil Services / Public Relations Executive',
  desc: 'Represent public or corporate organizations, managing policy communications and administrative tasks.',
  salary: '₹5L - ₹9L per annum',
  scholarships: 'Pre-Exam Training Support, National Fellowship Schemes',
  subjects: 'General Studies, Public Administration, Ethics',
};

export default function CareerGuidance() {
  const [selectedStream, setSelectedStream] = useState('Science');
  const [selectedInterest, setSelectedInterest] = useState('tech');
  const [matching, setMatching] = useState(false);
  const [careerResult, setCareerResult] = useState(null);

  const runAssessment = () => {
    setMatching(true);
    setCareerResult(null);
    setTimeout(() => {
      const key = `${selectedStream}-${selectedInterest}`;
      const match = MATCH_LOGIC[key] || DEFAULT_MATCH;
      setCareerResult(match);
      setMatching(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Career Guidance</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            AI Career Path Finder
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Discover matching career streams, curriculum roadmaps, and special corporate scholarships tailored to your academic background.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assessment Widget Panel */}
          <div className="lg:col-span-1 card space-y-6">
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-150 dark:border-slate-800 pb-3">
              <Compass className="w-5 h-5 text-primary-500" />
              Configure Profile
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label">Select Education Stream</label>
                <div className="grid grid-cols-3 gap-2">
                  {STREAMS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStream(s)}
                      className={`px-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedStream === s
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-350 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Select Your Interest Area</label>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((int) => (
                    <button
                      key={int.key}
                      onClick={() => setSelectedInterest(int.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                        selectedInterest === int.key
                          ? 'bg-primary-50 text-primary-600 border-primary-300 dark:bg-primary-950/20 dark:border-primary-900'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-350 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{int.icon}</span>
                      <span>{int.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={runAssessment}
                disabled={matching}
                className="btn btn-primary w-full py-3 text-xs font-bold gap-2 flex items-center justify-center shadow-lg shadow-primary-500/10 hover-scale"
              >
                {matching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
                {matching ? 'Calculating Roadmaps...' : 'Discover Career Paths'}
              </button>
            </div>
          </div>

          {/* Results Display Panel */}
          <div className="lg:col-span-2 space-y-6">
            {careerResult ? (
              <div className="card border-l-4 border-l-primary-500 bg-white dark:bg-slate-800 p-6 space-y-5 animate-slide-up shadow-md">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-primary-600 font-extrabold uppercase bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded-full">
                      Highly Compatible Path
                    </span>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mt-2">
                      {careerResult.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-xl text-[11px]">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> Premium Fit
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {careerResult.desc}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-750 pt-4 text-xs">
                  <div>
                    <span className="font-bold text-gray-500 dark:text-slate-400 block mb-1">Average Starting Salary</span>
                    <span className="font-mono font-extrabold text-gray-800 dark:text-slate-200">{careerResult.salary}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500 dark:text-slate-400 block mb-1">Target Scholarship Funding</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{careerResult.scholarships}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-gray-700 dark:text-slate-350 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-primary-500" /> Recommended Study Curriculum
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Master these skills to excel in this path: <strong>{careerResult.subjects}</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div className="card py-16 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-gray-200 dark:border-slate-700/80">
                <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-2xl">
                  💡
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Select Stream & Interests</h3>
                  <p className="text-xs text-gray-400 dark:text-slate-500 max-w-sm mt-1 leading-relaxed">
                    Set your background stream and interest keywords in the left panel to load your AI Career suggestions.
                  </p>
                </div>
              </div>
            )}

            {/* Counselors List Banner */}
            <div className="card bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl shadow-indigo-600/10">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-extrabold text-base">Need Live Mentorship?</h4>
                <p className="text-xs text-indigo-100 max-w-md leading-relaxed">
                  Book a direct virtual roadmap session with industry executives from Google, Tata, and Deloitte to guide your curriculum steps.
                </p>
              </div>
              <button 
                onClick={() => alert('Booking panel coming soon! Online counseling features are mock only.')}
                className="btn bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold py-2.5 px-5 shrink-0 shadow-lg"
              >
                Schedule Session <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
