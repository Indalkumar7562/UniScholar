const mongoose = require('mongoose');
require('dotenv').config();

const Scheme = require('./models/Scheme.model');
const User = require('./models/User.model');
const Profile = require('./models/Profile.model');
const EligibilityResult = require('./models/EligibilityResult.model');
const Notification = require('./models/Notification.model');

const schemes = [
  {
    name: 'PM National Scholarship Scheme',
    description: 'Merit-based scholarship for students pursuing UG/PG courses from central universities. Provides financial support to meritorious students from economically weaker sections.',
    category: 'General',
    ministry: 'Ministry of Education',
    amount: '₹12,000/year',
    amountValue: 12000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 25,
      maxAnnualIncome: 250000,
      minPercentage: 75,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other'],
      professions: ['Student'],
      requiredCriteria: ['Must have obtained at least 75% in the 12th Board exam', 'Must be enrolled in a full-time UG/PG program in a central university'],
      optionalCriteria: [],
      priorityCriteria: ['Priority given to BPL card holders'],
    },
    requiredDocuments: ['Income Certificate', 'Marksheet', 'Aadhaar Card'],
    applicationProcess: 'Apply through the National Scholarship Portal (scholarships.gov.in). Fill the online form, upload documents, and submit before the deadline.',
    officialLink: 'https://scholarships.gov.in',
    tags: ['merit', 'ug', 'pg', 'central'],
    isActive: true,
  },
  {
    name: 'SC/ST Post Matric Scholarship',
    description: 'Financial assistance to SC/ST students pursuing post-matric education. Covers tuition fees, maintenance allowance and other educational expenses.',
    category: 'SC',
    ministry: 'Ministry of Social Justice and Empowerment',
    amount: '₹15,000/year',
    amountValue: 15000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 14,
      maxAge: 40,
      maxAnnualIncome: 250000,
      minPercentage: 0,
      educationLevels: ['10th Pass', '12th Pass', 'Graduation', 'Post Graduation'],
      categories: ['SC', 'ST'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['All'],
      professions: ['Student'],
      requiredCriteria: ['Must possess a valid SC/ST Caste Certificate', 'Annual family income must be under ₹2.5 Lakhs'],
      optionalCriteria: [],
      priorityCriteria: ['Priority given to female candidates'],
    },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Marksheet'],
    applicationProcess: 'Register on NSP portal, select scheme, fill application form and upload required documents.',
    officialLink: 'https://scholarships.gov.in',
    tags: ['sc', 'st', 'post-matric', 'fees'],
    isActive: true,
  },
  {
    name: 'OBC Pre-Matric Scholarship',
    description: 'Support for OBC students enrolled in classes 1–10 from economically weaker sections. Helps reduce dropout rates among OBC students at the school level.',
    category: 'OBC',
    ministry: 'Ministry of Social Justice and Empowerment',
    amount: '₹4,000/year',
    amountValue: 4000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 5,
      maxAge: 18,
      maxAnnualIncome: 100000,
      minPercentage: 0,
      educationLevels: ['Below 10th'],
      categories: ['OBC'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Not Applicable'],
      professions: ['Student'],
      requiredCriteria: ['Must belong to OBC category', 'Must be studying in Class 1 to 10'],
      optionalCriteria: [],
      priorityCriteria: ['Priority given to families with lowest incomes'],
    },
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Aadhaar Card'],
    applicationProcess: 'Apply through the state scholarship portal or National Scholarship Portal before the deadline.',
    officialLink: 'https://scholarships.gov.in',
    tags: ['obc', 'pre-matric', 'school'],
    isActive: true,
  },
  {
    name: 'Central Sector Scholarship for College Students',
    description: 'For students in the top 20 percentile of their 12th board pursuing higher education. One of India\'s most prestigious merit scholarships.',
    category: 'General',
    ministry: 'Ministry of Education',
    amount: '₹20,000/year',
    amountValue: 20000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 22,
      maxAnnualIncome: 450000,
      minPercentage: 80,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Diploma'],
      professions: ['Student'],
      requiredCriteria: ['Must have scored 80% or above in 12th board', 'Family annual income must not exceed ₹4.5 Lakhs'],
      optionalCriteria: [],
      priorityCriteria: [],
    },
    requiredDocuments: ['Marksheet', 'Income Certificate', 'Aadhaar Card'],
    applicationProcess: 'Apply on NSP within 6 months of admission. Renewal available each year based on academic performance.',
    officialLink: 'https://scholarships.gov.in',
    tags: ['merit', 'ug', 'prestigious'],
    isActive: true,
  },
  {
    name: 'INSPIRE Scholarship for Higher Education',
    description: "DST's flagship scholarship for students pursuing Natural Sciences at UG level. Encourages talented students to pursue careers in science research.",
    category: 'General',
    ministry: 'Department of Science & Technology',
    amount: '₹80,000/year',
    amountValue: 80000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 22,
      maxAnnualIncome: 9999999,
      minPercentage: 85,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Science', 'Engineering'],
      professions: ['Student'],
      requiredCriteria: ['Must be enrolled in basic/natural science courses (BSc, BS)', 'Must possess marks in top 1% of the respective board exam'],
      optionalCriteria: [],
      priorityCriteria: [],
    },
    requiredDocuments: ['Marksheet', 'Aadhaar Card'],
    applicationProcess: 'Apply through DST INSPIRE portal. Requires being in top 1% of respective board examination.',
    officialLink: 'https://online-inspire.gov.in',
    tags: ['science', 'dst', 'bsc', 'research', 'merit'],
    isActive: true,
  },
  {
    name: 'Pragati Scholarship for Girl Students',
    description: 'AICTE scholarship exclusively for girl students pursuing technical education (engineering/MBA) to promote gender diversity in STEM.',
    category: 'General',
    ministry: 'All India Council for Technical Education',
    amount: '₹50,000/year',
    amountValue: 50000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 30,
      maxAnnualIncome: 800000,
      minPercentage: 0,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['All'],
      genders: ['Female'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Engineering', 'Medical', 'Diploma'],
      professions: ['Student'],
      requiredCriteria: ['Must be female', 'Enrolled in an AICTE approved college for Engineering or Professional Degree'],
      optionalCriteria: [],
      priorityCriteria: ['Priority given to disabled girls'],
    },
    requiredDocuments: ['Income Certificate', 'Aadhaar Card', 'Marksheet'],
    applicationProcess: 'Apply on AICTE portal. One girl per family is eligible. Tuition fee waiver + cash incentive.',
    officialLink: 'https://aicte-pragati-saksham-gov.in',
    tags: ['girls', 'stem', 'engineering', 'female'],
    isActive: true,
  },
  {
    name: 'National Means-cum-Merit Scholarship',
    description: 'Scholarship for meritorious students of economically weaker sections to arrest their dropout rate at Class VIII and continue until Class XII.',
    category: 'General',
    ministry: 'Ministry of Education',
    amount: '₹12,000/year',
    amountValue: 12000,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 12,
      maxAge: 18,
      maxAnnualIncome: 150000,
      minPercentage: 55,
      educationLevels: ['Below 10th'],
      categories: ['All'],
      states: ['All'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Not Applicable'],
      professions: ['Student'],
      requiredCriteria: ['Must pass the state level NMMS entrance examination', 'Must study in local government/aided school'],
      optionalCriteria: [],
      priorityCriteria: ['Priority for BPL families'],
    },
    requiredDocuments: ['Income Certificate', 'Marksheet', 'Aadhaar Card'],
    applicationProcess: 'Students in Class VIII need to appear for the NMMS examination conducted by states/UTs.',
    officialLink: 'https://scholarships.gov.in',
    tags: ['school', 'means-cum-merit', 'dropout-prevention'],
    isActive: true,
  },
  {
    name: 'Ishan Uday Special Scholarship – North East',
    description: 'Special scholarship for students from North East region pursuing general degree courses to promote higher education in the region.',
    category: 'General',
    ministry: 'University Grants Commission (UGC)',
    amount: '₹75,600/year',
    amountValue: 75600,
    frequency: 'Yearly',
    eligibilityCriteria: {
      minAge: 17,
      maxAge: 30,
      maxAnnualIncome: 450000,
      minPercentage: 0,
      educationLevels: ['12th Pass', 'Graduation'],
      categories: ['All'],
      states: ['Assam', 'Meghalaya', 'Manipur', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh', 'Sikkim'],
      genders: ['All'],
      disabilityRequired: false,
      bplRequired: false,
      streams: ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Diploma'],
      professions: ['Student'],
      requiredCriteria: ['Must be a permanent resident of North Eastern states', 'Family income must be under ₹4.5 Lakhs'],
      optionalCriteria: [],
      priorityCriteria: ['Priority given to rural and farming background families'],
    },
    requiredDocuments: ['Domicile Certificate', 'Income Certificate', 'Aadhaar Card', 'Marksheet'],
    applicationProcess: 'Apply on UGC Ishan Uday portal. Preference given to students from rural and remote areas.',
    officialLink: 'https://ugc.ac.in',
    tags: ['north-east', 'regional', 'ugc'],
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Scheme.deleteMany({});
    await EligibilityResult.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing DB data');

    // Insert schemes
    const created = await Scheme.insertMany(schemes);
    console.log(`✅ Seeded ${created.length} scholarship schemes`);

    // Create a demo admin user
    await User.deleteMany({ email: 'admin@uss.gov.in' });
    const admin = await User.create({
      name: 'USS Admin',
      email: 'admin@uss.gov.in',
      password: 'admin@123',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`✅ Admin user created: admin@uss.gov.in / admin@123`);

    // Demo student
    await User.deleteMany({ email: 'student@demo.com' });
    const student = await User.create({
      name: 'Priya Sharma',
      email: 'student@demo.com',
      password: 'demo@123',
      role: 'student',
      isEmailVerified: true,
    });

    await Profile.deleteMany({ user: student._id });
    await Profile.create({
      user: student._id,
      fullName: 'Priya Sharma',
      age: 21,
      gender: 'Female',
      state: 'Maharashtra',
      district: 'Mumbai',
      mobileNumber: '9876543210',
      email: 'student@demo.com',
      educationLevel: '12th Pass',
      stream: 'Science',
      collegeName: 'St. Xavier\'s College',
      cgpaOrPercentage: 88,
      currentYearOrSemester: '1st Year',
      profession: 'Student',
      annualFamilyIncome: 150000, // set below PM National limit
      bplStatus: false,
      category: 'General',
      minorityStatus: false,
      disabilityStatus: false,
      documentUploads: {
        aadhaar: 'https://uss-documents.s3.amazonaws.com/aadhaar_priya.pdf',
        incomeCertificate: '', // initially empty for simulation
        casteCertificate: '',
        domicile: 'https://uss-documents.s3.amazonaws.com/domicile_priya.pdf',
        marksheet: 'https://uss-documents.s3.amazonaws.com/marksheet_priya.pdf',
        disabilityCertificate: ''
      }
    });
    console.log(`✅ Demo student created: student@demo.com / demo@123`);

    // Create initial notification
    await Notification.create({
      user: student._id,
      title: '👋 Welcome to USS Platform',
      message: 'Keep your student profile updated and upload documents to verify scholarship match rates!',
      type: 'info'
    });
    console.log(`✅ Initial welcome notification seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin:   admin@uss.gov.in  /  admin@123');
    console.log('Student: student@demo.com  /  demo@123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
