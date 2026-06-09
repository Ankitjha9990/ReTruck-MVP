import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Star, Search, MapPin, ArrowRight, Truck, Trash2, Calendar,
  BadgeCheck, ChevronRight, Weight, IndianRupee, RefreshCcw
} from 'lucide-react';
import './SavedTrucks.css';

function SavedTrucks() {
  var navigate = useNavigate();
  var toast = useToast();

  var savedTrucksState = useState([]);
  var savedTrucks = savedTrucksState[0];
  var setSavedTrucks = savedTrucksState[1];

  useEffect(function () {
    var stored = localStorage.getItem('retruck_saved_trucks');
    if (stored) {
      try {
        setSavedTrucks(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved trucks', e);
      }
    }
  }, []);

  function handleRemove(e, trkId) {
    e.stopPropagation();
    var updated = savedTrucks.filter(function (t) { return t.id !== trkId; });
    setSavedTrucks(updated);
    localStorage.setItem('retruck_saved_trucks', JSON.stringify(updated));
    toast.showToast('Truck removed from Saved', 'success');
  }

  function getTruckLabel(type) {
    if (type === 'mini') return 'Mini Truck';
    if (type === 'trailer') return 'Trailer';
    return 'Full Truck';
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  return (
    <DashboardLayout activeTab="saved">
      <div className="saved-trucks-page">
        {/* Header */}
        <div className="st-header">
          <div className="st-header__text">
            <h1 className="st-title">Saved Trucks</h1>
            <p className="st-subtitle">Your bookmarked truck listings and preferred carrier fleet partners.</p>
          </div>
          {savedTrucks.length > 0 && (
            <button
              className="st-browse-btn"
              onClick={function () { navigate('/trucks'); }}
              type="button"
            >
              <Search size={16} /> Browse Trucks
            </button>
          )}
        </div>

        {/* Saved Trucks Grid */}
        {savedTrucks.length === 0 ? (
          <div className="st-empty">
            <div className="st-empty__icon-wrap">
              <Star size={40} color="var(--color-text-muted)" fill="var(--color-border)" aria-hidden="true" />
            </div>
            <h3 className="st-empty__title">No saved trucks yet</h3>
            <p className="st-empty__subtitle">Bookmark drivers and truck listings while searching to quickly access them here later.</p>
            <button
              className="st-empty__cta"
              onClick={function () { navigate('/trucks'); }}
              type="button"
            >
              <Search size={16} /> Browse Trucks
            </button>
          </div>
        ) : (
          <div className="st-grid">
            {savedTrucks.map(function (trk, idx) {
              return (
                <div
                  key={trk.id}
                  className="st-card"
                  style={{ animationDelay: (idx * 60) + 'ms' }}
                  onClick={function () { navigate('/trucks/' + trk.id); }}
                >
                  {/* Photo with discount */}
                  <div className="st-card__photo-wrap">
                    <img src={trk.truckPhoto} alt={getTruckLabel(trk.truckType)} className="st-card__photo" />
                    <button
                      className="st-card__delete-btn"
                      onClick={function (e) { handleRemove(e, trk.id); }}
                      type="button"
                      aria-label="Remove saved truck"
                    >
                      <Trash2 size={15} />
                    </button>
                    {trk.discountPercent > 0 && (
                      <span className="st-card__discount">Save {trk.discountPercent}%</span>
                    )}
                  </div>

                  {/* Body details */}
                  <div className="st-card__body">
                    {/* Driver details */}
                    <div className="st-card__driver">
                      <img src={trk.driverAvatar} alt={trk.driverName} className="st-card__avatar" />
                      <div className="st-card__driver-info">
                        <span className="st-card__driver-name">
                          {trk.driverName}
                          {trk.driverVerified && <BadgeCheck size={13} color="var(--color-green)" aria-hidden="true" />}
                        </span>
                        <span className="st-card__driver-rating">
                          <Star size={10} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                          {trk.driverRating} · {trk.tripsCompleted} trips
                        </span>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="st-card__route">
                      <MapPin size={14} color="var(--color-green)" aria-hidden="true" />
                      <span className="st-card__city">{trk.from}</span>
                      <ArrowRight size={12} color="var(--color-text-muted)" aria-hidden="true" />
                      <span className="st-card__city">{trk.to}</span>
                      {trk.tripType === 'return' && (
                        <span className="st-card__return-tag">
                          <RefreshCcw size={9} /> Return
                        </span>
                      )}
                    </div>

                    {/* Specifications */}
                    <div className="st-card__specs">
                      <span className="st-card__spec-item">
                        <Truck size={12} />
                        {getTruckLabel(trk.truckType)}
                      </span>
                      <span className="st-card__spec-item">
                        <Weight size={12} />
                        {trk.availableCapacity}T capacity
                      </span>
                    </div>
                  </div>

                  {/* Footer pricing & actions */}
                  <div className="st-card__footer">
                    <div className="st-card__price-section">
                      <span className="st-card__price-label">ESTIMATED TOTAL</span>
                      <span className="st-card__price">₹{(trk.estimatedTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="st-card__actions">
                      <button
                        className="st-card__book-btn"
                        onClick={function (e) {
                          e.stopPropagation();
                          navigate('/trucks/' + trk.id);
                        }}
                        type="button"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SavedTrucks;
