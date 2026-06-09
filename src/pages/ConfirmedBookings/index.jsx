import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Truck, CheckCircle, Clock, MapPin, ArrowRight, Calendar,
  Package, IndianRupee, FileText, Phone, Building2, User
} from 'lucide-react';
import { getBookingsForDriver } from '../../services/bookingService.js';
import { adaptBookings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './ConfirmedBookings.css';

function ConfirmedBookings() {
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

  // Realtime: booking status changes (accept/reject) reflect instantly
  useRealtime('bookings', loadBookings, 'confirmed_bookings');

  function formatDate(dateStr) {
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  }

  // Driver confirmed bookings are confirmed or completed
  var confirmedList = bookings.filter(function (b) {
    return b.status === 'confirmed' || b.status === 'completed';
  });

  var filteredBookings = confirmedList.filter(function (booking) {
    if (activeTab === 'All') return true;
    return booking.status === activeTab.toLowerCase();
  });

  return (
    <DashboardLayout activeTab="confirmed">
      <div className="confirmed-bookings-page">
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header__text">
            <h1 className="cb-title">Confirmed Bookings</h1>
            <p className="cb-subtitle">View and track all accepted shipments and completed trips.</p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="cb-tabs">
          {['All', 'Confirmed', 'Completed'].map(function (tab) {
            var count = 0;
            if (tab === 'All') count = confirmedList.length;
            else count = confirmedList.filter(function (b) { return b.status === tab.toLowerCase(); }).length;

            return (
              <button
                key={tab}
                className={'cb-tab-btn' + (activeTab === tab ? ' cb-tab-btn--active' : '')}
                onClick={function () { setActiveTab(tab); }}
                type="button"
              >
                {tab === 'Confirmed' ? 'In Transit' : tab}
                <span className="cb-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Bookings Display */}
        {filteredBookings.length === 0 ? (
          <div className="cb-empty">
            <Truck size={48} color="var(--color-text-muted)" aria-hidden="true" />
            <h3 className="cb-empty__title">No bookings found</h3>
            <p className="cb-empty__subtitle">Your confirmed bookings will appear here after you accept booking requests.</p>
          </div>
        ) : (
          <div className="cb-container">
            {/* Desktop Table View */}
            <div className="cb-table-wrap">
              <table className="cb-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Shipper</th>
                    <th>Route</th>
                    <th>Date</th>
                    <th>Cargo Details</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(function (bk) {
                    return (
                      <tr key={bk.id}>
                        <td className="cb-table__ref">#{bk.bookingRef}</td>
                        <td className="cb-table__shipper">
                          <span className="cb-table__business">{bk.shipperBusiness}</span>
                          <span className="cb-table__name">{bk.shipperName}</span>
                        </td>
                        <td className="cb-table__route">
                          {bk.from} → {bk.to}
                        </td>
                        <td className="cb-table__date">{formatDate(bk.departureDate)}</td>
                        <td className="cb-table__cargo">
                          {bk.cargoType} · {bk.weight}T
                        </td>
                        <td className="cb-table__price">₹{bk.estimatedPrice.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={'cb-status-badge cb-status-badge--' + bk.status}>
                            {bk.status === 'confirmed' ? 'In Transit' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="cb-cards">
              {filteredBookings.map(function (bk, index) {
                return (
                  <div
                    key={bk.id}
                    className="cb-card"
                    style={{ animationDelay: (index * 80) + 'ms' }}
                  >
                    <div className="cb-card__header">
                      <span className="cb-card__ref">#{bk.bookingRef}</span>
                      <span className={'cb-status-badge cb-status-badge--' + bk.status}>
                        {bk.status === 'confirmed' ? 'In Transit' : 'Completed'}
                      </span>
                    </div>

                    <div className="cb-card__route">
                      <MapPin size={14} color="var(--color-green)" aria-hidden="true" />
                      <span>{bk.from} → {bk.to}</span>
                    </div>

                    <div className="cb-card__details">
                      <div className="cb-card__detail">
                        <Calendar size={13} color="var(--color-text-muted)" />
                        <span>{formatDate(bk.departureDate)}</span>
                      </div>
                      <div className="cb-card__detail">
                        <Package size={13} color="var(--color-text-muted)" />
                        <span>{bk.cargoType} · {bk.weight} Tons</span>
                      </div>
                      <div className="cb-card__detail">
                        <Building2 size={13} color="var(--color-text-muted)" />
                        <span>{bk.shipperBusiness}</span>
                      </div>
                      <div className="cb-card__detail">
                        <User size={13} color="var(--color-text-muted)" />
                        <span>{bk.shipperName}</span>
                      </div>
                      {bk.shipperPhone && (
                        <div className="cb-card__detail">
                          <Phone size={13} color="var(--color-text-muted)" />
                          <span>+91 {bk.shipperPhone}</span>
                        </div>
                      )}
                    </div>

                    <div className="cb-card__footer">
                      <span className="cb-card__price-label">ESTIMATED PRICE</span>
                      <span className="cb-card__price">₹{bk.estimatedPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ConfirmedBookings;
