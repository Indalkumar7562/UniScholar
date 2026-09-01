import { useState } from 'react';
import { CheckCircle2, Shield, Plus, Edit3, Trash2, Sliders, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_RULES = [
  { _id: 'r1', schemeName: 'Merit-Cum-Means Scholarship for Minority Students', ageRange: '18 - 25', incomeLimit: 250000, educationLevel: 'Graduation', minMarks: 50, state: 'All India', category: 'Minority' },
  { _id: 'r2', schemeName: 'Post-Matric Scholarship for SC/ST Students', ageRange: '16 - 30', incomeLimit: 300000, educationLevel: '12th Pass / Higher', minMarks: 45, state: 'Gujarat', category: 'SC / ST' },
  { _id: 'r3', schemeName: 'PG Indira Gandhi Scholarship for Single Girl Child', ageRange: 'Below 30', incomeLimit: 600000, educationLevel: 'Post Graduation', minMarks: 60, state: 'All India', category: 'Single Girl Child' },
];

export default function AdminEligibilityPage() {
  const [rules, setRules] = useState(DEMO_RULES);

  const handleDeleteRule = (id) => {
    setRules(prev => prev.filter(r => r._id !== id));
    toast.success('Eligibility rule updated');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Structured Eligibility Rules Engine</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure deterministic eligibility criteria for scholarship matching. No arbitrary AI-generated rules.</p>
        </div>
        <button
          onClick={() => toast.info('New eligibility rule configuration opened.')}
          className="btn btn-primary text-xs py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Eligibility Rule
        </button>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Target Scholarship Scheme</th>
                <th className="p-4">Age Limit</th>
                <th className="p-4">Income Ceiling</th>
                <th className="p-4">Education Level</th>
                <th className="p-4">Min. Marks</th>
                <th className="p-4">State</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {rules.map(rule => (
                <tr key={rule._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-white max-w-xs">{rule.schemeName}</td>
                  <td className="p-4 font-mono text-slate-300">{rule.ageRange} yrs</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">≤ ₹{rule.incomeLimit.toLocaleString()}</td>
                  <td className="p-4 text-slate-300">{rule.educationLevel}</td>
                  <td className="p-4 font-mono font-bold text-blue-400">{rule.minMarks}%</td>
                  <td className="p-4 font-mono text-slate-400">{rule.state}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => handleDeleteRule(rule._id)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
