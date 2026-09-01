import UnifiedAuthContainer from '../components/auth/UnifiedAuthContainer.jsx';

export default function AdminLoginPage() {
  return <UnifiedAuthContainer role="admin" initialTab="login" />;
}
