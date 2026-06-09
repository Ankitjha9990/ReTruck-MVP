import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Settings as SettingsIcon, Shield, Bell, Eye, EyeOff, Globe,
  Moon, Sun, HelpCircle, Save, Smartphone, Mail
} from 'lucide-react';
import './Settings.css';

function Settings() {
  var navigate = useNavigate();
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;

  // Local settings states
  var [theme, setTheme] = useState('light');
  var [language, setLanguage] = useState('english');
  var [smsAlerts, setSmsAlerts] = useState(true);
  var [emailAlerts, setEmailAlerts] = useState(false);
  var [whatsappAlerts, setWhatsappAlerts] = useState(true);
  var [isSaving, setIsSaving] = useState(false);

  function handleSaveSettings(e) {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(function () {
      setIsSaving(false);
      toast.showToast('Settings updated successfully!', 'success');
    }, 600);
  }

  return (
    <DashboardLayout activeTab="settings">
      <div className="settings-page">
        {/* Header */}
        <div className="se-header">
          <h1 className="se-title">Settings</h1>
          <p className="se-subtitle">Customize your account, notifications, and platform experience.</p>
        </div>

        <div className="se-grid">
          {/* Main Settings Panel */}
          <div className="se-panel">
            <form onSubmit={handleSaveSettings}>
              {/* Profile Overview */}
              <div className="se-section">
                <h3 className="se-section__title">
                  <Smartphone size={18} />
                  Account Info
                </h3>
                <div className="se-info-row">
                  <div className="se-info-group">
                    <span className="se-info-label">Registerd Phone</span>
                    <span className="se-info-value">+91 {user ? user.phone : '9876543210'}</span>
                  </div>
                  <div className="se-info-group">
                    <span className="se-info-label">User Role</span>
                    <span className="se-info-value se-info-value--role">{auth.role === 'driver' ? 'Driver' : 'Shipper'}</span>
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="se-section">
                <h3 className="se-section__title">
                  <Globe size={18} />
                  App Preferences
                </h3>

                <div className="se-control-group">
                  <label className="se-label" htmlFor="se-lang-select">Default Language</label>
                  <select
                    id="se-lang-select"
                    className="se-select"
                    value={language}
                    onChange={function (e) { setLanguage(e.target.value); }}
                  >
                    <option value="english">English (US)</option>
                    <option value="hindi">हिन्दी (Hindi)</option>
                    <option value="marathi">मराठी (Marathi)</option>
                    <option value="bengali">বাংলা (Bengali)</option>
                  </select>
                </div>

                <div className="se-control-group">
                  <span className="se-label">App Theme</span>
                  <div className="se-theme-options">
                    <button
                      type="button"
                      className={'se-theme-btn' + (theme === 'light' ? ' se-theme-btn--active' : '')}
                      onClick={function () { setTheme('light'); }}
                    >
                      <Sun size={16} />
                      <span>Light Mode</span>
                    </button>
                    <button
                      type="button"
                      className={'se-theme-btn' + (theme === 'dark' ? ' se-theme-btn--active' : '')}
                      onClick={function () { setTheme('dark'); }}
                    >
                      <Moon size={16} />
                      <span>Dark Mode</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="se-section">
                <h3 className="se-section__title">
                  <Bell size={18} />
                  Notification Channels
                </h3>
                <p className="se-section-desc">Choose how you want to receive booking updates and platform alerts.</p>

                <div className="se-toggle-row">
                  <div className="se-toggle-text">
                    <span className="se-toggle-label">SMS Notifications</span>
                    <span className="se-toggle-desc">Get text messages for direct booking confirmations.</span>
                  </div>
                  <button
                    type="button"
                    className={'se-toggle' + (smsAlerts ? ' se-toggle--on' : '')}
                    onClick={function () { setSmsAlerts(!smsAlerts); }}
                    aria-label="Toggle SMS"
                  >
                    <span className="se-toggle__thumb" />
                  </button>
                </div>

                <div className="se-toggle-row">
                  <div className="se-toggle-text">
                    <span className="se-toggle-label">WhatsApp Alerts</span>
                    <span className="se-toggle-desc">Receive real-time tracking updates and booking cards directly on WhatsApp.</span>
                  </div>
                  <button
                    type="button"
                    className={'se-toggle' + (whatsappAlerts ? ' se-toggle--on' : '')}
                    onClick={function () { setWhatsappAlerts(!whatsappAlerts); }}
                    aria-label="Toggle WhatsApp"
                  >
                    <span className="se-toggle__thumb" />
                  </button>
                </div>

                <div className="se-toggle-row">
                  <div className="se-toggle-text">
                    <span className="se-toggle-label">Email Digest</span>
                    <span className="se-toggle-desc">Get a weekly summary of completed bookings and earnings analysis.</span>
                  </div>
                  <button
                    type="button"
                    className={'se-toggle' + (emailAlerts ? ' se-toggle--on' : '')}
                    onClick={function () { setEmailAlerts(!emailAlerts); }}
                    aria-label="Toggle Email"
                  >
                    <span className="se-toggle__thumb" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={'se-save-btn' + (isSaving ? ' se-save-btn--saving' : '')}
                disabled={isSaving}
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </form>
          </div>

          {/* Help Panel */}
          <div className="se-sidebar">
            <div className="se-help-card">
              <HelpCircle size={24} className="se-help-card__icon" />
              <h4 className="se-help-card__title">Need Help?</h4>
              <p className="se-help-card__desc">Have questions about setting up your listings, billing, or verification? Check our support portal or call helpline.</p>
              <a href="#" className="se-help-card__link" onClick={function (e) { e.preventDefault(); }}>
                Contact Support Direct
              </a>
            </div>

            <div className="se-help-card se-help-card--security">
              <div className="se-help-card__header-row">
                <Shield size={24} className="se-help-card__icon" />
                <span className={'se-kyc-badge se-kyc-badge--' + (user && user.verified ? 'verified' : 'pending')}>
                  {user && user.verified ? 'Verified' : 'Partially Verified'}
                </span>
              </div>
              <h4 className="se-help-card__title">KYC Status</h4>
              <p className="se-help-card__desc">
                {user && user.verified
                  ? 'Your profile is fully verified. You have access to all premium platform features.'
                  : 'Your profile is currently partially verified. Complete your documentation to receive the premium verified badge.'}
              </p>
              {!(user && user.verified) && (
                <a href="#" className="se-help-card__link" onClick={function (e) { e.preventDefault(); navigate('/profile'); }}>
                  Upload KYC Documents
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
