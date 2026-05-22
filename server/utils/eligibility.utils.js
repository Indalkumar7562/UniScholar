/**
 * Advanced Eligibility Engine
 * Evaluates user profile details against scheme criteria, calculating exact match rates,
 * missing items, confidence levels, eligibility probabilities, rejection reasons, and tips.
 */

// Helper to map document names to profile upload fields
const mapDocToProfileField = (docName) => {
  const name = docName.toLowerCase();
  if (name.includes('aadhaar')) return 'aadhaar';
  if (name.includes('income')) return 'incomeCertificate';
  if (name.includes('caste') || name.includes('category')) return 'casteCertificate';
  if (name.includes('domicile') || name.includes('resident')) return 'domicile';
  if (name.includes('marksheet') || name.includes('marks') || name.includes('grade')) return 'marksheet';
  if (name.includes('disability') || name.includes('pwd')) return 'disabilityCertificate';
  return null;
};

const checkSchemeEligibility = (profile, scheme) => {
  const matchedCriteria = [];
  const missingCriteria = [];
  const rejectionReasons = [];
  const suggestions = [];
  const missingDocuments = [];

  const criteria = scheme.eligibilityCriteria;
  let totalRules = 0;
  let matchedRulesCount = 0;

  // 1. Age Check
  totalRules++;
  if (profile.age >= criteria.minAge && profile.age <= criteria.maxAge) {
    matchedRulesCount++;
    matchedCriteria.push(`Age (${profile.age}) meets limits of ${criteria.minAge}-${criteria.maxAge} years`);
  } else {
    missingCriteria.push(`Age must be between ${criteria.minAge} and ${criteria.maxAge} years`);
    rejectionReasons.push(`Your age (${profile.age} years) is outside the permitted range of ${criteria.minAge} to ${criteria.maxAge} years.`);
    suggestions.push(`Explore other welfare schemes that support students in your age bracket.`);
  }

  // 2. Income Check
  totalRules++;
  if (profile.annualFamilyIncome <= criteria.maxAnnualIncome) {
    matchedRulesCount++;
    matchedCriteria.push(`Family income (₹${profile.annualFamilyIncome.toLocaleString('en-IN')}) is within limit of ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}`);
  } else {
    missingCriteria.push(`Family income must be below ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}`);
    rejectionReasons.push(`Your family income (₹${profile.annualFamilyIncome.toLocaleString('en-IN')}) exceeds the scheme's limit of ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}.`);
    suggestions.push(`Explore schemes with higher income limits, or upload an updated income certificate if your household income changed.`);
  }

  // 3. State Restriction Check
  const allowsAllStates = !criteria.states || criteria.states.includes('All') || criteria.states.length === 0;
  totalRules++;
  if (allowsAllStates || criteria.states.includes(profile.state)) {
    matchedRulesCount++;
    matchedCriteria.push(`Residency state (${profile.state}) matches`);
  } else {
    missingCriteria.push(`State must be one of: ${criteria.states.join(', ')}`);
    rejectionReasons.push(`This scheme is restricted to residents of ${criteria.states.join(', ')}. You are located in ${profile.state}.`);
    suggestions.push(`Look for scholarship options specific to ${profile.state}.`);
  }

  // 4. Gender Check
  const allowsAllGenders = !criteria.genders || criteria.genders.includes('All') || criteria.genders.length === 0;
  totalRules++;
  if (allowsAllGenders || criteria.genders.includes(profile.gender)) {
    matchedRulesCount++;
    matchedCriteria.push(`Gender eligibility matched (${profile.gender})`);
  } else {
    missingCriteria.push(`Gender requirement: ${criteria.genders.join(', ')}`);
    rejectionReasons.push(`Only ${criteria.genders.join(', ')} students are eligible. Your profile states: ${profile.gender}.`);
    suggestions.push(`Browse schemes open to all genders or specifically for ${profile.gender}.`);
  }

  // 5. Category/Caste Check
  const allowsAllCategories = !criteria.categories || criteria.categories.includes('All') || criteria.categories.length === 0;
  totalRules++;
  if (allowsAllCategories || criteria.categories.includes(profile.category)) {
    matchedRulesCount++;
    matchedCriteria.push(`Caste/Category (${profile.category}) matched`);
  } else {
    missingCriteria.push(`Category must be one of: ${criteria.categories.join(', ')}`);
    rejectionReasons.push(`Scheme is reserved for ${criteria.categories.join(', ')} categories. You are registered as ${profile.category}.`);
    suggestions.push(`Check if you are eligible under other social categories, or search for General/Open schemes.`);
  }

  // 6. Education Level Check
  const allowsAllEdu = !criteria.educationLevels || criteria.educationLevels.includes('All') || criteria.educationLevels.length === 0;
  totalRules++;
  if (allowsAllEdu || criteria.educationLevels.includes(profile.educationLevel)) {
    matchedRulesCount++;
    matchedCriteria.push(`Education level (${profile.educationLevel}) matched`);
  } else {
    missingCriteria.push(`Education level must be: ${criteria.educationLevels.join(' or ')}`);
    rejectionReasons.push(`This scheme is only for students in ${criteria.educationLevels.join(' / ')}. You are currently at: ${profile.educationLevel}.`);
    suggestions.push(`Update your profile if your academic level has changed, or check programs targeting ${profile.educationLevel}.`);
  }

  // 7. Stream Check
  const allowsAllStreams = !criteria.streams || criteria.streams.includes('All') || criteria.streams.length === 0;
  totalRules++;
  if (allowsAllStreams || criteria.streams.includes(profile.stream)) {
    matchedRulesCount++;
    matchedCriteria.push(`Academic stream (${profile.stream}) matched`);
  } else {
    missingCriteria.push(`Stream must be: ${criteria.streams.join(' or ')}`);
    rejectionReasons.push(`Scheme requires stream: ${criteria.streams.join(', ')}. Your stream: ${profile.stream}.`);
    suggestions.push(`Look for scholarships specific to the ${profile.stream} branch.`);
  }

  // 8. Profession Check
  const allowsAllProfessions = !criteria.professions || criteria.professions.includes('All') || criteria.professions.length === 0;
  totalRules++;
  if (allowsAllProfessions || criteria.professions.includes(profile.profession)) {
    matchedRulesCount++;
    matchedCriteria.push(`Occupation (${profile.profession}) matched`);
  } else {
    missingCriteria.push(`Occupation must be: ${criteria.professions.join(', ')}`);
    rejectionReasons.push(`Scheme is designed for families of ${criteria.professions.join(', ')}. Your occupation is: ${profile.profession}.`);
    suggestions.push(`Check general welfare schemes if this occupation constraint cannot be met.`);
  }

  // 9. BPL Status Check
  if (criteria.bplRequired) {
    totalRules++;
    if (profile.bplStatus) {
      matchedRulesCount++;
      matchedCriteria.push('Below Poverty Line (BPL) status verified');
    } else {
      missingCriteria.push('BPL Card/Status required');
      rejectionReasons.push('This scholarship is restricted to Below Poverty Line (BPL) households.');
      suggestions.push('If your family holds a BPL card, please toggle "BPL Status" in your profile and upload the card.');
    }
  }

  // 10. Disability Status Check
  if (criteria.disabilityRequired) {
    totalRules++;
    if (profile.disabilityStatus) {
      matchedRulesCount++;
      matchedCriteria.push('Person with Disability (PwD) status verified');
    } else {
      missingCriteria.push('PwD (Disability Certificate) required');
      rejectionReasons.push('This scheme is reserved exclusively for Persons with Disabilities (PwD).');
      suggestions.push('Search for general scholarship programs that do not have physical disability criteria.');
    }
  }

  // 11. Marks Percentage Check
  if (criteria.minPercentage > 0) {
    totalRules++;
    if (profile.cgpaOrPercentage >= criteria.minPercentage) {
      matchedRulesCount++;
      matchedCriteria.push(`Academic performance (${profile.cgpaOrPercentage}%) meets minimum of ${criteria.minPercentage}%`);
    } else {
      missingCriteria.push(`Academic marks must be at least ${criteria.minPercentage}%`);
      rejectionReasons.push(`Your academic score of ${profile.cgpaOrPercentage}% is below the required ${criteria.minPercentage}%.`);
      suggestions.push('Focus on boosting academic scores next term, or explore schemes with lower performance cutoffs.');
    }
  }

  // Evaluate Documents
  if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
    scheme.requiredDocuments.forEach((doc) => {
      const field = mapDocToProfileField(doc);
      if (field) {
        if (!profile.documentUploads || !profile.documentUploads[field]) {
          missingDocuments.push(doc);
        }
      } else {
        // Fallback check if it doesn't match standard keys (rare)
        missingDocuments.push(doc);
      }
    });
  }

  // Calculate Matching Score (0 - 100%)
  const matchScore = totalRules > 0 ? Math.round((matchedRulesCount / totalRules) * 100) : 100;
  const eligible = missingCriteria.length === 0;

  // Calculate Eligibility Probability
  let eligibilityProbability = matchScore;
  if (eligible) {
    // If eligible, probability increases if documents are already uploaded
    const docTotal = scheme.requiredDocuments.length;
    const docMissing = missingDocuments.length;
    const docUploaded = docTotal - docMissing;
    const docRatio = docTotal > 0 ? docUploaded / docTotal : 1;
    eligibilityProbability = Math.round(90 + (10 * docRatio));
  } else {
    // If not eligible, penalize probability for critical failures
    eligibilityProbability = Math.max(10, matchScore - 30);
  }

  // Calculate Confidence Score (based on profile completeness + documents uploaded)
  let profileFieldsFilled = 0;
  const coreFields = ['fullName', 'age', 'state', 'educationLevel', 'category', 'annualFamilyIncome'];
  coreFields.forEach(f => {
    if (profile[f] !== undefined && profile[f] !== null && profile[f] !== '') profileFieldsFilled++;
  });
  const fieldCompleteness = profileFieldsFilled / coreFields.length;
  const docTotalCount = Object.keys(profile.documentUploads || {}).length;
  let docsUploadedCount = 0;
  if (profile.documentUploads) {
    Object.values(profile.documentUploads).forEach(val => {
      if (val) docsUploadedCount++;
    });
  }
  const docCompleteness = docTotalCount > 0 ? docsUploadedCount / docTotalCount : 1;
  const confidenceScore = Math.round((fieldCompleteness * 60) + (docCompleteness * 40));

  // If eligible but missing documents, add suggestions to upload
  if (eligible && missingDocuments.length > 0) {
    missingDocuments.forEach(doc => {
      suggestions.push(`Upload your "${doc}" under the Profile document section to complete submission requirements.`);
    });
  }

  return {
    eligible,
    matchScore,
    matchedCriteria,
    missingCriteria,
    missingDocuments,
    eligibilityProbability,
    confidenceScore,
    rejectionReasons,
    suggestions,
  };
};

/**
 * Run eligibility check across all schemes for a profile
 */
const runEligibilityCheck = (profile, schemes) => {
  const results = schemes.map((scheme) => {
    const analysis = checkSchemeEligibility(profile, scheme);
    return {
      scheme: scheme._id,
      schemeData: scheme,
      ...analysis,
    };
  });

  const totalEligible = results.filter((r) => r.eligible).length;

  return {
    results,
    totalChecked: schemes.length,
    totalEligible,
  };
};

module.exports = { checkSchemeEligibility, runEligibilityCheck };
