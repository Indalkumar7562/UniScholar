import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, aiAPI, documentAPI } from '../services/api';
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
  const { user, profile, updateProfile, updateUser, language, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState({});
  const [ocrResults, setOcrResults] = useState({});

  const [previewImage, setPreviewImage] = useState(null);

  const handleAvatarUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid format. Please select a JPG, JPEG, or PNG image.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5MB or less');
      return;
    }

    // Live preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    const toastId = toast.loading('Uploading profile picture...');
    try {
      const { data } = await userAPI.uploadAvatar(formData);
      updateUser(data.user);
      setPreviewImage(null);
      toast.success('Profile picture updated successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      setPreviewImage(null);
      toast.error(err.response?.data?.message || 'Failed to upload profile picture', { id: toastId });
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    const toastId = toast.loading('Removing profile picture...');
    try {
      const { data } = await userAPI.removeAvatar();
      updateUser(data.user);
      setPreviewImage(null);
      toast.success('Profile picture removed successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove profile picture', { id: toastId });
    }
  };

  const getMissingFields = () => {
    const missing = [];
    if (!form.fullName) missing.push('Full Name');
    if (!form.mobileNumber) missing.push('Mobile Number');
    if (!form.age) missing.push('Age');
    if (!form.state) missing.push('Residency State');
    if (!form.educationLevel) missing.push('Education Level');
    if (!form.stream) missing.push('Education Stream');
    if (!form.cgpaOrPercentage) missing.push('Academic Score / Marks %');
    if (form.annualFamilyIncome === '') missing.push('Annual Family Income');
    if (!form.documentUploads?.incomeCertificate) missing.push('Income Certificate Document');
    if (!form.documentUploads?.marksheet && !form.documentUploads?.marksheet12th && !form.documentUploads?.marksheet10th) missing.push('Marksheet Document');
    return missing;
  };

  const missingFieldsList = getMissingFields();


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
      marksheet10th: '',
      marksheet12th: '',
      marksheetCollege: '',
      marksheetOther: '',
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
          marksheet10th: profile.documentUploads?.marksheet10th || '',
          marksheet12th: profile.documentUploads?.marksheet12th || '',
          marksheetCollege: profile.documentUploads?.marksheetCollege || '',
          marksheetOther: profile.documentUploads?.marksheetOther || '',
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
    if (form.documentUploads?.marksheet || form.documentUploads?.marksheet10th || form.documentUploads?.marksheet12th || form.documentUploads?.marksheetCollege || form.documentUploads?.marksheetOther) score++;
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

  // Active Document Upload & OCR verification
  const handleProfileFileChange = async (e, docType) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setOcrLoading(prev => ({ ...prev, [docType]: true }));

    let category = 'Other';
    if (docType === 'aadhaar') category = 'Identity';
    else if (docType === 'incomeCertificate') category = 'Income';
    else if (['marksheet', 'marksheet10th', 'marksheet12th', 'marksheetCollege', 'marksheetOther'].includes(docType)) category = 'Academic';
    else if (docType === 'domicile') category = 'Residence';
    else if (docType === 'casteCertificate') category = 'Category Certificate';

    let customName = `${category} Document`;
    if (docType === 'marksheet10th') customName = '10th Marksheet';
    else if (docType === 'marksheet12th') customName = '12th Marksheet';
    else if (docType === 'marksheetCollege') customName = 'College Marksheet';
    else if (docType === 'marksheetOther') customName = 'Other Academic Document';

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('customName', customName);

    try {
      // 1. Upload to Document Vault (saves file on backend and updates schema)
      const { data: uploadData } = await documentAPI.upload(formData);
      const filePath = uploadData.document.filePath;
      toast.success(`${selectedFile.name} uploaded successfully!`);

      // 2. Trigger OCR verification using file
      const { data: ocrData } = await aiAPI.verifyDocument(docType, filePath);
      setOcrResults(prev => ({ ...prev, [docType]: ocrData }));
      toast.success(`${category} details verified & synchronized!`);

      // 3. Auto-fill profile fields
      if (docType === 'incomeCertificate') {
        updateField('annualFamilyIncome', ocrData.extractedData.annualFamilyIncome);
      } else if (['marksheet', 'marksheet10th', 'marksheet12th', 'marksheetCollege', 'marksheetOther'].includes(docType)) {
        updateField('cgpaOrPercentage', ocrData.extractedData.cgpaOrPercentage);
        if (ocrData.extractedData.educationLevel) {
          updateField('educationLevel', ocrData.extractedData.educationLevel);
        }
        if (ocrData.extractedData.stream) {
          updateField('stream', ocrData.extractedData.stream);
        }
      } else if (docType === 'domicile') {
        updateField('state', ocrData.extractedData.state);
      }

      // 4. Update the profile local state for document uploads
      setForm(prev => ({
        ...prev,
        documentUploads: {
          ...prev.documentUploads,
          [docType]: filePath
        }
      }));

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'File upload or verification failed');
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

      {/* Progress & Profile Photo Header Card */}
      <div className="card glass-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Profile Photo Avatar Box */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white dark:border-slate-800 bg-emerald-500/10 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Avatar name={form.fullName || user?.name || 'Student'} size="2xl" src={user?.avatar} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="btn btn-outline btn-xs text-[11px] px-3 py-1 cursor-pointer">
                Change Photo
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/jpg" 
                  onChange={handleAvatarUpload} 
                />
              </label>

              {(user?.avatar || previewImage) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="btn btn-ghost btn-xs text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500">JPG, JPEG, PNG (max 5MB)</span>
          </div>

          {/* Student Info & Progress Bar */}
          <div className="flex-1 w-full text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                {form.fullName || user?.name || 'Indal Kumar'}
              </h2>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Student Candidate • {form.educationLevel || '12th Pass'} ({form.stream || 'Science'})
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {form.state || 'Maharashtra'} • Category: {form.category || 'General'} • Family Income: ₹{form.annualFamilyIncome ? Number(form.annualFamilyIncome).toLocaleString('en-IN') : '0'}/yr
              </p>
            </div>

            {/* Completion Progress Bar */}
            <div className="pt-2 max-w-lg">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="text-gray-700 dark:text-slate-300">Profile Completion</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{pct}%</span>
              </div>
              <ProgressBar value={pct} color={pct === 100 ? 'success' : 'primary'} />
            </div>

            {/* Missing Fields Indicator */}
            {missingFieldsList.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Missing required fields to reach 100%:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {missingFieldsList.map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 font-medium text-[11px]">
                      • {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
            <p className="text-gray-400 mb-4 font-semibold">
              Upload your actual credentials to verify your profile fields automatically using AI OCR extraction. Uploading a document here also securely stores it in your Document Vault.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Income Certificate Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">Income Certificate</span>
                    {form.documentUploads?.incomeCertificate ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'incomeCertificate')}
                      disabled={ocrLoading['incomeCertificate']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.incomeCertificate 
                        ? form.documentUploads.incomeCertificate.split('/').pop() 
                        : 'Choose Income Certificate file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['incomeCertificate'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* 10th Marksheet Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">10th Marksheet</span>
                    {form.documentUploads?.marksheet10th ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'marksheet10th')}
                      disabled={ocrLoading['marksheet10th']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.marksheet10th 
                        ? form.documentUploads.marksheet10th.split('/').pop() 
                        : 'Choose 10th Marksheet file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['marksheet10th'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* 12th Marksheet Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">12th Marksheet</span>
                    {form.documentUploads?.marksheet12th ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'marksheet12th')}
                      disabled={ocrLoading['marksheet12th']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.marksheet12th 
                        ? form.documentUploads.marksheet12th.split('/').pop() 
                        : 'Choose 12th Marksheet file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['marksheet12th'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* College Marksheet Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">College Marksheet</span>
                    {form.documentUploads?.marksheetCollege ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'marksheetCollege')}
                      disabled={ocrLoading['marksheetCollege']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.marksheetCollege 
                        ? form.documentUploads.marksheetCollege.split('/').pop() 
                        : 'Choose College Marksheet file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['marksheetCollege'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* Other Academic Document Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">Other Academic Document</span>
                    {form.documentUploads?.marksheetOther ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'marksheetOther')}
                      disabled={ocrLoading['marksheetOther']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.marksheetOther 
                        ? form.documentUploads.marksheetOther.split('/').pop() 
                        : 'Choose Other Academic Document file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['marksheetOther'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* Domicile Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">Domicile / Residency Certificate</span>
                    {form.documentUploads?.domicile ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'domicile')}
                      disabled={ocrLoading['domicile']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.domicile 
                        ? form.documentUploads.domicile.split('/').pop() 
                        : 'Choose Domicile Certificate file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['domicile'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
              </div>

              {/* Aadhaar Card Slot */}
              <div className="p-4 border border-dashed border-gray-200 dark:border-slate-700/80 rounded-3xl space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-700 dark:text-slate-350">Aadhaar Card</span>
                    {form.documentUploads?.aadhaar ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">✓ Verified</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full">Missing File</span>
                    )}
                  </div>

                  <label className="py-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/30 rounded-2xl border border-gray-100 dark:border-slate-800 cursor-pointer relative hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-colors">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleProfileFileChange(e, 'aadhaar')}
                      disabled={ocrLoading['aadhaar']}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="font-bold text-[10px] text-gray-500 dark:text-slate-400 font-mono text-center px-3 truncate w-full">
                      {form.documentUploads?.aadhaar 
                        ? form.documentUploads.aadhaar.split('/').pop() 
                        : 'Choose Aadhaar Card file'}
                    </span>
                  </label>
                </div>

                {ocrLoading['aadhaar'] && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-primary-600 font-bold animate-pulse pt-2">
                    <Spinner className="w-3.5 h-3.5" /> Uploading & OCR scanning...
                  </div>
                )}
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
