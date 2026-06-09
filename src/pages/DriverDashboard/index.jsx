import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  List, Clock, CheckCircle, IndianRupee, MapPin, Navigation,
  Calendar, Package, ChevronRight, CheckCircle2, XCircle,
  ArrowRight, RefreshCcw, Eye, Truck, TrendingUp, BadgeCheck,
  Plus
} from 'lucide-react';
import { getBookingsForDriver, updateBookingStatus } from '../../services/bookingService.js';
import { getMyListings } from '../../services/listingService.js';
import { adaptBookings, adaptListings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './DriverDashboard.css';

function DriverDashboard() {
  var navigate = useNavigate();
  var auth = useAuth();
  var user = auth.user;

  var tabState = useState('dashboard');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  // Local state for bookings (so accept/reject updates UI)
  var bookingsState = useState([]);
  var bookings = bookingsState[0];
  var setBookings = bookingsState[1];

  var routesState = useState([]);
  var routes = routesState[0];
  var setRoutes = routesState[1];

  // Load all data from Supabase
  var loadData = useCallback(async function () {
    var bookingResult = await getBookingsForDriver();
    if (bookingResult.data) {
      setBookings(adaptBookings(bookingResult.data));
    }
    var listingResult = await getMyListings();
    if (listingResult.data) {
      setRoutes(adaptListings(listingResult.data));
    }
  }, []);

  useEffect(function () {
    loadData();
  }, [loadData]);

  // Realtime: re-fetch whenever bookings or listings change in DB
  useRealtime('bookings', loadData, 'driver_dashboard');
  useRealtime('listings', loadData, 'driver_dashboard');

  // Stats calculations
  var activeListings = routes.filter(function (r) { return r.status === 'active'; });
  var pendingRequests = bookings.filter(function (b) { return b.status === 'pending'; });
  var confirmedBookings = bookings.filter(function (b) { return b.status === 'confirmed' || b.status === 'completed'; });
  var totalEarnings = confirmedBookings.reduce(function (sum, b) { return sum + (b.estimatedPrice || 0); }, 0);

  // Accept/Reject handlers
  async function handleAccept(bookingId) {
    var result = await updateBookingStatus(bookingId, 'confirmed');
    if (!result.error) {
      setBookings(bookings.map(function (b) {
        if (String(b.id) === String(bookingId)) {
          return Object.assign({}, b, { status: 'confirmed' });
        }
        return b;
      }));
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
    }
  }

  // Format date helper
  function formatDate(dateStr) {
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  }

  // Format currency
  function formatCurrency(amount) {
    if (amount >= 1000) {
      return '₹' + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'k';
    }
    return '₹' + amount.toLocaleString('en-IN');
  }

  function formatFullCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
  }

  // Tab change handler
  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  /* ─── Stat Cards Data ──────────────────────────────── */
  var statCards = [
    {
      id: 'active-listings',
      label: 'ACTIVE LISTINGS',
      value: activeListings.length,
      icon: List,
      color: '#2ECC8F',
      bgColor: 'rgba(46, 204, 143, 0.1)',
      trend: '+2 this week'
    },
    {
      id: 'pending-requests',
      label: 'PENDING REQUESTS',
      value: pendingRequests.length,
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      trend: 'Needs attention'
    },
    {
      id: 'confirmed-bookings',
      label: 'CONFIRMED BOOKINGS',
      value: confirmedBookings.length,
      icon: CheckCircle,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      trend: '+3 this month'
    },
    {
      id: 'earnings',
      label: 'EARNINGS THIS MONTH',
      value: formatFullCurrency(totalEarnings),
      icon: IndianRupee,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: '↑ 12% vs last month'
    }
  ];

  var statPaths = {
    'active-listings': '/dashboard/listings',
    'pending-requests': '/dashboard/requests',
    'confirmed-bookings': '/dashboard/confirmed'
  };

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="driver-dashboard">

        {/* ─── Stat Cards ──────────────────────────────── */}
        <section className="dd-stats">
          {statCards.map(function (stat, index) {
            var Icon = stat.icon;
            var path = statPaths[stat.id];
            return (
              <div
                key={stat.id}
                className="dd-stat-card"
                style={{
                  animationDelay: (index * 80) + 'ms',
                  cursor: path ? 'pointer' : 'default'
                }}
                onClick={path ? function () { navigate(path); } : undefined}
              >
                <div className="dd-stat-card__icon" style={{ background: stat.bgColor }}>
                  <Icon size={22} color={stat.color} aria-hidden="true" />
                </div>
                <div className="dd-stat-card__content">
                  <span className="dd-stat-card__label">{stat.label}</span>
                  <span className="dd-stat-card__value">{stat.value}</span>
                </div>
                <span className="dd-stat-card__trend">{stat.trend}</span>
              </div>
            );
          })}
        </section>

        {/* ─── Main Grid: Listings + Booking Requests ── */}
        <div className="dd-grid">

          {/* Left Column — Active Listings + Confirmed Bookings */}
          <div className="dd-grid__left">

            {/* ── Active Listings ───────────────────────── */}
            <section className="dd-section dd-section--listings">
              <div className="dd-section__header">
                <h2 className="dd-section__title">My Active Listings</h2>
                <button
                  className="dd-section__view-all"
                  onClick={function () { navigate('/dashboard/listings'); }}
                  type="button"
                >
                  View All <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>

              <div className="dd-listings-grid">
                {activeListings.length === 0 ? (
                  <div className="dd-empty">
                    <Truck size={48} color="#9CA3AF" aria-hidden="true" />
                    <p className="dd-empty__title">No active listings</p>
                    <p className="dd-empty__subtitle">Add your first route to start receiving booking requests.</p>
                    <button
                      className="dd-empty__cta"
                      onClick={function () { navigate('/driver/add-route'); }}
                      type="button"
                    >
                      <Plus size={16} aria-hidden="true" />
                      Add Route
                    </button>
                  </div>
                ) : (
                  activeListings.slice(0, 2).map(function (listing, index) {
                    return (
                      <div key={listing.id} className="dd-listing-card" style={{ animationDelay: (index * 100 + 200) + 'ms' }}>
                        <div className="dd-listing-card__route">
                          <div className="dd-listing-card__route-info">
                            <MapPin size={16} color="#2ECC8F" aria-hidden="true" />
                            <span className="dd-listing-card__city">{listing.from}</span>
                            <ArrowRight size={14} color="#9CA3AF" aria-hidden="true" />
                            <span className="dd-listing-card__city">{listing.to}</span>
                          </div>
                          {listing.tripType === 'return' && (
                            <span className="dd-badge dd-badge--return">
                              <RefreshCcw size={12} aria-hidden="true" /> Return
                            </span>
                          )}
                        </div>

                        <div className="dd-listing-card__details">
                          <div className="dd-listing-card__detail">
                            <span className="dd-listing-card__detail-label">Available From:</span>
                            <span className="dd-listing-card__detail-value">{formatDate(listing.departureDate)}</span>
                          </div>
                          <div className="dd-listing-card__detail">
                            <span className="dd-listing-card__detail-label">Capacity:</span>
                            <span className="dd-listing-card__detail-value">
                              {listing.availableCapacity} Tons ({listing.truckType === 'full' ? 'Open' : 'Container'})
                            </span>
                          </div>
                          <div className="dd-listing-card__detail">
                            <span className="dd-listing-card__detail-label">Rate:</span>
                            <span className="dd-listing-card__detail-value dd-listing-card__detail-value--price">
                              ₹{listing.pricePerKm.toLocaleString('en-IN')} / Ton
                            </span>
                          </div>
                        </div>

                        <div className="dd-listing-card__footer">
                          <span className="dd-badge dd-badge--active">
                            <span className="dd-badge__dot dd-badge__dot--green" />
                            Active
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ── Recent Confirmed Bookings ─────────────── */}
            <section className="dd-section dd-section--confirmed">
              <div className="dd-section__header">
                <h2 className="dd-section__title">Recent Confirmed Bookings</h2>
              </div>

              <div className="dd-table-wrap">
                <table className="dd-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Route</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.filter(function (b) {
                      return b.status === 'confirmed' || b.status === 'completed';
                    }).map(function (booking) {
                      return (
                        <tr key={booking.id}>
                          <td className="dd-table__id">#{booking.bookingRef}</td>
                          <td className="dd-table__route">
                            {booking.from} → {booking.to}
                          </td>
                          <td className="dd-table__date">{formatDate(booking.departureDate)}</td>
                          <td>
                            <span className={'dd-status-badge dd-status-badge--' + booking.status}>
                              {booking.status === 'confirmed' ? 'In Transit' : 'Completed'}
                            </span>
                          </td>
                          <td className="dd-table__amount">
                            {formatFullCurrency(booking.estimatedPrice)}
                          </td>
                        </tr>
                      );
                    })}
                    {bookings.filter(function (b) {
                      return b.status === 'confirmed' || b.status === 'completed';
                    }).length === 0 && (
                      <tr>
                        <td colSpan="5" className="dd-table__empty">
                          No confirmed bookings yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column — Booking Requests */}
          <div className="dd-grid__right">
            <section className="dd-section dd-section--requests">
              <div className="dd-section__header">
                <h2 className="dd-section__title">Booking Requests</h2>
                {pendingRequests.length > 0 && (
                  <span className="dd-pending-badge">
                    {pendingRequests.length} PENDING
                  </span>
                )}
              </div>

              <div className="dd-requests-list">
                {pendingRequests.length === 0 ? (
                  <div className="dd-empty dd-empty--compact">
                    <Clock size={36} color="#9CA3AF" aria-hidden="true" />
                    <p className="dd-empty__title">No pending requests</p>
                    <p className="dd-empty__subtitle">New booking requests will appear here.</p>
                  </div>
                ) : (
                  pendingRequests.map(function (request, index) {
                    return (
                      <div
                        key={request.id}
                        className="dd-request-card"
                        style={{
                          animationDelay: (index * 120 + 300) + 'ms',
                          cursor: 'pointer'
                        }}
                        onClick={function (e) {
                          if (e.target.closest('button')) return;
                          navigate('/dashboard/requests');
                        }}
                      >
                        <div className="dd-request-card__header">
                          <div className="dd-request-card__shipper">
                            <span className="dd-request-card__shipper-name">{request.shipperBusiness}</span>
                            <span className="dd-request-card__ref">Req ID: #{request.bookingRef}</span>
                          </div>
                          <span className="dd-request-card__price">
                            {formatCurrency(request.estimatedPrice)}
                          </span>
                        </div>

                        <div className="dd-request-card__route">
                          <MapPin size={14} color="#9CA3AF" aria-hidden="true" />
                          <span>{request.from} → {request.to}</span>
                        </div>

                        <div className="dd-request-card__actions">
                          <button
                            className="dd-request-card__btn dd-request-card__btn--accept"
                            onClick={function () { handleAccept(request.id); }}
                            type="button"
                          >
                            <CheckCircle2 size={16} aria-hidden="true" />
                            Accept
                          </button>
                          <button
                            className="dd-request-card__btn dd-request-card__btn--reject"
                            onClick={function () { handleReject(request.id); }}
                            type="button"
                          >
                            <XCircle size={16} aria-hidden="true" />
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                {pendingRequests.length > 0 && (
                  <button
                    className="dd-section__view-all dd-section__view-all--center"
                    onClick={function () { navigate('/dashboard/requests'); }}
                    type="button"
                  >
                    View All Requests <ChevronRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DriverDashboard;
