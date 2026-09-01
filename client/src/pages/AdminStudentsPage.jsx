import { useState } from 'react';
import { Search, Eye, CheckCircle2, Flag, User, FileText, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

const DEMO_STUDENTS = [
  {
    _id: 's1',
    name: 'Priya Sharma',
    email: 'student@demo.com',
    educationLevel: '12th Pass',
    category: 'General',
    profileScore: 92,
    applicationsCount: 3,
    verificationStatus: 'Verified',
    state: 'Gujarat',
    annualFamilyIncome: 150000,
    cgpaOrPercentage: 88,
    stream: 'Science'
  },
  {
    _id: 's2',
    name: 'Rahul Verma',
    email: 'rahul.v@example.com',
    educationLevel: 'Graduation',
    category: 'OBC',
    profileScore: 78,
    applicationsCount: 2,
    verificationStatus: 'Pending',
    state: 'Maharashtra',
    annualFamilyIncome: 220000,
    cgpaOrPercentage: 79,
    stream: 'Engineering'
  },
  {
    _id: 's3',
    name: 'Ananya Das',
    email: 'ananya.d@example.com',
    educationLevel: 'Post Graduation',
    category: 'SC',
    profileScore: 95,
    applicationsCount: 4,
    verificationStatus: 'Verified',
    state: 'West Bengal',
    annualFamilyIncome: 180000,
    cgpaOrPercentage: 91,
    stream: 'Arts'
  },
  {
    _id: 's4',
    name: 'Karan Patel',
    email: 'karan.p@example.com',
    educationLevel: 'Diploma',
    category: 'ST',
    profileScore: 64,
    applicationsCount: 1,
    verificationStatus: 'Action Required',
    state: 'Rajasthan',
    annualFamilyIncome: 350000,
    cgpaOrPercentage: 72,
    stream: 'Technical'
  }
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState(DEMO_STUDENTS);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.state.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerifyStudent = (id) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, verificationStatus: 'Verified' } : s));
    toast.success('Student profile marked as Verified');
  };

  const handleFlagStudent = (id) => {
    setStudents(prev => prev.map(s => s._id === id ? { ...s, verificationStatus: 'Flagged' } : s));
    toast.error('Student profile flagged for verification audit');
  };

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">View profiles, academic & financial criteria, uploaded credentials, and verification status.</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student name, email, or state..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-slate-400 font-mono text-[11px]">Total Students: <strong className="text-white">{filteredStudents.length}</strong></span>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Education</th>
                <th className="p-4">Category</th>
                <th className="p-4">Completion</th>
                <th className="p-4">Applications</th>
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStudents.map(student => (
                <tr key={student._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div>
                      <span className="font-bold text-white block">{student.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{student.email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-200">{student.educationLevel}</span>
                    <span className="text-[10px] text-slate-400 block">{student.stream}</span>
                  </td>
                  <td className="p-4 font-mono">{student.category}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{student.profileScore}%</td>
                  <td className="p-4 font-mono">{student.applicationsCount} active</td>
                  <td className="p-4">
                    {student.verificationStatus === 'Verified' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">Verified ✓</span>
                    ) : student.verificationStatus === 'Flagged' ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">Flagged 🚩</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Pending Review</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleVerifyStudent(student._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400"
                        title="Verify Student"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFlagStudent(student._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400"
                        title="Flag Student"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs" onClick={() => setSelectedStudent(null)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl z-10 text-xs">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Student Profile Record</span>
                <h3 className="text-base font-extrabold text-white mt-0.5">{selectedStudent.name}</h3>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div><span className="text-[10px] text-slate-400 uppercase block">State</span><strong className="text-white">{selectedStudent.state}</strong></div>
              <div><span className="text-[10px] text-slate-400 uppercase block">Category</span><strong className="text-white">{selectedStudent.category}</strong></div>
              <div><span className="text-[10px] text-slate-400 uppercase block">Annual Income</span><strong className="text-emerald-400">₹{selectedStudent.annualFamilyIncome.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-400 uppercase block">Academic Score</span><strong className="text-blue-400">{selectedStudent.cgpaOrPercentage}%</strong></div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setSelectedStudent(null)} className="btn btn-ghost px-4 py-2 text-xs font-bold text-slate-400">Close</button>
              <button onClick={() => { handleVerifyStudent(selectedStudent._id); setSelectedStudent(null); }} className="btn btn-primary px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">Verify Profile</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
