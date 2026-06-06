import { useState } from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { Search, Trophy, MapPin, Award, Star, Quote } from 'lucide-react';

export default function ResultsPublicPage() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');

  const stats = [
    { value: '14,250+', label: 'Selected Students' },
    { value: '₹18 Crores+', label: 'Total Funds Disbursed' },
    { value: '28 States', label: 'Welfare Reach' },
  ];

  const winners = [
    { name: 'Priya Sharma', state: 'Maharashtra', school: 'IIT Bombay', scholarship: 'Tata CSR Scholarship', amount: '₹85,000' },
    { name: 'Aarav Patel', state: 'Gujarat', school: 'L.D. College of Engineering', scholarship: 'Ramanujan Tech Fellowship', amount: '₹60,000' },
    { name: 'Meera Nair', state: 'Kerala', school: 'Government Medical College', scholarship: 'Welfare Medical Grant', amount: '₹1,20,000' },
    { name: 'Rahul Verma', state: 'Delhi', school: 'Delhi University', scholarship: 'HDFC Crisis Scholarship', amount: '₹40,000' },
    { name: 'Sneha Reddy', state: 'Karnataka', school: 'RV College of Engineering', scholarship: 'Siemens Tech Scholarship', amount: '₹75,000' },
    { name: 'Amit Singh', state: 'Uttar Pradesh', school: 'BHU Varanasi', scholarship: 'Aditya Birla Scholarship', amount: '₹1,00,000' },
  ];

  const states = ['All', 'Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Kerala', 'Uttar Pradesh'];

  const filtered = winners.filter(
    (w) =>
      (selectedState === 'All' || w.state === selectedState) &&
      (w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.scholarship.toLowerCase().includes(search.toLowerCase()) ||
        w.school.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <PublicNavbar />

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="badge badge-primary text-xs uppercase font-extrabold px-3 py-1 rounded-full">Selected Scholars</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Welfare Selection Results
          </h1>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            UniScholar celebrates the success of students who successfully verified their profiles, matched eligibility criteria, and received educational funding.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-5 text-center bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <span className="text-2xl font-black text-primary-600 font-mono">{stat.value}</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Search & Filter section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2 justify-center">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`chip px-4 py-2 text-xs font-bold ${selectedState === st ? 'chip-active' : ''}`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="Search winners, schools, schemes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Results Grid */}
        {filtered.length === 0 ? (
          <div className="card py-16 text-center text-xs text-gray-400 dark:text-slate-500">
            No scholars match the search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((w, idx) => (
              <div
                key={idx}
                className="card bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-600 flex items-center justify-center font-extrabold text-xs">
                        {w.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">{w.name}</h4>
                        <span className="text-[9px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-gray-400" /> {w.state}
                        </span>
                      </div>
                    </div>
                    <Award className="w-5 h-5 text-amber-500 shrink-0" />
                  </div>

                  <div className="text-[10px] text-gray-500 dark:text-slate-400 space-y-1">
                    <div>
                      Institution: <span className="font-bold text-gray-700 dark:text-slate-350">{w.school}</span>
                    </div>
                    <div>
                      Scheme: <span className="font-bold text-primary-600">{w.scholarship}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-750 pt-3 mt-4 flex justify-between items-center text-[10px]">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Disbursed Amount</span>
                  <span className="text-xs font-black text-emerald-600 font-mono">{w.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Testimony section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100 text-center">Student Testimonials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-850 shadow-sm relative space-y-4">
              <Quote className="absolute top-4 right-4 w-10 h-10 text-gray-100 dark:text-slate-700 pointer-events-none" />
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed italic">
                "UniScholar made my Tata scholarship application a breeze. The automatic verification flag let me know that my income document matched the criteria perfectly. I received ₹85,000 direct to my bank account!"
              </p>
              <div className="flex items-center gap-2 text-[10px]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-gray-800 dark:text-slate-200">Priya Sharma</span> · IIT Bombay
              </div>
            </div>

            <div className="card p-6 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-850 shadow-sm relative space-y-4">
              <Quote className="absolute top-4 right-4 w-10 h-10 text-gray-100 dark:text-slate-700 pointer-events-none" />
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed italic">
                "I was unaware that I qualified for INSPIRE fellowship. I ran the eligibility test and the rule engine verified that my 12th marksheet grade matched the scheme. I'm now pursuing biotech without any worries."
              </p>
              <div className="flex items-center gap-2 text-[10px]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="font-bold text-gray-800 dark:text-slate-200">Aarav Patel</span> · L.D. College of Engineering
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
