import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          containerStyle={{
            top: 80,
            right: 24,
            zIndex: 99999,
          }}
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '14px',
              padding: '12px 18px',
              background: '#0F172A',
              color: '#F8FAFC',
              border: '1px solid #1E293B',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#ffffff' } },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
