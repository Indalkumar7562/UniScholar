import UnifiedAuthContainer from '../components/auth/UnifiedAuthContainer.jsx';

export default function LoginPage() {
  return <UnifiedAuthContainer role="student" initialTab="login" />;
}
