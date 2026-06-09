import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Building2, User, Phone, Mail, MapPin, ShieldCheck, FileText,
  Upload, CheckCircle, AlertCircle, Save, Sparkles, Building, Briefcase, Camera
} from 'lucide-react';
import { processImageUpload, fileToBase64 } from '../../services/imageUploadService.js';
import './BusinessProfile.css';

function BusinessProfile() {
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;

  // Form states
  var [businessName, setBusinessName] = useState(user ? (user.businessName || 'Agro Foods Ltd.') : 'Agro Foods Ltd.');
  var [contactName, setContactName] = useState(user ? user.name : 'Suresh Agarwal');
  var [phone, setPhone] = useState(user ? (user.phone || '9988776655') : '9988776655');
  var [email, setEmail] = useState(user ? (user.email || 'suresh@agrofoods.com') : 'suresh@agrofoods.com');
  var [address, setAddress] = useState(user ? (user.city || 'Navi Mumbai Industrial Area, Maharashtra') : 'Navi Mumbai Industrial Area, Maharashtra');
  var [gstNumber, setGstNumber] = useState(user ? (user.gstNo || '22AAAAA0000A1Z5') : '22AAAAA0000A1Z5');

  // Avatar upload preview state
  var [avatarPreview, setAvatarPreview] = useState(user ? (user.avatar_url || user.avatar) : null);

  // Sync form states and avatar when user details load or update
  useEffect(function () {
    if (user) {
      setBusinessName(user.businessName || '');
      setContactName(user.name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.city || '');
      setGstNumber(user.gstNo || '');
      setAvatarPreview(user.avatar_url || user.avatar || null);
    }
  }, [user]);

  // Documents simulated status
  var [documents, setDocuments] = useState({
    gst: 'submitted',
    incorporation: 'pending',
    addressProof: 'submitted'
  });

  function handleUpload(docType) {
    var updated = Object.assign({}, documents);
    updated[docType] = 'submitted';
    setDocuments(updated);
    toast.showToast('Document uploaded successfully!', 'success');
  }

  async function handleAvatarFileChange(e) {
    var file = e.target.files && e.target.files[0];
    if (file) {
      var result = processImageUpload(file, 'profile-picture', user ? user.id : 'guest');
      if (result.success) {
        try {
          var base64 = await fileToBase64(file);
          setAvatarPreview(base64);
          await auth.updateUser({ avatar_url: base64 });
          toast.showToast('Profile photo updated!', 'success');
        } catch (err) {
          toast.showToast('Failed to process avatar file.', 'error');
        }
      } else {
        toast.showToast(result.error, 'error');
      }
    }
    e.target.value = '';
  }

  function handleSave(e) {
    e.preventDefault();
    auth.updateUser({
      name: contactName,
      businessName: businessName,
      phone: phone,
      email: email,
      city: address,
      gstNo: gstNumber
    });
    toast.showToast('Business Profile saved successfully!', 'success');
  }

  // Calculate KYC Verification percentage
  var docCount = Object.keys(documents).length;
  var submittedCount = Object.values(documents).filter(function (v) { return v === 'submitted'; }).length;
  var verificationPercentage = Math.round((submittedCount / docCount) * 100);

  return (
    <DashboardLayout activeTab="profile">
      <div className="business-profile-page">
        {/* Header */}
        <div className="bp-header">
          <h1 className="bp-title">Business Profile</h1>
          <p className="bp-subtitle">Manage company details, upload corporate registration licenses, and track verification status.</p>
        </div>

        {/* Profile Header section with Avatar Uploader */}
        <div className="bp-profile-header">
          <div className="bp-avatar-section">
            <div className="bp-avatar-wrap">
              <img
                src={avatarPreview || (user ? (user.avatar_url || user.avatar) : 'https://picsum.photos/seed/default/100')}
                alt={user ? user.name : 'Business Profile'}
                className="bp-avatar"
              />
              <label
                className="bp-camera-label"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleAvatarFileChange}
                />
              </label>
            </div>
          </div>
          <div className="bp-header-info">
            <h2 className="bp-header-name">{businessName || user?.businessName || 'Your Company Name'}</h2>
            <span className="bp-header-role">Shipper</span>
          </div>
        </div>

        <div className="bp-grid">
          {/* Left panel: Company details form */}
          <div className="bp-grid__left">
            <form className="bp-card bp-form" onSubmit={handleSave}>
              <div className="bp-card__header bp-card__header--icon">
                <div className="bp-card__icon-wrap">
                  <Building2 size={20} color="var(--color-green)" />
                </div>
                <div>
                  <h3 className="bp-card__title">Company Information</h3>
                  <p className="bp-card__subtitle">Your primary corporate details and billing credentials.</p>
                </div>
              </div>

              <div className="bp-form__group">
                <label className="bp-form__label" htmlFor="bp-bizname">Business Name</label>
                <div className="bp-form__input-wrap">
                  <Building size={16} color="var(--color-text-muted)" aria-hidden="true" />
                  <input
                    id="bp-bizname"
                    type="text"
                    className="bp-form__input"
                    value={businessName}
                    onChange={function (e) { setBusinessName(e.target.value); }}
                    required
                  />
                </div>
              </div>

              <div className="bp-form__row">
                <div className="bp-form__group bp-form__group--half">
                  <label className="bp-form__label" htmlFor="bp-contact">Contact Person</label>
                  <div className="bp-form__input-wrap">
                    <User size={16} color="var(--color-text-muted)" aria-hidden="true" />
                    <input
                      id="bp-contact"
                      type="text"
                      className="bp-form__input"
                      value={contactName}
                      onChange={function (e) { setContactName(e.target.value); }}
                      required
                    />
                  </div>
                </div>
                <div className="bp-form__group bp-form__group--half">
                  <label className="bp-form__label" htmlFor="bp-gst">GSTIN Number</label>
                  <div className="bp-form__input-wrap">
                    <Briefcase size={16} color="var(--color-text-muted)" aria-hidden="true" />
                    <input
                      id="bp-gst"
                      type="text"
                      className="bp-form__input"
                      value={gstNumber}
                      onChange={function (e) { setGstNumber(e.target.value.toUpperCase()); }}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
              </div>

              <div className="bp-form__row">
                <div className="bp-form__group bp-form__group--half">
                  <label className="bp-form__label" htmlFor="bp-phone">Phone Number</label>
                  <div className="bp-form__input-wrap">
                    <Phone size={16} color="var(--color-text-muted)" aria-hidden="true" />
                    <input
                      id="bp-phone"
                      type="tel"
                      className="bp-form__input"
                      value={phone}
                      onChange={function (e) { setPhone(e.target.value); }}
                      required
                    />
                  </div>
                </div>
                <div className="bp-form__group bp-form__group--half">
                  <label className="bp-form__label" htmlFor="bp-email">Corporate Email</label>
                  <div className="bp-form__input-wrap">
                    <Mail size={16} color="var(--color-text-muted)" aria-hidden="true" />
                    <input
                      id="bp-email"
                      type="email"
                      className="bp-form__input"
                      value={email}
                      onChange={function (e) { setEmail(e.target.value); }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bp-form__group">
                <label className="bp-form__label" htmlFor="bp-addr">Business Address</label>
                <div className="bp-form__input-wrap bp-form__input-wrap--textarea">
                  <MapPin size={16} color="var(--color-text-muted)" aria-hidden="true" />
                  <textarea
                    id="bp-addr"
                    className="bp-form__textarea"
                    value={address}
                    onChange={function (e) { setAddress(e.target.value); }}
                    rows={3}
                    required
                  />
                </div>
              </div>

              <button className="bp-save-btn" type="submit">
                <Save size={16} />
                <span>Save Company Details</span>
              </button>
            </form>
          </div>

          {/* Right panel: KYC Verification and Corporate Docs */}
          <div className="bp-grid__right">
            {/* KYC Progress meter */}
            <section className="bp-card bp-kyc">
              <h3 className="bp-card__title">Verification Progress</h3>
              
              <div className="bp-kyc__meter-wrap">
                <div className="bp-kyc__meter">
                  <div className="bp-kyc__meter-fill" style={{ width: verificationPercentage + '%' }} />
                </div>
                <div className="bp-kyc__meter-labels">
                  <span className="bp-kyc__meter-percent">{verificationPercentage}% verified</span>
                  <span className="bp-kyc__meter-count">{submittedCount} of {docCount} files uploaded</span>
                </div>
              </div>

              {verificationPercentage === 100 ? (
                <div className="bp-kyc__status bp-kyc__status--complete">
                  <ShieldCheck size={20} color="var(--color-green)" aria-hidden="true" />
                  <div>
                    <h4 className="bp-kyc__status-title">KYC Verified</h4>
                    <p className="bp-kyc__status-desc">Your enterprise account is fully verified. Premium load bidding active.</p>
                  </div>
                </div>
              ) : (
                <div className="bp-kyc__status bp-kyc__status--pending">
                  <AlertCircle size={20} color="var(--color-warning)" aria-hidden="true" />
                  <div>
                    <h4 className="bp-kyc__status-title">Pending Document Upload</h4>
                    <p className="bp-kyc__status-desc">Complete company incorporation registration upload to achieve 100% verification.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Corporate Documents */}
            <section className="bp-card bp-docs">
              <h3 className="bp-card__title">Verification Documents</h3>
              
              <div className="bp-docs__list">
                {/* GST */}
                <div className="bp-doc-row">
                  <div className="bp-doc-row__icon-wrap">
                    <FileText size={18} />
                  </div>
                  <div className="bp-doc-row__info">
                    <span className="bp-doc-row__label">GST Certificate</span>
                    <span className="bp-doc-row__desc">Goods and Services Tax ID</span>
                  </div>
                  <div className="bp-doc-row__action">
                    {documents.gst === 'submitted' ? (
                      <span className="bp-doc-status bp-doc-status--submitted">
                        <CheckCircle size={12} /> Submitted
                      </span>
                    ) : (
                      <button className="bp-upload-btn" onClick={function () { handleUpload('gst'); }} type="button">
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </div>
                </div>

                {/* Incorporation license */}
                <div className="bp-doc-row">
                  <div className="bp-doc-row__icon-wrap">
                    <FileText size={18} />
                  </div>
                  <div className="bp-doc-row__info">
                    <span className="bp-doc-row__label">Company Incorporation</span>
                    <span className="bp-doc-row__desc">Certificate of incorporation / LLC filing</span>
                  </div>
                  <div className="bp-doc-row__action">
                    {documents.incorporation === 'submitted' ? (
                      <span className="bp-doc-status bp-doc-status--submitted">
                        <CheckCircle size={12} /> Submitted
                      </span>
                    ) : (
                      <button className="bp-upload-btn" onClick={function () { handleUpload('incorporation'); }} type="button">
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </div>
                </div>

                {/* Address Proof */}
                <div className="bp-doc-row">
                  <div className="bp-doc-row__icon-wrap">
                    <FileText size={18} />
                  </div>
                  <div className="bp-doc-row__info">
                    <span className="bp-doc-row__label">Corporate Address Proof</span>
                    <span className="bp-doc-row__desc">Electric bill / rental agreement</span>
                  </div>
                  <div className="bp-doc-row__action">
                    {documents.addressProof === 'submitted' ? (
                      <span className="bp-doc-status bp-doc-status--submitted">
                        <CheckCircle size={12} /> Submitted
                      </span>
                    ) : (
                      <button className="bp-upload-btn" onClick={function () { handleUpload('addressProof'); }} type="button">
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BusinessProfile;
