import { useState } from 'react';
import { Copy, Check, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentIdBadge({ studentId = 'USS-STU-2026-000001', className = '', size = 'md' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(studentId);
    setCopied(true);
    toast.success('✓ Student ID copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const isSmall = size === 'sm';

  return (
    <div 
      onClick={handleCopy}
      title="Click to copy Student ID"
      className={`inline-flex items-center gap-2 bg-slate-950/90 border border-blue-900/40 hover:border-blue-500/60 rounded-xl px-2.5 py-1 text-slate-200 font-mono transition-all cursor-pointer shadow-xs ${className}`}
    >
      <Shield className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-blue-400 shrink-0`} />
      <div className="flex flex-col leading-tight">
        {!isSmall && <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">STUDENT ID</span>}
        <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} font-bold text-white tracking-wide`}>{studentId}</span>
      </div>
      <button 
        type="button"
        className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-blue-400 transition-colors shrink-0 ml-1"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}
