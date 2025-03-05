import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handle redirects from sessionStorage
const redirect = sessionStorage.redirect;
if (redirect) {
  // Clear the redirect from sessionStorage
  delete sessionStorage.redirect;
  
  // Update the history to include the path
  window.history.replaceState(null, '', redirect);
}

createRoot(document.getElementById("root")!).render(<App />);
