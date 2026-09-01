import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Search, Eye, Edit3, Trash2, ShieldCheck, AlertTriangle, X, Check, Filter } from 'lucide-react';
import { Spinner } from '../components/ui/index.jsx';
import StudentIdBadge from '../components/ui/StudentIdBadge.jsx';
import toast from 'react-hot-toast';

const DEMO_STUDENTS = [
  {
    _id: 's1',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    status: 'Active',
    createdAt: '2026-08-15',
    applicationsCount: 3,
    profile: { age: 19, gender: 'Male', state: 'Bihar', educationLevel: '12th Pass', stream: 'Science', annualFamilyIncome: 180000, category: 'OBC', isComplete: true }
  },
  {
    _id: 's2',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    status: 'Active',
    createdAt: '2026-08-20',
    applicationsCount: 2,
    profile: { age: 20, gender: 'Female', state: 'Maharashtra', educationLevel: 'Graduation', stream: 'Engineering', annualFamilyIncome: 240000, category: 'General', isComplete: true }
  },
  {
    _id: 's3',
    name: 'Amit Patel',
    email: 'amit.patel@gmail.com',
    status: 'Suspended',
    createdAt: '2026-08-22',
    applicationsCount: 1,
    profile: { age: 21, gender: 'Male', state: 'Gujarat', educationLevel: 'Graduation', stream: 'Commerce', annualFamilyIncome: 350000, category: 'SC', isComplete: false }
  }
];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals state
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeEditTab, setActiveEditTab] = useState('personal');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStudents();
      if (res.data?.students && res.data.students.length > 0) {
        setStudents(res.data.students);
      } else {
        setStudents(DEMO_STUDENTS);
      }
    } catch (err) {
      setStudents(DEMO_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!editStudent) return;

    try {
      await adminAPI.updateStudent(editStudent._id, {
        name: editStudent.name,
        email: editStudent.email,
        status: editStudent.status,
        profileData: editStudent.profile
      });
      toast.success('✓ Student record updated successfully!');
      fetchStudents();
      setEditStudent(null);
    } catch (err) {
      toast.error('Failed to update student');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirm) return;
    try {
      await adminAPI.deleteStudent(deleteConfirm._id);
      toast.success('Student account deleted');
      setDeleteConfirm(null);
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminAPI.updateStudent(student._id, { status: nextStatus });
      toast.success(`Student status changed to ${nextStatus}`);
      fetchStudents();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || 
                          s.email.toLowerCase().includes(q) || 
                          (s.studentId && s.studentId.toLowerCase().includes(q));
    const matchesCategory = filterCategory === 'All' || s.profile?.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Student Management Directory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage, verify, edit, and audit student accounts and profile scores.</p>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Student ID, name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="EWS">EWS</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center p-12"><Spinner /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Student ID</th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Education & Stream</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Family Income</th>
                  <th className="p-4">Applications</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredStudents.map(student => (
                  <tr key={student._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <StudentIdBadge studentId={student.studentId || 'USS-STU-2026-000001'} size="sm" />
                    </td>
                    <td className="p-4 font-bold text-white">
                      <div>{student.name}</div>
                      <span className="text-[10px] font-mono text-slate-400">{student.email}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{student.profile?.educationLevel || 'N/A'}</div>
                      <span className="text-[10px] text-slate-400">{student.profile?.stream || '-'}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                        {student.profile?.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      ₹{student.profile?.annualFamilyIncome ? student.profile.annualFamilyIncome.toLocaleString() : '0'}
                    </td>
                    <td className="p-4 font-mono text-blue-400 font-bold">
                      {student.applicationsCount || 0} Apps
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        student.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setViewStudent(student); }} 
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer transition-all active:scale-95" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setEditStudent(student); setActiveEditTab('personal'); }} 
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 cursor-pointer transition-all active:scale-95" 
                          title="Edit Student"
                        >
                          <Edit3 className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(student); }} 
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer transition-all active:scale-95" 
                          title="Suspend/Activate"
                        >
                          <ShieldCheck className="w-4 h-4 pointer-events-none" />
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(student); }} 
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 cursor-pointer transition-all active:scale-95" 
                          title="Delete Account"
                        >
                          <Trash2 className="w-4 h-4 pointer-events-none" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW STUDENT DETAILS MODAL (Eye Symbol 👁️) */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" /> Student Profile Details
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Read-only profile inspection for {viewStudent.name}</p>
              </div>
              <button onClick={() => setViewStudent(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student Identification</span>
                  <StudentIdBadge studentId={viewStudent.studentId || 'USS-STU-2026-000001'} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Full Name</span>
                    <strong className="text-white">{viewStudent.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Email Address</span>
                    <span className="font-mono text-slate-300">{viewStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Education Level</span>
                    <strong className="text-blue-400">{viewStudent.profile?.educationLevel || '12th Pass'} ({viewStudent.profile?.stream || 'Science'})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Domicile State</span>
                    <strong className="text-white">{viewStudent.profile?.state || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Social Category</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] inline-block mt-0.5">
                      {viewStudent.profile?.category || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Annual Family Income</span>
                    <strong className="text-emerald-400 font-mono">₹{viewStudent.profile?.annualFamilyIncome ? viewStudent.profile.annualFamilyIncome.toLocaleString() : '0'}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button onClick={() => setViewStudent(null)} className="btn btn-ghost px-5 py-2 text-xs font-bold text-slate-300">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base">✏️ Edit Student Record: {editStudent.name}</h3>
              <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-bold gap-4">
              {['personal', 'academic', 'financial', 'status'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveEditTab(tab)}
                  className={`pb-2 capitalize ${activeEditTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'}`}
                >
                  {tab} Details
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              
              {activeEditTab === 'personal' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Student Name</label>
                    <input
                      type="text"
                      value={editStudent.name}
                      onChange={e => setEditStudent(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editStudent.email}
                      onChange={e => setEditStudent(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">State</label>
                      <input
                        type="text"
                        value={editStudent.profile?.state || ''}
                        onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, state: e.target.value } }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Age</label>
                      <input
                        type="number"
                        value={editStudent.profile?.age || 18}
                        onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, age: Number(e.target.value) } }))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeEditTab === 'academic' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Education Level</label>
                    <input
                      type="text"
                      value={editStudent.profile?.educationLevel || ''}
                      onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, educationLevel: e.target.value } }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Stream / Branch</label>
                    <input
                      type="text"
                      value={editStudent.profile?.stream || ''}
                      onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, stream: e.target.value } }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {activeEditTab === 'financial' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      value={editStudent.profile?.annualFamilyIncome || 0}
                      onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, annualFamilyIncome: Number(e.target.value) } }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Category</label>
                    <select
                      value={editStudent.profile?.category || 'General'}
                      onChange={e => setEditStudent(p => ({ ...p, profile: { ...p.profile, category: e.target.value } }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="Minority">Minority</option>
                    </select>
                  </div>
                </div>
              )}

              {activeEditTab === 'status' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">Account Authorization Status</label>
                    <select
                      value={editStudent.status || 'Active'}
                      onChange={e => setEditStudent(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setEditStudent(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
                <button type="submit" className="btn btn-primary px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl">Save Changes →</button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950 border border-red-800/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Delete Student Account?</h4>
              <p className="text-xs text-slate-400 mt-1">Are you sure you want to delete {deleteConfirm.name}? This action cannot be undone.</p>
            </div>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost px-4 py-2 text-xs">Cancel</button>
              <button onClick={handleDeleteStudent} className="btn px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
