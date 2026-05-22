const Scheme = require('../models/Scheme.model');
const Profile = require('../models/Profile.model');
const EligibilityResult = require('../models/EligibilityResult.model');
const Notification = require('../models/Notification.model');
const { checkSchemeEligibility } = require('../utils/eligibility.utils');

// Simple simulation of OCR text extraction
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
      // Intentionally return 180,000 for verification or discrepancy simulation
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
    case 'casteCertificate':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          category: 'OBC',
          certificateNumber: `CST/2026/${timestamp}`
        },
        message: 'Caste Certificate scanned successfully. Category identified: OBC.'
      };
    case 'domicile':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          state: 'Gujarat',
          certificateNumber: `DOM/2026/${timestamp}`
        },
        message: 'Domicile Certificate scanned successfully. State: Gujarat.'
      };
    case 'marksheet':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          cgpaOrPercentage: 88,
          educationLevel: '12th Pass',
          stream: 'Science'
        },
        message: 'Marksheet parsed successfully. Extracted 88% in 12th Pass (Science).'
      };
    case 'disabilityCertificate':
      return {
        success: true,
        extractedData: {
          fullName: profileName || 'Student Name',
          disabilityStatus: true,
          disabilityPercentage: 55
        },
        message: 'Disability Certificate verified. Disability percentage: 55%.'
      };
    default:
      return { success: false, message: 'Unknown document type' };
  }
};

