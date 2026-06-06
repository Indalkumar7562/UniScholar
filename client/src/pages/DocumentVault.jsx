import { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { t } from '../utils/translate';
import { SectionHeader, Spinner, ProgressBar } from '../components/ui/index.jsx';
import { 
  Upload, FileText, Trash2, Eye, Download, Info,
  FolderOpen, ShieldCheck, Database, HardDrive, FileBadge, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Identity', 'Income', 'Residence', 'Category Certificate', 'Other'];

export default function DocumentVault() {
  const { language, fetchProfile, profile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Other');
  const [customName, setCustomName] = useState('');

  const loadDocuments = async () => {
    try {
      const { data } = await documentAPI.getAll();
      setDocuments(data.documents || []);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit');
        return;
      }
      setFile(selected);
      setCustomName(selected.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('customName', customName);

    try {
      await documentAPI.upload(formData);
      toast.success('Document uploaded and verified successfully');
      setFile(null);
      setCustomName('');
      await loadDocuments();
      await fetchProfile(); // refresh profile uploads status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      await documentAPI.delete(id);
      toast.success('Document removed');
      await loadDocuments();
      await fetchProfile(); // refresh profile uploads status
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate stats
  const totalSize = documents.reduce((sum, d) => sum + (d.fileSize || 0), 0);
  const totalCount = documents.length;

  // Check completeness based on core documents: Aadhaar, Income, Marksheet, Domicile
  const getCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    const { aadhaar, incomeCertificate, domicile, marksheet, marksheet10th, marksheet12th, marksheetCollege, marksheetOther } = profile.documentUploads || {};
    if (aadhaar) score++;
    if (incomeCertificate) score++;
    if (domicile) score++;
    if (marksheet || marksheet10th || marksheet12th || marksheetCollege || marksheetOther) score++;
    return (score / 4) * 100;
  };

  const completeness = getCompleteness();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <SectionHeader 
        title={t('documentVault', language)}
        subtitle="Securely store, manage, and verify your credentials for online scholarship applications."
      />

      {/* ── Dashboard Stats Widget ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card glass-card flex items-center gap-4 p-5 hover-scale">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Stored Items</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-1">{totalCount} files</div>
          </div>
        </div>

        <div className="card glass-card flex items-center gap-4 p-5 hover-scale">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vault Storage</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-1">{formatSize(totalSize)}</div>
          </div>
        </div>

        <div className="card glass-card flex items-center gap-4 p-5 hover-scale">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Core Verification</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-slate-100 mt-0.5">{completeness}%</div>
            <div className="w-full mt-1">
              <ProgressBar value={completeness} color="success" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card shadow-lg border border-gray-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700/80 pb-3">
              <Upload className="w-5 h-5 text-primary-500" />
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide">Upload Credentials</h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="label">{t('selectCategory', language)} *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="select text-xs font-semibold"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t('documentName', language)} *</label>
                <input
                  type="text"
                  placeholder="e.g. Income Certificate 2026"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="input text-xs font-semibold"
                  required
                />
              </div>

              {/* File Input Box */}
              <div>
                <label className="label">File Upload (PDF, Images under 10MB)</label>
                <div className="relative border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-2xl p-6 transition-colors flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-900/10 cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <FolderOpen className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-[11px] font-bold text-gray-500 dark:text-slate-400 text-center">
                    {file ? file.name : 'Click to select or drag file here'}
                  </span>
                  {file && (
                    <span className="text-[9px] text-gray-400 mt-1">({formatSize(file.size)})</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary w-full py-3 gap-2 text-xs font-bold shadow-lg hover-scale"
              >
                {uploading ? <Spinner /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Processing & Syncing...' : t('uploadDocument', language)}
              </button>
            </form>
          </div>

          {/* Sync Tip Box */}
          <div className="card bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
              <strong>Smart Profile Integration</strong>: Uploading documents under Academic, Income, Identity, or Residence will automatically link to your eligibility profile parameters and sync with matching scholarship algorithms!
            </div>
          </div>
        </div>

        {/* Right Side: Documents Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card shadow-lg border border-gray-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-500" />
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100 uppercase tracking-wide">Stored Credentials</h3>
              </div>
              <span className="badge badge-primary">{totalCount} total</span>
            </div>

            {loading ? (
              <div className="py-20 flex items-center justify-center">
                <Spinner className="spinner-blue" />
              </div>
            ) : documents.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
                  {t('noDocuments', language)}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => {
                  const isProfileLinked = [
                    profile?.documentUploads?.aadhaar,
                    profile?.documentUploads?.incomeCertificate,
                    profile?.documentUploads?.marksheet,
                    profile?.documentUploads?.marksheet10th,
                    profile?.documentUploads?.marksheet12th,
                    profile?.documentUploads?.marksheetCollege,
                    profile?.documentUploads?.marksheetOther,
                    profile?.documentUploads?.domicile,
                    profile?.documentUploads?.casteCertificate,
                    profile?.documentUploads?.disabilityCertificate
                  ].includes(doc.filePath);

                  return (
                    <div
                      key={doc._id}
                      className="p-4 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700/70 rounded-2xl flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-md hover:border-gray-250 dark:hover:border-slate-600 relative group overflow-hidden"
                    >
                      <div>
                        {/* Upper row */}
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            doc.category === 'Academic' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400' :
                            doc.category === 'Identity' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400' :
                            doc.category === 'Income' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            doc.category === 'Residence' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                            doc.category === 'Category Certificate' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' :
                            'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {doc.category}
                          </span>
                          
                          {isProfileLinked && (
                            <span 
                              className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                              title="Linked to eligibility profile verification rules"
                            >
                              <ShieldCheck className="w-3 h-3" /> Linked
                            </span>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="mt-3">
                          <h4 className="text-xs font-bold text-gray-800 dark:text-slate-100 truncate" title={doc.name}>
                            {doc.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 font-semibold truncate">
                            {doc.originalName}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      {/* Card Action footer */}
                      <div className="flex gap-2 border-t border-gray-50 dark:border-slate-700/50 pt-3 mt-1">
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost px-3 py-1 text-[10px] flex-1 flex items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                        <a
                          href={doc.filePath}
                          download={doc.name}
                          className="btn btn-ghost px-3 py-1 text-[10px] flex-1 flex items-center justify-center gap-1 hover:bg-gray-100 dark:hover:bg-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="btn btn-ghost px-2.5 py-1 text-[10px] text-red-500 dark:text-red-400 border-red-100 dark:border-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/10 hover:border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
