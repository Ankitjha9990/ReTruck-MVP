import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  MapPin, Navigation, Calendar, ArrowRight, RefreshCcw,
  Package, IndianRupee, ChevronLeft, ChevronRight, Eye,
  Weight, Check, Truck, Clock, AlertCircle
} from 'lucide-react';
import CITIES from '../../utils/cities.js';
import { createListing } from '../../services/listingService.js';
import { getMyTrucks } from '../../services/truckService.js';
import './AddRoute.css';

var CARGO_TYPES = [
  'General', 'Agriculture', 'Auto Parts', 'Textiles',
  'FMCG', 'Construction', 'Electronics', 'Chemicals'
];

function AddRoute() {
  var navigate = useNavigate();
  var auth = useAuth();
  var toast = useToast();
  var user = auth.user;

  var stepState = useState(1);
  var currentStep = stepState[0];
  var setCurrentStep = stepState[1];

  var isPublishing = useState(false);
  var publishing = isPublishing[0];
  var setPublishing = isPublishing[1];

  // Step 1 — Route
  var fromState = useState('');
  var fromCity = fromState[0];
  var setFromCity = fromState[1];

  var toState = useState('');
  var toCity = toState[0];
  var setToCity = toState[1];

  var dateState = useState('');
  var departureDate = dateState[0];
  var setDepartureDate = dateState[1];

  var tripState = useState('return');
  var tripType = tripState[0];
  var setTripType = tripState[1];

  // Step 2 — Cargo
  var capacityState = useState(10);
  var capacity = capacityState[0];
  var setCapacity = capacityState[1];

  var priceState = useState('');
  var pricePerKm = priceState[0];
  var setPricePerKm = priceState[1];

  var cargoState = useState([]);
  var selectedCargo = cargoState[0];
  var setSelectedCargo = cargoState[1];

  // Step 3 — Notes
  var notesState = useState('');
  var notes = notesState[0];
  var setNotes = notesState[1];

  // City autocomplete
  var fromSuggestState = useState([]);
  var fromSuggestions = fromSuggestState[0];
  var setFromSuggestions = fromSuggestState[1];

  var toSuggestState = useState([]);
  var toSuggestions = toSuggestState[0];
  var setToSuggestions = toSuggestState[1];

  var showFromState = useState(false);
  var showFromDropdown = showFromState[0];
  var setShowFromDropdown = showFromState[1];

  var showToState = useState(false);
  var showToDropdown = showToState[0];
  var setShowToDropdown = showToState[1];

  // Errors
  var errorsState = useState({});
  var errors = errorsState[0];
  var setErrors = errorsState[1];

  function handleCitySearch(value, setCity, setSuggestions, setShow) {
    setCity(value);
    if (value.length >= 2) {
      var filtered = CITIES.filter(function (c) {
        return c.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
      }).slice(0, 6);
      setSuggestions(filtered);
      setShow(true);
    } else {
      setSuggestions([]);
      setShow(false);
    }
  }

  function selectCity(city, setCity, setShow) {
    setCity(city.name);
    setShow(false);
  }

  function toggleCargo(type) {
    if (selectedCargo.indexOf(type) !== -1) {
      setSelectedCargo(selectedCargo.filter(function (c) { return c !== type; }));
    } else {
      setSelectedCargo(selectedCargo.concat([type]));
    }
  }

  function validateStep1() {
    var newErrors = {};
    if (!fromCity.trim()) newErrors.from = 'Origin city is required';
    if (!toCity.trim()) newErrors.to = 'Destination city is required';
    if (!departureDate) newErrors.date = 'Departure date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validateStep2() {
    var newErrors = {};
    if (capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
    setErrors({});
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  }

  function getEstimatedDistance() {
    // Simple mock distance calculation
    var distances = {
      'patna-delhi': 1050, 'patna-kolkata': 580, 'patna-mumbai': 1900,
      'delhi-chandigarh': 250, 'mumbai-pune': 150, 'bangalore-chennai': 350,
      'patna-varanasi': 300, 'delhi-ludhiana': 310, 'surat-ahmedabad': 265,
      'patna-lucknow': 540, 'delhi-jaipur': 280, 'mumbai-nashik': 170
    };
    var key = (fromCity + '-' + toCity).toLowerCase();
    var reverseKey = (toCity + '-' + fromCity).toLowerCase();
    return distances[key] || distances[reverseKey] || Math.floor(300 + Math.random() * 800);
  }

  // Load the user's first truck for listing
  var [userTruckId, setUserTruckId] = useState(null);
  var [loadingTruck, setLoadingTruck] = useState(true);
  useEffect(function () {
    async function loadTruck() {
      setLoadingTruck(true);
      try {
        var result = await getMyTrucks();
        if (result.data && result.data.length > 0) {
          setUserTruckId(result.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load truck', err);
      } finally {
        setLoadingTruck(false);
      }
    }
    loadTruck();
  }, []);

  async function handlePublish() {
    setPublishing(true);
    var distance = getEstimatedDistance();
    var price = parseInt(pricePerKm) || 40;

    var listingData = {
      truck_id: userTruckId,
      from_city: fromCity,
      to_city: toCity,
      from_state: '',
      to_state: '',
      departure_date: departureDate,
      trip_type: tripType,
      available_capacity: capacity,
      price_per_km: price,
      cargo_types: selectedCargo.map(function (c) { return c.toLowerCase(); }),
      notes: notes,
      estimated_distance: distance,
      status: 'active'
    };

    var result = await createListing(listingData);

    setPublishing(false);
    if (result.error) {
      toast.showToast('Failed to publish: ' + result.error.message, 'error');
    } else {
      toast.showToast('Route published! Shippers can now find you.', 'success');
      navigate('/dashboard');
    }
  }

  var today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout activeTab="add" onTabChange={function () {}}>
      <div className="add-route-page">
        {loadingTruck ? (
          <div className="ar-form-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            <div style={{ width: 40, height: 40, border: '3px solid var(--color-border, #E5E7EB)', borderTop: '3px solid var(--color-green, #2ECC8F)', borderRadius: '50%', animation: 'arSpin 700ms linear infinite' }}></div>
          </div>
        ) : !userTruckId ? (
          <div className="ar-form-card">
            <div className="ar-no-truck">
              <div className="ar-no-truck__icon-wrap">
                <Truck size={48} className="ar-no-truck__icon" aria-hidden="true" />
                <AlertCircle size={24} className="ar-no-truck__badge" aria-hidden="true" />
              </div>
              <h2 className="ar-no-truck__title">No Truck Registered</h2>
              <p className="ar-no-truck__desc">
                Before you can publish a route, you must first register your truck details (registration number, truck type, and weight capacity).
              </p>
              <button
                className="ar-no-truck__btn"
                onClick={function () { navigate('/dashboard/my-truck'); }}
                type="button"
              >
                Go to My Truck Settings
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress */}
            <div className="ar-progress">
              {[1, 2, 3].map(function (step) {
                var isActive = currentStep === step;
                var isCompleted = currentStep > step;
                return (
                  <div key={step} className="ar-progress__step-wrap">
                    <div className={'ar-progress__step' +
                      (isActive ? ' ar-progress__step--active' : '') +
                      (isCompleted ? ' ar-progress__step--completed' : '')}
                    >
                      {isCompleted ? <Check size={16} /> : step}
                    </div>
                    <span className={'ar-progress__label' +
                      (isActive ? ' ar-progress__label--active' : '')}
                    >
                      {step === 1 ? 'Route' : step === 2 ? 'Cargo' : 'Review'}
                    </span>
                    {step < 3 && (
                      <div className={'ar-progress__line' + (currentStep > step ? ' ar-progress__line--done' : '')} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="ar-form-card">

              {/* ── Step 1: Route ──────────────────────────── */}
              {currentStep === 1 && (
                <div className="ar-step ar-step--enter">
                  <h2 className="ar-step__title">Where are you headed?</h2>
                  <p className="ar-step__desc">Enter your route details</p>

                  <div className="ar-field">
                    <label className="ar-field__label" htmlFor="ar-from">
                      <MapPin size={14} color="var(--color-green)" aria-hidden="true" /> Origin City
                    </label>
                    <div className="ar-field__autocomplete">
                      <input
                        id="ar-from"
                        type="text"
                        className={'ar-field__input' + (errors.from ? ' ar-field__input--error' : '')}
                        value={fromCity}
                        onChange={function (e) { handleCitySearch(e.target.value, setFromCity, setFromSuggestions, setShowFromDropdown); }}
                        onFocus={function () { if (fromSuggestions.length > 0) setShowFromDropdown(true); }}
                        onBlur={function () { setTimeout(function () { setShowFromDropdown(false); }, 200); }}
                        placeholder="e.g. Patna"
                      />
                      {showFromDropdown && fromSuggestions.length > 0 && (
                        <div className="ar-field__dropdown">
                          {fromSuggestions.map(function (city) {
                            return (
                              <button
                                key={city.name}
                                className="ar-field__dropdown-item"
                                onMouseDown={function () { selectCity(city, setFromCity, setShowFromDropdown); }}
                                type="button"
                              >
                                <MapPin size={14} aria-hidden="true" />
                                <span>{city.name}</span>
                                <span className="ar-field__dropdown-state">{city.state}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {errors.from && <span className="ar-field__error"><AlertCircle size={14} /> {errors.from}</span>}
                  </div>

                  <div className="ar-field">
                    <label className="ar-field__label" htmlFor="ar-to">
                      <Navigation size={14} color="var(--color-navy)" aria-hidden="true" /> Destination City
                    </label>
                    <div className="ar-field__autocomplete">
                      <input
                        id="ar-to"
                        type="text"
                        className={'ar-field__input' + (errors.to ? ' ar-field__input--error' : '')}
                        value={toCity}
                        onChange={function (e) { handleCitySearch(e.target.value, setToCity, setToSuggestions, setShowToDropdown); }}
                        onFocus={function () { if (toSuggestions.length > 0) setShowToDropdown(true); }}
                        onBlur={function () { setTimeout(function () { setShowToDropdown(false); }, 200); }}
                        placeholder="e.g. Delhi"
                      />
                      {showToDropdown && toSuggestions.length > 0 && (
                        <div className="ar-field__dropdown">
                          {toSuggestions.map(function (city) {
                            return (
                              <button
                                key={city.name}
                                className="ar-field__dropdown-item"
                                onMouseDown={function () { selectCity(city, setToCity, setShowToDropdown); }}
                                type="button"
                              >
                                <MapPin size={14} aria-hidden="true" />
                                <span>{city.name}</span>
                                <span className="ar-field__dropdown-state">{city.state}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {errors.to && <span className="ar-field__error"><AlertCircle size={14} /> {errors.to}</span>}
                  </div>

                  <div className="ar-field">
                    <label className="ar-field__label" htmlFor="ar-date">
                      <Calendar size={14} aria-hidden="true" /> Departure Date
                    </label>
                    <input
                      id="ar-date"
                      type="date"
                      className={'ar-field__input' + (errors.date ? ' ar-field__input--error' : '')}
                      value={departureDate}
                      onChange={function (e) { setDepartureDate(e.target.value); }}
                      min={today}
                    />
                    {errors.date && <span className="ar-field__error"><AlertCircle size={14} /> {errors.date}</span>}
                  </div>

                  <div className="ar-field">
                    <label className="ar-field__label">Trip Type</label>
                    <div className="ar-trip-toggle">
                      <button
                        className={'ar-trip-card' + (tripType === 'standard' ? ' ar-trip-card--active' : '')}
                        onClick={function () { setTripType('standard'); }}
                        type="button"
                      >
                        <ArrowRight size={20} aria-hidden="true" />
                        <span className="ar-trip-card__title">Standard Trip</span>
                        <span className="ar-trip-card__desc">I'm heading to this destination</span>
                      </button>
                      <button
                        className={'ar-trip-card ar-trip-card--return' + (tripType === 'return' ? ' ar-trip-card--active' : '')}
                        onClick={function () { setTripType('return'); }}
                        type="button"
                      >
                        <RefreshCcw size={20} aria-hidden="true" />
                        <span className="ar-trip-card__title">Return Trip</span>
                        <span className="ar-trip-card__desc">I'm returning empty, offer discount</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Cargo ──────────────────────────── */}
              {currentStep === 2 && (
                <div className="ar-step ar-step--enter">
                  <h2 className="ar-step__title">Cargo & Pricing</h2>
                  <p className="ar-step__desc">Set your capacity and rate</p>

                  <div className="ar-field">
                    <label className="ar-field__label">
                      <Weight size={14} aria-hidden="true" /> Available Capacity (Tonnes)
                    </label>
                    <div className="ar-stepper">
                      <button
                        className="ar-stepper__btn"
                        onClick={function () { if (capacity > 0.5) setCapacity(capacity - 0.5); }}
                        type="button"
                        aria-label="Decrease capacity"
                      >−</button>
                      <span className="ar-stepper__value">{capacity}</span>
                      <button
                        className="ar-stepper__btn"
                        onClick={function () { if (capacity < 30) setCapacity(capacity + 0.5); }}
                        type="button"
                        aria-label="Increase capacity"
                      >+</button>
                    </div>
                    {errors.capacity && <span className="ar-field__error"><AlertCircle size={14} /> {errors.capacity}</span>}
                  </div>

                  <div className="ar-field">
                    <label className="ar-field__label" htmlFor="ar-price">
                      <IndianRupee size={14} aria-hidden="true" /> Price per KM (optional)
                    </label>
                    <div className="ar-field__input-wrap ar-field__input-wrap--price">
                      <span className="ar-field__input-prefix">₹</span>
                      <input
                        id="ar-price"
                        type="number"
                        className="ar-field__input"
                        value={pricePerKm}
                        onChange={function (e) { setPricePerKm(e.target.value); }}
                        placeholder="e.g. 45"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="ar-field">
                    <label className="ar-field__label">
                      <Package size={14} aria-hidden="true" /> Accepted Cargo Types
                    </label>
                    <div className="ar-cargo-chips">
                      {CARGO_TYPES.map(function (type) {
                        var isSelected = selectedCargo.indexOf(type) !== -1;
                        return (
                          <button
                            key={type}
                            className={'ar-cargo-chip' + (isSelected ? ' ar-cargo-chip--selected' : '')}
                            onClick={function () { toggleCargo(type); }}
                            type="button"
                          >
                            {isSelected && <Check size={14} aria-hidden="true" />}
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 3: Review & Publish ───────────────── */}
              {currentStep === 3 && (
                <div className="ar-step ar-step--enter">
                  <h2 className="ar-step__title">Review & Publish</h2>
                  <p className="ar-step__desc">Add notes and preview your listing</p>

                  <div className="ar-field">
                    <label className="ar-field__label" htmlFor="ar-notes">Notes / Availability</label>
                    <textarea
                      id="ar-notes"
                      className="ar-field__textarea"
                      value={notes}
                      onChange={function (e) { setNotes(e.target.value.substring(0, 300)); }}
                      placeholder="Any additional info for shippers..."
                      rows={3}
                      maxLength={300}
                    />
                    <span className="ar-field__char-count">{notes.length}/300</span>
                  </div>

                  {/* Listing Preview */}
                  <div className="ar-preview">
                    <div className="ar-preview__badge">
                      <Eye size={14} aria-hidden="true" /> Preview
                    </div>
                    <div className="ar-preview__card">
                      <div className="ar-preview__route">
                        <div className="ar-preview__route-cities">
                          <MapPin size={16} color="var(--color-green)" aria-hidden="true" />
                          <span className="ar-preview__city">{fromCity || '---'}</span>
                          <ArrowRight size={14} color="var(--color-text-muted)" aria-hidden="true" />
                          <span className="ar-preview__city">{toCity || '---'}</span>
                        </div>
                        <span className={'ar-preview__trip-badge ar-preview__trip-badge--' + tripType}>
                          {tripType === 'return' ? (
                            <><RefreshCcw size={12} aria-hidden="true" /> Return</>
                          ) : (
                            <><ArrowRight size={12} aria-hidden="true" /> Standard</>
                          )}
                        </span>
                      </div>

                      <div className="ar-preview__details">
                        <div className="ar-preview__detail">
                          <Calendar size={14} aria-hidden="true" />
                          <span>{departureDate ? new Date(departureDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}</span>
                        </div>
                        <div className="ar-preview__detail">
                          <Truck size={14} aria-hidden="true" />
                          <span>{capacity} Tonnes</span>
                        </div>
                        <div className="ar-preview__detail">
                          <IndianRupee size={14} aria-hidden="true" />
                          <span>₹{pricePerKm || '40'}/km</span>
                        </div>
                      </div>

                      {selectedCargo.length > 0 && (
                        <div className="ar-preview__cargo">
                          {selectedCargo.map(function (c) {
                            return <span key={c} className="ar-preview__cargo-tag">{c}</span>;
                          })}
                        </div>
                      )}

                      {notes && (
                        <p className="ar-preview__notes">{notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Action Bar ──────────────────────────────── */}
            <div className="ar-actions">
              {currentStep > 1 && (
                <button className="ar-actions__back" onClick={prevStep} type="button">
                  <ChevronLeft size={18} aria-hidden="true" /> Back
                </button>
              )}
              <div className="ar-actions__spacer" />
              {currentStep < 3 ? (
                <button className="ar-actions__next" onClick={nextStep} type="button">
                  Next <ChevronRight size={18} aria-hidden="true" />
                </button>
              ) : (
                <button
                  className={'ar-actions__publish' + (publishing ? ' ar-actions__publish--loading' : '')}
                  onClick={handlePublish}
                  disabled={publishing}
                  type="button"
                >
                  {publishing ? (
                    <span className="ar-actions__loader" />
                  ) : (
                    <>Publish Route <Check size={18} aria-hidden="true" /></>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AddRoute;
