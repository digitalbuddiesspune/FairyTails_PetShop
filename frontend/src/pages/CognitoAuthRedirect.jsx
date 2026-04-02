import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { isAdminAuthenticated } from '../auth/session';

const CognitoAuthRedirect = ({ mode = 'signin' }) => {
  const auth = useAuth();
  const isAdminMode = mode === 'admin-signin';

  useEffect(() => {
    if (auth.isLoading || auth.activeNavigator) return;
    if (auth.isAuthenticated) {
      window.location.replace(isAdminAuthenticated() ? '/admin/dashboard' : '/');
      return;
    }

    const params =
      mode === 'signup'
        ? { extraQueryParams: { screen_hint: 'signup' } }
        : undefined;

    auth.signinRedirect(params).catch((error) => {
      console.error(`Failed to start Cognito ${mode} flow:`, error);
    });
  }, [auth, mode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">
          Redirecting to {mode === 'signup' ? 'signup' : isAdminMode ? 'admin login' : 'login'}
        </h1>
        <p className="text-slate-400">Please wait...</p>
      </div>
    </div>
  );
};

export default CognitoAuthRedirect;

