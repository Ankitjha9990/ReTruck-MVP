import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  ClipboardList, Clock, CheckCircle, XCircle, MapPin, ArrowRight,
  Truck, Calendar, Package, Search, Inbox, RefreshCcw, BadgeCheck,
  ChevronRight, Star
} from 'lucide-react';
import { getBookingsForShipper } from '../../services/bookingService.js';
import { adaptBookings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './MyBookings.css';

var BOOKING_TABS = ['All', 'Pending', 'Confirmed', 'Rejected', 'Completed'];

function MyBookings() {
  var navigate = useNavigate();
  var auth = useAuth();
  var user = auth.user;

  var tabState = useState('All');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var bookingsState = useState([]);
  var bookings = bookingsState[0];
  var setBookings = bookingsState[1];

  var loadBookings = useCallback(async function () {
    var result = await getBookingsForShipper();
    if (result.data) {
      setBookings(adaptBookings(result.data));
    }
  }, []);

  useEffect(function () {
    loadBookings();
  }, [loadBookings, user]);

  // Realtime: booking status updates (confirmed/rejected by driver) reflect instantly
  useRealtime('bookings', loadBookings, 'my_bookings');

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getStatusColor(status) {
    if (status === 'pending') return 'warning';
    if (status === 'confirmed') return 'success';
    if (status === 'rejected') return 'error';
    if (status === 'completed') return 'info';
    return 'muted';
  }

  function getStatusIcon(status) {
    if (status === 'pending') return Clock;
    if (status === 'confirmed') return CheckCircle;
    if (status === 'rejected') return XCircle;
    if (status === 'completed') return CheckCircle;
    return Clock;
  }

  function getTruckLabel(type) {
    if (type === 'mini') return 'Mini Truck';
    if (type === 'trailer') return 'Trailer';
    return 'Full Truck';
  }

  var filteredBookings = activeTab === 'All' ? bookings : bookings.filter(function (b) {
    return b.status === activeTab.toLowerCase();
  });

  return (
    <DashboardLayout activeTab="bookings">
      <div className="my-bookings-page">
        {/* Header */}
        <div className="mb-header">
          <div className="mb-header__text">
            <h1 className="mb-title">My Bookings</h1>
            <p className="mb-subtitle">Track your shipments, view delivery statuses, and monitor active carrier requests.</p>
          </div>
          <button
            className="mb-search-btn"
            onClick={function () { navigate('/trucks'); }}
            type="button"
          >
            <Search size={16} />
            Find More Trucks
          </button>
        </div>

        {/* Tab Filters */}
        <div className="mb-tabs">
          {BOOKING_TABS.map(function (tab) {
            var count = 0;
            if (tab === 'All') count = bookings.length;
            else count = bookings.filter(function (b) { return b.status === tab.toLowerCase(); }).length;

            return (
              <button
                key={tab}
                className={'mb-tab-btn' + (activeTab === tab ? ' mb-tab-btn--active' : '')}
                onClick={function () { setActiveTab(tab); }}
                type="button"
              >
                {tab}
                <span className="mb-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="mb-empty">
            <Inbox size={48} color="var(--color-text-muted)" aria-hidden="true" />
            <h3 className="mb-empty__title">No {activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase()} bookings</h3>
            <p className="mb-empty__subtitle">You don't have any bookings in this section. Start searching for trucks to book a shipment!</p>
            <button
              className="mb-empty__cta"
              onClick={function () { navigate('/trucks'); }}
              type="button"
            >
              <Search size={16} /> Find Trucks
            </button>
          </div>
        ) : (
          <div className="mb-list">
            {filteredBookings.map(function (bk, i) {
              var StatusIcon = getStatusIcon(bk.status);
              return (
                <div
                  key={bk.id || i}
                  className="mb-card"
                  style={{ animationDelay: (i * 60) + 'ms', cursor: 'pointer' }}
                  onClick={function () { navigate('/dashboard/bookings/' + bk.id); }}
                >
                  <div className="mb-card__top">
                    <span className="mb-card__ref">Booking ID: #{bk.bookingRef || 'RT0000'}</span>
                    <span className={'mb-card__status mb-card__status--' + getStatusColor(bk.status)}>
                      <StatusIcon size={12} aria-hidden="true" />
                      {bk.status === 'confirmed' ? 'In Transit' : bk.status}
                    </span>
                  </div>

                  {/* Route Visual */}
                  <div className="mb-card__route">
                    <MapPin size={16} color="var(--color-green)" aria-hidden="true" />
                    <span className="mb-card__city">{bk.from}</span>
                    <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
                    <span className="mb-card__city">{bk.to}</span>
                    {bk.tripType === 'return' && (
                      <span className="mb-card__return-tag">
                        <RefreshCcw size={10} aria-hidden="true" /> Return Trip
                      </span>
                    )}
                  </div>

                  {/* Driver & Truck profile inline summary */}
                  <div className="mb-card__driver">
                    <img
                      src={bk.driverAvatar || 'https://picsum.photos/seed/driver/100'}
                      alt={bk.driverName}
                      className="mb-card__avatar"
                    />
                    <div className="mb-card__driver-details">
                      <span className="mb-card__driver-name">
                        {bk.driverName}
                        {bk.driverVerified && <BadgeCheck size={13} color="var(--color-green)" aria-hidden="true" />}
                      </span>
                      <span className="mb-card__driver-rating">
                        <Star size={10} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                        {bk.driverRating || 4.7} · {getTruckLabel(bk.truckType)}
                      </span>
                    </div>
                  </div>

                  {/* Stats & Meta info */}
                  <div className="mb-card__meta">
                    <div className="mb-card__meta-item">
                      <Calendar size={14} color="var(--color-text-secondary)" />
                      <span><strong>Departure:</strong> {formatDate(bk.departureDate)}</span>
                    </div>
                    <div className="mb-card__meta-item">
                      <Package size={14} color="var(--color-text-secondary)" />
                      <span><strong>Cargo:</strong> {bk.cargoType} · {bk.weight} T</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mb-card__footer">
                    <div className="mb-card__price-section">
                      <span className="mb-card__price-label">ESTIMATED PRICE</span>
                      <span className="mb-card__price">₹{(bk.estimatedPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                      className="mb-card__view-btn"
                      onClick={function (e) {
                        e.stopPropagation();
                        navigate('/dashboard/bookings/' + bk.id);
                      }}
                      type="button"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </button>
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

export default MyBookings;
