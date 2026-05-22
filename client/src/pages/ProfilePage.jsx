import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, aiAPI } from '../services/api';
import { t } from '../utils/translate';
import { SectionHeader, Avatar, ProgressBar, Spinner } from '../components/ui/index.jsx';
import { 
  Save, User, BookOpen, IndianRupee, FileText, Upload, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

const EDU_LEVELS = ['Below 10th', '10th Pass', '12th Pass', 'Graduation', 'Post Graduation'];
const STREAMS     = ['Science', 'Commerce', 'Arts', 'Diploma', 'Engineering', 'Medical', 'ITI', 'Not Applicable'];
const CATEGORIES  = ['General', 'OBC', 'SC', 'ST'];
const GENDERS     = ['Male', 'Female', 'Other'];
const PROFESSIONS = ['Student', 'Farmer', 'Labour Worker', 'Government Employee', 'Private Employee', 'Unemployed'];
const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka','Kerala',
  'Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand',
  'West Bengal'
];

const MOCK_FILES = {
  aadhaar: 'https://uss-documents.s3.amazonaws.com/aadhaar_priya.pdf',
  incomeCertificate: 'https://uss-documents.s3.amazonaws.com/income_priya.pdf',
  marksheet: 'https://uss-documents.s3.amazonaws.com/marksheet_priya.pdf',
  domicile: 'https://uss-documents.s3.amazonaws.com/domicile_priya.pdf',
  casteCertificate: 'https://uss-documents.s3.amazonaws.com/caste_priya.pdf'
};

