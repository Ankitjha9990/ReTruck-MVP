import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  CheckCircle, Clock, Bell, Phone, Truck, MapPin,
  ArrowRight, Calendar, Package, IndianRupee, Search, RefreshCcw
} from 'lucide-react';
import './BookingConfirm.css';

function BookingConfirm() {
  var navigate = useNavigate();
  var bookingCtx = useBooking();
  var auth = useAuth();

  var animState = useState(false);
  var showContent = animState[0];
  var setShowContent = animState[1];

  useEffect(function () {
    setTimeout(function () { setShowContent(true); }, 600);
  }, []);

  var bk = bookingCtx.draftBooking;

  // Fallback if no draft (direct navigation)
  if (!bk) {
    bk = {
      bookingRef: 'RT2026' + Math.floor(1000 + Math.random() * 9000),
      driverName: 'Driver',
      from: 'Origin',
      to: 'Destination',
      departureDate: new Date().toISOString(),
      cargoType: 'General',
      weight: 10,
      estimatedPrice: 25000,
      tripType: 'standard',
      status: 'pending'
    };
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="booking-confirm-page">

      {/* ─── Success Checkmark ─────────────────────────── */}
      <div className="bc-success-anim">
        <div className="bc-success-circle">
          <svg className="bc-success-svg" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="bc-success-svg__circle" cx="26" cy="26" r="24" fill="none" stroke="var(--color-green, #2ECC8F)" strokeWidth="3" />
            <path className="bc-success-svg__check" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M15 27 l6 6 l12 -14" />
          </svg>
        </div>
        <h1 className="bc-success-title">Booking Request Sent!</h1>
        <p className="bc-success-subtitle">
          Your request has been sent to <strong>{bk.driverName}</strong>
        </p>
      </div>

      {/* ─── Booking Summary Card ──────────────────────── */}
      <div className={'bc-summary-card' + (showContent ? ' bc-summary-card--visible' : '')}>
        <div className="bc-summary-card__badge">
          <span>Booking #{bk.bookingRef}</span>
          <span className="bc-summary-card__status">
            <Clock size={12} aria-hidden="true" /> Pending
          </span>
        </div>

        <div className="bc-summary-card__route">
          <MapPin size={16} color="var(--color-green)" aria-hidden="true" />
          <span className="bc-summary-card__city">{bk.from}</span>
          <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
          <span className="bc-summary-card__city">{bk.to}</span>
          <span className={'bc-summary-card__trip bc-summary-card__trip--' + bk.tripType}>
            {bk.tripType === 'return' ? <><RefreshCcw size={10} /> Return</> : <><ArrowRight size={10} /> Std</>}
          </span>
        </div>

        <div className="bc-summary-card__grid">
          <div className="bc-summary-card__item">
            <Truck size={14} aria-hidden="true" />
            <span className="bc-summary-card__item-label">Driver</span>
            <span className="bc-summary-card__item-value">{bk.driverName}</span>
          </div>
          <div className="bc-summary-card__item">
            <Calendar size={14} aria-hidden="true" />
            <span className="bc-summary-card__item-label">Departure</span>
            <span className="bc-summary-card__item-value">{formatDate(bk.departureDate)}</span>
          </div>
          <div className="bc-summary-card__item">
            <Package size={14} aria-hidden="true" />
            <span className="bc-summary-card__item-label">Cargo</span>
            <span className="bc-summary-card__item-value">{bk.cargoType} · {bk.weight}T</span>
          </div>
          <div className="bc-summary-card__item">
            <IndianRupee size={14} aria-hidden="true" />
            <span className="bc-summary-card__item-label">Est. Price</span>
            <span className="bc-summary-card__item-value bc-summary-card__item-value--price">₹{(bk.estimatedPrice || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ─── Next Steps ────────────────────────────────── */}
      <div className={'bc-next-steps' + (showContent ? ' bc-next-steps--visible' : '')}>
        <h3 className="bc-next-steps__title">What happens next?</h3>
        <div className="bc-next-steps__flow">
          <div className="bc-next-step">
            <div className="bc-next-step__icon bc-next-step__icon--pending">
              <Clock size={20} aria-hidden="true" />
            </div>
            <div className="bc-next-step__content">
              <span className="bc-next-step__label">Step 1</span>
              <h4 className="bc-next-step__title">Driver Reviews</h4>
              <p className="bc-next-step__desc">The driver will review your request within 24 hours</p>
            </div>
          </div>
          <div className="bc-next-step__connector" />
          <div className="bc-next-step">
            <div className="bc-next-step__icon bc-next-step__icon--notify">
              <Bell size={20} aria-hidden="true" />
            </div>
            <div className="bc-next-step__content">
              <span className="bc-next-step__label">Step 2</span>
              <h4 className="bc-next-step__title">Get Notified</h4>
              <p className="bc-next-step__desc">You'll receive a notification when the driver confirms</p>
            </div>
          </div>
          <div className="bc-next-step__connector" />
          <div className="bc-next-step">
            <div className="bc-next-step__icon bc-next-step__icon--connect">
              <Phone size={20} aria-hidden="true" />
            </div>
            <div className="bc-next-step__content">
              <span className="bc-next-step__label">Step 3</span>
              <h4 className="bc-next-step__title">Connect Directly</h4>
              <p className="bc-next-step__desc">Coordinate pickup and delivery details with the driver</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTAs ──────────────────────────────────────── */}
      <div className={'bc-actions' + (showContent ? ' bc-actions--visible' : '')}>
        <button
          className="bc-action-btn bc-action-btn--primary"
          onClick={function () { navigate('/dashboard'); }}
          type="button"
        >
          View My Bookings
        </button>
        <button
          className="bc-action-btn bc-action-btn--ghost"
          onClick={function () { navigate('/trucks'); }}
          type="button"
        >
          <Search size={16} aria-hidden="true" /> Find More Trucks
        </button>
      </div>
    </div>
  );
}

export default BookingConfirm;
