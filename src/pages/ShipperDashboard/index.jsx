import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  ClipboardList, CheckCircle, Truck, IndianRupee, Calendar,
  MapPin, ArrowRight, RefreshCcw, Clock, XCircle, Star,
  Search, Package, Inbox, ChevronRight, BadgeCheck, Bell,
  UserCircle, Heart, Building2, Eye, TrendingUp, Sparkles
} from 'lucide-react';
import { getBookingsForShipper } from '../../services/bookingService.js';
import { getListings } from '../../services/listingService.js';
import { adaptBookings, adaptListings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './ShipperDashboard.css';

function ShipperDashboard() {
  var navigate = useNavigate();
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;

  var bookingsState = useState([]);
  var bookings = bookingsState[0];
  var setBookings = bookingsState[1];

  var savedTrucksState = useState([]);
  var savedTrucks = savedTrucksState[0];
  var setSavedTrucks = savedTrucksState[1];

  // Load bookings — stable so realtime can call it
  var loadBookings = useCallback(async function () {
    var bookingResult = await getBookingsForShipper();
    if (bookingResult.data) {
      setBookings(adaptBookings(bookingResult.data));
    }
    // Load saved trucks from localStorage (kept local for MVP — no DB table for saved)
    var storedSaved = localStorage.getItem('retruck_saved_trucks');
    if (storedSaved) {
      try {
        setSavedTrucks(JSON.parse(storedSaved));
      } catch (e) { /* ignore */ }
    }
  }, []);

  useEffect(function () {
    loadBookings();
  }, [loadBookings, user]);

  // Realtime: re-fetch whenever bookings change in DB
  useRealtime('bookings', loadBookings, 'shipper_dashboard');

  // Premium Recommendations: load from Supabase listings
  var [recommendedTrucks, setRecommendedTrucks] = useState([]);

  var loadRecommended = useCallback(async function () {
    var result = await getListings({ tripType: 'return' });
    if (result.data) {
      setRecommendedTrucks(adaptListings(result.data).slice(0, 5));
    }
  }, []);

  useEffect(function () {
    loadRecommended();
  }, [loadRecommended]);

  // Realtime: re-fetch listings when they change
  useRealtime('listings', loadRecommended, 'shipper_dashboard');

  // Stats
  function getStatCounts() {
    var sent = bookings.length;
    var confirmed = bookings.filter(function (b) { return b.status === 'confirmed'; }).length;
    var completed = bookings.filter(function (b) { return b.status === 'completed'; }).length;
    var totalSpent = bookings.reduce(function (sum, b) {
      if (b.status === 'completed' || b.status === 'confirmed') {
        return sum + (b.estimatedPrice || 0);
      }
      return sum;
    }, 0);
    return { sent: sent, confirmed: confirmed, completed: completed, totalSpent: totalSpent };
  }

  var stats = getStatCounts();

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
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

  // Toggle Save Truck
  function toggleSaveTruck(e, trk) {
    e.stopPropagation();
    var isSaved = savedTrucks.some(function (t) { return t.id === trk.id; });
    var updated = [];
    if (isSaved) {
      updated = savedTrucks.filter(function (t) { return t.id !== trk.id; });
      toast.showToast('Truck removed from Saved', 'success');
    } else {
      updated = savedTrucks.concat([trk]);
      toast.showToast('Truck saved successfully!', 'success');
    }
    setSavedTrucks(updated);
    localStorage.setItem('retruck_saved_trucks', JSON.stringify(updated));
  }

  var STAT_CARDS = [
    {
      id: 'sent',
      label: 'BOOKINGS SENT',
      value: stats.sent,
      icon: ClipboardList,
      color: '#1B2B4B',
      bgColor: 'rgba(27, 43, 75, 0.1)',
      trend: 'Active requests'
    },
    {
      id: 'confirmed',
      label: 'CONFIRMED SHIPMENTS',
      value: stats.confirmed,
      icon: CheckCircle,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      trend: 'In transit'
    },
    {
      id: 'completed',
      label: 'COMPLETED SHIPMENTS',
      value: stats.completed,
      icon: Truck,
      color: '#2ECC8F',
      bgColor: 'rgba(46, 204, 143, 0.1)',
      trend: 'Delivered successfully'
    },
    {
      id: 'spend',
      label: 'TOTAL FREIGHT SPEND',
      value: '₹' + stats.totalSpent.toLocaleString('en-IN'),
      icon: IndianRupee,
      color: '#8B5CF6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      trend: 'Optimized logistics spend'
    }
  ];

  var QUICK_ACTIONS = [
    { label: 'Search Trucks', desc: 'Find available vehicles', icon: Search, path: '/trucks', color: 'green' },
    { label: 'My Bookings', desc: 'Track load status', icon: ClipboardList, path: '/dashboard/bookings', color: 'blue' },
    { label: 'Saved Trucks', desc: 'Preferred carriers', icon: Star, path: '/dashboard/saved', color: 'orange' },
    { label: 'Business Profile', desc: 'Manage KYC & Billing', icon: Building2, path: '/profile', color: 'purple' },
    { label: 'Notifications', desc: 'Logistics alerts', icon: Bell, path: '/dashboard/notifications', color: 'navy' }
  ];

  return (
    <DashboardLayout activeTab="dashboard">
      <div className="shipper-dash">

        {/* ─── Personalized Greeting Header ────────────────── */}
        <section className="sd-welcome">
          <div className="sd-welcome__info">
            <h2 className="sd-welcome__title">Welcome back, {user ? user.name.split(' ')[0] : 'Suresh'}!</h2>
            <p className="sd-welcome__subtitle">Manage logistics, discover premium fleets, and save up to 40% on return trips.</p>
          </div>
          <div className="sd-welcome__ctas">
            <button className="sd-btn sd-btn--primary" onClick={function () { navigate('/trucks'); }} type="button">
              <Search size={16} />
              <span>Find a Truck</span>
            </button>
            <button className="sd-btn sd-btn--secondary" onClick={function () { navigate('/dashboard/bookings'); }} type="button">
              <ClipboardList size={16} />
              <span>View Bookings</span>
            </button>
          </div>
        </section>

        {/* ─── 4 Stat Cards Grid ────────────────────────────── */}
        <section className="sd-stats-section">
          <div className="sd-stats-grid">
            {STAT_CARDS.map(function (stat, i) {
              var Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="sd-stat-card"
                  style={{ animationDelay: (i * 80) + 'ms' }}
                >
                  <div className="sd-stat-card__icon" style={{ background: stat.bgColor }}>
                    <Icon size={20} color={stat.color} aria-hidden="true" />
                  </div>
                  <div className="sd-stat-card__content">
                    <span className="sd-stat-card__label">{stat.label}</span>
                    <span className="sd-stat-card__value">{stat.value}</span>
                  </div>
                  <span className="sd-stat-card__trend">
                    <TrendingUp size={10} aria-hidden="true" /> {stat.trend}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Main Grid: Recent + Recommended + Quick Actions ─── */}
        <div className="sd-grid">

          {/* Left Panel: Recent Bookings & Recommended Trucks */}
          <div className="sd-grid__left">

            {/* Recent Bookings Section */}
            <section className="sd-section">
              <div className="sd-section__header">
                <h3 className="sd-section__title">Recent Active Bookings</h3>
                {bookings.length > 3 && (
                  <button className="sd-view-all-btn" onClick={function () { navigate('/dashboard/bookings'); }} type="button">
                    View All <ChevronRight size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              {bookings.length === 0 ? (
                <div className="sd-empty">
                  <Inbox size={40} color="var(--color-text-muted)" aria-hidden="true" />
                  <p className="sd-empty__title">No bookings sent yet</p>
                  <p className="sd-empty__subtitle">Search available trucks and post your first shipment booking request!</p>
                  <button className="sd-empty__cta" onClick={function () { navigate('/trucks'); }} type="button">
                    <Search size={16} /> Find Trucks
                  </button>
                </div>
              ) : (
                <div className="sd-booking-list">
                  {bookings.slice(0, 3).map(function (bk, i) {
                    var StatusIcon = getStatusIcon(bk.status);
                    return (
                      <div
                        key={bk.id || i}
                        className="sd-booking-item"
                        style={{ animationDelay: (i * 80) + 'ms' }}
                        onClick={function () { navigate('/dashboard/bookings/' + bk.id); }}
                      >
                        <div className="sd-booking-item__route">
                          <div className="sd-booking-item__route-details">
                            <MapPin size={14} color="var(--color-green)" aria-hidden="true" />
                            <span className="sd-booking-item__city">{bk.from}</span>
                            <ArrowRight size={12} color="var(--color-text-muted)" aria-hidden="true" />
                            <span className="sd-booking-item__city">{bk.to}</span>
                          </div>
                          {bk.tripType === 'return' && (
                            <span className="sd-badge sd-badge--return">
                              <RefreshCcw size={10} aria-hidden="true" /> Return Trip
                            </span>
                          )}
                        </div>

                        <div className="sd-booking-item__meta">
                          <div className="sd-booking-item__info-group">
                            <span className="sd-booking-item__info-label">Driver:</span>
                            <span className="sd-booking-item__info-value">{bk.driverName}</span>
                          </div>
                          <div className="sd-booking-item__info-group">
                            <span className="sd-booking-item__info-label">Date:</span>
                            <span className="sd-booking-item__info-value">{formatDate(bk.departureDate)}</span>
                          </div>
                          <div className="sd-booking-item__info-group">
                            <span className={'sd-status-badge sd-status-badge--' + getStatusColor(bk.status)}>
                              <StatusIcon size={10} aria-hidden="true" />
                              {bk.status === 'confirmed' ? 'In Transit' : bk.status}
                            </span>
                          </div>
                        </div>

                        <div className="sd-booking-item__footer">
                          <span className="sd-booking-item__ref">ID: #{bk.bookingRef || 'RT0000'}</span>
                          <span className="sd-booking-item__price">₹{(bk.estimatedPrice || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Recommended Trucks Section */}
            <section className="sd-section sd-section--recommended">
              <div className="sd-section__header">
                <h3 className="sd-section__title">
                  <Sparkles size={16} color="var(--color-green)" aria-hidden="true" />
                  <span>Recommended Fleets</span>
                </h3>
                <span className="sd-section__badge">RETURN TRIPS</span>
              </div>

              <div className="sd-recommended-scroll">
                {recommendedTrucks.map(function (trk) {
                  var isSaved = savedTrucks.some(function (t) { return t.id === trk.id; });
                  return (
                    <div
                      key={trk.id}
                      className="sd-rec-card"
                      onClick={function () { navigate('/trucks/' + trk.id); }}
                    >
                      <div className="sd-rec-card__photo-wrap">
                        <img src={trk.truckPhoto} alt={getTruckLabel(trk.truckType)} className="sd-rec-card__photo" />
                        <button
                          className={'sd-rec-card__save-btn' + (isSaved ? ' sd-rec-card__save-btn--saved' : '')}
                          onClick={function (e) { toggleSaveTruck(e, trk); }}
                          type="button"
                          aria-label="Save Fleet"
                        >
                          <Star size={14} fill={isSaved ? 'var(--color-green)' : 'none'} color={isSaved ? 'var(--color-green)' : '#FFFFFF'} />
                        </button>
                        {trk.discountPercent > 0 && (
                          <span className="sd-rec-card__discount">Save {trk.discountPercent}%</span>
                        )}
                      </div>

                      <div className="sd-rec-card__body">
                        <div className="sd-rec-card__driver">
                          <img src={trk.driverAvatar} alt={trk.driverName} className="sd-rec-card__avatar" />
                          <div>
                            <span className="sd-rec-card__driver-name">
                              {trk.driverName}
                              {trk.driverVerified && <BadgeCheck size={12} color="var(--color-green)" aria-hidden="true" />}
                            </span>
                            <span className="sd-rec-card__rating">
                              <Star size={10} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                              {trk.driverRating} · {trk.tripsCompleted} completed
                            </span>
                          </div>
                        </div>

                        <div className="sd-rec-card__route">
                          <MapPin size={12} color="var(--color-green)" aria-hidden="true" />
                          <span>{trk.from} → {trk.to}</span>
                        </div>

                        <div className="sd-rec-card__footer">
                          <div className="sd-rec-card__price-wrap">
                            <span className="sd-rec-card__price-label">EST. TOTAL</span>
                            <span className="sd-rec-card__price">₹{(trk.estimatedTotal || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <span className="sd-rec-card__cta">
                            Book <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Panel: Quick Actions */}
          <div className="sd-grid__right">
            <section className="sd-section sd-section--quick">
              <div className="sd-section__header">
                <h3 className="sd-section__title">Quick Actions</h3>
              </div>
              <div className="sd-quick-grid">
                {QUICK_ACTIONS.map(function (action, idx) {
                  var Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      className={'sd-quick-btn sd-quick-btn--' + action.color}
                      onClick={function () { navigate(action.path); }}
                      type="button"
                    >
                      <div className="sd-quick-btn__icon-wrap">
                        <Icon size={20} aria-hidden="true" />
                      </div>
                      <div className="sd-quick-btn__text">
                        <span className="sd-quick-btn__label">{action.label}</span>
                        <span className="sd-quick-btn__desc">{action.desc}</span>
                      </div>
                      <ChevronRight size={14} className="sd-quick-btn__arrow" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default ShipperDashboard;
