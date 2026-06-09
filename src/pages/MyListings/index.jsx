import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  List, MapPin, ArrowRight, RefreshCcw, Calendar, Trash2, Plus,
  ChevronRight, Truck, Clock
} from 'lucide-react';
import { getMyListings, deleteListing } from '../../services/listingService.js';
import { adaptListings } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './MyListings.css';

function MyListings() {
  var navigate = useNavigate();
  var toast = useToast();

  var tabState = useState('All');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var routesState = useState([]);
  var routes = routesState[0];
  var setRoutes = routesState[1];

  var loadListings = useCallback(async function () {
    var result = await getMyListings();
    if (result.data) {
      setRoutes(adaptListings(result.data));
    }
  }, []);

  useEffect(function () {
    loadListings();
  }, [loadListings]);

  // Realtime: new listings / status changes appear immediately
  useRealtime('listings', loadListings, 'my_listings');

  async function handleDelete(id) {
    var result = await deleteListing(id);
    if (!result.error) {
      setRoutes(routes.filter(function (r) { return String(r.id) !== String(id); }));
      toast.showToast('Listing deleted successfully!', 'success');
    }
  }

  function formatDate(dateStr) {
    var options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-IN', options);
  }

  // Filter listings based on status
  var filteredRoutes = routes.filter(function (route) {
    if (activeTab === 'All') return true;
    return route.status === activeTab.toLowerCase();
  });

  return (
    <DashboardLayout activeTab="listings">
      <div className="my-listings-page">
        {/* Header */}
        <div className="ml-header">
          <div className="ml-header__text">
            <h1 className="ml-title">My Listings</h1>
            <p className="ml-subtitle">Manage and track your published routes and availability.</p>
          </div>
          <button
            className="ml-add-btn"
            onClick={function () { navigate('/driver/add-route'); }}
            type="button"
          >
            <Plus size={16} aria-hidden="true" />
            Add New Route
          </button>
        </div>

        {/* Tab Filters */}
        <div className="ml-tabs">
          {['All', 'Active', 'Expired'].map(function (tab) {
            var count = 0;
            if (tab === 'All') count = routes.length;
            else count = routes.filter(function (r) { return r.status === tab.toLowerCase(); }).length;

            return (
              <button
                key={tab}
                className={'ml-tab-btn' + (activeTab === tab ? ' ml-tab-btn--active' : '')}
                onClick={function () { setActiveTab(tab); }}
                type="button"
              >
                {tab}
                <span className="ml-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Listings Grid */}
        {filteredRoutes.length === 0 ? (
          <div className="ml-empty">
            <Truck size={48} color="var(--color-text-muted)" aria-hidden="true" />
            <h3 className="ml-empty__title">No {activeTab.toLowerCase() === 'all' ? '' : activeTab.toLowerCase()} listings found</h3>
            <p className="ml-empty__subtitle">Create a route listing to let shippers find you and send booking requests.</p>
            <button
              className="ml-empty__cta"
              onClick={function () { navigate('/driver/add-route'); }}
              type="button"
            >
              <Plus size={16} aria-hidden="true" /> Add Route
            </button>
          </div>
        ) : (
          <div className="ml-grid">
            {filteredRoutes.map(function (listing, index) {
              return (
                <div
                  key={listing.id}
                  className="ml-card"
                  style={{ animationDelay: (index * 80) + 'ms' }}
                >
                  <div className="ml-card__header">
                    <div className="ml-card__route">
                      <MapPin size={16} color="var(--color-green)" aria-hidden="true" />
                      <span className="ml-card__city">{listing.from}</span>
                      <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
                      <span className="ml-card__city">{listing.to}</span>
                    </div>
                    {listing.tripType === 'return' && (
                      <span className="ml-card__badge ml-card__badge--return">
                        <RefreshCcw size={12} aria-hidden="true" /> Return
                      </span>
                    )}
                  </div>

                  <div className="ml-card__details">
                    <div className="ml-card__detail">
                      <span className="ml-card__detail-label">Available From:</span>
                      <span className="ml-card__detail-value">{formatDate(listing.departureDate)}</span>
                    </div>
                    <div className="ml-card__detail">
                      <span className="ml-card__detail-label">Capacity:</span>
                      <span className="ml-card__detail-value">
                        {listing.availableCapacity} Tons ({listing.truckType === 'full' ? 'Open' : 'Container'})
                      </span>
                    </div>
                    <div className="ml-card__detail">
                      <span className="ml-card__detail-label">Rate / Ton:</span>
                      <span className="ml-card__detail-value ml-card__detail-value--price">
                        ₹{listing.pricePerKm.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="ml-card__footer">
                    <span className={'ml-status-badge ml-status-badge--' + listing.status}>
                      <span className="ml-status-badge__dot" />
                      {listing.status.toUpperCase()}
                    </span>
                    <button
                      className="ml-card__delete-btn"
                      onClick={function () { handleDelete(listing.id); }}
                      type="button"
                      aria-label="Delete listing"
                    >
                      <Trash2 size={16} aria-hidden="true" />
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

export default MyListings;
