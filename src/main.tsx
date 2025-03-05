import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle redirects from sessionStorage
const redirect = sessionStorage.redirect;
if (redirect && redirect !== window.location.href) {
  // Clear the redirect from sessionStorage
  delete sessionStorage.redirect;
  
  // Extract the path from the redirect URL
  const url = new URL(redirect);
  const path = url.pathname + url.search + url.hash;
  
  // Update the history to include the path
  window.history.replaceState(null, '', path);
}

createRoot(document.getElementById("root")!).render(<App />);
