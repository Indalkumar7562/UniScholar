import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, aiAPI, documentAPI } from '../services/api';
import { t } from '../utils/translate';
import { SectionHeader, Avatar, ProgressBar, Spinner } from '../components/ui/index.jsx';
import { STATES_AND_DISTRICTS, STATES_LIST } from '../data/indiaLocations';
import AcademicDetailsSection from '../components/profile/AcademicDetailsSection.jsx';

import { 
  Save, User, BookOpen, IndianRupee, FileText, Upload, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert, Check,
  Edit3, Eye, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Briefcase, Award, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const EDU_LEVELS = ['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];
const STREAMS     = ['Science', 'Commerce', 'Arts', 'Diploma', 'Engineering', 'Medical', 'ITI', 'Other', 'Not Applicable'];
const CATEGORIES  = ['General', 'EWS', 'OBC', 'SC', 'ST'];
const GENDERS     = ['Male', 'Female', 'Other', 'Prefer not to say'];
const MINORITY_COMMUNITIES = ['Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi', 'Other'];
const PWD_TYPES = ['Visual', 'Hearing', 'Physical/Locomotor', 'Intellectual', 'Multiple', 'Other'];
const RESIDENTIAL_AREAS = ['Urban', 'Rural'];
const PROFESSIONS = ['Student', 'Farmer', 'Labour Worker', 'Government Employee', 'Private Employee', 'Unemployed', 'Self-employed', 'Business Owner'];

const getDocFileName = (val, fallback = 'Choose file') => {
  if (typeof val === 'string' && val.trim()) {
    return val.split('/').pop() || fallback;
  }
  return fallback;
};

const calculateAge = (dobString) => {
  if (!dobString || typeof dobString !== 'string') return null;
  const birthDate = new Date(dobString);
  const today = new Date();
  if (isNaN(birthDate.getTime())) return null;
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateUser, language, fetchProfile, loading } = useAuth();
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState({});
  const [ocrResults, setOcrResults] = useState({});

  const [previewImage, setPreviewImage] = useState(null);

  // Edit Mode Toggles for clean display vs edit view
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingFinancial, setIsEditingFinancial] = useState(false);

  const handleAvatarUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a JPG, JPEG, PNG, or WebP image under 2 MB.');
      return;
    }

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error('Please upload a JPG, JPEG, PNG, or WebP image under 2 MB.');
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

  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    age: '',
    gender: 'Male',
    state: '',
    district: '',
    residentialArea: 'Urban',
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
    minorityCommunity: 'Not Applicable',
    disabilityStatus: false,
    pwdType: 'Not Applicable',
    pwdPercentage: 0,
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

  const [academicDetails, setAcademicDetails] = useState({});

  const getMissingFields = () => {
    const missing = [];
    if (!form.fullName) missing.push('Full Name');
    if (!form.mobileNumber) missing.push('Mobile Number');
    if (!form.dob && !form.age) missing.push('Date of Birth');
    if (!form.state) missing.push('Domicile State');
    if (!form.district) missing.push('District');
    if (!form.educationLevel) missing.push('Education Level');
    if (!form.stream) missing.push('Education Stream');
    if (!form.cgpaOrPercentage) missing.push('Academic Score / Marks %');
    if (form.annualFamilyIncome === '') missing.push('Annual Family Income');
    if (!form.category) missing.push('Category');
    return missing;
  };

  const missingFieldsList = getMissingFields();

  useEffect(() => {
    const loadProfileIfNeeded = async () => {
      if (!profile && fetchProfile) {
        setFetchingProfile(true);
        try {
          await fetchProfile();
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingProfile(false);
        }
      }
    };
    loadProfileIfNeeded();
  }, []);

  useEffect(() => {
    if (profile) {
      const initialDob = profile.dob || '';
      const calculated = calculateAge(initialDob);
      if (profile.academicDetails) {
        setAcademicDetails(profile.academicDetails);
      }
      setForm({
        fullName: profile.fullName || user?.name || '',
        dob: initialDob,
        age: calculated !== null ? calculated : (profile.age || ''),
        gender: profile.gender || 'Male',
        state: profile.state || '',
        district: profile.district || '',
        residentialArea: profile.residentialArea || 'Urban',
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
        minorityCommunity: profile.minorityCommunity || 'Not Applicable',
        disabilityStatus: profile.disabilityStatus || false,
        pwdType: profile.pwdType || 'Not Applicable',
        pwdPercentage: profile.pwdPercentage || 0,
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
    } else if (user) {
      setForm(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [profile, user]);

  const updateField = (key, value) => {
    if (key === 'dob') {
      const computedAge = calculateAge(value);
      setForm(prev => ({
        ...prev,
        dob: value,
        age: computedAge !== null ? computedAge : prev.age
      }));
    } else if (key === 'state') {
      const availableDistricts = STATES_AND_DISTRICTS[value] || [];
      setForm(prev => ({
        ...prev,
        state: value,
        district: availableDistricts.includes(prev.district) ? prev.district : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const calculateCompleteness = () => {
    let score = 0;
    const totalFields = 10;
    if (form.fullName) score++;
    if (form.dob || form.age) score++;
    if (form.state) score++;
    if (form.district) score++;
    if (form.mobileNumber) score++;
    if (form.educationLevel) score++;
    if (form.stream) score++;
    if (form.cgpaOrPercentage) score++;
    if (form.annualFamilyIncome !== '') score++;
    if (form.category) score++;
    return Math.round((score / totalFields) * 100);
  };

  const pct = calculateCompleteness();

  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaveSuccessMsg(false);

    // Validation
    if (!form.fullName || form.fullName.trim().length < 2) {
      toast.error('Please enter a valid full name.');
      setActiveTab('personal');
      setIsEditingPersonal(true);
      return;
    }
    if (!form.mobileNumber || !/^\+?\d{10,12}$/.test(form.mobileNumber.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number.');
      setActiveTab('personal');
      setIsEditingPersonal(true);
      return;
    }
    if (!form.dob) {
      toast.error('Please select your Date of Birth.');
      setActiveTab('personal');
      setIsEditingPersonal(true);
      return;
    }
    if (!form.state) {
      toast.error('Please select your Domicile State.');
      setActiveTab('personal');
      setIsEditingPersonal(true);
      return;
    }
    if (!form.district) {
      toast.error('Please select your District.');
      setActiveTab('personal');
      setIsEditingPersonal(true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        academicDetails,
        age: Number(form.age) || calculateAge(form.dob) || 18,
        annualFamilyIncome: Number(form.annualFamilyIncome) || 0,
        cgpaOrPercentage: Number(form.cgpaOrPercentage) || 0,
        pwdPercentage: Number(form.pwdPercentage) || 0
      };
      const { data } = await userAPI.saveProfile(payload);
      updateProfile(data.profile);
      setSaveSuccessMsg(true);
      setIsEditingPersonal(false);
      setIsEditingFinancial(false);

      let successText = '✓ Profile saved successfully!';
      if (activeTab === 'academic') {
        successText = '✓ Academic details saved successfully! Your education history has been updated. You can now proceed to Financial Details.';
      } else if (activeTab === 'personal') {
        successText = '✓ Profile saved successfully! Your personal details have been updated. You can now proceed to Academic Details.';
      } else if (activeTab === 'financial') {
        successText = '✓ Financial details saved successfully! Your eligibility details have been updated. You can now proceed to Documents.';
      }
      toast.success(successText, { duration: 4000 });
      await fetchProfile();
      setTimeout(() => {
        setSaveSuccessMsg(false);
      }, 4000);
    } catch (err) {
      setSaveSuccessMsg(false);
      toast.error(err.response?.data?.message || '⚠ Unable to save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Document Upload & OCR verification
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

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('customName', customName);

    try {
      const { data: uploadData } = await documentAPI.upload(formData);
      const filePath = uploadData.document.filePath;
      toast.success(`${selectedFile.name} uploaded successfully!`);

      const { data: ocrData } = await aiAPI.verifyDocument(docType, filePath);
      setOcrResults(prev => ({ ...prev, [docType]: ocrData }));
      toast.success(`${category} details verified & synchronized!`);

      if (docType === 'incomeCertificate') {
        updateField('annualFamilyIncome', ocrData.extractedData.annualFamilyIncome);
      } else if (['marksheet', 'marksheet10th', 'marksheet12th'].includes(docType)) {
        updateField('cgpaOrPercentage', ocrData.extractedData.cgpaOrPercentage);
      }

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

  const availableDistricts = STATES_AND_DISTRICTS[form.state] || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* ── 1. COMPACT PAGE HEADER ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            My Profile
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mt-0.5">
            Manage your personal, academic, financial, and eligibility information to get better scholarship matches.
          </p>
        </div>
      </div>

      {/* ── 2. PROFILE HERO CARD ─────────────────────────────────── */}
      <div className="card glass-card p-6 border border-gray-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
          
          {/* LEFT: Profile Photo & Actions */}
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
              <label className="btn btn-outline btn-xs text-[11px] px-3 py-1 cursor-pointer font-bold">
                Change Photo
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/jpg,image/webp" 
                  onChange={handleAvatarUpload} 
                />
              </label>

              {(user?.avatar || previewImage) && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="btn btn-ghost btn-xs text-[11px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 font-semibold"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">JPG, JPEG, PNG, WebP (max 2MB)</span>
          </div>

          {/* MIDDLE: Candidate Name & Identity Info */}
          <div className="flex-1 text-center lg:text-left space-y-2">
            <div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">
                  {form.fullName || user?.name || 'Student Candidate'}
                </h2>
                {user?.email ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Verified Student
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Profile Verification Pending
                  </span>
                )}
              </div>
              
              <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-1 flex items-center justify-center lg:justify-start gap-1">
                <GraduationCap className="w-4 h-4 shrink-0" />
                Student Candidate • {form.educationLevel || '12th Pass'} {form.stream ? `(${form.stream})` : ''}
              </p>

              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center justify-center lg:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                {form.state ? `${form.state}${form.district ? `, ${form.district}` : ''}` : 'Location Not Provided'}
              </p>
            </div>
          </div>

          {/* RIGHT: Profile Completion Widget */}
          <div className="w-full lg:w-72 bg-gray-50/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3 shrink-0 text-center lg:text-left">
            <div>
              <div className="flex justify-between items-center text-xs font-extrabold mb-1">
                <span className="text-gray-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Profile Completion</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black text-sm">{pct}%</span>
              </div>
              <ProgressBar value={pct} color={pct === 100 ? 'success' : 'primary'} />
            </div>

            {missingFieldsList.length > 0 && (
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold space-y-1">
                <span>Missing information:</span>
                <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
                  {missingFieldsList.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 font-bold text-[10px]">
                      • {item}
                    </span>
                  ))}
                  {missingFieldsList.length > 3 && (
                    <span className="text-[10px] text-gray-400">+{missingFieldsList.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-1 flex gap-2">
              <button 
                onClick={() => {
                  if (activeTab === 'personal') setIsEditingPersonal(!isEditingPersonal);
                  else if (activeTab === 'financial') setIsEditingFinancial(!isEditingFinancial);
                  else setActiveTab('personal');
                }}
                className="btn btn-primary btn-xs w-full text-xs font-bold py-2 flex items-center justify-center gap-1.5 shadow"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingPersonal || isEditingFinancial ? 'View Profile' : 'Edit Profile'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. QUICK PROFILE SUMMARY ROW ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Education</span>
          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
            {form.educationLevel ? `${form.educationLevel} ${form.stream ? `(${form.stream})` : ''}` : 'Not provided'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Current Level</span>
          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
            {form.educationLevel || 'Not provided'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Category</span>
          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
            {form.category || 'Not provided'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">State</span>
          <p className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
            {form.state || 'Not provided'}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Family Income</span>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
            {form.annualFamilyIncome ? `₹${Number(form.annualFamilyIncome).toLocaleString('en-IN')} / year` : 'Not provided'}
          </p>
        </div>
      </div>

      {/* ── 4. PROFILE NAVIGATION TABS ───────────────────────────── */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 gap-2 overflow-x-auto scrollbar-hide pb-0.5">
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

      {/* ── 5. FORM / VIEW CONTAINER ────────────────────────────── */}
      <form onSubmit={(e) => e.preventDefault()} className="card border border-gray-200 dark:border-slate-800 space-y-6">
        
        {/* ── TAB 1: PERSONAL DETAILS ────────────────────────── */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header Action Bar */}
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                Personal Information
              </h3>

              <button
                type="button"
                onClick={() => setIsEditingPersonal(!isEditingPersonal)}
                className="btn btn-outline btn-xs text-xs px-3 py-1 font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingPersonal ? 'Cancel Edit' : 'Edit Personal Details'}
              </button>
            </div>

            {/* VIEW MODE */}
            {!isEditingPersonal ? (
              <div className="space-y-6">
                
                {/* Section 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Full Name</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.fullName || 'Not provided'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Mobile Number</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.mobileNumber || 'Not provided'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Email Address</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
                      {form.email || user?.email || 'Not provided'}
                      {form.email && <span className="text-[10px] text-emerald-500 font-bold">✓ Verified</span>}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Date of Birth & Age</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">
                      {form.dob ? `${form.dob} (${calculateAge(form.dob)} years)` : 'Not provided'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Gender</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.gender || 'Not provided'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Domicile State</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.state || 'Not provided'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">District</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.district || 'Not provided'}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Category</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.category || 'Not provided'}</p>
                  </div>
                </div>

              </div>
            ) : (
              /* EDIT MODE INPUTS */
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input 
                      type="text" className="input" placeholder="e.g. Rahul Sharma" required
                      value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Mobile Number *</label>
                    <input 
                      type="tel" className="input" placeholder="e.g. 9876543210" required
                      value={form.mobileNumber} onChange={(e) => updateField('mobileNumber', e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="label mb-0">Email Address *</label>
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <input 
                      type="email" className="input bg-gray-50 dark:bg-slate-900/80 cursor-not-allowed opacity-90" 
                      value={form.email} readOnly disabled
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="label mb-0">Date of Birth *</label>
                      {form.dob && calculateAge(form.dob) !== null && (
                        <span className="text-[11px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-md font-mono">
                          Age: {calculateAge(form.dob)} years
                        </span>
                      )}
                    </div>
                    <input 
                      type="date" className="input" required max={new Date().toISOString().split('T')[0]}
                      value={form.dob} onChange={(e) => updateField('dob', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label">Gender *</label>
                    <select 
                      className="select" required
                      value={form.gender} onChange={(e) => updateField('gender', e.target.value)}
                    >
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Domicile State *</label>
                    <select 
                      className="select" required
                      value={form.state} onChange={(e) => updateField('state', e.target.value)}
                    >
                      <option value="">Select Domicile State</option>
                      {STATES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">District *</label>
                    <select 
                      className="select" required disabled={!form.state}
                      value={form.district} onChange={(e) => updateField('district', e.target.value)}
                    >
                      <option value="">{form.state ? 'Select District' : 'Select State First'}</option>
                      {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Residential Area</label>
                    <select 
                      className="select"
                      value={form.residentialArea} onChange={(e) => updateField('residentialArea', e.target.value)}
                    >
                      {RESIDENTIAL_AREAS.map(ra => <option key={ra} value={ra}>{ra}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="label">Category *</label>
                    <select 
                      className="select" required
                      value={form.category} onChange={(e) => updateField('category', e.target.value)}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── TAB 2: ACADEMIC DETAILS ────────────────────────── */}
        {activeTab === 'academic' && (
          <AcademicDetailsSection 
            form={form}
            updateField={updateField}
            academicDetails={academicDetails}
            setAcademicDetails={setAcademicDetails}
          />
        )}

        {/* ── TAB 3: FINANCIAL DETAILS ───────────────────────── */}
        {activeTab === 'social' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                Financial & Social Information
              </h3>

              <button
                type="button"
                onClick={() => setIsEditingFinancial(!isEditingFinancial)}
                className="btn btn-outline btn-xs text-xs px-3 py-1 font-bold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingFinancial ? 'Cancel Edit' : 'Edit Financial Details'}
              </button>
            </div>

            {!isEditingFinancial ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Profession</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.profession || 'Student'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Annual Family Income</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {form.annualFamilyIncome ? `₹${Number(form.annualFamilyIncome).toLocaleString('en-IN')} / year` : 'Not provided'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Category</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.category || 'General'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Below Poverty Line (BPL)</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">{form.bplStatus ? 'Yes' : 'No'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Minority Reservation</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">
                    {form.minorityStatus ? `Yes (${form.minorityCommunity || 'General'})` : 'No'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Person with Disability (PwD)</span>
                  <p className="text-sm font-bold text-gray-900 dark:text-slate-100 mt-0.5">
                    {form.disabilityStatus ? `Yes (${form.pwdType || 'Physical'} - ${form.pwdPercentage || 0}%)` : 'No'}
                  </p>
                </div>
              </div>
            ) : (
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
                    <label className="label">Caste / Reservation Category *</label>
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
                      type="checkbox" id="minorityStatusCheck" className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500"
                      checked={form.minorityStatus} onChange={(e) => handleCheckbox('minorityStatus', e.target.checked)}
                    />
                    <label htmlFor="minorityStatusCheck" className="text-xs font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">Minority Reservation Status</label>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                    <input 
                      type="checkbox" id="disabilityStatusCheck" className="w-4 h-4 bg-gray-100 rounded border-gray-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500"
                      checked={form.disabilityStatus} onChange={(e) => handleCheckbox('disabilityStatus', e.target.checked)}
                    />
                    <label htmlFor="disabilityStatusCheck" className="text-xs font-semibold text-gray-700 dark:text-slate-350 cursor-pointer">Physically Disabled (PwD)</label>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── TAB 4: DOCUMENTS WALLET ────────────────────────── */}
        {activeTab === 'documents' && (
          <div className="space-y-4 animate-fade-in text-xs">
            <div>
              <h3 className="text-xs font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                Document Uploads
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                Upload documents to verify your profile details. <span className="text-[10px] text-primary-500 dark:text-primary-400 font-medium font-mono ml-1">• Details may be extracted automatically</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'incomeCertificate', name: 'Income Certificate', desc: 'Proof of annual family income', required: true, icon: FileText },
                { key: 'marksheet10th',     name: '10th Marksheet',     desc: 'Class 10 academic record',    required: true, icon: BookOpen },
                { key: 'marksheet12th',     name: '12th Marksheet',     desc: 'Class 12 academic record',    required: true, icon: BookOpen },
                { key: 'aadhaar',           name: 'Aadhaar Card',       desc: 'Identity verification document', required: true, icon: User },
                { key: 'casteCertificate',  name: 'Caste Certificate',  desc: 'Category verification document', required: false, icon: Award },
                { key: 'domicile',          name: 'Domicile Certificate', desc: 'State residency proof',       required: true, icon: MapPin },
              ].map(doc => {
                const DocIcon = doc.icon;
                const docVal = form.documentUploads?.[doc.key];
                const isUploaded = !!docVal;
                const fileName = getDocFileName(docVal, '');

                return (
                  <div
                    key={doc.key}
                    className="p-3.5 rounded-2xl bg-gray-50/60 dark:bg-slate-900/70 border border-gray-200 dark:border-slate-800 flex flex-col justify-between space-y-3 relative transition-all hover:border-gray-300 dark:hover:border-slate-700 shadow-sm"
                  >
                    {/* Header: Icon + Name + Short Desc + Status */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                            <DocIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate block leading-tight">
                              {doc.name}
                            </h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                              {doc.desc}
                            </p>
                          </div>
                        </div>

                        {isUploaded ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 text-emerald-500" /> Uploaded
                          </span>
                        ) : doc.required ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 dark:text-slate-400 font-bold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                            Optional
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Upload Action / Drop Zone */}
                    <div>
                      <label className="py-2 px-3 flex items-center justify-center gap-2 bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700/80 cursor-pointer relative hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleProfileFileChange(e, doc.key)}
                          disabled={ocrLoading[doc.key]}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                        <Upload className="w-3.5 h-3.5 text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-[11px] text-gray-700 dark:text-slate-200 truncate max-w-[170px]">
                          {fileName || (isUploaded ? 'Replace Document' : 'Upload Document')}
                        </span>
                      </label>

                      {ocrLoading[doc.key] && (
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-primary-600 dark:text-primary-400 font-bold animate-pulse pt-2">
                          <Spinner className="w-3 h-3" /> Details may be extracted automatically...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Success Banner */}
        {saveSuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3 animate-fade-in my-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-bold text-xs">✓ Profile saved successfully!</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Your profile information has been updated. You can now proceed to the next tab or view your matching scholarships.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700/80 pt-5 gap-4">
          <div>
            {activeTab !== 'personal' && (
              <button 
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex(t => t.id === activeTab);
                  setActiveTab(TABS[idx - 1].id);
                }}
                className="btn btn-ghost px-4 py-2 flex items-center gap-1.5 font-bold text-xs"
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
              className="btn btn-primary px-6 py-2.5 flex items-center gap-2 font-bold text-xs shadow-lg shadow-primary-600/20"
            >
              {saving ? <Spinner /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>

            {activeTab !== 'documents' ? (
              <button 
                type="button"
                onClick={() => {
                  const idx = TABS.findIndex(t => t.id === activeTab);
                  setActiveTab(TABS[idx + 1].id);
                }}
                className="btn btn-outline px-4 py-2 flex items-center gap-1.5 font-bold text-xs"
              >
                {t('nextStep', language)} <ChevronRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        </div>

      </form>

      {/* ── 6. BOTTOM WIDGET: PROFILE COMPLETION CHECKLIST ─────────────── */}
      <div className="card glass-card p-5 border border-gray-200 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-extrabold text-gray-900 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Profile Completion Checklist
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
              form.fullName && form.mobileNumber && form.dob && form.state 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold block opacity-80 uppercase">Step 1</span>
              <span className="text-xs font-bold">Personal Details</span>
            </div>
            {form.fullName && form.mobileNumber && form.dob && form.state ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
              form.educationLevel && form.stream && form.collegeName 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold block opacity-80 uppercase">Step 2</span>
              <span className="text-xs font-bold">Academic Details</span>
            </div>
            {form.educationLevel && form.stream && form.collegeName ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('financial')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
              form.annualFamilyIncome !== '' && form.category 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold block opacity-80 uppercase">Step 3</span>
              <span className="text-xs font-bold">Financial Details</span>
            </div>
            {form.annualFamilyIncome !== '' && form.category ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-colors ${
              form.documentUploads?.incomeCertificate || form.documentUploads?.marksheet10th 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-bold block opacity-80 uppercase">Step 4</span>
              <span className="text-xs font-bold">Documents Upload</span>
            </div>
            {form.documentUploads?.incomeCertificate || form.documentUploads?.marksheet10th ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* ── 7. BOTTOM WIDGET: SCHOLARSHIP MATCHING SUMMARY ─────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Your Scholarship Profile</h4>
          </div>
          <p className="text-xs text-slate-300">
            Education: <span className="font-bold text-white">{form.educationLevel || 'Graduation'} ({form.stream || 'Science'})</span> • Category: <span className="font-bold text-white">{form.category || 'General'}</span> • State: <span className="font-bold text-white">{form.state || 'Not set'}</span>
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">24 Matches Found</span>
            <span className="px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 font-bold">14 Strong Fits</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => navigate('/scholarships')}
          className="btn btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 shrink-0 shadow-md shadow-primary-600/30"
        >
          View Matching Scholarships <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
