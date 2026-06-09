import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Truck, RefreshCcw, ShieldCheck, Ban, Phone, Eye, EyeOff,
  ArrowRight, User, Building2, Lock, Mail, AlertCircle,
  BadgeCheck, MapPin, Star, ChevronRight
} from 'lucide-react';
import retruckLogo from '../../assets/logos/retruck-logo.png';
import retruckText from '../../assets/logos/Retruck-text.png';
import './Auth.css';

// Demo test accounts for quick login
var DEMO_ACCOUNTS = {
  driver: { email: 'ramesh.yadav@retruck.in', password: 'ReTruck@2026' },
  shipper: { email: 'suresh.agarwal@retruck.in', password: 'ReTruck@2026' }
};

function Auth() {
  var navigate = useNavigate();
  var auth = useAuth();

  // State
  var modeState = useState('login');
  var mode = modeState[0];
  var setMode = modeState[1];

  var roleState = useState('driver');
  var selectedRole = roleState[0];
  var setSelectedRole = roleState[1];

  var showPassState = useState(false);
  var showPassword = showPassState[0];
  var setShowPassword = showPassState[1];

  var showConfirmState = useState(false);
  var showConfirmPassword = showConfirmState[0];
  var setShowConfirmPassword = showConfirmState[1];

  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var animatingState = useState(false);
  var isAnimating = animatingState[0];
  var setIsAnimating = animatingState[1];

  // Form fields
  var nameState = useState('');
  var name = nameState[0];
  var setName = nameState[1];

  var phoneState = useState('');
  var phone = phoneState[0];
  var setPhone = phoneState[1];

  var passwordState = useState('');
  var password = passwordState[0];
  var setPassword = passwordState[1];

  var confirmPassState = useState('');
  var confirmPassword = confirmPassState[0];
  var setConfirmPassword = confirmPassState[1];

  var businessNameState = useState('');
  var businessName = businessNameState[0];
  var setBusinessName = businessNameState[1];

  var licenseNoState = useState('');
  var licenseNo = licenseNoState[0];
  var setLicenseNo = licenseNoState[1];

  var experienceState = useState('');
  var experience = experienceState[0];
  var setExperience = experienceState[1];

  var emailState = useState('');
  var email = emailState[0];
  var setEmail = emailState[1];

  // Errors
  var errorsState = useState({});
  var errors = errorsState[0];
  var setErrors = errorsState[1];

  // Phone format helper
  function formatPhoneDisplay(value) {
    var digits = value.replace(/\D/g, '').substring(0, 10);
    if (digits.length > 5) {
      return digits.substring(0, 5) + ' ' + digits.substring(5);
    }
    return digits;
  }

  function handlePhoneChange(e) {
    var raw = e.target.value.replace(/\D/g, '').substring(0, 10);
    setPhone(raw);
    if (errors.phone) {
      setErrors(Object.assign({}, errors, { phone: '' }));
    }
  }

  // Validation
  function validatePhone(val) {
    if (!val || val.length !== 10) return 'Phone number must be 10 digits';
    if (!/^[6-9]/.test(val)) return 'Phone number must start with 6-9';
    return '';
  }

  function validatePassword(val) {
    if (!val || val.length < 8) return 'Password must be at least 8 characters';
    return '';
  }

  function validateEmail(val) {
    if (!val || !val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Enter a valid email address';
    return '';
  }

  function validate() {
    var newErrors = {};

    var emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    var phoneErr = validatePhone(phone);
    if (phoneErr) newErrors.phone = phoneErr;

    var passErr = validatePassword(password);
    if (passErr) newErrors.password = passErr;

    if (mode === 'signup') {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (selectedRole === 'shipper' && !businessName.trim()) {
        newErrors.businessName = 'Business name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        var loginResult = await auth.login(email, password);
        if (loginResult.error) {
          setErrors({ email: loginResult.error.message || 'Invalid login credentials' });
          setIsLoading(false);
          return;
        }
      } else {
        var signupResult = await auth.signUp(email, password, {
          role: selectedRole,
          name: name,
          phone: phone,
          licenseNo: licenseNo || null,
          experience: experience ? parseInt(experience) : null,
          businessName: businessName || null
        });
        if (signupResult.error) {
          setErrors({ email: signupResult.error.message || 'Signup failed' });
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ email: err.message || 'An unexpected error occurred' });
      setIsLoading(false);
    }
  }

  function fillDemoAccount() {
    var demo = DEMO_ACCOUNTS[selectedRole];
    setEmail(demo.email);
    setPhone(selectedRole === 'driver' ? '9876543201' : '9988776655');
    setPassword(demo.password);
  }

  function switchMode(newMode) {
    if (newMode === mode) return;
    setIsAnimating(true);
    setTimeout(function () {
      setMode(newMode);
      setErrors({});
      setPassword('');
      setConfirmPassword('');
      setTimeout(function () {
        setIsAnimating(false);
      }, 50);
    }, 250);
  }

  function switchRole(newRole) {
    if (newRole === selectedRole) return;
    setIsAnimating(true);
    setTimeout(function () {
      setSelectedRole(newRole);
      setErrors({});
      setTimeout(function () {
        setIsAnimating(false);
      }, 50);
    }, 200);
  }

  // Brand panel features
  var brandFeatures = [
    { icon: RefreshCcw, text: 'Return Trip Bookings', desc: 'Fill empty returns, earn more' },
    { icon: ShieldCheck, text: 'Verified Drivers Only', desc: 'KYC-checked fleet partners' },
    { icon: Ban, text: 'Zero Broker Commission', desc: 'Direct connections, no middlemen' }
  ];

  return (
    <div className="auth-page">
      {/* Left Brand Panel — Desktop Only */}
      <div className="auth-brand-panel">
        <div className="auth-brand-panel__content">
          <div className="auth-brand-panel__hero">
            <h1 className="auth-brand-panel__title">
              The Smarter Way to Move Freight.
            </h1>
            <p className="auth-brand-panel__subtitle">
              Join India's most reliable network. Connect with
              vetted partners, optimize your routes, and
              increase your margins.
            </p>
          </div>

          <div className="auth-brand-panel__features">
            {brandFeatures.map(function (feature, index) {
              var IconComponent = feature.icon;
              return (
                <div className="auth-brand-panel__feature" key={index} style={{ animationDelay: (index * 150) + 'ms' }}>
                  <div className="auth-brand-panel__feature-icon">
                    <IconComponent size={20} aria-hidden="true" />
                  </div>
                  <div className="auth-brand-panel__feature-text">
                    <span className="auth-brand-panel__feature-title">{feature.text}</span>
                    <span className="auth-brand-panel__feature-desc">{feature.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="auth-brand-panel__stats">
            <div className="auth-brand-panel__stat">
              <span className="auth-brand-panel__stat-value">13M+</span>
              <span className="auth-brand-panel__stat-label">Trucks</span>
            </div>
            <div className="auth-brand-panel__stat-divider"></div>
            <div className="auth-brand-panel__stat">
              <span className="auth-brand-panel__stat-value">40-60%</span>
              <span className="auth-brand-panel__stat-label">Lower Rates</span>
            </div>
            <div className="auth-brand-panel__stat-divider"></div>
            <div className="auth-brand-panel__stat">
              <span className="auth-brand-panel__stat-value">₹0</span>
              <span className="auth-brand-panel__stat-label">Broker Fee</span>
            </div>
          </div>

          {/* Decorative elements inside the sticky content wrapper */}
          <div className="auth-brand-panel__decor-dots"></div>
          <div className="auth-brand-panel__decor-circle"></div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">

          {/* Logo (always visible on mobile, visible on right panel too) */}
          <div className="auth-form-panel__logo">
            <img src={retruckLogo} alt="ReTruck Logo" className="auth-form-panel__logo-icon" />
            <img src={retruckText} alt="ReTruck" className="auth-form-panel__logo-text" />
          </div>

          {/* Form Card */}
          <div className="auth-card">

            {/* Mode Heading */}
            <div className="auth-card__header">
              <h2 className="auth-card__title">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="auth-card__subtitle">
                {mode === 'login'
                  ? 'Please enter your details to sign in.'
                  : 'Get started with ReTruck for free.'
                }
              </p>

              {/* Login / Sign Up Tabs */}
              <div className="auth-tabs">
                <button
                  className={'auth-tabs__btn' + (mode === 'login' ? ' auth-tabs__btn--active' : '')}
                  onClick={function () { switchMode('login'); }}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={'auth-tabs__btn' + (mode === 'signup' ? ' auth-tabs__btn--active' : '')}
                  onClick={function () { switchMode('signup'); }}
                  type="button"
                >
                  Sign Up
                </button>
                <div className={'auth-tabs__indicator' + (mode === 'signup' ? ' auth-tabs__indicator--right' : '')}></div>
              </div>
            </div>

            {/* Role Toggle */}
            <div className="auth-role-toggle">
              <button
                className={'auth-role-toggle__btn' + (selectedRole === 'driver' ? ' auth-role-toggle__btn--active' : '')}
                onClick={function () { switchRole('driver'); }}
                type="button"
              >
                <Truck size={16} aria-hidden="true" />
                <span>Driver</span>
              </button>
              <button
                className={'auth-role-toggle__btn' + (selectedRole === 'shipper' ? ' auth-role-toggle__btn--active' : '')}
                onClick={function () { switchRole('shipper'); }}
                type="button"
              >
                <Building2 size={16} aria-hidden="true" />
                <span>Shipper</span>
              </button>
              <div className={'auth-role-toggle__slider' + (selectedRole === 'shipper' ? ' auth-role-toggle__slider--right' : '')}></div>
            </div>

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className={'auth-form__fields' + (isAnimating ? ' auth-form__fields--exit' : ' auth-form__fields--enter')}>

                {/* Name — Signup only */}
                {mode === 'signup' && (
                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="auth-name">
                      <User size={14} aria-hidden="true" />
                      Full Name
                    </label>
                    <div className={'auth-field__input-wrap' + (errors.name ? ' auth-field__input-wrap--error' : '')}>
                      <input
                        id="auth-name"
                        type="text"
                        className="auth-field__input"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={function (e) { setName(e.target.value); }}
                      />
                    </div>
                    {errors.name && (
                      <span className="auth-field__error">
                        <AlertCircle size={14} aria-hidden="true" />
                        {errors.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="auth-email">
                    <Mail size={14} aria-hidden="true" />
                    Email Address
                  </label>
                  <div className={'auth-field__input-wrap' + (errors.email ? ' auth-field__input-wrap--error' : '')}>
                    <input
                      id="auth-email"
                      type="email"
                      className="auth-field__input"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={function (e) { setEmail(e.target.value); }}
                    />
                  </div>
                  {errors.email && (
                    <span className="auth-field__error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* Phone */}
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="auth-phone">
                    <Phone size={14} aria-hidden="true" />
                    Phone Number
                  </label>
                  <div className={'auth-field__input-wrap auth-field__input-wrap--phone' + (errors.phone ? ' auth-field__input-wrap--error' : '')}>
                    <div className="auth-field__phone-prefix">
                      <span className="auth-field__flag">🇮🇳</span>
                      <span className="auth-field__code">+91</span>
                    </div>
                    <div className="auth-field__phone-divider"></div>
                    <input
                      id="auth-phone"
                      type="tel"
                      className="auth-field__input"
                      placeholder="00000 00000"
                      value={formatPhoneDisplay(phone)}
                      onChange={handlePhoneChange}
                      maxLength={11}
                    />
                  </div>
                  {errors.phone && (
                    <span className="auth-field__error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {errors.phone}
                    </span>
                  )}
                </div>

                {/* Business Name — Shipper Signup only */}
                {mode === 'signup' && selectedRole === 'shipper' && (
                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="auth-business">
                      <Building2 size={14} aria-hidden="true" />
                      Business Name
                    </label>
                    <div className={'auth-field__input-wrap' + (errors.businessName ? ' auth-field__input-wrap--error' : '')}>
                      <input
                        id="auth-business"
                        type="text"
                        className="auth-field__input"
                        placeholder="Enter your business name"
                        value={businessName}
                        onChange={function (e) { setBusinessName(e.target.value); }}
                      />
                    </div>
                    {errors.businessName && (
                      <span className="auth-field__error">
                        <AlertCircle size={14} aria-hidden="true" />
                        {errors.businessName}
                      </span>
                    )}
                  </div>
                )}

                {/* License No — Driver Signup only */}
                {mode === 'signup' && selectedRole === 'driver' && (
                  <div className="auth-field-row">
                    <div className="auth-field auth-field--half">
                      <label className="auth-field__label" htmlFor="auth-license">
                        License No.
                      </label>
                      <div className="auth-field__input-wrap">
                        <input
                          id="auth-license"
                          type="text"
                          className="auth-field__input"
                          placeholder="e.g. BR20110012345"
                          value={licenseNo}
                          onChange={function (e) { setLicenseNo(e.target.value); }}
                        />
                      </div>
                    </div>
                    <div className="auth-field auth-field--half">
                      <label className="auth-field__label" htmlFor="auth-experience">
                        Experience (yrs)
                      </label>
                      <div className="auth-field__input-wrap">
                        <input
                          id="auth-experience"
                          type="number"
                          className="auth-field__input"
                          placeholder="e.g. 5"
                          min="0"
                          max="50"
                          value={experience}
                          onChange={function (e) { setExperience(e.target.value); }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="auth-password">
                    <Lock size={14} aria-hidden="true" />
                    Password
                  </label>
                  <div className={'auth-field__input-wrap' + (errors.password ? ' auth-field__input-wrap--error' : '')}>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      className="auth-field__input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={function (e) { setPassword(e.target.value); }}
                    />
                    <button
                      type="button"
                      className="auth-field__eye-btn"
                      onClick={function () { setShowPassword(!showPassword); }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <Eye size={18} />
                        : <EyeOff size={18} />
                      }
                    </button>
                  </div>
                  {errors.password && (
                    <span className="auth-field__error">
                      <AlertCircle size={14} aria-hidden="true" />
                      {errors.password}
                    </span>
                  )}
                  {mode === 'login' && (
                    <a href="#" className="auth-field__forgot" onClick={function (e) { e.preventDefault(); }}>
                      Forgot password?
                    </a>
                  )}
                </div>

                {/* Confirm Password — Signup only */}
                {mode === 'signup' && (
                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="auth-confirm-password">
                      <Lock size={14} aria-hidden="true" />
                      Confirm Password
                    </label>
                    <div className={'auth-field__input-wrap' + (errors.confirmPassword ? ' auth-field__input-wrap--error' : '')}>
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="auth-field__input"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={function (e) { setConfirmPassword(e.target.value); }}
                      />
                      <button
                        type="button"
                        className="auth-field__eye-btn"
                        onClick={function () { setShowConfirmPassword(!showConfirmPassword); }}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword
                          ? <Eye size={18} />
                          : <EyeOff size={18} />
                        }
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="auth-field__error">
                        <AlertCircle size={14} aria-hidden="true" />
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={'auth-submit-btn' + (isLoading ? ' auth-submit-btn--loading' : '')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-submit-btn__loader"></span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Continue' : 'Create Account'}</span>
                    <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>



            {/* Divider */}
            <div className="auth-divider">
              <span className="auth-divider__line"></span>
              <span className="auth-divider__text">OR CONTINUE WITH</span>
              <span className="auth-divider__line"></span>
            </div>

            {/* Social Auth */}
            <div className="auth-social">
              <button className="auth-social__btn" type="button">
                <svg className="auth-social__icon" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button className="auth-social__btn" type="button">
                <svg className="auth-social__icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Legal */}
            <p className="auth-legal">
              By continuing, you agree to ReTruck's{' '}
              <a href="#" className="auth-legal__link">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="auth-legal__link">Privacy Policy</a>.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
