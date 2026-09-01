import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/index.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

import LandingPage          from './pages/LandingPage.jsx';
import LoginPage            from './pages/LoginPage.jsx';
import RegisterPage         from './pages/RegisterPage.jsx';
import DashboardHome        from './pages/DashboardHome.jsx';
import ProfilePage          from './pages/ProfilePage.jsx';
import EligibilityPage      from './pages/EligibilityPage.jsx';
import ResultsPage          from './pages/ResultsPage.jsx';
import SchemesPage          from './pages/SchemesPage.jsx';
import SchemeDetailPage     from './pages/SchemeDetailPage.jsx';
import SchemeComparisonPage from './pages/SchemeComparisonPage.jsx';
import AdminDashboard       from './pages/AdminDashboard.jsx';
import AIHub                from './pages/AIHub.jsx';
import DocumentVault        from './pages/DocumentVault.jsx';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage.jsx';

import StudentServices      from './pages/StudentServices.jsx';
import CareerGuidance       from './pages/CareerGuidance.jsx';
import BecomePartner        from './pages/BecomePartner.jsx';
import EducationLoan        from './pages/EducationLoan.jsx';
import OnlineDegrees        from './pages/OnlineDegrees.jsx';
import ArticlesPage         from './pages/ArticlesPage.jsx';
import SupportProgramme     from './pages/SupportProgramme.jsx';
import ResultsPublicPage    from './pages/ResultsPublicPage.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/services" element={<StudentServices />} />
      <Route path="/career" element={<CareerGuidance />} />
      <Route path="/partner" element={<BecomePartner />} />
      <Route path="/loan" element={<EducationLoan />} />
      <Route path="/degrees" element={<OnlineDegrees />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/support-programme" element={<SupportProgramme />} />
      <Route path="/results-public" element={<ResultsPublicPage />} />

      {/* Protected (dashboard) */}
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
      }/>      <Route path="/schemes/compare" element={
        <ProtectedRoute>
          <DashboardLayout><SchemeComparisonPage /></DashboardLayout>
        </ProtectedRoute>
      }/>      <Route path="/schemes/:id" element={
        <ProtectedRoute>
          <DashboardLayout><SchemeDetailPage /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/ai-hub" element={
        <ProtectedRoute>
          <DashboardLayout><AIHub /></DashboardLayout>
        </ProtectedRoute>
      }/>
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminRoute>
            <DashboardLayout><AdminDashboard /></DashboardLayout>
          </AdminRoute>
        </ProtectedRoute>
      }/>

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
