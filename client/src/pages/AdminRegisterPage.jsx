import UnifiedAuthContainer from '../components/auth/UnifiedAuthContainer.jsx';

export default function AdminRegisterPage() {
  return <UnifiedAuthContainer role="admin" initialTab="register" />;
}