// @desc    Perform document OCR simulation and verify data
// @route   POST /api/ai/verify-document
// @access  Private
const verifyDocumentOCR = async (req, res) => {
  try {
    const { docType } = req.body;
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const ocrResult = simulateOCR(docType, profile.fullName);
    if (!ocrResult.success) {
      return res.status(400).json({ success: false, message: ocrResult.message });
    }

    // Check for fraud or discrepancies
    let discrepancy = false;
    let discrepancyDetails = '';

    if (docType === 'incomeCertificate') {
      const extractedIncome = ocrResult.extractedData.annualFamilyIncome;
      // If user input exceeds/differs from certificate significantly
      if (profile.annualFamilyIncome !== extractedIncome) {
        discrepancy = true;
        discrepancyDetails = `Income Mismatch: Input ₹${profile.annualFamilyIncome.toLocaleString()} vs Certificate ₹${extractedIncome.toLocaleString()}`;
        
        // Trigger warning notification
        await Notification.create({
          user: req.user._id,
          title: '⚠️ Profile Verification Alert',
          message: `Discrepancy detected in Income Certificate autofill (Form: ₹${profile.annualFamilyIncome.toLocaleString()} vs Certificate: ₹${extractedIncome.toLocaleString()}).`,
          type: 'warning'
        });
      }
    }

    res.json({
      success: true,
      message: ocrResult.message,
      data: ocrResult.extractedData,
      discrepancy,
      discrepancyDetails
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Document verification failed' });
  }
};

// @desc    Get AI recommendations for matching schemes
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Profile not found' });
    }

    const schemes = await Scheme.find({ isActive: true });
    
    // Check eligibility and add matching metadata
    const results = schemes.map(scheme => {
      const analysis = checkSchemeEligibility(profile, scheme);
      
      // Calculate ranking weights
      let weight = analysis.matchScore;
      if (analysis.eligible) weight += 100; // prioritize fully eligible schemes
      if (profile.bplStatus && scheme.eligibilityCriteria.bplRequired) weight += 20; // BPL prioritization
      if (profile.disabilityStatus && scheme.eligibilityCriteria.disabilityRequired) weight += 20; // disability prioritization
      
      // Recommend tags based on profile match
      let recReason = '';
      if (analysis.eligible && analysis.matchScore >= 90) {
        recReason = '✨ Highly Recommended: Full profile match';
      } else if (analysis.eligible) {
        recReason = '⭐ Recommended for your profile';
      } else if (analysis.matchScore >= 70) {
        recReason = '💡 Good Match: Potential eligibility with profile updates';
      } else {
        recReason = 'Low Match';
      }

      return {
        scheme,
        ...analysis,
        weight,
        recReason
      };
    });

    // Sort schemes by weight descending
    results.sort((a, b) => b.weight - a.weight);

    // Predict future schemes
    const futureSchemes = [];
    if (profile.educationLevel === '12th Pass') {
      futureSchemes.push({
        title: 'Central Sector Scholarship for University Students',
        reason: 'You are finishing 12th Pass; this scheme supports graduation students with scores > 80%.'
      });
    } else if (profile.educationLevel === 'Graduation') {
      futureSchemes.push({
        title: 'Rajiv Gandhi National Fellowship',
        reason: 'Recommended for postgraduate research and PG studies after Graduation.'
      });
    }

    res.json({
      success: true,
      data: {
        recommendations: results.slice(0, 5), // return top 5 recommended schemes
        futureSchemes,
        profileCompleteness: profile.isComplete ? 100 : 50
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
};

// @desc    Conversational AI Chatbot interface
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const profile = await Profile.findOne({ user: req.user._id });
    const schemes = await Scheme.find({ isActive: true });
    
    // In a real application with GEMINI_API_KEY, we would send a prompt to Google Gen AI.
    // Let's implement a smart NLP keyword router that mimics a highly context-aware chatbot!
    const query = message.toLowerCase();
    let reply = '';
    let chips = [];

    // Check if there is an eligibility check result
    const result = await EligibilityResult.findOne({ user: req.user._id }).populate('results.scheme');

    if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      reply = `Hello ${profile?.fullName || 'there'}! 🎓 I am your AI Scholarship Assistant. I can help you find scholarships, check your eligibility status, explain why a scheme was rejected, or guide you with document uploads. What would you like to know today?`;
      chips = ['Which scholarships am I eligible for?', 'Why was I rejected?', 'What documents do I need?'];
    } 
    else if (query.includes('eligible') || query.includes('recommend') || query.includes('find')) {
      if (!profile) {
        reply = 'You have not created a profile yet. Please complete your profile first so I can find suitable scholarships for you!';
      } else {
        const eligibleList = schemes.filter(s => checkSchemeEligibility(profile, s).eligible);
        if (eligibleList.length > 0) {
          reply = `Based on your profile, you are eligible for **${eligibleList.length}** scholarship schemes. Key recommendations: \n\n` + 
            eligibleList.map((s, idx) => `${idx + 1}. **${s.name}** - Offers ${s.amount} (${s.frequency})`).join('\n') + 
            `\n\nWould you like me to explain the criteria for any of these?`;
          chips = eligibleList.map(s => `Explain ${s.name}`);
        } else {
          reply = `I analyzed active schemes and found that you are currently not fully eligible for any. However, you have high matching scores on several! Let me know if you want tips on how to become eligible.`;
          chips = ['How to increase eligibility?', 'Why was I rejected?'];
        }
      }
    } 
    else if (query.includes('reject') || query.includes('why') || query.includes('failed')) {
      if (!result || !result.results || result.results.length === 0) {
        reply = 'You have not run an eligibility check yet. Go to the "Eligibility Check" tab and run it so I can analyze any rejection factors!';
      } else {
        const rejected = result.results.filter(r => !r.eligible);
        if (rejected.length > 0) {
          reply = 'Here are the primary reasons for ineligibility in some schemes:\n\n' + 
            rejected.slice(0, 3).map((r) => {
              const schemeName = r.scheme ? r.scheme.name : 'Scheme';
              const reasonsList = r.rejectionReasons && r.rejectionReasons.length > 0 
                ? r.rejectionReasons.join(', ') 
                : 'Criteria mismatch';
              return `❌ **${schemeName}**: ${reasonsList}`;
            }).join('\n\n') + 
            `\n\n**Suggestions**: Update missing certificates, or toggle BPL status if applicable.`;
          chips = ['How to increase eligibility?', 'What documents do I need?'];
        } else {
          reply = 'Congratulations! You are eligible for all checked schemes. No rejections found.';
        }
      }
    }
    else if (query.includes('document') || query.includes('upload') || query.includes('paper')) {
      reply = `Generally, government scholarships require the following documents:
- **Aadhaar Card** (Identity proof)
- **Income Certificate** (Financial proof, must be below scheme limits)
- **Caste/Category Certificate** (If applying under OBC/SC/ST/Minority)
- **Domicile Certificate** (Residency proof)
- **Academic Marksheet** (Verification of percentage/GPA)

In your current profile, you have uploaded **${profile ? Object.values(profile.documentUploads || {}).filter(Boolean).length : 0}/6** documents. Try uploading the remaining ones to increase your eligibility confidence!`;
      chips = ['Am I eligible?', 'How to increase eligibility?'];
    }
    else if (query.includes('how to increase') || query.includes('increase') || query.includes('improve') || query.includes('help')) {
      if (!profile) {
        reply = 'Please create and fill your profile details to receive specific improvement suggestions!';
      } else {
        const advice = [];
        if (!profile.bplStatus) advice.push('If you belong to a low-income household and have a BPL card, turn on BPL Status in your profile.');
        
        // Find missing docs
        const docKeys = Object.keys(profile.documentUploads || {});
        const missing = docKeys.filter(k => !profile.documentUploads[k]);
        if (missing.length > 0) {
          advice.push(`Upload missing documents: ${missing.map(m => m.replace(/([A-Z])/g, ' $1').toLowerCase()).join(', ')}.`);
        }
        
        if (profile.cgpaOrPercentage < 75) {
          advice.push('Maintain an academic percentage of 75% or above to open up merit-based scholarships.');
        }

        if (advice.length > 0) {
          reply = `Here is how you can boost your eligibility score and qualify for more schemes:\n\n` + 
            advice.map((ad, idx) => `🔹 ${idx + 1}. ${ad}`).join('\n') + 
            `\n\nWould you like to try scanning a document using OCR to autofill details?`;
          chips = ['Scan my Income Certificate', 'Am I eligible?'];
        } else {
          reply = `Your profile is fully complete and documents are uploaded! You have the highest confidence score (95%+). Check the dashboard to view your matching scholarships!`;
        }
      }
    }
    else if (query.includes('explain')) {
      // Find matching scheme
      const targetScheme = schemes.find(s => query.includes(s.name.toLowerCase()) || query.includes(s.slug.replace(/-/g, ' ')));
      if (targetScheme) {
        reply = `**${targetScheme.name}** (${targetScheme.ministry}):
- **Benefit**: ${targetScheme.amount} (${targetScheme.frequency})
- **Required Documents**: ${targetScheme.requiredDocuments.join(', ')}
- **Criteria**: Maximum income of ₹${targetScheme.eligibilityCriteria.maxAnnualIncome.toLocaleString()}, open to ${targetScheme.eligibilityCriteria.categories.join('/')} students.
\nWould you like to know if you match this scheme?`;
        chips = [`Am I eligible?`];
      } else {
        reply = 'I could not find that specific scheme. Here are some of the active schemes in our database: ' + schemes.slice(0, 3).map(s => s.name).join(', ') + '.';
      }
    }
    else {
      // Default local search
      const matches = schemes.filter(s => s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));
      if (matches.length > 0) {
        reply = `I found **${matches.length}** schemes matching "${message}":\n\n` + 
          matches.map(m => `• **${m.name}** - Benefitting ₹${m.amount} for ${m.eligibilityCriteria.educationLevels.join('/')}`).join('\n') + 
          `\n\nAsk me "Explain [Scheme Name]" for detailed criteria!`;
        chips = matches.map(m => `Explain ${m.name}`);
      } else {
        reply = `I understand you are asking about "${message}". As your welfare intelligence guide, I suggest checking if your family income limits, state, and category are updated in your profile so I can provide precise matching advice!`;
        chips = ['Am I eligible?', 'How to increase eligibility?'];
      }
    }

    res.json({
      success: true,
      data: {
        reply,
        suggestedQuestions: chips
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chatbot service failed' });
  }
};

module.exports = {
  verifyDocumentOCR,
  getRecommendations,
  chatWithAI
};