export default function ProfilePage() {
  const { user, profile, updateProfile, language, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState({});
  const [ocrResults, setOcrResults] = useState({});

  const [form, setForm] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    state: '',
    district: '',
    mobileNumber: '',
    email: '',
    educationLevel: '',
    stream: '',
    collegeName: '',
    cgpaOrPercentage: '',
    currentYearOrSemester: '',
    profession: 'Student',
    annualFamilyIncome: '',
    bplStatus: false,
    category: 'General',
    minorityStatus: false,
    disabilityStatus: false,
    documentUploads: {
      aadhaar: '',
      incomeCertificate: '',
      casteCertificate: '',
      domicile: '',
      marksheet: '',
      disabilityCertificate: ''
    }
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        age: profile.age || '',
        gender: profile.gender || 'Male',
        state: profile.state || '',
        district: profile.district || '',
        mobileNumber: profile.mobileNumber || '',
        email: profile.email || user?.email || '',
        educationLevel: profile.educationLevel || '',
        stream: profile.stream || '',
        collegeName: profile.collegeName || '',
        cgpaOrPercentage: profile.cgpaOrPercentage || '',
        currentYearOrSemester: profile.currentYearOrSemester || '',
        profession: profile.profession || 'Student',
        annualFamilyIncome: profile.annualFamilyIncome || '',
        bplStatus: profile.bplStatus || false,
        category: profile.category || 'General',
        minorityStatus: profile.minorityStatus || false,
        disabilityStatus: profile.disabilityStatus || false,
        documentUploads: {
          aadhaar: profile.documentUploads?.aadhaar || '',
          incomeCertificate: profile.documentUploads?.incomeCertificate || '',
          casteCertificate: profile.documentUploads?.casteCertificate || '',
          domicile: profile.documentUploads?.domicile || '',
          marksheet: profile.documentUploads?.marksheet || '',
          disabilityCertificate: profile.documentUploads?.disabilityCertificate || ''
        }
      });
    }
  }, [profile, user]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckbox = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const calculateCompleteness = () => {
    let score = 0;
    const totalFields = 10;
    if (form.fullName) score++;
    if (form.age) score++;
    if (form.state) score++;
    if (form.mobileNumber) score++;
    if (form.educationLevel) score++;
    if (form.stream) score++;
    if (form.cgpaOrPercentage) score++;
    if (form.annualFamilyIncome !== '') score++;
    if (form.documentUploads?.incomeCertificate) score++;
    if (form.documentUploads?.marksheet) score++;
    return Math.round((score / totalFields) * 100);
  };

  const pct = calculateCompleteness();

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        age: Number(form.age),
        annualFamilyIncome: Number(form.annualFamilyIncome),
        cgpaOrPercentage: Number(form.cgpaOrPercentage)
      };
      const { data } = await userAPI.saveProfile(payload);
      updateProfile(data.profile);
      toast.success(t('saveProfile', language) + ' successfully!');
      await fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Simulate OCR Scan verification
  const triggerOCR = async (docType) => {
    setOcrLoading(prev => ({ ...prev, [docType]: true }));
    try {
      const fileUrl = MOCK_FILES[docType];
      const { data } = await aiAPI.verifyDocument(docType, fileUrl);
      
      setOcrResults(prev => ({ ...prev, [docType]: data }));
      toast.success(`${docType} details extracted!`);

      // Autofill fields based on document
      if (docType === 'incomeCertificate') {
        updateField('annualFamilyIncome', data.extractedData.annualFamilyIncome);
        setForm(p => ({
          ...p,
          documentUploads: { ...p.documentUploads, incomeCertificate: fileUrl }
        }));
      } else if (docType === 'marksheet') {
        updateField('cgpaOrPercentage', data.extractedData.cgpaOrPercentage);
        setForm(p => ({
          ...p,
          documentUploads: { ...p.documentUploads, marksheet: fileUrl }
        }));
      } else if (docType === 'domicile') {
        updateField('state', data.extractedData.state);
        setForm(p => ({
          ...p,
          documentUploads: { ...p.documentUploads, domicile: fileUrl }
        }));
      } else {
        // Just link file
        setForm(p => ({
          ...p,
          documentUploads: { ...p.documentUploads, [docType]: fileUrl }
        }));
      }
    } catch (err) {
      toast.error('OCR Simulator processing error');
    } finally {
      setOcrLoading(prev => ({ ...prev, [docType]: false }));
    }
  };

  const TABS = [
    { id: 'personal', label: t('personalDetails', language), icon: User },
    { id: 'academic', label: t('academicDetails', language), icon: BookOpen },
    { id: 'social', label: t('financialDetails', language), icon: IndianRupee },
    { id: 'documents', label: t('documentsUpload', language), icon: FileText }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <SectionHeader 
        title={t('myProfile', language)}
        subtitle="Manage your academic, financial, and caste attributes to identify matches."
      />

      {/* Progress Header Card */}
      <div className="card glass-card flex flex-col md:flex-row items-center gap-6 p-6">
        <Avatar name={form.fullName || user?.name || '?'} size="xl" />
        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">{form.fullName || 'New Candidate'}</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {form.educationLevel || 'No Education Level'} · {form.stream || 'No Stream'} · {form.state || 'No State'}
          </p>
          <div className="mt-4 max-w-md mx-auto md:mx-0">
            <ProgressBar value={pct} color={pct === 100 ? 'success' : 'primary'} />
            <div className="flex justify-between items-center mt-1 text-[10px] font-bold text-gray-400">
              <span>{pct}% completeness</span>
              <span>{pct === 100 ? 'Verified Complete' : 'Under Development'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-slate-700/80 gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-all duration-200 whitespace-nowrap ${
                isActive 
                  ? 'border-b-primary-600 text-primary-600 dark:border-b-primary-500 dark:text-primary-400' 
                  : 'border-b-transparent text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-350'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Form Container ──────────────────────────────────── */}
      <form onSubmit={(e) => e.preventDefault()} className="card space-y-6">
        
        {/* Tab 1: Personal Details */}
        {activeTab === 'personal' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input 
                  type="text" className="input" placeholder="e.g. Priya Sharma" required
                  value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Mobile Number *</label>
                <input 
                  type="text" className="input" placeholder="e.g. 9876543210" required
                  value={form.mobileNumber} onChange={(e) => updateField('mobileNumber', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Age *</label>
                <input 
                  type="number" className="input" placeholder="e.g. 21" min="5" max="99" required
                  value={form.age} onChange={(e) => updateField('age', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select 
                  className="select"
                  value={form.gender} onChange={(e) => updateField('gender', e.target.value)}
                >
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Residency State *</label>
                <select 
                  className="select" required
                  value={form.state} onChange={(e) => updateField('state', e.target.value)}
                >
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">District *</label>
                <input 
                  type="text" className="input" placeholder="e.g. Mumbai" required
                  value={form.district} onChange={(e) => updateField('district', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Academic Details */}
        {activeTab === 'academic' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Current Education Level *</label>
                <select 
                  className="select" required
                  value={form.educationLevel} onChange={(e) => updateField('educationLevel', e.target.value)}
                >
                  <option value="">Select level</option>
                  {EDU_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Education Stream / Branch *</label>
                <select 
                  className="select" required
                  value={form.stream} onChange={(e) => updateField('stream', e.target.value)}
                >
                  <option value="">Select stream</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">College/School Name *</label>
                <input 
                  type="text" className="input" placeholder="e.g. St. Xavier College" required
                  value={form.collegeName} onChange={(e) => updateField('collegeName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Current Year / Semester</label>
                <input 
                  type="text" className="input" placeholder="e.g. 1st Year / Sem II"
                  value={form.currentYearOrSemester} onChange={(e) => updateField('currentYearOrSemester', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Academic Percentage / CGPA *</label>
                <input 
                  type="number" className="input" placeholder="e.g. 85" min="0" max="100" required
                  value={form.cgpaOrPercentage} onChange={(e) => updateField('cgpaOrPercentage', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social & Financial Details */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Profession *</label>
                <select 
                  className="select" required
                  value={form.profession} onChange={(e) => updateField('profession', e.target.value)}
                >
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Annual Family Income (₹) *</label>
                <input 
                  type="number" className="input" placeholder="e.g. 150000" min="0" required
                  value={form.annualFamilyIncome} onChange={(e) => updateField('annualFamilyIncome', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Caste / Social Reservation Category *</label>
                <select 
                  className="select" required
                  value={form.category} onChange={(e) => updateField('category', e.target.value)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-slate-700/80 pt-5">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <input 
                  type="checkbox" id="bplStatus" className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500"
                  checked={form.bplStatus} onChange={(e) => handleCheckbox('bplStatus', e.target.checked)}
                />
                <label htmlFor="bplStatus" className="text-xs font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">Below Poverty Line (BPL) Card</label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <input 
                  type="checkbox" id="minorityStatus" className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500"
                  checked={form.minorityStatus} onChange={(e) => handleCheckbox('minorityStatus', e.target.checked)}
                />
                <label htmlFor="minorityStatus" className="text-xs font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">Minority Reservation Status</label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                <input 
                  type="checkbox" id="disabilityStatus" className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500"
                  checked={form.disabilityStatus} onChange={(e) => handleCheckbox('disabilityStatus', e.target.checked)}
                />
                <label htmlFor="disabilityStatus" className="text-xs font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">Physically Disabled (PwD)</label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Documents Upload & OCR */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <p className="text-gray-400 mb-4">
              Simulate uploading documents to verify credentials using OCR. Each verification runs OCR scanning and updates form parameters automatically.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Income Certificate Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-slate-350">Income Certificate</span>
                  {form.documentUploads?.incomeCertificate ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                  )}
                </div>

                <div className="py-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-[10px] text-gray-400 font-mono">income_certificate_priya.pdf</span>
                </div>

                <button 
                  type="button"
                  onClick={() => triggerOCR('incomeCertificate')}
                  disabled={ocrLoading['incomeCertificate']}
                  className="btn btn-ghost w-full py-2 flex items-center justify-center gap-1.5"
                >
                  {ocrLoading['incomeCertificate'] ? (
                    <Spinner />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t('ocrVerify', language)}
                    </>
                  )}
                </button>
              </div>

              {/* Marksheet Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-slate-350">Academic Marksheet</span>
                  {form.documentUploads?.marksheet ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                  )}
                </div>

                <div className="py-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-[10px] text-gray-400 font-mono">marksheet_priya.pdf</span>
                </div>

                <button 
                  type="button"
                  onClick={() => triggerOCR('marksheet')}
                  disabled={ocrLoading['marksheet']}
                  className="btn btn-ghost w-full py-2 flex items-center justify-center gap-1.5"
                >
                  {ocrLoading['marksheet'] ? (
                    <Spinner />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t('ocrVerify', language)}
                    </>
                  )}
                </button>
              </div>

              {/* Domicile Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-slate-350">Domicile / Residency Certificate</span>
                  {form.documentUploads?.domicile ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                  )}
                </div>

                <div className="py-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-[10px] text-gray-400 font-mono">domicile_maharashtra.pdf</span>
                </div>

                <button 
                  type="button"
                  onClick={() => triggerOCR('domicile')}
                  disabled={ocrLoading['domicile']}
                  className="btn btn-ghost w-full py-2 flex items-center justify-center gap-1.5"
                >
                  {ocrLoading['domicile'] ? (
                    <Spinner />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t('ocrVerify', language)}
                    </>
                  )}
                </button>
              </div>

              {/* Aadhaar Card Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-slate-350">Aadhaar Card</span>
                  {form.documentUploads?.aadhaar ? (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                  )}
                </div>

                <div className="py-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="font-bold text-[10px] text-gray-400 font-mono">aadhaar_priya.pdf</span>
                </div>

                <button 
                  type="button"
                  onClick={() => triggerOCR('aadhaar')}
                  disabled={ocrLoading['aadhaar']}
                  className="btn btn-ghost w-full py-2 flex items-center justify-center gap-1.5"
                >
                  {ocrLoading['aadhaar'] ? (
                    <Spinner />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {t('ocrVerify', language)}
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700/80 pt-5 gap-4">
          <div>
            {activeTab !== 'personal' && (
              <button 
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex(t => t.id === activeTab);
                  setActiveTab(TABS[idx - 1].id);
                }}
                className="btn btn-ghost px-4 py-2 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> {t('prevStep', language)}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="btn btn-primary px-6 flex items-center gap-2"
            >
              {saving ? <Spinner /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : t('saveProfile', language)}
            </button>

            {activeTab !== 'documents' ? (
              <button 
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex(t => t.id === activeTab);
                  setActiveTab(TABS[idx + 1].id);
                }}
                className="btn btn-outline px-4 py-2 flex items-center gap-1.5"
              >
                {t('nextStep', language)} <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

      </form>
    </div>
  );
}
