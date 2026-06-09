import React from 'react';
import './LandingFooter.css';
import Logo from '../Logo/Logo.jsx';

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <a href="#home" className="footer-logo-link">
            <Logo theme="dark" />
          </a>
          <p className="footer-tagline">
            India's Smartest Freight Marketplace.<br />
            No truck returns empty.
          </p>
        </div>

        <div className="footer-col">
          <h5 className="footer-col-title">Company</h5>
          <ul className="footer-links">
            <li><a href="#about" className="footer-link">About Us</a></li>
            <li><a href="#careers" className="footer-link">Careers</a></li>
            <li><a href="#blog" className="footer-link">Blog</a></li>
            <li><a href="#press" className="footer-link">Press</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-col-title">Legal</h5>
          <ul className="footer-links">
            <li><a href="#privacy" className="footer-link">Privacy Policy</a></li>
            <li><a href="#terms" className="footer-link">Terms of Service</a></li>
            <li><a href="#cookies" className="footer-link">Cookie Policy</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5 className="footer-col-title">Support</h5>
          <ul className="footer-links">
            <li><a href="#help" className="footer-link">Help Center</a></li>
            <li><a href="#contact" className="footer-link">Contact Us</a></li>
            <li><a href="#status" className="footer-link">System Status</a></li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; 2025 ReTruck Freight Marketplace. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default LandingFooter;
