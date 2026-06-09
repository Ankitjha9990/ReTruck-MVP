import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import ImageUploader from '../../components/common/ImageUploader/ImageUploader.jsx';
import { processImageUpload, fileToBase64 } from '../../services/imageUploadService.js';
import {
  User, Truck, FileText, ShieldCheck, Bell, Camera,
  MapPin, Phone, Calendar, BadgeCheck, Pencil, Save,
  Upload, Eye, EyeOff, AlertCircle, CheckCircle, Clock,
  Building2, ChevronRight
} from 'lucide-react';
import './DriverProfile.css';

var DRIVER_TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'truck', label: 'Truck Details', icon: Truck },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

var SHIPPER_TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'business', label: 'Business Info', icon: Building2 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell }
];

function DriverProfile() {
  var navigate = useNavigate();
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;
  var role = auth.role;

  var tabState = useState('personal');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var editState = useState(false);
  var isEditing = editState[0];
  var setIsEditing = editState[1];

  // Form states
  var nameState = useState(user ? user.name : '');
  var formName = nameState[0];
  var setFormName = nameState[1];

  var phoneState = useState(user ? user.phone : '');
  var formPhone = phoneState[0];
  var setFormPhone = phoneState[1];

  var cityState = useState(user ? user.city || '' : '');
  var formCity = cityState[0];
  var setFormCity = cityState[1];

  var bioState = useState(user ? user.bio || '' : '');
  var formBio = bioState[0];
  var setFormBio = bioState[1];

  var expState = useState(user ? (user.experience || '') : '');
  var formExperience = expState[0];
  var setFormExperience = expState[1];

  // Truck form states
  var truckNumberState = useState(user && user.truck ? user.truck.number || '' : '');
  var truckNumber = truckNumberState[0];
  var setTruckNumber = truckNumberState[1];

  var truckTypeState = useState(user && user.truck ? user.truck.type || '' : '');
  var truckType = truckTypeState[0];
  var setTruckType = truckTypeState[1];

  var truckCapacityState = useState(user && user.truck ? user.truck.capacity || '' : '');
  var truckCapacity = truckCapacityState[0];
  var setTruckCapacity = truckCapacityState[1];

  // Business form states
  var businessNameState = useState(user ? user.businessName || '' : '');
  var businessName = businessNameState[0];
  var setBusinessName = businessNameState[1];

  var gstState = useState('');
  var gstNumber = gstState[0];
  var setGstNumber = gstState[1];

  var businessAddressState = useState('');
  var businessAddress = businessAddressState[0];
  var setBusinessAddress = businessAddressState[1];

  // Security form
  var currentPassState = useState('');
  var currentPassword = currentPassState[0];
  var setCurrentPassword = currentPassState[1];

  var newPassState = useState('');
  var newPassword = newPassState[0];
  var setNewPassword = newPassState[1];

  var confirmPassState = useState('');
  var confirmPassword = confirmPassState[0];
  var setConfirmPassword = confirmPassState[1];

  var showPassState = useState(false);
  var showPassword = showPassState[0];
  var setShowPassword = showPassState[1];

  // Notification toggles
  var notifsState = useState({
    bookingRequests: true,
    bookingUpdates: true,
    promotions: false,
    smsAlerts: true,
    whatsappAlerts: true,
    emailDigest: false
  });
  var notifs = notifsState[0];
  var setNotifs = notifsState[1];

  // Document status
  var docsState = useState({
    license: user && user.licenseNo ? 'submitted' : 'pending',
    rc: 'pending',
    insurance: 'pending'
  });
  var docs = docsState[0];
  var setDocs = docsState[1];

  // Uploaded image previews
  var avatarState = useState(user ? (user.avatar_url || user.avatar) : null);
  var avatarPreview = avatarState[0];
  var setAvatarPreview = avatarState[1];

  var truckPhotoState = useState(user && user.truck ? user.truck.photo : null);
  var truckPhotoPreview = truckPhotoState[0];
  var setTruckPhotoPreview = truckPhotoState[1];

  var kycPreviewsState = useState({ license: null, rc: null, insurance: null });
  var kycPreviews = kycPreviewsState[0];
  var setKycPreviews = kycPreviewsState[1];

  var tabs = role === 'shipper' ? SHIPPER_TABS : DRIVER_TABS;

  function handleSavePersonal() {
    auth.updateUser({
      name: formName,
      phone: formPhone,
      city: formCity,
      bio: formBio,
      experience: parseInt(formExperience) || 0
    });
    setIsEditing(false);
    toast.showToast('Profile saved successfully!', 'success');
  }

  function handleSaveTruck() {
    auth.updateUser({
      truck: {
        number: truckNumber,
        type: truckType,
        capacity: parseInt(truckCapacity) || 0,
        photo: user && user.truck ? user.truck.photo : 'https://picsum.photos/seed/truck_new/400/250'
      }
    });
    toast.showToast('Truck details saved!', 'success');
  }

  function handleSaveBusiness() {
    auth.updateUser({
      businessName: businessName
    });
    toast.showToast('Business info saved!', 'success');
  }

  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.showToast('Please fill all password fields', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast.showToast('New password must be at least 8 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.showToast('Passwords do not match', 'error');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.showToast('Password changed successfully!', 'success');
  }

  function handleDocUpload(docType) {
    var updated = Object.assign({}, docs);
    updated[docType] = 'submitted';
    setDocs(updated);
    toast.showToast('Document uploaded successfully!', 'success');
  }

  async function handleAvatarUpload(uploadResult) {
    try {
      var base64 = await fileToBase64(uploadResult.file);
      setAvatarPreview(base64);
      auth.updateUser({ avatar_url: base64 });
      toast.showToast('Profile photo updated!', 'success');
    } catch (err) {
      toast.showToast('Failed to process avatar file.', 'error');
    }
  }

  async function handleTruckPhotoUpload(uploadResult) {
    try {
      var base64 = await fileToBase64(uploadResult.file);
      setTruckPhotoPreview(base64);
      var currentTruck = (user && user.truck) ? user.truck : {};
      auth.updateUser({
        truck: Object.assign({}, currentTruck, { photo: base64 })
      });
      toast.showToast('Truck photo updated!', 'success');
    } catch (err) {
      toast.showToast('Failed to process truck photo.', 'error');
    }
  }

  function handleKycUpload(docType, uploadResult) {
    var updated = Object.assign({}, kycPreviews);
    updated[docType] = uploadResult.previewUrl;
    setKycPreviews(updated);
    handleDocUpload(docType);
  }

  function handleNotifToggle(key) {
    var updated = Object.assign({}, notifs);
    updated[key] = !updated[key];
    setNotifs(updated);
  }

  function getPasswordStrength(pass) {
    if (!pass) return 0;
    var score = 0;
    if (pass.length >= 8) score += 25;
    if (pass.length >= 12) score += 15;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 20;
    return Math.min(score, 100);
  }

  var strength = getPasswordStrength(newPassword);

  function getStrengthLabel(s) {
    if (s < 25) return 'Weak';
    if (s < 50) return 'Fair';
    if (s < 75) return 'Good';
    return 'Strong';
  }

  function getStrengthColor(s) {
    if (s < 25) return 'var(--color-error, #EF4444)';
    if (s < 50) return 'var(--color-warning, #F59E0B)';
    if (s < 75) return 'var(--color-info, #3B82F6)';
    return 'var(--color-success, #10B981)';
  }

  return (
    <DashboardLayout activeTab="profile" onTabChange={function () {}}>
      <div className="profile-page">

        {/* ─── Profile Header ──────────────────────────── */}
        <div className="profile-header">
          <div className="profile-header__avatar-section">
            <div className="profile-header__avatar-wrap">
              <img
                src={avatarPreview || (user ? (user.avatar_url || user.avatar) : 'https://picsum.photos/seed/default/100')}
                alt={user ? user.name : 'Profile'}
                className="profile-header__avatar"
              />
              <label
                className="profile-header__camera"
                title="Change profile photo"
                aria-label="Change profile photo"
                style={{ cursor: 'pointer' }}
              >
                <Camera size={16} />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={function (e) {
                    var file = e.target.files && e.target.files[0];
                    if (file) {
                      var result = processImageUpload(file, 'profile-picture', user ? user.id : 'guest');
                      if (result.success) {
                        result.file = file;
                        handleAvatarUpload(result);
                      } else {
                        toast.showToast(result.error, 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {user && user.verified && (
                <span className="profile-header__verified">
                  <BadgeCheck size={16} />
                </span>
              )}
            </div>
            <div className="profile-header__info">
              <h1 className="profile-header__name">{user ? user.name : 'User'}</h1>
              <span className="profile-header__role-badge">
                {role === 'driver' ? (
                  <><Truck size={14} aria-hidden="true" /> Driver</>
                ) : (
                  <><Building2 size={14} aria-hidden="true" /> Shipper</>
                )}
              </span>
              {user && user.city && (
                <span className="profile-header__city">
                  <MapPin size={14} aria-hidden="true" /> {user.city}
                </span>
              )}
            </div>
          </div>
          {!(user && user.verified) && (
            <div className="profile-header__kyc-banner">
              <AlertCircle size={16} aria-hidden="true" />
              <span>Complete your KYC to get verified</span>
              <button
                className="profile-header__kyc-btn"
                onClick={function () { setActiveTab('documents'); }}
                type="button"
              >
                Upload <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* ─── Profile Tabs ────────────────────────────── */}
        <div className="profile-tabs">
          <div className="profile-tabs__scroll">
            {tabs.map(function (tab) {
              var Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={'profile-tabs__btn' + (activeTab === tab.id ? ' profile-tabs__btn--active' : '')}
                  onClick={function () { setActiveTab(tab.id); setIsEditing(false); }}
                  type="button"
                >
                  <Icon size={16} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Tab Content ─────────────────────────────── */}
        <div className="profile-content">

          {/* ── Personal Info Tab ───────────────────────── */}
          {activeTab === 'personal' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">Personal Information</h2>
                {!isEditing ? (
                  <button
                    className="profile-section__edit-btn"
                    onClick={function () { setIsEditing(true); }}
                    type="button"
                  >
                    <Pencil size={14} aria-hidden="true" /> Edit
                  </button>
                ) : (
                  <button
                    className="profile-section__save-btn"
                    onClick={handleSavePersonal}
                    type="button"
                  >
                    <Save size={14} aria-hidden="true" /> Save
                  </button>
                )}
              </div>

              <div className="profile-form">
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="profile-form__input"
                    value={formName}
                    onChange={function (e) { setFormName(e.target.value); }}
                    disabled={!isEditing}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__group profile-form__group--half">
                    <label className="profile-form__label" htmlFor="profile-phone">Phone Number</label>
                    <div className="profile-form__input-wrap profile-form__input-wrap--phone">
                      <span className="profile-form__prefix">+91</span>
                      <input
                        id="profile-phone"
                        type="tel"
                        className="profile-form__input"
                        value={formPhone}
                        onChange={function (e) { setFormPhone(e.target.value.replace(/\D/g, '').substring(0, 10)); }}
                        disabled={!isEditing}
                        placeholder="0000000000"
                      />
                    </div>
                  </div>
                  <div className="profile-form__group profile-form__group--half">
                    <label className="profile-form__label" htmlFor="profile-city">City</label>
                    <input
                      id="profile-city"
                      type="text"
                      className="profile-form__input"
                      value={formCity}
                      onChange={function (e) { setFormCity(e.target.value); }}
                      disabled={!isEditing}
                      placeholder="Enter your city"
                    />
                  </div>
                </div>

                {role === 'driver' && (
                  <div className="profile-form__group">
                    <label className="profile-form__label" htmlFor="profile-exp">Years of Experience</label>
                    <input
                      id="profile-exp"
                      type="number"
                      className="profile-form__input"
                      value={formExperience}
                      onChange={function (e) { setFormExperience(e.target.value); }}
                      disabled={!isEditing}
                      placeholder="e.g. 5"
                      min="0"
                      max="50"
                    />
                  </div>
                )}

                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="profile-bio">Bio</label>
                  <textarea
                    id="profile-bio"
                    className="profile-form__textarea"
                    value={formBio}
                    onChange={function (e) { setFormBio(e.target.value); }}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={300}
                  />
                  <span className="profile-form__char-count">{formBio.length}/300</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Truck Details Tab ──────────────────────── */}
          {activeTab === 'truck' && role === 'driver' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">Truck Details</h2>
                <button
                  className="profile-section__save-btn"
                  onClick={handleSaveTruck}
                  type="button"
                >
                  <Save size={14} aria-hidden="true" /> Save
                </button>
              </div>

              <div className="profile-truck-photo">
                <ImageUploader
                  category="truck-photo"
                  currentImage={truckPhotoPreview || (user && user.truck ? user.truck.photo : null)}
                  onUpload={handleTruckPhotoUpload}
                  label="Truck Photo"
                  previewShape="rectangle"
                  userId={user ? user.id : 'guest'}
                />
              </div>

              <div className="profile-form">
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="truck-number">Truck Number</label>
                  <input
                    id="truck-number"
                    type="text"
                    className="profile-form__input"
                    value={truckNumber}
                    onChange={function (e) { setTruckNumber(e.target.value.toUpperCase()); }}
                    placeholder="e.g. BR01AB1234"
                  />
                </div>

                <div className="profile-form__row">
                  <div className="profile-form__group profile-form__group--half">
                    <label className="profile-form__label" htmlFor="truck-type">Truck Type</label>
                    <select
                      id="truck-type"
                      className="profile-form__select"
                      value={truckType}
                      onChange={function (e) { setTruckType(e.target.value); }}
                    >
                      <option value="">Select Type</option>
                      <option value="mini">Mini Truck</option>
                      <option value="full">Full Truck</option>
                      <option value="trailer">Trailer</option>
                    </select>
                  </div>
                  <div className="profile-form__group profile-form__group--half">
                    <label className="profile-form__label" htmlFor="truck-capacity">Capacity (Tonnes)</label>
                    <input
                      id="truck-capacity"
                      type="number"
                      className="profile-form__input"
                      value={truckCapacity}
                      onChange={function (e) { setTruckCapacity(e.target.value); }}
                      placeholder="e.g. 20"
                      min="1"
                      max="40"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Business Info Tab (Shipper) ────────────── */}
          {activeTab === 'business' && role === 'shipper' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">Business Information</h2>
                <button
                  className="profile-section__save-btn"
                  onClick={handleSaveBusiness}
                  type="button"
                >
                  <Save size={14} aria-hidden="true" /> Save
                </button>
              </div>

              <div className="profile-form">
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="biz-name">Business Name</label>
                  <input
                    id="biz-name"
                    type="text"
                    className="profile-form__input"
                    value={businessName}
                    onChange={function (e) { setBusinessName(e.target.value); }}
                    placeholder="Enter business name"
                  />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="biz-gst">GST Number (optional)</label>
                  <input
                    id="biz-gst"
                    type="text"
                    className="profile-form__input"
                    value={gstNumber}
                    onChange={function (e) { setGstNumber(e.target.value.toUpperCase()); }}
                    placeholder="e.g. 22AAAAA0000A1Z5"
                  />
                </div>
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="biz-address">Business Address</label>
                  <textarea
                    id="biz-address"
                    className="profile-form__textarea"
                    value={businessAddress}
                    onChange={function (e) { setBusinessAddress(e.target.value); }}
                    placeholder="Enter your business address"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Documents Tab ──────────────────────────── */}
          {activeTab === 'documents' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">KYC Documents</h2>
              </div>

              <div className="profile-docs">
                {/* ── Driving License ── */}
                <div className="profile-doc-card profile-doc-card--upload">
                  <div className="profile-doc-card__info">
                    <FileText size={20} className="profile-doc-card__icon" aria-hidden="true" />
                    <div>
                      <h3 className="profile-doc-card__title">Driving License</h3>
                      <p className="profile-doc-card__desc">Upload your valid driving license</p>
                    </div>
                    {docs.license === 'submitted' && (
                      <span className="profile-doc-card__status profile-doc-card__status--submitted">
                        <CheckCircle size={14} aria-hidden="true" /> Submitted
                      </span>
                    )}
                  </div>
                  <div className="profile-doc-card__uploader">
                    <ImageUploader
                      category="kyc-document"
                      currentImage={kycPreviews.license}
                      onUpload={function (result) { handleKycUpload('license', result); }}
                      label="License Photo / Scan"
                      previewShape="document"
                      userId={user ? user.id : 'guest'}
                    />
                  </div>
                </div>

                {/* ── RC Book ── */}
                <div className="profile-doc-card profile-doc-card--upload">
                  <div className="profile-doc-card__info">
                    <FileText size={20} className="profile-doc-card__icon" aria-hidden="true" />
                    <div>
                      <h3 className="profile-doc-card__title">RC Book</h3>
                      <p className="profile-doc-card__desc">Vehicle registration certificate</p>
                    </div>
                    {docs.rc === 'submitted' && (
                      <span className="profile-doc-card__status profile-doc-card__status--submitted">
                        <CheckCircle size={14} aria-hidden="true" /> Submitted
                      </span>
                    )}
                  </div>
                  <div className="profile-doc-card__uploader">
                    <ImageUploader
                      category="kyc-document"
                      currentImage={kycPreviews.rc}
                      onUpload={function (result) { handleKycUpload('rc', result); }}
                      label="RC Book Photo / Scan"
                      previewShape="document"
                      userId={user ? user.id : 'guest'}
                    />
                  </div>
                </div>

                {/* ── Insurance ── */}
                <div className="profile-doc-card profile-doc-card--upload">
                  <div className="profile-doc-card__info">
                    <FileText size={20} className="profile-doc-card__icon" aria-hidden="true" />
                    <div>
                      <h3 className="profile-doc-card__title">Insurance</h3>
                      <p className="profile-doc-card__desc">Vehicle insurance document</p>
                    </div>
                    {docs.insurance === 'submitted' && (
                      <span className="profile-doc-card__status profile-doc-card__status--submitted">
                        <CheckCircle size={14} aria-hidden="true" /> Submitted
                      </span>
                    )}
                  </div>
                  <div className="profile-doc-card__uploader">
                    <ImageUploader
                      category="kyc-document"
                      currentImage={kycPreviews.insurance}
                      onUpload={function (result) { handleKycUpload('insurance', result); }}
                      label="Insurance Document Photo / Scan"
                      previewShape="document"
                      userId={user ? user.id : 'guest'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Security Tab ───────────────────────────── */}
          {activeTab === 'security' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">Change Password</h2>
              </div>

              <div className="profile-form">
                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="current-pass">Current Password</label>
                  <div className="profile-form__input-wrap profile-form__input-wrap--pass">
                    <input
                      id="current-pass"
                      type={showPassword ? 'text' : 'password'}
                      className="profile-form__input"
                      value={currentPassword}
                      onChange={function (e) { setCurrentPassword(e.target.value); }}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="profile-form__eye-btn"
                      onClick={function () { setShowPassword(!showPassword); }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="new-pass">New Password</label>
                  <input
                    id="new-pass"
                    type="password"
                    className="profile-form__input"
                    value={newPassword}
                    onChange={function (e) { setNewPassword(e.target.value); }}
                    placeholder="Enter new password"
                  />
                  {newPassword && (
                    <div className="profile-strength">
                      <div className="profile-strength__bar">
                        <div
                          className="profile-strength__fill"
                          style={{ width: strength + '%', background: getStrengthColor(strength) }}
                        />
                      </div>
                      <span className="profile-strength__label" style={{ color: getStrengthColor(strength) }}>
                        {getStrengthLabel(strength)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="profile-form__group">
                  <label className="profile-form__label" htmlFor="confirm-pass">Confirm New Password</label>
                  <input
                    id="confirm-pass"
                    type="password"
                    className="profile-form__input"
                    value={confirmPassword}
                    onChange={function (e) { setConfirmPassword(e.target.value); }}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  className="profile-form__submit-btn"
                  onClick={handleChangePassword}
                  type="button"
                >
                  <ShieldCheck size={16} aria-hidden="true" /> Update Password
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications Tab ──────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="profile-section profile-section--enter">
              <div className="profile-section__header">
                <h2 className="profile-section__title">Notification Preferences</h2>
              </div>

              <div className="profile-notifs">
                {[
                  { key: 'bookingRequests', label: 'Booking Requests', desc: 'Get notified when someone sends a booking request' },
                  { key: 'bookingUpdates', label: 'Booking Updates', desc: 'Updates on accepted, rejected, or completed bookings' },
                  { key: 'promotions', label: 'Promotions', desc: 'Offers, discounts, and platform updates' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive important alerts via SMS' },
                  { key: 'whatsappAlerts', label: 'WhatsApp Alerts', desc: 'Get notifications on WhatsApp' },
                  { key: 'emailDigest', label: 'Weekly Email Digest', desc: 'Summary of your activity sent weekly' }
                ].map(function (item) {
                  return (
                    <div className="profile-notif-row" key={item.key}>
                      <div className="profile-notif-row__info">
                        <span className="profile-notif-row__label">{item.label}</span>
                        <span className="profile-notif-row__desc">{item.desc}</span>
                      </div>
                      <button
                        className={'profile-notif-toggle' + (notifs[item.key] ? ' profile-notif-toggle--on' : '')}
                        onClick={function () { handleNotifToggle(item.key); }}
                        type="button"
                        aria-label={'Toggle ' + item.label}
                      >
                        <span className="profile-notif-toggle__thumb" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DriverProfile;
