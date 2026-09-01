import { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Award, Building, Calendar, Check, AlertCircle } from 'lucide-react';

const EDU_LEVELS = ['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'];

const GRAD_DEGREES = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'B.A.', 'BCA', 'BBA', 'B.Pharm', 'MBBS', 'B.Arch', 'LLB', 'B.Ed', 'Other'];
const PG_DEGREES = ['M.Tech', 'M.E.', 'M.Sc', 'M.Com', 'M.A.', 'MCA', 'MBA', 'M.Pharm', 'LLM', 'MD', 'M.Ed', 'Other'];
const DIPLOMA_COURSES = ['Diploma in Engineering', 'Diploma in Pharmacy', 'Diploma in Computer Application', 'ITI', 'Diploma in Business Management', 'Other'];

const BRANCHES = [
  'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 
  'Artificial Intelligence & Data Science', 'Chemical Engineering', 'Biotechnology', 
  'Commerce / Finance', 'Arts / Humanities', 'Other'
];

const STREAMS_12TH = ['Science', 'Commerce', 'Arts / Humanities', 'Vocational', 'Other'];
const BOARDS = ['CBSE', 'ICSE / CISCE', 'State Board', 'NIOS', 'IB', 'Other'];
const STUDY_MODES = ['Regular / On Campus', 'Distance', 'Online / Part-time'];
const ENROLLMENT_STATUSES = ['Currently Studying', 'Completed', 'Discontinued'];
const RESULT_TYPES = ['Percentage', 'CGPA', 'Marks', 'Grade'];

