import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';
import { IconIndiaBadge, IconTruckButton } from '../Icons/Icons.jsx';
import mapImage from '../../../../assets/images/india-map-neon.png';

function HeroSection() {
  var navigate = useNavigate();

  function handleFindTruck() {
    navigate('/auth');
  }

  function handleJoinDriver() {
    navigate('/auth');
  }

  return (
    <section className="hero" id="home">
      <div className="hero-inner">

        {/* Left Content */}
        <div className="hero-left">
          <div className="hero-badge">
            <IconIndiaBadge size={18} />
            <span className="badge-text">India's Smartest Freight Marketplace</span>
          </div>

          <h1 className="hero-heading">
            Book Trucks. Fill Returns.<br />
            Cut Costs by <span className="hero-highlight">60%</span>
          </h1>

          <p className="hero-para">
            Connect directly with verified fleet owners and drivers. Say goodbye to
            empty return trips and hello to optimised logistics efficiency.
          </p>

          <div className="hero-buttons">
            <button className="btn-find-truck" onClick={handleFindTruck}>
              <IconTruckButton size={18} />
              Find a Truck
            </button>
            <button className="btn-join-driver" onClick={handleJoinDriver}>Join as Driver</button>
          </div>

          <div className="hero-trust">
            <span className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Clients
            </span>
            <span className="trust-divider">|</span>
            <span className="trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Rated &amp; Reviewed
            </span>
          </div>
        </div>

        {/* Right Content - Map Card */}
        <div className="hero-right">
          <div className="hero-map-card">
            <div className="map-header">
              <span className="map-tag">&#8377;62,500 Cr</span>
              <span className="map-subtitle">Market size</span>
            </div>
            <div className="map-illustration">
              <img src={mapImage} alt="India Route Map" className="india-map-image" />
            </div>
            <div className="map-footer">
              <div className="map-stat">
                <strong>13M+</strong>
                <span>Commercial Vehicles</span>
              </div>
            </div>
          </div>

          {/* Floating stat card */}
          <div className="floating-card floating-card-bottom">
            <span className="floating-label">40–60%</span>
            <span className="floating-sub">Empty Returns</span>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;
