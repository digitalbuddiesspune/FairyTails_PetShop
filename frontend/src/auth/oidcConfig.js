const region = import.meta.env.VITE_COGNITO_REGION || 'ap-south-1';
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_6kSN7qDBD';
const hostedDomain =
  import.meta.env.VITE_COGNITO_DOMAIN ||
  'https://ap-south-16ksn7qdbd.auth.ap-south-1.amazoncognito.com';
const clientId =
  import.meta.env.VITE_COGNITO_CLIENT_ID || '2bg7a4mpp4ci2l0qph9km9nlb7';
const authority = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const redirectUri =
  import.meta.env.VITE_COGNITO_REDIRECT_URI || `${window.location.origin}/callback`;
const postLogoutRedirectUri =
  import.meta.env.VITE_COGNITO_POST_LOGOUT_REDIRECT_URI || `${window.location.origin}/`;
// Must match "Allowed OAuth Scopes" on the Cognito app client (profile is optional).
const scope = import.meta.env.VITE_COGNITO_SCOPE || 'openid email phone';

export const oidcConfig = {
  authority,
  client_id: clientId,
  redirect_uri: redirectUri,
  post_logout_redirect_uri: postLogoutRedirectUri,
  response_type: 'code',
  scope,
  // Provide Cognito endpoints explicitly to avoid browser CORS issues
  // when trying OIDC discovery against the hosted UI domain.
  metadata: {
    issuer: authority,
    authorization_endpoint: `${hostedDomain}/oauth2/authorize`,
    token_endpoint: `${hostedDomain}/oauth2/token`,
    userinfo_endpoint: `${hostedDomain}/oauth2/userInfo`,
    end_session_endpoint: `${hostedDomain}/logout`,
    jwks_uri: `${authority}/.well-known/jwks.json`,
  },
  automaticSilentRenew: true,
  loadUserInfo: true,
  monitorSession: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

