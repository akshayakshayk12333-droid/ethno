import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { AuthProvider } from './hooks/useAuth'
import { AccessibilityProvider } from './hooks/useAccessibility'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AccessibilityProvider>
  </React.StrictMode>,
)
