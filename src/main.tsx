import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { TemplateProvider } from './contexts/TemplateContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <TemplateProvider>
      <App />
    </TemplateProvider>
  </AuthProvider>
);
