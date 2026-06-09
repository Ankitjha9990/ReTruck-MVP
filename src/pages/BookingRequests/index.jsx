import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Inbox, Clock, CheckCircle, XCircle, MapPin, ArrowRight,
  Phone, Calendar, Package, FileText, ChevronRight, User,
  Building2, CheckCircle2, XCircle as XCircleIcon
} from 'lucide-react';
import { getBookingsForDriver, updateBookingStatus } from '../../services/bookingService.js';
import { adaptBookings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './BookingRequests.css';

function BookingRequests() {
  var toast = useToast();

  var tabState = useState('All');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var bookingsState = useState([]);
  var bookings = bookingsState[0];
  var setBookings = bookingsState[1];

  var loadBookings = useCallback(async function () {
    var result = await getBookingsForDriver();
    if (result.data) {
      setBookings(adaptBookings(result.data));
    }
  }, []);

  useEffect(function () {
    loadBookings();
  }, [loadBookings]);

  // Realtime: new bookings appear automatically
  useRealtime('bookings', loadBookings, 'booking_requests');

  async function handleAccept(bookingId) {
    var result = await updateBookingStatus(bookingId, 'confirmed');
    if (!result.error) {
      setBookings(bookings.map(function (b) {
        if (String(b.id) === String(bookingId)) {
          return Object.assign({}, b, { status: 'confirmed' });
        }
        return b;
      }));
      toast.showToast('Booking request accepted successfully!', 'success');
    }
  }

  async function handleReject(bookingId) {
    var result = await updateBookingStatus(bookingId, 'rejected');
    if (!result.error) {
      setBookings(bookings.map(function (b) {
        if (String(b.id) === String(bookingId)) {
          return Object.assign({}, b, { status: 'rejected' });
        }
        return b;
      }));
      toast.showToast('Booking request rejected.', 'info');
    }
  }

  function formatDate(dateStr) {
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  }

  // Filter bookings based on status
  var filteredBookings = bookings.filter(function (booking) {
    if (activeTab === 'All') return true;
    return booking.status === activeTab.toLowerCase();
  });

  return (
    <DashboardLayout activeTab="requests">
      <div className="booking-requests-page">
        {/* Header */}
        <div className="br-header">
          <div className="br-header__text">
            <h1 className="br-title">Booking Requests</h1>
            <p className="br-subtitle">Review, accept, or reject incoming transportation requests.</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="br-tabs">
          {['All', 'Pending', 'Confirmed', 'Rejected'].map(function (tab) {
            var count = 0;
            if (tab === 'All') count = bookings.length;
            else count = bookings.filter(function (b) { return b.status === tab.toLowerCase(); }).length;

            return (
              <button
                key={tab}
                className={'br-tab-btn' + (activeTab === tab ? ' br-tab-btn--active' : '')}
                onClick={function () { setActiveTab(tab); }}
                type="button"
              >
                {tab}
                <span className="br-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Requests List */}
        {filteredBookings.length === 0 ? (
          <div className="br-empty">
            <Inbox size={48} color="var(--color-text-muted)" aria-hidden="true" />
            <h3 className="br-empty__title">No {activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase()} requests</h3>
            <p className="br-empty__subtitle">When shippers book your listed routes, their requests will appear here.</p>
          </div>
        ) : (
          <div className="br-list">
            {filteredBookings.map(function (request, index) {
              return (
                <div
                  key={request.id}
                  className="br-card"
                  style={{ animationDelay: (index * 80) + 'ms' }}
                >
                  <div className="br-card__header">
                    <div className="br-card__shipper-info">
                      <div className="br-card__icon-wrap">
                        <Building2 size={18} color="var(--color-navy)" />
                      </div>
                      <div>
                        <h3 className="br-card__shipper-business">{request.shipperBusiness}</h3>
                        <div className="br-card__shipper-name-row">
                          <User size={12} color="var(--color-text-secondary)" />
                          <span className="br-card__shipper-name">{request.shipperName}</span>
                          <span className="br-card__ref">ID: #{request.bookingRef}</span>
                        </div>
                      </div>
                    </div>
                    <div className="br-card__price-section">
                      <span className="br-card__price-label">ESTIMATED PAY</span>
                      <span className="br-card__price">₹{request.estimatedPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="br-card__body">
                    {/* Route */}
                    <div className="br-card__route">
                      <MapPin size={16} color="var(--color-green)" aria-hidden="true" />
                      <span className="br-card__city">{request.from}</span>
                      <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
                      <span className="br-card__city">{request.to}</span>
                      {request.tripType === 'return' && (
                        <span className="br-card__badge-return">Return Trip</span>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="br-card__details-grid">
                      <div className="br-card__detail">
                        <Calendar size={14} color="var(--color-text-muted)" />
                        <span><strong>Departure:</strong> {formatDate(request.departureDate)}</span>
                      </div>
                      <div className="br-card__detail">
                        <Package size={14} color="var(--color-text-muted)" />
                        <span><strong>Cargo:</strong> {request.cargoType} ({request.weight} Tons)</span>
                      </div>
                      {request.shipperPhone && (
                        <div className="br-card__detail">
                          <Phone size={14} color="var(--color-text-muted)" />
                          <span><strong>Contact:</strong> +91 {request.shipperPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Pickup Address */}
                    <div className="br-card__address">
                      <MapPin size={14} color="var(--color-text-muted)" />
                      <span><strong>Pickup Address:</strong> {request.pickupAddress}</span>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="br-card__notes">
                        <FileText size={14} color="var(--color-text-muted)" />
                        <span><strong>Notes:</strong> {request.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="br-card__footer">
                    <span className={'br-status-tag br-status-tag--' + request.status}>
                      {request.status.toUpperCase()}
                    </span>

                    {request.status === 'pending' && (
                      <div className="br-card__actions">
                        <button
                          className="br-card__btn br-card__btn--accept"
                          onClick={function () { handleAccept(request.id); }}
                          type="button"
                        >
                          <CheckCircle2 size={16} />
                          Accept Request
                        </button>
                        <button
                          className="br-card__btn br-card__btn--reject"
                          onClick={function () { handleReject(request.id); }}
                          type="button"
                        >
                          <XCircleIcon size={16} />
                          Reject
                        </button>
                      </div>
                    )}
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

export default BookingRequests;
