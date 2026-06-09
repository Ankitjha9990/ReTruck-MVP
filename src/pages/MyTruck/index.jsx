import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import ImageUploader from '../../components/common/ImageUploader/ImageUploader.jsx';
import { fileToBase64 } from '../../services/imageUploadService.js';
import { Truck, Save, Camera, AlertCircle, Info } from 'lucide-react';
import './MyTruck.css';

function MyTruck() {
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;

  // Local state for form fields
  var truckNumberState = useState(user && user.truck ? user.truck.number || '' : '');
  var truckNumber = truckNumberState[0];
  var setTruckNumber = truckNumberState[1];

  var truckTypeState = useState(user && user.truck ? user.truck.type || '' : '');
  var truckType = truckTypeState[0];
  var setTruckType = truckTypeState[1];

  var truckCapacityState = useState(user && user.truck ? user.truck.capacity || '' : '');
  var truckCapacity = truckCapacityState[0];
  var setTruckCapacity = truckCapacityState[1];

  var [isSaving, setIsSaving] = useState(false);

  // Track uploaded truck photo preview
  var truckPhotoState = useState(user && user.truck ? user.truck.photo : null);
  var truckPhotoPreview = truckPhotoState[0];
  var setTruckPhotoPreview = truckPhotoState[1];

  // Sync if auth user changes
  useEffect(function () {
    if (user && user.truck) {
      setTruckNumber(user.truck.number || '');
      setTruckType(user.truck.type || '');
      setTruckCapacity(user.truck.capacity || '');
      if (user.truck.photo && !truckPhotoPreview) {
        setTruckPhotoPreview(user.truck.photo);
      }
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    if (!truckNumber.trim()) {
      toast.showToast('Please enter your truck number.', 'error');
      return;
    }
    if (!truckType) {
      toast.showToast('Please select your truck type.', 'error');
      return;
    }
    if (!truckCapacity || parseInt(truckCapacity) <= 0) {
      toast.showToast('Please enter a valid weight capacity.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      var result = await auth.updateUser({
        truck: {
          number: truckNumber,
          type: truckType,
          capacity: parseInt(truckCapacity) || 0,
          photo: truckPhotoPreview || (user && user.truck && user.truck.photo ? user.truck.photo : 'https://picsum.photos/seed/truck_' + (user ? user.id : 'default') + '/400/250')
        }
      });

      if (result && result.error) {
        toast.showToast('Failed to save truck details: ' + (result.error.message || 'Unknown error'), 'error');
      } else {
        toast.showToast('Truck details saved successfully!', 'success');
      }
    } catch (err) {
      toast.showToast('Failed to save truck details. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTruckPhotoUpload(uploadResult) {
    try {
      var base64 = await fileToBase64(uploadResult.file);
      setTruckPhotoPreview(base64);
      toast.showToast('Truck photo selected! Click Save to apply.', 'success');
    } catch (err) {
      toast.showToast('Failed to process truck photo.', 'error');
    }
  }

  return (
    <DashboardLayout activeTab="truck">
      <div className="my-truck-page">
        {/* Header */}
        <div className="mt-header">
          <div className="mt-header__text">
            <h1 className="mt-title">My Truck</h1>
            <p className="mt-subtitle">Configure your vehicle specifications and capacity thresholds.</p>
          </div>
        </div>

        <div className="mt-content-grid">
          {/* Left Column - Card Preview */}
          <div className="mt-preview-col">
            <div className="mt-card">
              <div className="mt-card__image-container">
                <img
                  src={truckPhotoPreview || (user && user.truck && user.truck.photo ? user.truck.photo : 'https://i.pinimg.com/736x/cb/da/28/cbda28760ef2fe7bb593ddf8c4588e7b.jpg')}
                  alt="My Truck"
                  className="mt-card__img"
                />
              </div>

              <div className="mt-card__body">
                <div className="mt-card__badge-row">
                  <span className="mt-card__badge">
                    <Truck size={14} />
                    Active Fleet
                  </span>
                </div>
                <h2 className="mt-card__number">{truckNumber || 'BR-01-GB-7890'}</h2>
                <div className="mt-card__specs">
                  <div className="mt-card__spec">
                    <span className="mt-card__spec-label">TYPE</span>
                    <span className="mt-card__spec-val">
                      {truckType === 'mini' ? 'Mini Truck' : truckType === 'full' ? 'Full Truck' : truckType === 'trailer' ? 'Trailer' : 'Not Set'}
                    </span>
                  </div>
                  <div className="mt-card__spec-divider"></div>
                  <div className="mt-card__spec">
                    <span className="mt-card__spec-label">CAPACITY</span>
                    <span className="mt-card__spec-val">{truckCapacity ? truckCapacity + ' Tons' : 'Not Set'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-info-box">
              <Info size={18} className="mt-info-box__icon" />
              <p className="mt-info-box__text">
                Keeping your truck capacity and specifications accurate helps ReTruck match you with matching shippers.
              </p>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="mt-form-col">
            <div className="mt-form-card">
              <h3 className="mt-form-card__title">Vehicle Specifications</h3>

              {/* Truck Photo Uploader */}
              <div className="mt-photo-uploader">
                <ImageUploader
                  category="truck-photo"
                  currentImage={truckPhotoPreview}
                  onUpload={handleTruckPhotoUpload}
                  label="Truck Photo"
                  previewShape="rectangle"
                  userId={user ? user.id : 'guest'}
                />
              </div>

              <form onSubmit={handleSave} className="mt-form">
                <div className="mt-form__group">
                  <label className="mt-form__label" htmlFor="truck-num">Truck Registration Number</label>
                  <input
                    id="truck-num"
                    type="text"
                    className="mt-form__input"
                    value={truckNumber}
                    onChange={function (e) { setTruckNumber(e.target.value.toUpperCase()); }}
                    placeholder="e.g. BR-01-GB-7890"
                    maxLength={15}
                  />
                  <span className="mt-form__help">Enter your vehicle's commercial registration plate number.</span>
                </div>

                <div className="mt-form__row">
                  <div className="mt-form__group mt-form__group--half">
                    <label className="mt-form__label" htmlFor="truck-type-select">Truck Type</label>
                    <select
                      id="truck-type-select"
                      className="mt-form__select"
                      value={truckType}
                      onChange={function (e) { setTruckType(e.target.value); }}
                    >
                      <option value="">Select Type</option>
                      <option value="mini">Mini Truck (1-3T)</option>
                      <option value="full">Full Truck (5-16T)</option>
                      <option value="trailer">Trailer (20-40T)</option>
                    </select>
                  </div>

                  <div className="mt-form__group mt-form__group--half">
                    <label className="mt-form__label" htmlFor="truck-cap-num">Max Capacity (Tons)</label>
                    <input
                      id="truck-cap-num"
                      type="number"
                      className="mt-form__input"
                      value={truckCapacity}
                      onChange={function (e) { setTruckCapacity(e.target.value); }}
                      placeholder="e.g. 10"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={'mt-form__submit' + (isSaving ? ' mt-form__submit--saving' : '')}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  <span>{isSaving ? 'Saving...' : 'Save Truck Details'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyTruck;
