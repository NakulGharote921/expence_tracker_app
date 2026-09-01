import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { client } from './lib/appwrite/client';

// One-time Appwrite reachability check so the setup can be confirmed in the browser console.
client.ping()
    .then(() => console.log('[appwrite] connection OK'))
    .catch((err) => console.error('[appwrite] ping failed', err?.message || err));

createRoot(document.getElementById('root')).render(<StrictMode>
    <App />
  </StrictMode>);
