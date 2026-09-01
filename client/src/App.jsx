import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/index.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import AdminLayout from './components/layout/AdminLayout.jsx';
import PartnerLayout from './components/layout/PartnerLayout.jsx';

import LandingPage          from './pages/LandingPage.jsx';
import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import AdminLoginPage       from './pages/AdminLoginPage.jsx';
import PartnerLoginPage     from './pages/PartnerLoginPage.jsx';
import AccessRestrictedPage from './pages/AccessRestrictedPage.jsx';

import DashboardHome        from './pages/DashboardHome.jsx';
import ProfilePage          from './pages/ProfilePage.jsx';
import EligibilityPage      from './pages/EligibilityPage.jsx';
import ResultsPage          from './pages/ResultsPage.jsx';
import SchemesPage          from './pages/SchemesPage.jsx';
import SchemeDetailPage     from './pages/SchemeDetailPage.jsx';
import SchemeComparisonPage from './pages/SchemeComparisonPage.jsx';
import AIHub                from './pages/AIHub.jsx';
import DocumentVault        from './pages/DocumentVault.jsx';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage.jsx';

import AdminDashboardPage   from './pages/AdminDashboardPage.jsx';
import AdminStudentsPage    from './pages/AdminStudentsPage.jsx';
import AdminSchemesPage     from './pages/AdminSchemesPage.jsx';
import AdminApplicationsPage from './pages/AdminApplicationsPage.jsx';
import AdminDocumentsPage   from './pages/AdminDocumentsPage.jsx';
import AdminPartnersPage    from './pages/AdminPartnersPage.jsx';
import AdminAuditLogsPage   from './pages/AdminAuditLogsPage.jsx';

import PartnerDashboardPage from './pages/PartnerDashboardPage.jsx';
import PartnerSchemesPage   from './pages/PartnerSchemesPage.jsx';
import PartnerApplicationsPage from './pages/PartnerApplicationsPage.jsx';
import PartnerDocumentsPage from './pages/PartnerDocumentsPage.jsx';
import PartnerVerificationPage from './pages/PartnerVerificationPage.jsx';
import PartnerReportsPage   from './pages/PartnerReportsPage.jsx';

import StudentServices      from './pages/StudentServices.jsx';
import CareerGuidance       from './pages/CareerGuidance.jsx';
import BecomePartner        from './pages/BecomePartner.jsx';
import EducationLoan        from './pages/EducationLoan.jsx';
import OnlineDegrees        from './pages/OnlineDegrees.jsx';
import ArticlesPage         from './pages/ArticlesPage.jsx';
import SupportProgramme     from './pages/SupportProgramme.jsx';
import ResultsPublicPage    from './pages/ResultsPublicPage.jsx';
import TermsPage            from './pages/TermsPage.jsx';
import PrivacyPage          from './pages/PrivacyPage.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/access-restricted" replace />;
};

const PartnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/partner/login" replace />;
  return (user.role === 'partner' || user.role === 'admin') ? children : <Navigate to="/access-restricted" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"         element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/partner/login" element={<PartnerLoginPage />} />
      <Route path="/access-restricted" element={<AccessRestrictedPage />} />

      <Route path="/terms"    element={<TermsPage />} />
      <Route path="/privacy"  element={<PrivacyPage />} />
      <Route path="/services" element={<StudentServices />} />
      <Route path="/career" element={<CareerGuidance />} />
      <Route path="/partner" element={<BecomePartner />} />
      <Route path="/loan" element={<EducationLoan />} />
      <Route path="/degrees" element={<OnlineDegrees />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/support-programme" element={<SupportProgramme />} />
      <Route path="/results-public" element={<ResultsPublicPage />} />

      {/* Student Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout><DashboardHome /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/profile" element={
        <ProtectedRoute>
          <DashboardLayout><ProfilePage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/vault" element={
        <ProtectedRoute>
          <DashboardLayout><DocumentVault /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/applications" element={
        <ProtectedRoute>
          <DashboardLayout><ApplicationTrackerPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/tracker" element={
        <ProtectedRoute>
          <DashboardLayout><ApplicationTrackerPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/application-tracker" element={
        <ProtectedRoute>
          <DashboardLayout><ApplicationTrackerPage /></DashboardLayout>
        </ProtectedRoute>
      }/>

      <Route path="/eligibility" element={
        <ProtectedRoute>
          <DashboardLayout><EligibilityPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/results" element={
        <ProtectedRoute>
          <DashboardLayout><ResultsPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/schemes" element={
        <ProtectedRoute>
          <DashboardLayout><SchemesPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/schemes/:id" element={
        <ProtectedRoute>
          <DashboardLayout><SchemeDetailPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/compare" element={
        <ProtectedRoute>
          <DashboardLayout><SchemeComparisonPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/ai-hub" element={
        <ProtectedRoute>
          <DashboardLayout><AIHub /></DashboardLayout>
        </ProtectedRoute>
      }/>

      {/* Admin Portal Protected Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/students"  element={<AdminRoute><AdminLayout><AdminStudentsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/schemes"   element={<AdminRoute><AdminLayout><AdminSchemesPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/applications" element={<AdminRoute><AdminLayout><AdminApplicationsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/documents" element={<AdminRoute><AdminLayout><AdminDocumentsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/partners"  element={<AdminRoute><AdminLayout><AdminPartnersPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin/audit-logs" element={<AdminRoute><AdminLayout><AdminAuditLogsPage /></AdminLayout></AdminRoute>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Partner Portal Protected Routes */}
      <Route path="/partner/dashboard"    element={<PartnerRoute><PartnerLayout><PartnerDashboardPage /></PartnerLayout></PartnerRoute>} />
      <Route path="/partner/schemes"      element={<PartnerRoute><PartnerLayout><PartnerSchemesPage /></PartnerLayout></PartnerRoute>} />
      <Route path="/partner/applications" element={<PartnerRoute><PartnerLayout><PartnerApplicationsPage /></PartnerLayout></PartnerRoute>} />
      <Route path="/partner/documents"    element={<PartnerRoute><PartnerLayout><PartnerDocumentsPage /></PartnerLayout></PartnerRoute>} />
      <Route path="/partner/verification" element={<PartnerRoute><PartnerLayout><PartnerVerificationPage /></PartnerLayout></PartnerRoute>} />
      <Route path="/partner/reports"      element={<PartnerRoute><PartnerLayout><PartnerReportsPage /></PartnerLayout></PartnerRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
