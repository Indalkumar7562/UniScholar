import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, userAPI } from '../services/api';
import { t } from '../utils/translate';
import { 
  FileText, Upload, Sparkles, AlertTriangle, CheckCircle, 
  RefreshCw, Cpu, Brain, ArrowRight, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOCK_DOCS = {
  incomeCertificate: {
    name: 'income_certificate_priya.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/income_priya.pdf',
    description: 'Income Certificate showing family income ₹1,50,000/year.'
  },
  incomeCertificateFraud: {
    name: 'income_certificate_unverified.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/income_fake.pdf',
    description: 'Discrepant certificate showing family income ₹2,50,000/year.'
  },
  marksheet: {
    name: 'marksheet_priya.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/marksheet_priya.pdf',
    description: 'Generic marksheet showing 88% aggregate grade.'
  },
  marksheet10th: {
    name: '10th_marksheet.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/10th_marksheet.pdf',
    description: '10th standard marksheet showing 90% aggregate score.'
  },
  marksheet12th: {
    name: '12th_marksheet.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/12th_marksheet.pdf',
    description: '12th standard marksheet showing 88% aggregate score.'
  },
  marksheetCollege: {
    name: 'college_marksheet.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/college_marksheet.pdf',
    description: 'College graduation marksheet showing 85% aggregate score.'
  },
  marksheetOther: {
    name: 'academic_other.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/academic_other.pdf',
    description: 'Other academic certificate showing 80% aggregate score.'
  },
  domicile: {
    name: 'domicile_maharashtra.pdf',
    url: 'https://uss-documents.s3.amazonaws.com/domicile_priya.pdf',
    description: 'Domicile Certificate of Maharashtra state.'
  }
};

export default function AIHub() {
  const { profile, fetchProfile, language } = useAuth();
  
  // OCR Scan States
  const [selectedDocType, setSelectedDocType] = useState('incomeCertificate');
  const [useFraudTemplate, setUseFraudTemplate] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Recommendations States
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Completeness Metrics
  const [completenessScore, setCompletenessScore] = useState(0);
  const [completenessSuggestions, setCompletenessSuggestions] = useState([]);

  useEffect(() => {
    fetchRecommendations();
    calculateCompleteness();
  }, [profile]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const { data } = await aiAPI.getRecommendations();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const calculateCompleteness = () => {
    if (!profile) return;
    let score = 0;
    const suggestions = [];

    // Personal details
    if (profile.fullName) score += 15; else suggestions.push('Fill in your full name');
    if (profile.age) score += 10; else suggestions.push('Provide your age for age-restricted schemes');
    if (profile.gender) score += 10; else suggestions.push('Specify gender for female-only initiatives');
    if (profile.state) score += 15; else suggestions.push('Specify state residency');

    // Financial details
    if (profile.annualFamilyIncome !== undefined) score += 15; else suggestions.push('Enter annual family income to verify limits');
    if (profile.documentUploads?.incomeCertificate) score += 15; else suggestions.push('Upload Income Certificate for validation');

    // Academic details
    if (profile.cgpaOrPercentage) score += 10; else suggestions.push('Enter GPA or academic marks percentage');
    if (profile.documentUploads?.marksheet || profile.documentUploads?.marksheet10th || profile.documentUploads?.marksheet12th || profile.documentUploads?.marksheetCollege || profile.documentUploads?.marksheetOther) score += 10; else suggestions.push('Upload recent academic marksheet');

    setCompletenessScore(score);
    setCompletenessSuggestions(suggestions);
  };

  const runOCRVerify = async () => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const template = selectedDocType === 'incomeCertificate' && useFraudTemplate 
        ? MOCK_DOCS.incomeCertificateFraud 
        : MOCK_DOCS[selectedDocType];

      const { data } = await aiAPI.verifyDocument(selectedDocType, template.url);
      setScanResult(data);
      toast.success('Document scan completed!');
      await fetchProfile(); // updates layout checklist and alerts
    } catch (err) {
      toast.error('Verification failed. Server is down.');
    } finally {
      setIsScanning(false);
    }
  };

  const autofillFromOCR = async () => {
    if (!scanResult || !scanResult.extractedData) return;
    try {
      const ocr = scanResult.extractedData;
      const updatedProfile = { ...profile };

      if (selectedDocType === 'incomeCertificate') {
        updatedProfile.annualFamilyIncome = ocr.annualFamilyIncome;
        updatedProfile.documentUploads = {
          ...updatedProfile.documentUploads,
          incomeCertificate: MOCK_DOCS.incomeCertificate.url
        };
      } else if (['marksheet', 'marksheet10th', 'marksheet12th', 'marksheetCollege', 'marksheetOther'].includes(selectedDocType)) {
        updatedProfile.cgpaOrPercentage = ocr.cgpaOrPercentage;
        if (ocr.educationLevel) updatedProfile.educationLevel = ocr.educationLevel;
        if (ocr.stream) updatedProfile.stream = ocr.stream;
        updatedProfile.documentUploads = {
          ...updatedProfile.documentUploads,
          [selectedDocType]: MOCK_DOCS[selectedDocType]?.url || MOCK_DOCS.marksheet.url
        };
      } else if (selectedDocType === 'domicile') {
        updatedProfile.state = ocr.state;
        updatedProfile.documentUploads = {
          ...updatedProfile.documentUploads,
          domicile: MOCK_DOCS.domicile.url
        };
      }

      const { data } = await userAPI.saveProfile(updatedProfile);
      toast.success('Profile autofilled and updated successfully!');
      setScanResult(null);
      await fetchProfile();
    } catch (err) {
      toast.error('Failed to autofill profile parameters');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1 className="section-title flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          {t('aiHub', language)}
        </h1>
        <p className="section-sub">
          Unlock the power of automated welfare intelligence. Run smart document OCR scans, analyze your profile matching status, and get scheme predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Column 1 & 2: OCR Sandbox ──────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="card glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-32 h-32 text-primary-600" />
            </div>
            
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-primary-600" />
              {t('ocrVerify', language)}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label">Select Document Class</label>
                <select 
                  className="select" 
                  value={selectedDocType}
                  onChange={(e) => {
                    setSelectedDocType(e.target.value);
                    setScanResult(null);
                  }}
                >
                  <option value="incomeCertificate">Income Certificate (Standard)</option>
                  <option value="marksheet">Marksheet (Generic Academic Report)</option>
                  <option value="marksheet10th">10th Marksheet</option>
                  <option value="marksheet12th">12th Marksheet</option>
                  <option value="marksheetCollege">College Marksheet</option>
                  <option value="marksheetOther">Other Academic Document</option>
                  <option value="domicile">Domicile Certificate (Residency)</option>
                </select>
              </div>

              {selectedDocType === 'incomeCertificate' && (
                <div>
                  <label className="label">Audit Test Mode</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="fraudToggle" 
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 bg-gray-100 border-gray-300 dark:bg-slate-700 dark:border-slate-600"
                      checked={useFraudTemplate}
                      onChange={(e) => {
                        setUseFraudTemplate(e.target.checked);
                        setScanResult(null);
                      }}
                    />
                    <label htmlFor="fraudToggle" className="text-xs font-semibold text-gray-600 dark:text-slate-300 cursor-pointer">
                      Simulate Discrepant (Audit Fail) Certificate
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Document Template Information Box */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 mb-6">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-slate-400">
                  <span className="font-bold text-gray-900 dark:text-slate-200">Simulated Upload File: </span>
                  <span className="font-mono">{
                    selectedDocType === 'incomeCertificate' && useFraudTemplate 
                      ? MOCK_DOCS.incomeCertificateFraud.name 
                      : MOCK_DOCS[selectedDocType]?.name
                  }</span>
                  <p className="mt-1">
                    {selectedDocType === 'incomeCertificate' && useFraudTemplate 
                      ? MOCK_DOCS.incomeCertificateFraud.description 
                      : MOCK_DOCS[selectedDocType]?.description
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Verify */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={runOCRVerify}
                disabled={isScanning}
                className="btn btn-primary px-6 flex items-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning Document...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Verify Document Details
                  </>
                )}
              </button>
            </div>

            {/* ── Scan Results Overlay ────────────────────────── */}
            {scanResult && (
              <div className="mt-6 border-t border-gray-100 dark:border-slate-700/80 pt-6 space-y-4 animate-slide-up">
                <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Extracted Extrinsic Attributes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Extracted Card */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/30 text-xs">
                    <div className="font-bold text-gray-500 uppercase tracking-wide mb-2">OCR Document Reader Output</div>
                    <ul className="space-y-1.5 font-mono text-gray-800 dark:text-slate-300">
                      <li>Name: {scanResult.extractedData?.fullName || 'N/A'}</li>
                      {selectedDocType === 'incomeCertificate' && (
                        <li>Annual Income: ₹{scanResult.extractedData?.annualFamilyIncome?.toLocaleString()}</li>
                      )}
                      {['marksheet', 'marksheet10th', 'marksheet12th', 'marksheetCollege', 'marksheetOther'].includes(selectedDocType) && (
                        <li>Aggregate GPA/Score: {scanResult.extractedData?.cgpaOrPercentage}%</li>
                      )}
                      {selectedDocType === 'domicile' && (
                        <li>State: {scanResult.extractedData?.state}</li>
                      )}
                    </ul>
                  </div>

                  {/* Profile Comparison Card */}
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/30 text-xs">
                    <div className="font-bold text-gray-500 uppercase tracking-wide mb-2">Your Current Profile Values</div>
                    <ul className="space-y-1.5 font-mono text-gray-800 dark:text-slate-300">
                      <li>Name: {profile?.fullName || 'Not Filled'}</li>
                      {selectedDocType === 'incomeCertificate' && (
                        <li>Annual Income: ₹{profile?.annualFamilyIncome?.toLocaleString() || 'Not Filled'}</li>
                      )}
                      {['marksheet', 'marksheet10th', 'marksheet12th', 'marksheetCollege', 'marksheetOther'].includes(selectedDocType) && (
                        <li>Aggregate GPA/Score: {profile?.cgpaOrPercentage ? `${profile.cgpaOrPercentage}%` : 'Not Filled'}</li>
                      )}
                      {selectedDocType === 'domicile' && (
                        <li>State: {profile?.state || 'Not Filled'}</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Verification Discrepancy Alerts */}
                {scanResult.hasDiscrepancy ? (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-red-800 dark:text-red-300">Profile Data Discrepancy Flagged</div>
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                        {scanResult.message} A warning has been recorded in the system audit logs. The administrator panel has been alerted for possible fraud check.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Data Integrity Checks Passed</div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Extracted values correspond perfectly with your application fields. No discrepancy found.
                      </p>
                      <button 
                        onClick={autofillFromOCR}
                        className="mt-2.5 px-4 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1"
                      >
                        {t('ocrAutofill', language)} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI recommendations */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-violet-500" />
              AI Welfare Recommendations
            </h2>

            {loadingRecs ? (
              <div className="py-12 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 dark:text-slate-500">
                Please complete your profile to unlock custom recommendations.
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div 
                    key={i} 
                    className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white dark:from-slate-800/40 dark:to-slate-800 border border-gray-100 dark:border-slate-700/60 flex items-start gap-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 font-extrabold font-mono text-sm">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">{rec.name}</div>
                      <div className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">{rec.ministry}</div>
                      
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <span className="text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          Match: {rec.matchPercentage}%
                        </span>
                        {rec.priority && (
                          <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            ★ Priority Matching
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                        <span className="font-bold text-gray-700 dark:text-slate-350">Why Recommended: </span>
                        {rec.reason}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Column 3: Profile completeness Analyzer ────────── */}
        <div className="space-y-8">
          
          <div className="card text-center">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-6">Profile completeness Analyzer</h2>

            {/* Circular Progress Gauge */}
            <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-gray-100 dark:stroke-slate-700" 
                  strokeWidth="8" fill="transparent" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-primary-600 dark:stroke-primary-500" 
                  strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * completenessScore) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-black text-gray-900 dark:text-slate-100 font-mono">
                  {completenessScore}%
                </span>
                <span className="block text-[9px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
                  Complete
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4">
              A highly detailed student profile improves the accuracy of the matching algorithm and maximizes scholarship approvals.
            </p>

            {completenessSuggestions.length > 0 ? (
              <div className="text-left bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800">
                <div className="text-xs font-bold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Remaining Action Tasks
                </div>
                <ul className="space-y-2 text-[10px] text-gray-500 dark:text-slate-400">
                  {completenessSuggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl text-xs text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Profile is 100% complete!
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
