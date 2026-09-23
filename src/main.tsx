import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminProvider } from './context/AdminContext';
import { RBACProvider } from './context/RBACContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminProvider>
      <RBACProvider>
        <App />
      </RBACProvider>
    </AdminProvider>
  </StrictMode>,
);
