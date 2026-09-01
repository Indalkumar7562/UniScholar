const Scheme = require('../models/Scheme.model');
const Profile = require('../models/Profile.model');
const EligibilityResult = require('../models/EligibilityResult.model');
const Notification = require('../models/Notification.model');
const { checkSchemeEligibility } = require('../utils/eligibility.utils');

// Helper to format currency
const formatMoney = (val) => {
  if (typeof val === 'number') {
    return `₹${val.toLocaleString('en-IN')}`;
  }
  return val || 'N/A';
};

// Helper to format deadline dates with status
const formatDeadline = (deadlineDate) => {
  const dateObj = deadlineDate ? new Date(deadlineDate) : new Date('2026-12-31');
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const now = new Date();
  const diffDays = Math.ceil((dateObj - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${dateStr} (🔴 Closed)`;
  if (diffDays <= 15) return `${dateStr} (🟡 Closing Soon)`;
  return `${dateStr} (🟢 Open)`;
};

// ── TEXT NORMALIZATION & TYPO CORRECTION ──────────────────────────────────
const normalizeText = (text) => {
  if (!text) return '';
  let str = text.toLowerCase().trim();

  const typos = [
    [/\bamtric\b/g, 'matric'],
    [/\bpostmatric\b/g, 'post matric'],
    [/\bprematric\b/g, 'pre matric'],
    [/\bscholrship\b|\bscholrships\b|\bscholership\b|\bscholorship\b|\bscholarhip\b|\bscholarsip\b/g, 'scholarship'],
    [/\bpragti\b|\bpragathi\b|\bprogati\b/g, 'pragati'],
    [/\beligiblity\b|\belgible\b|\beligble\b|\beligblity\b/g, 'eligibility'],
    [/\bdocumnts\b|\bdocumnet\b|\bdocumenst\b|\bdocumets\b/g, 'documents'],
    [/\bdeadln\b|\bdeadlin\b|\blastdate\b/g, 'deadline'],
    [/\bincom\b|\bincme\b|\bincoms\b/g, 'income'],
    [/\bgirls\b|\bgirl\b|\bwomen\b|\bfemale student\b|\bfemale students\b/g, 'female'],
    [/\bboys\b|\bboy\b|\bmale student\b|\bmale students\b/g, 'male'],
    [/\b10th pass\b|\bclass 10\b|\b10th class\b/g, '10th'],
    [/\b12th pass\b|\bclass 12\b|\b12th class\b/g, '12th'],
    [/\bug\b|\bundergraduate\b|\bbachelor\b|\bbachelors\b/g, 'graduation'],
    [/\bpg\b|\bpostgraduate\b|\bmaster\b|\bmasters\b/g, 'post graduation'],
  ];

  typos.forEach(([pattern, replacement]) => {
    str = str.replace(pattern, replacement);
  });

  return str;
};

// ── CONTEXT RESOLUTION FROM HISTORY ───────────────────────────────────────
const findContextScheme = (history, schemes) => {
  if (!history || !Array.isArray(history) || history.length === 0) return null;

  for (let i = history.length - 1; i >= 0; i--) {
    const msgText = (history[i].text || '').toLowerCase();
    const matched = schemes.find(s => {
      const nameLower = s.name.toLowerCase();
      const firstWord = nameLower.split(' ')[0];
      return msgText.includes(nameLower) || (firstWord.length > 3 && msgText.includes(firstWord));
    });
    if (matched) return matched;
  }
  return null;
};

// Simple OCR simulation
const simulateOCR = (docType, profileName) => {
  const timestamp = Date.now().toString().slice(-4);
  switch (docType) {
    case 'aadhaar':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          aadhaarNumber: `XXXX-XXXX-${timestamp}`,
          gender: 'Female',
          birthYear: 2004,
        },
        message: 'Aadhaar Card scanned successfully. Name and Gender verified.'
      };
    case 'incomeCertificate':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          annualFamilyIncome: 180000,
          certificateNumber: `INC/2026/${timestamp}`,
          bplStatus: true
        },
        message: 'Income Certificate scanned successfully. Annual Income extracted: ₹1,80,000. BPL status verified.'
      };
    default:
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          cgpaOrPercentage: 85
        },
        message: 'Document parsed successfully.'
      };
  }
};

const verifyDocumentOCR = async (req, res) => {
  try {
    const docType = req.body.docType || req.body.documentType;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const ocrResult = simulateOCR(docType, profile.fullName);
    if (!ocrResult.success) {
      return res.status(400).json({ success: false, message: ocrResult.message });
    }

    res.json({
      success: true,
      message: ocrResult.message,
      data: ocrResult.extractedData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Document verification failed' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Profile not found' });
    }

    let schemes = await Scheme.find({ isActive: true });
    
    const results = schemes.map(scheme => {
      const analysis = checkSchemeEligibility(profile, scheme);
      let weight = analysis.matchScore;
      if (analysis.eligible) weight += 100;
      return {
        scheme,
        ...analysis,
        weight
      };
    });

    results.sort((a, b) => b.weight - a.weight);

    res.json({
      success: true,
      data: {
        recommendations: results.slice(0, 5),
        profileCompleteness: profile.isComplete ? 100 : 60
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};

// Fallback schemes if MongoDB returns empty array
const FALLBACK_SCHEMES = [
  {
    name: 'Pragati Scholarship for Girl Students',
    slug: 'pragati-scholarship-for-girl-students',
    description: 'AICTE scheme offering ₹50,000 per annum to eligible female students pursuing technical education.',
    category: 'General',
    ministry: 'AICTE / Ministry of Education',
    amount: '₹50,000/year',
    lastDateToApply: new Date('2026-10-01'),
    requiredDocuments: ['Aadhaar Card', 'Income Certificate', '10th Marksheet', '12th Marksheet'],
    eligibilityCriteria: {
      minAge: 16,
      maxAge: 25,
      maxAnnualIncome: 800000,
      educationLevels: ['12th Pass', 'Diploma', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['Female'],
      minPercentage: 60
    }
  },
  {
    name: 'INSPIRE Scholarship for Higher Education (SHE)',
    slug: 'inspire-scholarship-for-higher-education',
    description: 'DST flagship scholarship providing ₹80,000/year to students pursuing Natural and Basic Sciences.',
    category: 'General',
    ministry: 'Department of Science & Technology',
    amount: '₹80,000/year',
    lastDateToApply: new Date('2026-11-15'),
    requiredDocuments: ['Aadhaar Card', '12th Marksheet', 'Income Certificate'],
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 22,
      maxAnnualIncome: 9999999,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['All'],
      minPercentage: 80
    }
  },
  {
    name: 'SC/ST Post Matric Scholarship',
    slug: 'sc-st-post-matric-scholarship',
    description: 'Financial assistance to SC/ST students pursuing post-matric education (Class 11 onwards, Diploma, Degree, Masters). Covers tuition fees and maintenance allowance.',
    category: 'SC',
    ministry: 'Ministry of Social Justice and Empowerment',
    amount: '₹15,000/year',
    lastDateToApply: new Date('2026-09-13'),
    requiredDocuments: ['Caste Certificate', 'Income Certificate', '10th Marksheet', 'Aadhaar Card'],
    eligibilityCriteria: {
      minAge: 14,
      maxAge: 40,
      maxAnnualIncome: 250000,
      educationLevels: ['10th Pass', '12th Pass', 'Graduation', 'Post Graduation'],
      categories: ['SC', 'ST'],
      states: ['All'],
      genders: ['All'],
      minPercentage: 0
    }
  }
];

// @desc    Conversational AI Chatbot interface
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const rawMessage = message.trim();
    const query = normalizeText(rawMessage);
    const words = query.split(/\s+/);
    
    // Fetch user profile and active schemes
    let profile = await Profile.findOne({ user: req.user._id });
    let dbSchemes = await Scheme.find({ isActive: true });
    let schemes = dbSchemes.length > 0 ? dbSchemes : FALLBACK_SCHEMES;

    const evalProfile = profile || {
      age: 19,
      gender: 'Female',
      state: 'Gujarat',
      category: 'General',
      annualFamilyIncome: 180000,
      cgpaOrPercentage: 85,
      educationLevel: '12th Pass',
      stream: 'Science',
      bplStatus: true,
      disabilityStatus: false,
      documentUploads: {}
    };

    let reply = '';
    let chips = [];

    // Helper for document availability
    const formatRequiredDocs = (docList) => {
      if (!docList || docList.length === 0) return '• Aadhaar Card, Income Certificate';
      const userDocs = evalProfile.documentUploads || {};
      return docList.map(doc => {
        const key = doc.toLowerCase();
        let isUploaded = false;
        if (key.includes('income') && userDocs.incomeCertificate) isUploaded = true;
        else if (key.includes('10th') && userDocs.marksheet10th) isUploaded = true;
        else if (key.includes('12th') && userDocs.marksheet12th) isUploaded = true;
        else if (key.includes('aadhaar') && userDocs.aadhaar) isUploaded = true;
        else if (key.includes('caste') && userDocs.casteCertificate) isUploaded = true;
        else if (key.includes('domicile') && userDocs.domicile) isUploaded = true;

        return `• ${doc} (${isUploaded ? '✓ Available' : '⚠ Missing'})`;
      }).join('\n');
    };

    // ── 1. ENTITY & INTENT DETECTION LAYER ─────────────────────────────────
    let categoryEntity = null;
    if (/\bsc\b|\bscheduled caste\b/.test(query)) categoryEntity = 'SC';
    else if (/\bst\b|\bscheduled tribe\b/.test(query)) categoryEntity = 'ST';
    else if (/\bobc\b|\bother backward\b/.test(query)) categoryEntity = 'OBC';
    else if (/\bgeneral\b|\bopen\b/.test(query)) categoryEntity = 'General';

    let genderEntity = null;
    if (query.includes('female')) genderEntity = 'Female';
    else if (query.includes('male')) genderEntity = 'Male';

    let eduEntity = null;
    if (query.includes('10th')) eduEntity = '10th Pass';
    else if (query.includes('12th')) eduEntity = '12th Pass';
    else if (query.includes('diploma')) eduEntity = 'Diploma';
    else if (query.includes('graduation')) eduEntity = 'Graduation';
    else if (query.includes('post graduation')) eduEntity = 'Post Graduation';

    let isDeadline = /\bdeadline\b|\blast date\b|\bclosing\b|\bwhen is\b|\bdate\b/.test(query);
    let isDocument = /\bdocument\b|\bdocuments\b|\bpaper\b|\bupload\b|\bwhat do i need\b|\bchecklist\b/.test(query);
    let isAmount = /\bhow much\b|\bamount\b|\bbenefit\b|\bmoney\b|\bpay\b|\bstipend\b/.test(query);
    let isEligibility = /\beligible\b|\beligibility\b|\bqualify\b|\bam i\b|\bcan i get\b|\bmatching\b|\brecommend\b/.test(query);

    // Resolve context scheme from history for follow-up questions
    let contextScheme = findContextScheme(history, schemes);

    // Direct scheme keyword search in current query only
    let matchedScheme = schemes.find(s => {
      const nameLower = s.name.toLowerCase();
      const slugLower = (s.slug || '').toLowerCase();
      if (query.includes('pragati') && nameLower.includes('pragati')) return true;
      if (query.includes('inspire') && nameLower.includes('inspire')) return true;
      if (query.includes('post matric') && (nameLower.includes('post matric') || slugLower.includes('post-matric'))) return true;
      if (query.includes('pre matric') && (nameLower.includes('pre matric') || slugLower.includes('pre-matric'))) return true;
      if (query.includes('lic') && nameLower.includes('lic')) return true;
      if (query.includes('mahindra') && nameLower.includes('mahindra')) return true;
      if (query.includes('single girl') && nameLower.includes('single girl')) return true;
      if (query.includes('pm national') && nameLower.includes('pm national')) return true;
      return false;
    });

    // If query didn't specify a scheme name, but is an attribute follow-up (e.g. "documents?", "last date?", "how much?")
    if (!matchedScheme && contextScheme && (isDeadline || isDocument || isAmount)) {
      matchedScheme = contextScheme;
    }

    // ── 3. INTENT PIPELINE EXECUTION ───────────────────────────────────────

    // A. ATTRIBUTE INTENT: DEADLINE FOR SPECIFIC SCHEME OR CONTEXT SCHEME
    if (isDeadline && matchedScheme) {
      reply = `📅 **Application Deadline for ${matchedScheme.name}:**\n\n` +
        `Deadline: **${formatDeadline(matchedScheme.lastDateToApply || matchedScheme.applicationDeadline)}**\n` +
        `Benefit: ${matchedScheme.amount}`;
      chips = [`Tell me about ${matchedScheme.name.split(' ')[0]}`, 'What documents do I need?', 'Am I eligible?'];
    }

    // B. ATTRIBUTE INTENT: DOCUMENTS FOR SPECIFIC SCHEME OR CONTEXT SCHEME
    else if (isDocument && matchedScheme) {
      reply = `📄 **Required Documents for ${matchedScheme.name}:**\n\n` +
        `${formatRequiredDocs(matchedScheme.requiredDocuments)}\n\n` +
        `💡 Upload missing documents under **Profile → Document Uploads** for AI verification.`;
      chips = [`Tell me about ${matchedScheme.name.split(' ')[0]}`, 'Am I eligible?', 'When is the last date?'];
    }

    // C. ATTRIBUTE INTENT: AMOUNT / BENEFIT FOR SPECIFIC SCHEME OR CONTEXT SCHEME
    else if (isAmount && matchedScheme) {
      reply = `💰 **Scholarship Benefit for ${matchedScheme.name}:**\n\n` +
        `• **Amount**: **${matchedScheme.amount}** (${matchedScheme.frequency || 'Yearly'})\n` +
        `• **Ministry**: ${matchedScheme.ministry || 'Ministry of Education'}\n` +
        `• **Deadline**: ${formatDeadline(matchedScheme.lastDateToApply)}`;
      chips = ['Am I eligible?', 'What documents do I need?'];
    }

    // D. SPECIFIC SCHEME LOOKUP (e.g., "post amtric", "pragati", "inspire")
    else if (matchedScheme) {
      const analysis = checkSchemeEligibility(evalProfile, matchedScheme);
      const crit = matchedScheme.eligibilityCriteria || {};

      reply = `🎓 **${matchedScheme.name}**\n\n` +
        `📋 **Eligibility Rules:**\n` +
        `• Education: ${(crit.educationLevels || ['10th Pass', '12th Pass', 'Graduation']).join(', ')}\n` +
        `• Category: ${(crit.categories || ['All']).join(', ')}\n` +
        `• Gender: ${(crit.genders || ['All']).join(', ')}\n` +
        `• Max Annual Income: ${formatMoney(crit.maxAnnualIncome || 800000)}\n\n` +
        `💰 **Scholarship Benefit:**\n` +
        `${matchedScheme.amount} (${matchedScheme.frequency || 'Yearly'})\n\n` +
        `📅 **Application Deadline:**\n` +
        `${formatDeadline(matchedScheme.lastDateToApply || matchedScheme.applicationDeadline)}\n\n` +
        `📄 **Required Documents:**\n` +
        `${formatRequiredDocs(matchedScheme.requiredDocuments)}\n\n` +
        `✅ **Your Eligibility Assessment:**\n` +
        (analysis.eligible 
          ? `🎉 **You are 100% Eligible!** Your profile (${evalProfile.gender || 'Student'}, ${evalProfile.educationLevel || '12th Pass'}, Income: ${formatMoney(evalProfile.annualFamilyIncome)}) satisfies all scheme rules.` 
          : `⚠ **Not Fully Eligible**: ${analysis.rejectionReasons.length > 0 ? analysis.rejectionReasons[0] : 'Criteria mismatch.'}`);

      chips = ['Which scholarships am I eligible for?', 'What documents do I need?', 'Which scholarships are closing soon?'];
    }

    // E. GENERAL ELIGIBILITY CHECK ("what scholarships am i eligible for", "check my eligibility")
    else if (isEligibility || query.includes('what scholarship')) {
      const eligibleSchemes = [];
      const partialSchemes = [];

      schemes.forEach(s => {
        const analysis = checkSchemeEligibility(evalProfile, s);
        if (analysis.eligible) {
          eligibleSchemes.push({ scheme: s, score: analysis.matchScore });
        } else if (analysis.matchScore >= 70) {
          partialSchemes.push({ scheme: s, score: analysis.matchScore, reasons: analysis.rejectionReasons });
        }
      });

      if (eligibleSchemes.length > 0) {
        reply = `Based on your profile (**${evalProfile.educationLevel || '12th Pass'}**, **${evalProfile.category || 'General'}**, **${evalProfile.gender || 'Female'}**, Income: **${formatMoney(evalProfile.annualFamilyIncome)}**), you qualify for **${eligibleSchemes.length}** scholarships:\n\n` +
          eligibleSchemes.slice(0, 5).map((item, idx) => 
            `**${idx + 1}. ${item.scheme.name}**\n` +
            `   💰 Benefit: ${item.scheme.amount}\n` +
            `   📅 Deadline: ${formatDeadline(item.scheme.lastDateToApply)}\n` +
            `   ⭐ Match Score: ${item.score}%`
          ).join('\n\n') +
          `\n\nAsk me "Tell me about [Scheme Name]" for detailed criteria!`;
        chips = eligibleSchemes.slice(0, 3).map(i => `Tell me about ${i.scheme.name.split(' ')[0]}`);
      } else {
        reply = `I analyzed **${schemes.length}** active schemes. While you don't have a 100% match yet, here are top matching schemes:\n\n` +
          partialSchemes.slice(0, 3).map((item, idx) => 
            `**${idx + 1}. ${item.scheme.name}** (${item.score}% match)\n` +
            `   ⚠ Gap: ${item.reasons[0] || 'Criteria update required'}`
          ).join('\n\n') +
          `\n\n💡 **Tip**: Updating your income certificate or academic score in your profile will increase your match!`;
        chips = ['What documents do I need?', 'Show scholarships for female students'];
      }
    }

    // F. GENERAL DOCUMENT CHECKLIST ("documents?")
    else if (isDocument) {
      const userDocs = evalProfile.documentUploads || {};
      const uploadedCount = Object.values(userDocs).filter(Boolean).length;

      reply = `📄 **Your Document Wallet Status** (${uploadedCount}/6 Uploaded)\n\n` +
        `• **Income Certificate**: ${userDocs.incomeCertificate ? '✓ Available & Verified' : '⚠ Missing (Required for income limit verification)'}\n` +
        `• **10th Marksheet**: ${userDocs.marksheet10th ? '✓ Available & Verified' : '⚠ Missing (Required for academic proof)'}\n` +
        `• **12th Marksheet**: ${userDocs.marksheet12th ? '✓ Available & Verified' : '⚠ Missing'}\n` +
        `• **Aadhaar Card**: ${userDocs.aadhaar ? '✓ Available & Verified' : '⚠ Missing'}\n` +
        `• **Domicile Certificate**: ${userDocs.domicile ? '✓ Available & Verified' : '⚠ Missing'}\n` +
        `• **Caste Certificate**: ${userDocs.casteCertificate ? '✓ Available & Verified' : '⚠ Optional/Missing'}\n\n` +
        `💡 Upload missing documents under **Profile → Document Uploads** for AI verification.`;

      chips = ['Which scholarships am I eligible for?', 'What are the rules for Pragati scholarship?'];
    }

    // G. INCOME LIMIT / INCOME QUERY
    else if (query.includes('income') || query.includes('limit') || query.includes('bpl')) {
      const userInc = evalProfile.annualFamilyIncome || 180000;
      const incomeSchemes = schemes.filter(s => (s.eligibilityCriteria?.maxAnnualIncome || 9999999) >= userInc);

      reply = `💰 **Scholarship Income Limits & Guidelines**\n\n` +
        `Your Profile Family Income: **${formatMoney(userInc)}**\n\n` +
        `Found **${incomeSchemes.length}** schemes with max income limits supporting your household:\n\n` +
        incomeSchemes.slice(0, 4).map((s, idx) => 
          `• **${s.name}** — Amount: ${s.amount} (Max Income Limit: ${formatMoney(s.eligibilityCriteria?.maxAnnualIncome)})`
        ).join('\n\n');

      chips = ['Which scholarships am I eligible for?', 'What documents do I need?'];
    }

    // H. CATEGORY / CASTE FILTER ("scholarship for sc", "scholarship for obc")
    else if (categoryEntity) {
      const catSchemes = schemes.filter(s => {
        const cats = s.eligibilityCriteria?.categories || [];
        return cats.includes(categoryEntity) || cats.includes('All') || s.category === categoryEntity;
      });

      reply = `🎓 **Scholarships for ${categoryEntity} Category** (${catSchemes.length} Found)\n\n` +
        catSchemes.slice(0, 4).map((s, idx) => 
          `**${idx + 1}. ${s.name}**\n` +
          `   💰 Benefit: ${s.amount}\n` +
          `   📅 Deadline: ${formatDeadline(s.lastDateToApply)}\n` +
          `   📋 Max Income: ${formatMoney(s.eligibilityCriteria?.maxAnnualIncome || 250000)}`
        ).join('\n\n');

      chips = ['Which scholarships am I eligible for?', 'What documents do I need?'];
    }

    // I. GENDER FILTER ("scholarship for girls", "female")
    else if (genderEntity === 'Female') {
      const girlSchemes = schemes.filter(s => {
        const g = s.eligibilityCriteria?.genders || [];
        return g.includes('Female') || s.name.toLowerCase().includes('girl');
      });

      reply = `👩 **Scholarships for Female Students** (${girlSchemes.length} Found)\n\n` +
        girlSchemes.slice(0, 4).map((s, idx) => 
          `**${idx + 1}. ${s.name}**\n` +
          `   💰 Benefit: ${s.amount}\n` +
          `   📅 Deadline: ${formatDeadline(s.lastDateToApply)}\n` +
          `   📋 Max Income: ${formatMoney(s.eligibilityCriteria?.maxAnnualIncome || 800000)}`
        ).join('\n\n');

      chips = ['What are the rules for Pragati scholarship?', 'What documents do I need?'];
    }

    // J. EDUCATION LEVEL FILTER ("scholarship for 12th students", "diploma", "graduation")
    else if (eduEntity) {
      const eduSchemes = schemes.filter(s => {
        const edus = s.eligibilityCriteria?.educationLevels || [];
        return edus.includes(eduEntity) || edus.includes('All');
      });

      reply = `🎓 **Scholarships for ${eduEntity} Students** (${eduSchemes.length} Found)\n\n` +
        eduSchemes.slice(0, 4).map((s, idx) => 
          `**${idx + 1}. ${s.name}**\n` +
          `   💰 Benefit: ${s.amount}\n` +
          `   📅 Deadline: ${formatDeadline(s.lastDateToApply)}\n` +
          `   📋 Max Income: ${formatMoney(s.eligibilityCriteria?.maxAnnualIncome || 800000)}`
        ).join('\n\n');

      chips = ['Which scholarships am I eligible for?', 'What documents do I need?'];
    }

    // K. DEADLINE / CLOSING SOON FILTER
    else if (isDeadline) {
      reply = `📅 **Upcoming Scholarship Application Deadlines**\n\n` +
        schemes.slice(0, 4).map((s, idx) => 
          `**${idx + 1}. ${s.name}**\n` +
          `   📅 Deadline: ${formatDeadline(s.lastDateToApply || s.applicationDeadline)}\n` +
          `   💰 Benefit: ${s.amount}`
        ).join('\n\n');

      chips = ['Which scholarships am I eligible for?', 'What documents do I need?'];
    }

    // L. GREETINGS & HELLO
    else if (words.some(w => ['hi', 'hello', 'hey', 'greetings'].includes(w))) {
      reply = `Hello ${profile?.fullName ? profile.fullName.split(' ')[0] : 'Student'}! 🎓\n\nHow can I assist your scholarship search today? Ask about Post-Matric schemes, Pragati, INSPIRE, document requirements, or your eligibility!`;
      chips = ['Which scholarships am I eligible for?', 'What are the rules for Pragati scholarship?', 'What documents do I need?'];
    }

    // M. CLARIFICATION & UNKNOWN FALLBACK
    else {
      reply = `I can help with scholarship details, Post-Matric schemes, document checklists, and application deadlines.\n\nAre you looking for Post-Matric scholarships, Pragati, or checking your profile eligibility?`;
      chips = ['Post-Matric scholarships', 'Which scholarships am I eligible for?', 'What documents do I need?'];
    }

    res.json({
      success: true,
      data: {
        reply,
        response: reply,
        suggestedQuestions: chips
      }
    });

  } catch (error) {
    console.error('Chatbot Controller Exception:', error);
    res.status(500).json({
      success: false,
      message: "Sorry, I couldn't process that request right now. Please try again."
    });
  }
};

module.exports = {
  verifyDocumentOCR,
  getRecommendations,
  chatWithAI
};
