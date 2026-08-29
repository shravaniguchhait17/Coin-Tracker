import { useAuth } from '../context/AuthContext.jsx';
import { redirectToGoogleLogin } from '../api/client.js';

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, fontFamily: 'monospace' }}>Loading…</div>;
  }

  if (!isAuthenticated) {
    // Full navigation, not a client-side route change — has to leave
    // the SPA so Spring/Google can do the OAuth2 redirect dance.
    redirectToGoogleLogin();
    return null;
  }

  return children;
}
