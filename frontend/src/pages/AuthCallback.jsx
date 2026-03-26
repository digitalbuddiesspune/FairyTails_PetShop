import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const AuthCallback = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [callbackError, setCallbackError] = useState('');
  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const oauthError = query.get('error');
    if (oauthError) {
      const description = query.get('error_description') || 'OAuth callback failed';
      setCallbackError(`${oauthError}: ${description}`);
      return;
    }

    const run = async () => {
      if (auth.isLoading || auth.activeNavigator) return;
      if (!auth.isAuthenticated || !auth.user) return;

      navigate('/', { replace: true });
    };

    run().catch((error) => {
      console.error('Error finalizing Cognito callback:', error);
      setCallbackError(error?.message || 'Error finalizing Cognito callback');
      navigate('/signin', { replace: true });
    });
  }, [auth, navigate, query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Signing you in...</h1>
        {callbackError ? (
          <>
            <p className="text-red-400 mb-4">{callbackError}</p>
            <button
              type="button"
              onClick={() => navigate('/signin', { replace: true })}
              className="px-4 py-2 bg-white text-slate-900 rounded-md font-medium"
            >
              Try Sign In Again
            </button>
          </>
        ) : (
          <p className="text-slate-400">Finalizing secure login.</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

