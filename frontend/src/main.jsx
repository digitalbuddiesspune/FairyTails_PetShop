import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.jsx'
import { oidcConfig } from './auth/oidcConfig.js'
import { bootstrapTokenFromOidcStorage } from './auth/session.js'

bootstrapTokenFromOidcStorage(oidcConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
