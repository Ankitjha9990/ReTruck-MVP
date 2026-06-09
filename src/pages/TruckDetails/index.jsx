import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBooking } from '../../context/BookingContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  MapPin, Navigation, Calendar, ArrowRight, RefreshCcw, Star,
  BadgeCheck, Truck, IndianRupee, Package, Weight, Phone,
  MessageCircle, ShieldCheck, Locate, ChevronLeft, ArrowLeft,
  Milestone, Clock, CheckCircle
} from 'lucide-react';
import { getListingById } from '../../services/listingService.js';
import { createBooking } from '../../services/bookingService.js';
import { adaptListing } from '../../services/dataAdapters.js';
import './TruckDetails.css';

function TruckDetails() {
  var params = useParams();
  var navigate = useNavigate();
  var auth = useAuth();
  var booking = useBooking();
  var toast = useToast();

  var truckState = useState(null);
  var truck = truckState[0];
  var setTruck = truckState[1];

  var [savedTrucks, setSavedTrucks] = useState(function () {
    var stored = localStorage.getItem('retruck_saved_trucks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });

  var isSaved = savedTrucks.some(function (t) { return t.id === params.id; });

  function handleSaveToggle() {
    if (!truck) return;
    var updated = [];
    if (isSaved) {
      updated = savedTrucks.filter(function (t) { return t.id !== params.id; });
      toast.showToast('Truck removed from Saved', 'success');
    } else {
      updated = savedTrucks.concat([truck]);
      toast.showToast('Truck saved successfully!', 'success');
    }
    setSavedTrucks(updated);
    localStorage.setItem('retruck_saved_trucks', JSON.stringify(updated));
  }

  var activePhotoState = useState(0);
  var activePhoto = activePhotoState[0];
  var setActivePhoto = activePhotoState[1];

  var bookingSheetState = useState(false);
  var showBookingSheet = bookingSheetState[0];
  var setShowBookingSheet = bookingSheetState[1];

  // Booking form
  var cargoTypeState = useState('');
  var cargoType = cargoTypeState[0];
  var setCargoType = cargoTypeState[1];

  var weightState = useState('');
  var weight = weightState[0];
  var setWeight = weightState[1];

  var pickupState = useState('');
  var pickupAddress = pickupState[0];
  var setPickupAddress = pickupState[1];

  var bookNotesState = useState('');
  var bookNotes = bookNotesState[0];
  var setBookNotes = bookNotesState[1];

  var submittingState = useState(false);
  var isSubmitting = submittingState[0];
  var setIsSubmitting = submittingState[1];

  useEffect(function () {
    async function loadTruck() {
      var result = await getListingById(parseInt(params.id));
      if (result.data) {
        setTruck(adaptListing(result.data));
      }
    }
    loadTruck();
  }, [params.id]);

  if (!truck) {
    return (
      <div className="td-loading">
        <div className="td-loading__spinner" />
        <p>Loading truck details...</p>
      </div>
    );
  }

  var photos = [
    truck.truckPhoto,
    'https://picsum.photos/seed/' + truck.id + '_2/400/250',
    'https://picsum.photos/seed/' + truck.id + '_3/400/250',
    'https://picsum.photos/seed/' + truck.id + '_4/400/250'
  ];

  var mockReviews = [
    { name: 'Suresh Agarwal', rating: 5, text: 'Excellent service! Goods delivered on time and in perfect condition.', date: '2 weeks ago' },
    { name: 'Priya Sharma', rating: 4, text: 'Good driver, very professional. Will book again for next shipment.', date: '1 month ago' },
    { name: 'Ravi Gupta', rating: 5, text: 'Best rates for return trip. Saved 40% compared to broker rates.', date: '2 months ago' }
  ];

  async function handleBookingSubmit() {
    if (!auth.isAuthenticated) {
      toast.showToast('Please login to send a booking request', 'warning');
      navigate('/auth');
      return;
    }

    if (!cargoType || !weight || !pickupAddress) {
      toast.showToast('Please fill all required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    var bookingData = {
      listing_id: parseInt(params.id),
      driver_id: truck.driverId,
      cargo_type: cargoType,
      weight: parseFloat(weight),
      pickup_address: pickupAddress,
      notes: bookNotes,
      estimated_price: truck.estimatedTotal || (truck.pricePerKm * (truck.estimatedDistance || 500)),
      status: 'pending'
    };

    var result = await createBooking(bookingData);

    if (result.error) {
      toast.showToast('Booking failed: ' + result.error.message, 'error');
      setIsSubmitting(false);
      return;
    }

    // Set draft in context for confirmation page
    booking.setDraft({
      id: result.data.id,
      from: truck.from,
      to: truck.to,
      driverName: truck.driverName,
      estimatedPrice: bookingData.estimated_price,
      status: 'pending'
    });

    setIsSubmitting(false);
    navigate('/booking/confirm');
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getTruckLabel(type) {
    if (type === 'mini') return 'Mini Truck';
    if (type === 'trailer') return 'Trailer';
    return 'Full Truck';
  }

  var isLoggedIn = auth.isAuthenticated;

  var pageContent = (
    <div className={'truck-detail-page' + (isLoggedIn ? ' td-page-dashboard' : '')}>
      {/* ─── Back Button & Save ────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button className="td-back-btn" onClick={function () { navigate(-1); }} type="button" style={{ marginBottom: 0 }}>
          <ArrowLeft size={20} aria-hidden="true" /> Back
        </button>
        <button
          onClick={handleSaveToggle}
          type="button"
          style={{
            background: isSaved ? 'var(--color-green-light, #D1FAE5)' : 'var(--color-surface, #FFFFFF)',
            color: isSaved ? 'var(--color-green-text, #065F46)' : 'var(--color-text-secondary, #6B7280)',
            border: '1.5px solid ' + (isSaved ? 'var(--color-green, #2ECC8F)' : 'var(--color-border, #E5E7EB)'),
            borderRadius: 'var(--radius-md, 10px)',
            padding: '8px 16px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 200ms ease'
          }}
        >
          <Star size={16} fill={isSaved ? 'var(--color-green, #2ECC8F)' : 'none'} color={isSaved ? 'var(--color-green, #2ECC8F)' : 'currentColor'} />
          <span>{isSaved ? 'Saved Fleet' : 'Save Fleet'}</span>
        </button>
      </div>

      <div className="td-layout">
        {/* ─── Left Column (Content) ───────────────────── */}
        <div className="td-main">

          {/* Photo Gallery */}
          <div className="td-gallery">
            <img src={photos[activePhoto]} alt="Truck" className="td-gallery__main" />
            <div className="td-gallery__thumbs">
              {photos.map(function (photo, i) {
                return (
                  <button
                    key={i}
                    className={'td-gallery__thumb' + (activePhoto === i ? ' td-gallery__thumb--active' : '')}
                    onClick={function () { setActivePhoto(i); }}
                    type="button"
                  >
                    <img src={photo} alt={'Photo ' + (i + 1)} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Driver Info */}
          <div className="td-card td-driver-card">
            <img src={truck.driverAvatar} alt={truck.driverName} className="td-driver-card__avatar" />
            <div className="td-driver-card__info">
              <h2 className="td-driver-card__name">
                {truck.driverName}
                {truck.driverVerified && <BadgeCheck size={18} color="var(--color-green)" aria-hidden="true" />}
              </h2>
              <div className="td-driver-card__stats">
                <span className="td-driver-card__stat">
                  <Star size={14} fill="#F59E0B" color="#F59E0B" aria-hidden="true" /> {truck.driverRating}
                </span>
                <span className="td-driver-card__stat">
                  <Truck size={14} aria-hidden="true" /> {truck.tripsCompleted} trips
                </span>
                <span className="td-driver-card__stat">
                  <Phone size={14} aria-hidden="true" /> Contact
                </span>
              </div>
            </div>
          </div>

          {/* Truck Details Card */}
          <div className="td-card">
            <h3 className="td-card__title">Truck Details</h3>
            <div className="td-details-grid">
              <div className="td-detail-item">
                <Truck size={16} aria-hidden="true" />
                <span className="td-detail-item__label">Type</span>
                <span className="td-detail-item__value">{getTruckLabel(truck.truckType)}</span>
              </div>
              <div className="td-detail-item">
                <Weight size={16} aria-hidden="true" />
                <span className="td-detail-item__label">Capacity</span>
                <span className="td-detail-item__value">{truck.truckCapacity || truck.availableCapacity} Tonnes</span>
              </div>
              <div className="td-detail-item">
                <ShieldCheck size={16} aria-hidden="true" />
                <span className="td-detail-item__label">Insurance</span>
                <span className="td-detail-item__value">Active</span>
              </div>
              <div className="td-detail-item">
                <Locate size={16} aria-hidden="true" />
                <span className="td-detail-item__label">GPS</span>
                <span className="td-detail-item__value">Available</span>
              </div>
            </div>
          </div>

          {/* Route Details */}
          <div className="td-card">
            <h3 className="td-card__title">Route Details</h3>
            <div className="td-route-visual">
              <div className="td-route-visual__from">
                <div className="td-route-visual__dot td-route-visual__dot--green" />
                <div>
                  <span className="td-route-visual__city">{truck.from}</span>
                  <span className="td-route-visual__state">{truck.fromState || 'Origin'}</span>
                </div>
              </div>
              <div className="td-route-visual__line" />
              <div className="td-route-visual__to">
                <div className="td-route-visual__dot td-route-visual__dot--navy" />
                <div>
                  <span className="td-route-visual__city">{truck.to}</span>
                  <span className="td-route-visual__state">{truck.toState || 'Destination'}</span>
                </div>
              </div>
            </div>
            <div className="td-route-meta">
              <span className={'td-route-meta__badge td-route-meta__badge--' + truck.tripType}>
                {truck.tripType === 'return' ? (
                  <><RefreshCcw size={12} aria-hidden="true" /> Return Trip</>
                ) : (
                  <><ArrowRight size={12} aria-hidden="true" /> Standard Trip</>
                )}
              </span>
              <span className="td-route-meta__item">
                <Calendar size={14} aria-hidden="true" /> {formatDate(truck.departureDate)}
              </span>
              <span className="td-route-meta__item">
                <Milestone size={14} aria-hidden="true" /> {truck.estimatedDistance} km
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="td-card td-price-card">
            <h3 className="td-card__title">Price Breakdown</h3>
            <div className="td-price-rows">
              <div className="td-price-row">
                <span>Base rate</span>
                <span>₹{truck.pricePerKm}/km</span>
              </div>
              <div className="td-price-row">
                <span>Estimated distance</span>
                <span>{truck.estimatedDistance} km</span>
              </div>
              <div className="td-price-row td-price-row--total">
                <span>Estimated Total</span>
                <span>₹{(truck.estimatedTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {truck.tripType === 'return' && truck.marketRate && (
                <div className="td-price-row td-price-row--market">
                  <span>vs Market Rate</span>
                  <span>
                    <s>₹{truck.marketRate.toLocaleString('en-IN')}</s>
                    <span className="td-price-save"> Save {truck.discountPercent}%</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="td-card">
            <h3 className="td-card__title">Reviews</h3>
            <div className="td-reviews">
              {mockReviews.map(function (review, i) {
                return (
                  <div key={i} className="td-review">
                    <div className="td-review__header">
                      <span className="td-review__name">{review.name}</span>
                      <div className="td-review__stars">
                        {[1, 2, 3, 4, 5].map(function (s) {
                          return <Star key={s} size={12} fill={s <= review.rating ? '#F59E0B' : 'none'} color={s <= review.rating ? '#F59E0B' : '#E5E7EB'} aria-hidden="true" />;
                        })}
                      </div>
                    </div>
                    <p className="td-review__text">{review.text}</p>
                    <span className="td-review__date">{review.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Right Column (Booking Panel — desktop) ──── */}
        <div className="td-sidebar">
          <div className="td-booking-panel">
            <h3 className="td-booking-panel__title">Send Booking Request</h3>

            <div className="td-booking-form">
              <div className="td-booking-field">
                <label htmlFor="td-cargo">Cargo Type *</label>
                <select id="td-cargo" value={cargoType} onChange={function (e) { setCargoType(e.target.value); }}>
                  <option value="">Select cargo type</option>
                  <option value="General">General</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Auto Parts">Auto Parts</option>
                  <option value="Textiles">Textiles</option>
                  <option value="FMCG">FMCG</option>
                  <option value="Construction">Construction</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Chemicals">Chemicals</option>
                </select>
              </div>
              <div className="td-booking-field">
                <label htmlFor="td-weight">Weight (Tonnes) *</label>
                <input id="td-weight" type="number" value={weight} onChange={function (e) { setWeight(e.target.value); }} placeholder="e.g. 10" min="0.5" max={truck.availableCapacity} />
              </div>
              <div className="td-booking-field">
                <label htmlFor="td-pickup">Pickup Address *</label>
                <textarea id="td-pickup" value={pickupAddress} onChange={function (e) { setPickupAddress(e.target.value); }} placeholder="Full pickup address" rows={3} />
              </div>
              <div className="td-booking-field">
                <label htmlFor="td-notes">Notes (optional)</label>
                <textarea id="td-notes" value={bookNotes} onChange={function (e) { setBookNotes(e.target.value); }} placeholder="Any special instructions..." rows={2} />
              </div>

              <div className="td-booking-estimate">
                <span>Estimated Price</span>
                <span className="td-booking-estimate__price">₹{(truck.estimatedTotal || 0).toLocaleString('en-IN')}</span>
              </div>

              <button
                className={'td-booking-submit' + (isSubmitting ? ' td-booking-submit--loading' : '')}
                onClick={handleBookingSubmit}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? <span className="td-booking-submit__loader" /> : 'Send Booking Request'}
              </button>
              <p className="td-booking-fine-print">Driver will confirm within 24 hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile CTA + Bottom Sheet ─────────────────── */}
      <button className="td-mobile-cta" onClick={function () { setShowBookingSheet(true); }} type="button">
        <span>₹{(truck.estimatedTotal || 0).toLocaleString('en-IN')}</span>
        <span className="td-mobile-cta__text">Book Now</span>
      </button>

      {showBookingSheet && (
        <>
          <div className="td-sheet-overlay" onClick={function () { setShowBookingSheet(false); }} />
          <div className="td-booking-sheet">
            <div className="td-booking-sheet__header">
              <h3>Send Booking Request</h3>
              <button onClick={function () { setShowBookingSheet(false); }} type="button" aria-label="Close">✕</button>
            </div>
            <div className="td-booking-sheet__body">
              <div className="td-booking-form">
                <div className="td-booking-field">
                  <label htmlFor="td-cargo-m">Cargo Type *</label>
                  <select id="td-cargo-m" value={cargoType} onChange={function (e) { setCargoType(e.target.value); }}>
                    <option value="">Select cargo type</option>
                    <option value="General">General</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Textiles">Textiles</option>
                    <option value="FMCG">FMCG</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div className="td-booking-field">
                  <label htmlFor="td-weight-m">Weight (Tonnes) *</label>
                  <input id="td-weight-m" type="number" value={weight} onChange={function (e) { setWeight(e.target.value); }} placeholder="e.g. 10" />
                </div>
                <div className="td-booking-field">
                  <label htmlFor="td-pickup-m">Pickup Address *</label>
                  <textarea id="td-pickup-m" value={pickupAddress} onChange={function (e) { setPickupAddress(e.target.value); }} placeholder="Full pickup address" rows={2} />
                </div>
                <button className={'td-booking-submit' + (isSubmitting ? ' td-booking-submit--loading' : '')} onClick={handleBookingSubmit} disabled={isSubmitting} type="button">
                  {isSubmitting ? <span className="td-booking-submit__loader" /> : 'Send Booking Request'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isLoggedIn) {
    return (
      <DashboardLayout activeTab="search">
        {pageContent}
      </DashboardLayout>
    );
  }

  return pageContent;
}

export default TruckDetails;
