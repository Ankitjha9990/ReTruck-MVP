import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/variables.css';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './services/supabaseClient.js';

var isConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'your_supabase_project_url' &&
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

function ConfigErrorScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg, #f7f9fc)',
      padding: '24px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface, #ffffff)',
        borderRadius: 'var(--radius-lg, 16px)',
        boxShadow: 'var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12))',
        width: '100%',
        maxWidth: '640px',
        padding: '40px',
        borderTop: '6px solid var(--color-warning, #f59e0b)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            backgroundColor: 'var(--color-warning-light, #fef3c7)',
            color: 'var(--color-warning, #d97706)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            ⚠️
          </div>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--color-text-primary, #111827)',
              margin: 0
            }}>
              Configuration Required
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary, #4b5563)',
              margin: '4px 0 0 0'
            }}>
              Supabase environment variables are missing
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid var(--color-border, #e5e7eb)',
          borderRadius: 'var(--radius-sm, 8px)',
          padding: '16px 20px',
          marginBottom: '28px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--color-text-primary, #374151)'
        }}>
          <p style={{ margin: '0 0 12px 0' }}>
            The application is unable to connect to the backend database because the Supabase URL or Anon Key is not configured.
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-navy, #1e3a8a)' }}>
            This occurs because environment variables (.env files) are not committed to Git for security reasons. You must configure them on your deployment platform.
          </p>
        </div>

        <h2 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--color-text-primary, #111827)',
          marginBottom: '16px'
        }}>
          How to resolve this:
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #4b5563)' }}>
            <strong style={{ color: 'var(--color-text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
              1. On your Deployment Platform (Vercel, Netlify, Render, etc.)
            </strong>
            Go to your project's dashboard under <strong>Environment Variables</strong> or <strong>Config Vars</strong>, and add the following keys with your Supabase credentials:
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>
                <code>VITE_SUPABASE_URL</code> = <em>(Your Supabase project URL)</em>
              </li>
              <li>
                <code>VITE_SUPABASE_ANON_KEY</code> = <em>(Your Supabase anon public key)</em>
              </li>
            </ul>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #4b5563)' }}>
            <strong style={{ color: 'var(--color-text-primary, #111827)', display: 'block', marginBottom: '4px' }}>
              2. Trigger a New Build/Redeploy
            </strong>
            Since Vite inlines environment variables statically during build-time, you <strong>must trigger a new deployment or rebuild</strong> after adding the environment variables.
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-border, #e5e7eb)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={function() { window.location.reload(); }}
            style={{
              backgroundColor: 'var(--color-green, #10b981)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={function(e) { e.currentTarget.style.backgroundColor = 'var(--color-green-dark, #059669)'; }}
            onMouseOut={function(e) { e.currentTarget.style.backgroundColor = 'var(--color-green, #10b981)'; }}
          >
            Check Configuration Again
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isConfigured ? <App /> : <ConfigErrorScreen />}
  </React.StrictMode>
);

