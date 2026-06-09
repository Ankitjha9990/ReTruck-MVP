import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Search, MapPin, Navigation, Calendar, ArrowRight, RefreshCcw,
  SlidersHorizontal, ArrowUpDown, Star, BadgeCheck, Truck,
  IndianRupee, Package, Inbox, X, ChevronDown, Weight, Filter,
  ChevronLeft, ChevronRight, ArrowLeftRight, Menu, LogOut
} from 'lucide-react';
import retruckLogo from '../../assets/logos/retruck-logo.png';
import retruckText from '../../assets/logos/Retruck-text.png';
import './TruckSearch.css';

var ITEMS_PER_PAGE = 6;

function TruckSearch() {
  var navigate = useNavigate();
  var auth = useAuth();
  var search = useSearch();
  var toast = useToast();

  var [showFilterSheet, setShowFilterSheet] = useState(false);
  var [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  var [currentPage, setCurrentPage] = useState(1);

  var [savedTrucks, setSavedTrucks] = useState(function () {
    var stored = localStorage.getItem('retruck_saved_trucks');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [];
  });

  // Filter states
  var [tripFilter, setTripFilter] = useState('all');
  var [truckTypeFilter, setTruckTypeFilter] = useState([]);
  var [capacityRange, setCapacityRange] = useState(40);
  var [priceRange, setPriceRange] = useState(60000);
  var [minRating, setMinRating] = useState(0);

  // Search bar state
  var [searchFrom, setSearchFrom] = useState(search.filters.from || '');
  var [searchTo, setSearchTo] = useState(search.filters.to || '');
  var [searchDate, setSearchDate] = useState(search.filters.date || '');
  var [truckTypeDropdown, setTruckTypeDropdown] = useState('all');

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

  // Run search on mount
  useEffect(function () {
    search.runSearch();
  }, []);

  function handleSearch() {
    search.setFilters({
      from: searchFrom,
      to: searchTo,
      date: searchDate,
      tripType: tripFilter === 'all' ? 'all' : tripFilter
    });
    setCurrentPage(1);
    setTimeout(function () { search.runSearch(); }, 50);
  }

  function handleSortChange(e) {
    search.setSort(e.target.value);
    setTimeout(function () { search.runSearch(); }, 50);
  }

  function handleClearFilters() {
    search.resetFilters();
    setSearchFrom('');
    setSearchTo('');
    setSearchDate('');
    setTripFilter('all');
    setTruckTypeFilter([]);
    setCapacityRange(40);
    setPriceRange(60000);
    setMinRating(0);
    setTruckTypeDropdown('all');
    setCurrentPage(1);
    setTimeout(function () { search.runSearch(); }, 50);
  }

  function handleApplyFilters() {
    setShowFilterSheet(false);
    handleSearch();
  }

  function swapCities() {
    var temp = searchFrom;
    setSearchFrom(searchTo);
    setSearchTo(temp);
  }

  function toggleTruckType(type) {
    if (truckTypeFilter.indexOf(type) !== -1) {
      setTruckTypeFilter(truckTypeFilter.filter(function (t) { return t !== type; }));
    } else {
      setTruckTypeFilter(truckTypeFilter.concat([type]));
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function getTruckLabel(type) {
    if (type === 'mini') return 'Mini Truck';
    if (type === 'trailer') return 'Trailer';
    if (type === 'container') return 'Container';
    return 'Full Truck';
  }

  var today = new Date().toISOString().split('T')[0];

  // Apply local filters on top of search results
  var allResults = search.results;
  var filteredResults = allResults.filter(function (truck) {
    // Trip type filter
    if (tripFilter !== 'all' && truck.tripType !== tripFilter) return false;
    // Truck type filter
    if (truckTypeFilter.length > 0 && truckTypeFilter.indexOf(truck.truckType) === -1) return false;
    // Capacity
    if (truck.availableCapacity > capacityRange) return false;
    // Price
    if (truck.estimatedTotal > priceRange) return false;
    // Rating
    if (minRating > 0 && truck.driverRating < minRating) return false;
    return true;
  });

  // Pagination
  var totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  var paginatedResults = filteredResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToPage(page) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function getPaginationPages() {
    var pages = [];
    if (totalPages <= 5) {
      for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      var start = Math.max(2, currentPage - 1);
      var end = Math.min(totalPages - 1, currentPage + 1);
      for (var j = start; j <= end; j++) pages.push(j);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  // Search heading
  var searchHeading = '';
  if (searchFrom && searchTo) {
    searchHeading = 'Showing ' + filteredResults.length + ' trucks for ' + searchFrom + ' → ' + searchTo;
  } else {
    searchHeading = 'Showing ' + filteredResults.length + ' trucks found';
  }

  var isLoggedIn = auth.isAuthenticated;

  var pageContent = (
    <>
      {/* ─── Search Bar Section ───────────────────────────── */}
      <section className="ts-search-section">
        <div className="ts-search-section__inner">
          <div className="ts-search-bar">
            <div className="ts-search-field">
              <MapPin size={18} color="var(--color-green, #2ECC8F)" aria-hidden="true" />
              <input
                type="text"
                className="ts-search-field__input"
                placeholder="From City"
                value={searchFrom}
                onChange={function (e) { setSearchFrom(e.target.value); }}
              />
            </div>

            <button className="ts-swap-btn" onClick={swapCities} type="button" aria-label="Swap cities">
              <ArrowLeftRight size={18} />
            </button>

            <div className="ts-search-field">
              <MapPin size={18} color="var(--color-navy, #1B2B4B)" aria-hidden="true" />
              <input
                type="text"
                className="ts-search-field__input"
                placeholder="To City"
                value={searchTo}
                onChange={function (e) { setSearchTo(e.target.value); }}
              />
            </div>

            <div className="ts-search-field ts-search-field--date">
              <Calendar size={18} aria-hidden="true" />
              <input
                type="date"
                className="ts-search-field__input"
                value={searchDate}
                onChange={function (e) { setSearchDate(e.target.value); }}
                min={today}
              />
            </div>

            <div className="ts-search-field ts-search-field--type">
              <Truck size={18} aria-hidden="true" />
              <select
                className="ts-search-field__select"
                value={truckTypeDropdown}
                onChange={function (e) { setTruckTypeDropdown(e.target.value); }}
              >
                <option value="all">All Types</option>
                <option value="mini">Mini Truck</option>
                <option value="full">Full Truck</option>
                <option value="trailer">Trailer</option>
              </select>
            </div>

            <button className="ts-search-btn" onClick={handleSearch} type="button">
              <Search size={18} aria-hidden="true" />
              <span>Search Trucks</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── Main Content: Sidebar + Results ──────────────── */}
      <div className="ts-main">
        <div className="ts-main__inner">

          {/* Sidebar Filters — Desktop */}
          <aside className="ts-sidebar">
            <div className="ts-sidebar__card">
              <h3 className="ts-sidebar__title">Filters</h3>

              {/* Trip Type */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Trip Type</label>
                <div className="ts-filter-toggle">
                  <button
                    className={'ts-filter-toggle__btn' + (tripFilter === 'standard' ? ' ts-filter-toggle__btn--active' : '')}
                    onClick={function () { setTripFilter(tripFilter === 'standard' ? 'all' : 'standard'); }}
                    type="button"
                  >Standard</button>
                  <button
                    className={'ts-filter-toggle__btn' + (tripFilter === 'return' ? ' ts-filter-toggle__btn--active' : '')}
                    onClick={function () { setTripFilter(tripFilter === 'return' ? 'all' : 'return'); }}
                    type="button"
                  >Return</button>
                </div>
              </div>

              {/* Truck Type */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Truck Type</label>
                <div className="ts-filter-checks">
                  {['mini', 'full', 'trailer', 'container'].map(function (t) {
                    var checked = truckTypeFilter.indexOf(t) !== -1;
                    return (
                      <label key={t} className="ts-filter-check">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={function () { toggleTruckType(t); }}
                        />
                        <span className="ts-filter-check__custom" />
                        <span className="ts-filter-check__text">{getTruckLabel(t)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Capacity */}
              <div className="ts-filter-group">
                <div className="ts-filter-group__header">
                  <label className="ts-filter-group__label">Capacity</label>
                  <span className="ts-filter-group__value">0 - {capacityRange}t</span>
                </div>
                <input
                  type="range"
                  className="ts-range-slider"
                  min="0"
                  max="40"
                  value={capacityRange}
                  onChange={function (e) { setCapacityRange(parseInt(e.target.value)); }}
                />
              </div>

              {/* Price Range */}
              <div className="ts-filter-group">
                <div className="ts-filter-group__header">
                  <label className="ts-filter-group__label">Price Range</label>
                  <span className="ts-filter-group__value">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  className="ts-range-slider"
                  min="0"
                  max="100000"
                  step="1000"
                  value={priceRange}
                  onChange={function (e) { setPriceRange(parseInt(e.target.value)); }}
                />
              </div>

              {/* Minimum Rating */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Minimum Rating</label>
                <div className="ts-rating-stars">
                  {[1, 2, 3, 4, 5].map(function (star) {
                    return (
                      <button
                        key={star}
                        className="ts-rating-star-btn"
                        onClick={function () { setMinRating(minRating === star ? 0 : star); }}
                        type="button"
                        aria-label={'Set minimum rating to ' + star}
                      >
                        <Star
                          size={22}
                          fill={star <= minRating ? '#F59E0B' : 'none'}
                          color={star <= minRating ? '#F59E0B' : '#D1D5DB'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button className="ts-sidebar__apply-btn" onClick={handleApplyFilters} type="button">
                Apply Filters
              </button>
            </div>
          </aside>

          {/* Results Column */}
          <div className="ts-results">
            {/* Results Header */}
            <div className="ts-results__header">
              <div className="ts-results__header-left">
                <h2 className="ts-results__heading">{searchHeading}</h2>
                {/* Mobile filter toggle */}
                <button
                  className="ts-results__filter-mobile-btn"
                  onClick={function () { setShowFilterSheet(true); }}
                  type="button"
                >
                  <Filter size={16} /> Filters
                </button>
              </div>
              <div className="ts-results__sort-wrap">
                <span className="ts-results__sort-label">Sort by:</span>
                <select className="ts-results__sort-select" value={search.sort} onChange={handleSortChange}>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="date_asc">Nearest Date</option>
                </select>
              </div>
            </div>

            {/* Truck Cards Grid */}
            {search.isLoading ? (
              <div className="ts-grid">
                {[1, 2, 3, 4, 5, 6].map(function (i) {
                  return (
                    <div key={i} className="ts-skeleton-card">
                      <div className="ts-skeleton ts-skeleton--photo" />
                      <div className="ts-skeleton ts-skeleton--line" />
                      <div className="ts-skeleton ts-skeleton--line ts-skeleton--short" />
                      <div className="ts-skeleton ts-skeleton--btn" />
                    </div>
                  );
                })}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="ts-empty">
                <Inbox size={48} color="var(--color-text-muted)" aria-hidden="true" />
                <h3 className="ts-empty__title">No trucks found</h3>
                <p className="ts-empty__subtitle">Try adjusting your search criteria or clearing filters</p>
                <button className="ts-empty__cta" onClick={handleClearFilters} type="button">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="ts-grid">
                  {paginatedResults.map(function (truck, index) {
                    var isSaved = savedTrucks.some(function (t) { return t.id === truck.id; });
                    return (
                      <div
                        key={truck.id}
                        className="ts-card"
                        style={{ animationDelay: (index * 60) + 'ms' }}
                      >
                        {/* Card Photo */}
                        <div className="ts-card__photo-wrap">
                          <img
                            src={truck.truckPhoto}
                            alt={getTruckLabel(truck.truckType)}
                            className="ts-card__photo"
                          />
                          <span className={'ts-card__trip-badge' + (truck.tripType === 'return' ? ' ts-card__trip-badge--return' : ' ts-card__trip-badge--standard')}>
                            {truck.tripType === 'return' ? 'RETURN TRIP' : 'STANDARD'}
                          </span>
                          <div className="ts-card__rating-badge">
                            <Star size={12} fill="#F59E0B" color="#F59E0B" aria-hidden="true" />
                            <span>{truck.driverRating}</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="ts-card__body">
                          {/* Driver name + verified */}
                          <div className="ts-card__driver-row">
                            <span className="ts-card__driver-name">
                              {truck.driverName}
                              {truck.driverVerified && <BadgeCheck size={14} color="var(--color-green)" aria-hidden="true" />}
                            </span>
                            <button
                              className={'ts-card__save-btn' + (isSaved ? ' ts-card__save-btn--saved' : '')}
                              onClick={function (e) { toggleSaveTruck(e, truck); }}
                              type="button"
                              aria-label="Save truck"
                            >
                              <Star size={16} fill={isSaved ? '#2ECC8F' : 'none'} color={isSaved ? '#2ECC8F' : '#9CA3AF'} />
                            </button>
                          </div>

                          {/* Route */}
                          <div className="ts-card__route">
                            <span>{truck.from}</span>
                            <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
                            <span>{truck.to}</span>
                          </div>

                          {/* Meta tags */}
                          <div className="ts-card__tags">
                            <span className="ts-card__tag">{formatDate(truck.departureDate)}</span>
                            <span className="ts-card__tag">{getTruckLabel(truck.truckType)}</span>
                            <span className="ts-card__tag">{truck.availableCapacity} Tonnes</span>
                          </div>

                          {/* Price */}
                          <div className="ts-card__price-row">
                            <span className="ts-card__price">₹{(truck.estimatedTotal || 0).toLocaleString('en-IN')}</span>
                            <span className="ts-card__price-unit">/trip</span>
                          </div>

                          {/* View Details */}
                          <button
                            className="ts-card__view-btn"
                            onClick={function () { navigate('/trucks/' + truck.id); }}
                            type="button"
                          >
                            <span>View Details</span>
                            <ArrowRight size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="ts-pagination">
                    <button
                      className="ts-pagination__btn ts-pagination__btn--arrow"
                      onClick={function () { goToPage(currentPage - 1); }}
                      disabled={currentPage === 1}
                      type="button"
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {getPaginationPages().map(function (page, idx) {
                      if (page === '...') {
                        return <span key={'dots-' + idx} className="ts-pagination__dots">…</span>;
                      }
                      return (
                        <button
                          key={page}
                          className={'ts-pagination__btn' + (currentPage === page ? ' ts-pagination__btn--active' : '')}
                          onClick={function () { goToPage(page); }}
                          type="button"
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      className="ts-pagination__btn ts-pagination__btn--arrow"
                      onClick={function () { goToPage(currentPage + 1); }}
                      disabled={currentPage === totalPages}
                      type="button"
                      aria-label="Next page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Sheet ───────────────────────────── */}
      {showFilterSheet && (
        <>
          <div className="ts-sheet-overlay" onClick={function () { setShowFilterSheet(false); }} />
          <div className="ts-filter-sheet">
            <div className="ts-filter-sheet__header">
              <h3 className="ts-filter-sheet__title">Filters</h3>
              <button
                className="ts-filter-sheet__close"
                onClick={function () { setShowFilterSheet(false); }}
                type="button"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="ts-filter-sheet__body">
              {/* Trip Type */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Trip Type</label>
                <div className="ts-filter-toggle">
                  <button
                    className={'ts-filter-toggle__btn' + (tripFilter === 'standard' ? ' ts-filter-toggle__btn--active' : '')}
                    onClick={function () { setTripFilter(tripFilter === 'standard' ? 'all' : 'standard'); }}
                    type="button"
                  >Standard</button>
                  <button
                    className={'ts-filter-toggle__btn' + (tripFilter === 'return' ? ' ts-filter-toggle__btn--active' : '')}
                    onClick={function () { setTripFilter(tripFilter === 'return' ? 'all' : 'return'); }}
                    type="button"
                  >Return</button>
                </div>
              </div>

              {/* Truck Type */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Truck Type</label>
                <div className="ts-filter-checks">
                  {['mini', 'full', 'trailer', 'container'].map(function (t) {
                    var checked = truckTypeFilter.indexOf(t) !== -1;
                    return (
                      <label key={t} className="ts-filter-check">
                        <input type="checkbox" checked={checked} onChange={function () { toggleTruckType(t); }} />
                        <span className="ts-filter-check__custom" />
                        <span className="ts-filter-check__text">{getTruckLabel(t)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Capacity */}
              <div className="ts-filter-group">
                <div className="ts-filter-group__header">
                  <label className="ts-filter-group__label">Capacity</label>
                  <span className="ts-filter-group__value">0 - {capacityRange}t</span>
                </div>
                <input type="range" className="ts-range-slider" min="0" max="40" value={capacityRange}
                  onChange={function (e) { setCapacityRange(parseInt(e.target.value)); }} />
              </div>

              {/* Price Range */}
              <div className="ts-filter-group">
                <div className="ts-filter-group__header">
                  <label className="ts-filter-group__label">Price Range</label>
                  <span className="ts-filter-group__value">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" className="ts-range-slider" min="0" max="100000" step="1000" value={priceRange}
                  onChange={function (e) { setPriceRange(parseInt(e.target.value)); }} />
              </div>

              {/* Min Rating */}
              <div className="ts-filter-group">
                <label className="ts-filter-group__label">Minimum Rating</label>
                <div className="ts-rating-stars">
                  {[1, 2, 3, 4, 5].map(function (star) {
                    return (
                      <button key={star} className="ts-rating-star-btn" type="button"
                        onClick={function () { setMinRating(minRating === star ? 0 : star); }}
                        aria-label={'Set minimum rating to ' + star}
                      >
                        <Star size={22} fill={star <= minRating ? '#F59E0B' : 'none'} color={star <= minRating ? '#F59E0B' : '#D1D5DB'} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="ts-filter-sheet__footer">
              <button className="ts-filter-sheet__clear" onClick={handleClearFilters} type="button">Clear All</button>
              <button className="ts-filter-sheet__apply" onClick={handleApplyFilters} type="button">Apply Filters</button>
            </div>
          </div>
        </>
      )}
    </>
  );

  if (isLoggedIn) {
    return (
      <DashboardLayout activeTab="search">
        <div className="ts-page">
          {pageContent}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="ts-page">
      {/* ─── Top Navigation Bar ───────────────────────────── */}
      <nav className="ts-navbar">
        <div className="ts-navbar__inner">
          <div className="ts-navbar__left">
            <a className="ts-navbar__brand" onClick={function () { navigate('/'); }}>
              <img src={retruckLogo} alt="ReTruck" className="ts-navbar__logo-icon" />
              <img src={retruckText} alt="ReTruck" className="ts-navbar__logo-text" />
            </a>
          </div>

          <button
            className="ts-navbar__hamburger"
            onClick={function () { setMobileMenuOpen(!mobileMenuOpen); }}
            type="button"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={'ts-navbar__links' + (mobileMenuOpen ? ' ts-navbar__links--open' : '')}>
            <li><a className="ts-navbar__link" onClick={function () { navigate('/'); }}>Home</a></li>
            {isLoggedIn && (
              <li><a className="ts-navbar__link" onClick={function () { navigate('/dashboard'); }}>Dashboard</a></li>
            )}
            <li><a className="ts-navbar__link ts-navbar__link--active">Find Trucks</a></li>
            {isLoggedIn && auth.role === 'shipper' && (
              <li><a className="ts-navbar__link" onClick={function () { navigate('/dashboard/bookings'); }}>My Bookings</a></li>
            )}
          </ul>

          <div className={'ts-navbar__actions' + (mobileMenuOpen ? ' ts-navbar__actions--open' : '')}>
            {isLoggedIn ? (
              <>
                <button className="ts-navbar__btn-dashboard" onClick={function () { navigate('/dashboard'); }} type="button">
                  Dashboard
                </button>
                <button className="ts-navbar__btn-logout" onClick={function () { auth.logout(); navigate('/'); }} type="button">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <button className="ts-navbar__btn-login" onClick={function () { navigate('/auth'); }} type="button">Login</button>
                <button className="ts-navbar__btn-cta" onClick={function () { navigate('/auth'); }} type="button">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {pageContent}

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="ts-footer">
        <div className="ts-footer__inner">
          <div className="ts-footer__brand">
            <div className="ts-footer__logo-wrap" onClick={function () { navigate('/'); }}>
              <img src={retruckLogo} alt="ReTruck" className="ts-footer__logo-icon" />
              <img src={retruckText} alt="ReTruck" className="ts-footer__logo-text" />
            </div>
            <p className="ts-footer__tagline">© {new Date().getFullYear()} ReTruck Freight Marketplace.<br />Efficiency in motion.</p>
          </div>
          <div className="ts-footer__col">
            <h5 className="ts-footer__col-title">Links</h5>
            <a className="ts-footer__link" onClick={function () { navigate('/'); }}>Company</a>
            <a className="ts-footer__link" href="#">Legal</a>
            <a className="ts-footer__link" href="#">Support</a>
            <a className="ts-footer__link" href="#">Socials</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TruckSearch;