export default function AcademicDetailsSection({
  form,
  updateField,
  academicDetails,
  setAcademicDetails
}) {
  const currentLevel = form.educationLevel || 'Graduation';

  // Ensure internal academicDetails state exists
  const details = academicDetails || {};

  const updateSubLevel = (levelKey, fieldKey, value) => {
    const updatedLevel = {
      ...(details[levelKey] || {}),
      [fieldKey]: value
    };
    const newAcademicDetails = {
      ...details,
      [levelKey]: updatedLevel
    };
    setAcademicDetails(newAcademicDetails);

    // Sync primary flat fields for backward compatibility and backend analytics
    if (levelKey === 'graduation' && (currentLevel === 'Graduation')) {
      if (fieldKey === 'specialization' || fieldKey === 'degree') {
        updateField('stream', updatedLevel.specialization || updatedLevel.degree || 'Engineering');
      }
      if (fieldKey === 'college') updateField('collegeName', value);
      if (fieldKey === 'currentYearOrSem') updateField('currentYearOrSemester', value);
      if (fieldKey === 'percentage' || fieldKey === 'cgpa') updateField('cgpaOrPercentage', Number(value) || 0);
    } else if (levelKey === 'twelfth' && currentLevel === '12th Pass') {
      if (fieldKey === 'stream') updateField('stream', value);
      if (fieldKey === 'schoolName') updateField('collegeName', value);
      if (fieldKey === 'percentage' || fieldKey === 'cgpa') updateField('cgpaOrPercentage', Number(value) || 0);
    } else if (levelKey === 'tenth' && currentLevel === '10th Pass') {
      if (fieldKey === 'schoolName') updateField('collegeName', value);
      if (fieldKey === 'percentage' || fieldKey === 'cgpa') updateField('cgpaOrPercentage', Number(value) || 0);
    }
  };

  const getSubField = (levelKey, fieldKey, defaultValue = '') => {
    return details[levelKey]?.[fieldKey] !== undefined ? details[levelKey][fieldKey] : defaultValue;
  };

  // Render Result Input Component depending on Result Type (Percentage, CGPA, Marks, Grade)
  const renderResultInputs = (levelKey, isCurrent = false) => {
    const resultType = getSubField(levelKey, 'resultType', 'Percentage');
    const percentage = getSubField(levelKey, 'percentage', '');
    const cgpa = getSubField(levelKey, 'cgpa', '');
    const obtained = getSubField(levelKey, 'obtainedMarks', '');
    const total = getSubField(levelKey, 'totalMarks', '');
    const grade = getSubField(levelKey, 'grade', '');

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">{isCurrent ? 'Current Result Type' : 'Result Type *'}</label>
            <select
              className="select"
              value={resultType}
              onChange={(e) => updateSubLevel(levelKey, 'resultType', e.target.value)}
            >
              {RESULT_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
          </div>

          {resultType === 'Percentage' && (
            <div>
              <label className="label">{isCurrent ? 'Current Percentage (%) *' : 'Percentage (%) *'}</label>
              <input
                type="number" step="0.01" min="0" max="100" className="input" placeholder="e.g. 87.5"
                value={percentage} onChange={(e) => updateSubLevel(levelKey, 'percentage', e.target.value)}
              />
            </div>
          )}

          {resultType === 'CGPA' && (
            <div>
              <label className="label">{isCurrent ? 'Current CGPA (out of 10) *' : 'Final CGPA (out of 10) *'}</label>
              <input
                type="number" step="0.01" min="0" max="10" className="input" placeholder="e.g. 8.5"
                value={cgpa} onChange={(e) => updateSubLevel(levelKey, 'cgpa', e.target.value)}
              />
            </div>
          )}

          {resultType === 'Grade' && (
            <div>
              <label className="label">Grade *</label>
              <input
                type="text" className="input" placeholder="e.g. A+ / O"
                value={grade} onChange={(e) => updateSubLevel(levelKey, 'grade', e.target.value)}
              />
            </div>
          )}
        </div>

        {resultType === 'Marks' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="label">Obtained Marks *</label>
              <input
                type="number" className="input" placeholder="e.g. 435"
                value={obtained} onChange={(e) => updateSubLevel(levelKey, 'obtainedMarks', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Total Marks *</label>
              <input
                type="number" className="input" placeholder="e.g. 500"
                value={total} onChange={(e) => updateSubLevel(levelKey, 'totalMarks', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Calculated %</label>
              <div className="input bg-gray-50 dark:bg-slate-900/80 flex items-center font-mono text-emerald-400 font-bold">
                {obtained && total && Number(total) > 0 
                  ? `${((Number(obtained) / Number(total)) * 100).toFixed(2)}%` 
                  : '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── 1. SELECT CURRENT EDUCATION LEVEL & TOP SUMMARY ───────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-400" />
              Academic Qualification Hierarchy
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your current/highest level. Relevant historical qualifications down to 10th will be built automatically.
            </p>
          </div>

          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 shrink-0 self-start sm:self-center">
            HIGH → LOW ORDER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label text-primary-300 font-bold">Current Education Level *</label>
            <select
              className="select border-primary-500/40 focus:border-primary-500 font-bold text-sm"
              value={currentLevel}
              onChange={(e) => {
                const val = e.target.value;
                updateField('educationLevel', val);
              }}
            >
              {EDU_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Compact Summary Badge */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-center text-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Profile Summary</span>
            <div className="font-semibold text-slate-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-emerald-400 font-bold">{currentLevel}</span>
              {getSubField('graduation', 'degree') && (
                <span>• {getSubField('graduation', 'degree')} ({getSubField('graduation', 'specialization') || 'General'})</span>
              )}
              {getSubField('twelfth', 'stream') && currentLevel === '12th Pass' && (
                <span>• {getSubField('twelfth', 'stream')} Stream</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          DYNAMIC QUALIFICATION SECTIONS (HIGH TO LOW ORDER)
         ────────────────────────────────────────────────────────────────── */}

      {/* ── 1. PhD SECTION (If PhD) ── */}
      {currentLevel === 'PhD' && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border-2 border-primary-500/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Current PhD Details</h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-primary-500/20 text-primary-300">CURRENT HIGHEST</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Research Area / Specialization *</label>
              <input
                type="text" className="input" placeholder="e.g. Quantum Computing & Machine Learning"
                value={getSubField('phd', 'researchArea')}
                onChange={(e) => updateSubLevel('phd', 'researchArea', e.target.value)}
              />
            </div>
            <div>
              <label className="label">University / Institution *</label>
              <input
                type="text" className="input" placeholder="e.g. IIT Bombay / IISc"
                value={getSubField('phd', 'institution')}
                onChange={(e) => updateSubLevel('phd', 'institution', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Department</label>
              <input
                type="text" className="input" placeholder="e.g. Dept. of Computer Science & Automation"
                value={getSubField('phd', 'department')}
                onChange={(e) => updateSubLevel('phd', 'department', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Enrollment Status</label>
              <select
                className="select"
                value={getSubField('phd', 'enrollmentStatus', 'Currently Studying')}
                onChange={(e) => updateSubLevel('phd', 'enrollmentStatus', e.target.value)}
              >
                {ENROLLMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Research Start Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2023"
                value={getSubField('phd', 'startYear')}
                onChange={(e) => updateSubLevel('phd', 'startYear', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Expected Completion Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2027"
                value={getSubField('phd', 'expectedYear')}
                onChange={(e) => updateSubLevel('phd', 'expectedYear', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. POST GRADUATION SECTION (If PhD or Post Graduation) ── */}
      {['PhD', 'Post Graduation'].includes(currentLevel) && (
        <div className={`p-5 rounded-2xl bg-slate-900/60 space-y-4 ${
          currentLevel === 'Post Graduation' ? 'border-2 border-primary-500/30 shadow-md' : 'border border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-violet-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {currentLevel === 'Post Graduation' ? 'Current Post Graduation Details' : 'Post Graduation Details'}
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
              {currentLevel === 'Post Graduation' ? 'CURRENT HIGHEST' : 'COMPLETED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Degree / Course *</label>
              <select
                className="select"
                value={getSubField('postGraduation', 'degree', 'M.Tech')}
                onChange={(e) => updateSubLevel('postGraduation', 'degree', e.target.value)}
              >
                {PG_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Specialization / Branch *</label>
              <input
                type="text" className="input" placeholder="e.g. Data Science / Finance"
                value={getSubField('postGraduation', 'specialization')}
                onChange={(e) => updateSubLevel('postGraduation', 'specialization', e.target.value)}
              />
            </div>
            <div>
              <label className="label">College / Institute *</label>
              <input
                type="text" className="input" placeholder="e.g. St. Xavier College"
                value={getSubField('postGraduation', 'college')}
                onChange={(e) => updateSubLevel('postGraduation', 'college', e.target.value)}
              />
            </div>
            <div>
              <label className="label">University Name *</label>
              <input
                type="text" className="input" placeholder="e.g. Mumbai University"
                value={getSubField('postGraduation', 'university')}
                onChange={(e) => updateSubLevel('postGraduation', 'university', e.target.value)}
              />
            </div>

            {currentLevel === 'Post Graduation' ? (
              <>
                <div>
                  <label className="label">Current Year / Semester *</label>
                  <input
                    type="text" className="input" placeholder="e.g. 1st Year / Sem II"
                    value={getSubField('postGraduation', 'currentYearOrSem')}
                    onChange={(e) => updateSubLevel('postGraduation', 'currentYearOrSem', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Admission Year *</label>
                  <input
                    type="number" className="input" placeholder="e.g. 2024"
                    value={getSubField('postGraduation', 'admissionYear')}
                    onChange={(e) => updateSubLevel('postGraduation', 'admissionYear', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Expected Completion Year *</label>
                  <input
                    type="number" className="input" placeholder="e.g. 2026"
                    value={getSubField('postGraduation', 'expectedYear')}
                    onChange={(e) => updateSubLevel('postGraduation', 'expectedYear', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Study Mode</label>
                  <select
                    className="select"
                    value={getSubField('postGraduation', 'studyMode', 'Regular / On Campus')}
                    onChange={(e) => updateSubLevel('postGraduation', 'studyMode', e.target.value)}
                  >
                    {STUDY_MODES.map(sm => <option key={sm} value={sm}>{sm}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="label">Passing Year *</label>
                <input
                  type="number" className="input" placeholder="e.g. 2024"
                  value={getSubField('postGraduation', 'passingYear')}
                  onChange={(e) => updateSubLevel('postGraduation', 'passingYear', e.target.value)}
                />
              </div>
            )}
          </div>

          {renderResultInputs('postGraduation', currentLevel === 'Post Graduation')}
        </div>
      )}

      {/* ── 3. GRADUATION SECTION (If PhD, Post Graduation, or Graduation) ── */}
      {['PhD', 'Post Graduation', 'Graduation'].includes(currentLevel) && (
        <div className={`p-5 rounded-2xl bg-slate-900/60 space-y-4 ${
          currentLevel === 'Graduation' ? 'border-2 border-primary-500/30 shadow-md' : 'border border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                {currentLevel === 'Graduation' ? 'Current Graduation Details' : 'Graduation Details'}
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              {currentLevel === 'Graduation' ? 'CURRENT HIGHEST' : 'COMPLETED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Degree / Course *</label>
              <select
                className="select"
                value={getSubField('graduation', 'degree', 'B.Tech')}
                onChange={(e) => updateSubLevel('graduation', 'degree', e.target.value)}
              >
                {GRAD_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Specialization / Branch *</label>
              <select
                className="select"
                value={getSubField('graduation', 'specialization', 'Computer Science & Engineering')}
                onChange={(e) => updateSubLevel('graduation', 'specialization', e.target.value)}
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">College / Institute *</label>
              <input
                type="text" className="input" placeholder="e.g. St. Xavier College of Engineering"
                value={getSubField('graduation', 'college')}
                onChange={(e) => updateSubLevel('graduation', 'college', e.target.value)}
              />
            </div>
            <div>
              <label className="label">University Name *</label>
              <input
                type="text" className="input" placeholder="e.g. Mumbai University / VTU"
                value={getSubField('graduation', 'university')}
                onChange={(e) => updateSubLevel('graduation', 'university', e.target.value)}
              />
            </div>

            {currentLevel === 'Graduation' ? (
              <>
                <div>
                  <label className="label">Current Year / Semester *</label>
                  <input
                    type="text" className="input" placeholder="e.g. 4th Year / Sem VII"
                    value={getSubField('graduation', 'currentYearOrSem')}
                    onChange={(e) => updateSubLevel('graduation', 'currentYearOrSem', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Admission Year *</label>
                  <input
                    type="number" className="input" placeholder="e.g. 2023"
                    value={getSubField('graduation', 'admissionYear')}
                    onChange={(e) => updateSubLevel('graduation', 'admissionYear', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Expected Graduation Year *</label>
                  <input
                    type="number" className="input" placeholder="e.g. 2027"
                    value={getSubField('graduation', 'expectedYear')}
                    onChange={(e) => updateSubLevel('graduation', 'expectedYear', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Study Mode</label>
                  <select
                    className="select"
                    value={getSubField('graduation', 'studyMode', 'Regular / On Campus')}
                    onChange={(e) => updateSubLevel('graduation', 'studyMode', e.target.value)}
                  >
                    {STUDY_MODES.map(sm => <option key={sm} value={sm}>{sm}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="label">Passing Year *</label>
                <input
                  type="number" className="input" placeholder="e.g. 2023"
                  value={getSubField('graduation', 'passingYear')}
                  onChange={(e) => updateSubLevel('graduation', 'passingYear', e.target.value)}
                />
              </div>
            )}
          </div>

          {renderResultInputs('graduation', currentLevel === 'Graduation')}
        </div>
      )}

      {/* ── 4. DIPLOMA SECTION (If Diploma) ── */}
      {currentLevel === 'Diploma' && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border-2 border-primary-500/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Current Diploma Details</h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">CURRENT HIGHEST</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Diploma Course *</label>
              <select
                className="select"
                value={getSubField('diploma', 'course', 'Diploma in Engineering')}
                onChange={(e) => updateSubLevel('diploma', 'course', e.target.value)}
              >
                {DIPLOMA_COURSES.map(dc => <option key={dc} value={dc}>{dc}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Specialization / Branch *</label>
              <input
                type="text" className="input" placeholder="e.g. Computer Engineering / Mechanical"
                value={getSubField('diploma', 'specialization')}
                onChange={(e) => updateSubLevel('diploma', 'specialization', e.target.value)}
              />
            </div>
            <div>
              <label className="label">College / Institute *</label>
              <input
                type="text" className="input" placeholder="e.g. Government Polytechnic"
                value={getSubField('diploma', 'college')}
                onChange={(e) => updateSubLevel('diploma', 'college', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Current Year / Semester *</label>
              <input
                type="text" className="input" placeholder="e.g. 2nd Year / Sem III"
                value={getSubField('diploma', 'currentYearOrSem')}
                onChange={(e) => updateSubLevel('diploma', 'currentYearOrSem', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Admission Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2024"
                value={getSubField('diploma', 'admissionYear')}
                onChange={(e) => updateSubLevel('diploma', 'admissionYear', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Expected Completion Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2027"
                value={getSubField('diploma', 'expectedYear')}
                onChange={(e) => updateSubLevel('diploma', 'expectedYear', e.target.value)}
              />
            </div>
          </div>

          {renderResultInputs('diploma', true)}
        </div>
      )}

      {/* ── 5. 12TH SECTION (If PhD, Post Graduation, Graduation, or 12th Pass) ── */}
      {['PhD', 'Post Graduation', 'Graduation', '12th Pass'].includes(currentLevel) && (
        <div className={`p-5 rounded-2xl bg-slate-900/60 space-y-4 ${
          currentLevel === '12th Pass' ? 'border-2 border-primary-500/30 shadow-md' : 'border border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                12th / Senior Secondary Details
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {currentLevel === '12th Pass' ? 'CURRENT HIGHEST' : 'COMPLETED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Board *</label>
              <select
                className="select"
                value={getSubField('twelfth', 'board', 'CBSE')}
                onChange={(e) => updateSubLevel('twelfth', 'board', e.target.value)}
              >
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">School Name *</label>
              <input
                type="text" className="input" placeholder="e.g. Kendriya Vidyalaya No. 1"
                value={getSubField('twelfth', 'schoolName')}
                onChange={(e) => updateSubLevel('twelfth', 'schoolName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Stream *</label>
              <select
                className="select"
                value={getSubField('twelfth', 'stream', 'Science')}
                onChange={(e) => updateSubLevel('twelfth', 'stream', e.target.value)}
              >
                {STREAMS_12TH.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Passing Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2023"
                value={getSubField('twelfth', 'passingYear')}
                onChange={(e) => updateSubLevel('twelfth', 'passingYear', e.target.value)}
              />
            </div>
          </div>

          {renderResultInputs('twelfth', currentLevel === '12th Pass')}
        </div>
      )}

      {/* ── 6. 10TH SECTION (If PhD, Post Graduation, Graduation, 12th Pass, Diploma, or 10th Pass) ── */}
      {['PhD', 'Post Graduation', 'Graduation', '12th Pass', 'Diploma', '10th Pass'].includes(currentLevel) && (
        <div className={`p-5 rounded-2xl bg-slate-900/60 space-y-4 ${
          currentLevel === '10th Pass' ? 'border-2 border-primary-500/30 shadow-md' : 'border border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                10th / Secondary Details
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
              {currentLevel === '10th Pass' ? 'CURRENT HIGHEST' : 'COMPLETED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Board *</label>
              <select
                className="select"
                value={getSubField('tenth', 'board', 'CBSE')}
                onChange={(e) => updateSubLevel('tenth', 'board', e.target.value)}
              >
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">School Name *</label>
              <input
                type="text" className="input" placeholder="e.g. St. Joseph High School"
                value={getSubField('tenth', 'schoolName')}
                onChange={(e) => updateSubLevel('tenth', 'schoolName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Passing Year *</label>
              <input
                type="number" className="input" placeholder="e.g. 2021"
                value={getSubField('tenth', 'passingYear')}
                onChange={(e) => updateSubLevel('tenth', 'passingYear', e.target.value)}
              />
            </div>
          </div>

          {renderResultInputs('tenth', currentLevel === '10th Pass')}
        </div>
      )}

      {/* ── 7. BELOW 10TH SECTION (If Below 10th) ── */}
      {currentLevel === 'Below 10th' && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border-2 border-primary-500/30 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Current School Details</h4>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">CURRENT SCHOOLING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Current Class *</label>
              <select
                className="select"
                value={getSubField('belowTenth', 'currentClass', 'Class 9')}
                onChange={(e) => updateSubLevel('belowTenth', 'currentClass', e.target.value)}
              >
                {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">School Name *</label>
              <input
                type="text" className="input" placeholder="e.g. St. Michael School"
                value={getSubField('belowTenth', 'schoolName')}
                onChange={(e) => updateSubLevel('belowTenth', 'schoolName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Academic Year *</label>
              <input
                type="text" className="input" placeholder="e.g. 2025-2026"
                value={getSubField('belowTenth', 'academicYear')}
                onChange={(e) => updateSubLevel('belowTenth', 'academicYear', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Board / Authority</label>
              <select
                className="select"
                value={getSubField('belowTenth', 'board', 'State Board')}
                onChange={(e) => updateSubLevel('belowTenth', 'board', e.target.value)}
              >
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
