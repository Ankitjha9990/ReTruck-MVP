import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  ArrowLeft, MapPin, ArrowRight, Truck, Calendar, Package, Weight,
  Clock, CheckCircle2, Phone, MessageSquare, FileText, RefreshCcw,
  BadgeCheck, Star, ShieldCheck, XCircle, AlertCircle, Download
} from 'lucide-react';
import './BookingDetails.css';
import { getBookingById } from '../../services/bookingService.js';
import { adaptBooking } from '../../services/dataAdapters.js';

function BookingDetails() {
  var params = useParams();
  var navigate = useNavigate();
  var auth = useAuth();
  var search = useSearch();
  var toast = useToast();

  var [booking, setBooking] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadBooking() {
      var result = await getBookingById(params.id);
      if (result.data) {
        setBooking(adaptBooking(result.data));
      }
      setLoading(false);
    }
    loadBooking();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout activeTab="bookings">
        <div className="bd-loading">
          <div className="bd-loading__spinner" />
          <p>Loading booking details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout activeTab="bookings">
        <div className="bd-error">
          <AlertCircle size={48} color="var(--color-error)" aria-hidden="true" />
          <h2 className="bd-error__title">Booking Not Found</h2>
          <p className="bd-error__subtitle">We couldn't retrieve the details for this booking ID. It may have been deleted.</p>
          <button className="bd-error__cta" onClick={function () { navigate('/dashboard/bookings'); }} type="button">
            Back to Bookings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function formatFullDate(dateStr) {
    return new Date(dateStr).toLocaleString('en-IN', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function getStatusBadgeClass(status) {
    if (status === 'pending') return 'bd-status--warning';
    if (status === 'confirmed') return 'bd-status--success';
    if (status === 'rejected') return 'bd-status--error';
    if (status === 'completed') return 'bd-status--info';
    return 'bd-status--muted';
  }

  function getStatusLabel(status) {
    if (status === 'pending') return 'Pending Confirmation';
    if (status === 'confirmed') return 'Confirmed (In Transit)';
    if (status === 'rejected') return 'Booking Rejected';
    if (status === 'completed') return 'Shipment Completed';
    return status;
  }

  // Book Similar Route Handler
  function handleBookSimilar() {
    search.setFilters({
      from: booking.from,
      to: booking.to,
      date: '',
      tripType: booking.tripType || 'all'
    });
    toast.showToast('Pre-filled route filters for standard search', 'success');
    navigate('/trucks');
  }

  // Simulated download
  function handleDownloadReceipt() {
    toast.showToast('Downloading receipt receipt_' + booking.bookingRef + '.pdf...', 'success');
  }

  // Simulated call
  function handleContact() {
    toast.showToast('Connecting you with driver ' + booking.driverName + ' (+91 ' + (booking.driverPhone || '98765 43210') + ')...', 'success');
  }

  // Status index for timeline awareness
  var statusIndex = 0;
  if (booking.status === 'pending') statusIndex = 1;
  else if (booking.status === 'confirmed') statusIndex = 3;
  else if (booking.status === 'completed') statusIndex = 5;

  function getTruckLabel(type) {
    if (type === 'mini') return 'Mini Truck';
    if (type === 'trailer') return 'Trailer';
    return 'Full Truck';
  }

  var timelineSteps = [
    { title: 'Booking Request Sent', desc: 'Request submitted to driver', time: formatFullDate(booking.createdAt), index: 1 },
    { title: 'Driver Confirmed', desc: 'Booking request accepted by driver', time: booking.status !== 'pending' && booking.status !== 'rejected' ? 'Confirmed' : 'Awaiting', index: 2 },
    { title: 'Pickup Scheduled', desc: 'Truck arriving at pickup address', time: booking.status === 'completed' || booking.status === 'confirmed' ? 'Scheduled' : 'Pending', index: 3 },
    { title: 'In Transit', desc: 'Cargo on the way to destination', time: booking.status === 'completed' || booking.status === 'confirmed' ? 'On the way' : 'Pending', index: 4 },
    { title: 'Delivered Successfully', desc: 'Cargo delivered and verified by receiver', time: booking.status === 'completed' ? formatFullDate(booking.updatedAt) : 'Pending', index: 5 }
  ];

  return (
    <DashboardLayout activeTab="bookings">
      <div className="booking-details-page">
        {/* Back navigation */}
        <button className="bd-back" onClick={function () { navigate('/dashboard/bookings'); }} type="button">
          <ArrowLeft size={16} />
          <span>Back to Bookings</span>
        </button>

        {/* ─── Header Info ─────────────────────────────────── */}
        <section className="bd-header-card">
          <div className="bd-header-card__left">
            <span className="bd-header-card__ref">BOOKING REFERENCE: #{booking.bookingRef}</span>
            <h1 className="bd-header-card__route">
              <span>{booking.from}</span>
              <ArrowRight size={20} className="bd-header-card__arrow" />
              <span>{booking.to}</span>
            </h1>
            <span className="bd-header-card__date">Requested on {formatDate(booking.createdAt)}</span>
          </div>

          <div className="bd-header-card__right">
            <span className={'bd-status-badge ' + getStatusBadgeClass(booking.status)}>
              {getStatusLabel(booking.status)}
            </span>
            <span className="bd-header-card__price">₹{(booking.estimatedPrice || 0).toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* ─── Columns Layout ─────────────────────────────── */}
        <div className="bd-grid">
          {/* Left panel: Timeline & Cargo Details */}
          <div className="bd-grid__left">
            {/* Shipment Lifecycle Timeline */}
            <section className="bd-card">
              <h2 className="bd-card__title">Shipment Progress</h2>
              
              {booking.status === 'rejected' ? (
                <div className="bd-rejected-banner">
                  <XCircle size={24} color="var(--color-error)" aria-hidden="true" />
                  <div>
                    <h3 className="bd-rejected-banner__title">Booking Rejected</h3>
                    <p className="bd-rejected-banner__desc">This booking request was declined by the driver. No charges have been made.</p>
                  </div>
                </div>
              ) : (
                <div className="bd-timeline">
                  {timelineSteps.map(function (step) {
                    var isCompleted = statusIndex >= step.index;
                    var isActive = statusIndex === step.index;
                    var isLast = step.index === 5;

                    return (
                      <div
                        key={step.index}
                        className={
                          'bd-timeline-step' +
                          (isCompleted ? ' bd-timeline-step--completed' : '') +
                          (isActive ? ' bd-timeline-step--active' : '')
                        }
                      >
                        <div className="bd-timeline-step__left">
                          <div className="bd-timeline-step__node">
                            {isCompleted ? <CheckCircle2 size={16} aria-hidden="true" /> : <Clock size={16} aria-hidden="true" />}
                          </div>
                          {!isLast && <div className="bd-timeline-step__connector" />}
                        </div>
                        <div className="bd-timeline-step__right">
                          <h4 className="bd-timeline-step__title">{step.title}</h4>
                          <p className="bd-timeline-step__desc">{step.desc}</p>
                          <span className="bd-timeline-step__time">{step.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Cargo Breakdown */}
            <section className="bd-card">
              <h2 className="bd-card__title">Cargo & Shipment Breakdown</h2>
              
              <div className="bd-cargo-grid">
                <div className="bd-cargo-item">
                  <Package size={18} color="var(--color-text-secondary)" aria-hidden="true" />
                  <div>
                    <span className="bd-cargo-item__label">CARGO TYPE</span>
                    <span className="bd-cargo-item__value">{booking.cargoType}</span>
                  </div>
                </div>
                <div className="bd-cargo-item">
                  <Weight size={18} color="var(--color-text-secondary)" aria-hidden="true" />
                  <div>
                    <span className="bd-cargo-item__label">WEIGHT (TONNES)</span>
                    <span className="bd-cargo-item__value">{booking.weight} T</span>
                  </div>
                </div>
                <div className="bd-cargo-item">
                  <Calendar size={18} color="var(--color-text-secondary)" aria-hidden="true" />
                  <div>
                    <span className="bd-cargo-item__label">DEPARTURE DATE</span>
                    <span className="bd-cargo-item__value">{formatDate(booking.departureDate)}</span>
                  </div>
                </div>
                <div className="bd-cargo-item">
                  <Truck size={18} color="var(--color-text-secondary)" aria-hidden="true" />
                  <div>
                    <span className="bd-cargo-item__label">VEHICLE CLASS</span>
                    <span className="bd-cargo-item__value">{getTruckLabel(booking.truckType)}</span>
                  </div>
                </div>
              </div>

              <div className="bd-address-block">
                <div className="bd-address">
                  <div className="bd-address__dot bd-address__dot--green" />
                  <div>
                    <span className="bd-address__label">PICKUP LOCATION</span>
                    <p className="bd-address__text">{booking.pickupAddress}</p>
                  </div>
                </div>
                <div className="bd-address__line" />
                <div className="bd-address">
                  <div className="bd-address__dot bd-address__dot--navy" />
                  <div>
                    <span className="bd-address__label">DELIVERY LOCATION</span>
                    <p className="bd-address__text">{booking.deliveryAddress || 'GIDC Industrial Area, Destination'}</p>
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="bd-notes-block">
                  <span className="bd-notes-block__label">SPECIAL INSTRUCTIONS</span>
                  <p className="bd-notes-block__text">"{booking.notes}"</p>
                </div>
              )}
            </section>
          </div>

          {/* Right panel: Driver & Quick actions */}
          <div className="bd-grid__right">
            {/* Driver Credentials Card */}
            <section className="bd-card bd-card--driver">
              <h2 className="bd-card__title">Carrier Details</h2>
              <div className="bd-driver-profile">
                <div className="bd-driver-avatar-wrap">
                  <img
                    src={booking.driverAvatar || 'https://picsum.photos/seed/driver/100'}
                    alt={booking.driverName}
                    className="bd-driver-avatar"
                  />
                  {booking.driverVerified && (
                    <span className="bd-driver-verified" title="Verified Carrier">✓</span>
                  )}
                </div>
                <div className="bd-driver-info">
                  <h3 className="bd-driver-name">
                    {booking.driverName}
                  </h3>
                  <div className="bd-driver-ratings">
                    <Star size={12} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                    <span>{booking.driverRating || 4.7} · Professional Partner</span>
                  </div>
                  <span className="bd-driver-license">Plate: {booking.truckNumber || 'BR01AB1234'}</span>
                </div>
              </div>

              <div className="bd-driver-actions">
                <button className="bd-driver-btn bd-driver-btn--contact" onClick={handleContact} type="button">
                  <Phone size={16} /> Contact Driver
                </button>
                <button className="bd-driver-btn bd-driver-btn--chat" onClick={handleContact} type="button">
                  <MessageSquare size={16} /> Chat
                </button>
              </div>
            </section>

            {/* Quick Actions Panel */}
            <section className="bd-card bd-card--actions">
              <h2 className="bd-card__title">Logistics Actions</h2>
              
              <div className="bd-action-buttons">
                <button className="bd-action-btn" onClick={handleDownloadReceipt} type="button">
                  <Download size={16} /> Download Receipt
                </button>
                <button className="bd-action-btn" onClick={handleBookSimilar} type="button">
                  <RefreshCcw size={16} /> Book Similar Route
                </button>
                <button
                  className="bd-action-btn bd-action-btn--support"
                  onClick={function () { toast.showToast('Raising support ticket...', 'success'); }}
                  type="button"
                >
                  <ShieldCheck size={16} /> Contact Support
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default BookingDetails;
