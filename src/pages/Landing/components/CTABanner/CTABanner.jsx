import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTABanner.css';

function CTABanner() {
  var navigate = useNavigate();

  function handleRegisterShipper() {
    navigate('/auth');
  }

  function handleRegisterDriver() {
    navigate('/auth');
  }

  return (
    <section className="cta-banner">
      <div className="cta-inner">
        <h2 className="cta-title">Ready to Stop Losing Money on Empty Trips?</h2>
        <p className="cta-subtitle">
          Join thousands of shippers and fleet owners already optimising their logistics with ReTruck.
        </p>
        <div className="cta-buttons">
          <button className="cta-btn-shipper" onClick={handleRegisterShipper}>Register as Shipper</button>
          <button className="cta-btn-driver" onClick={handleRegisterDriver}>Register as Driver</button>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;
