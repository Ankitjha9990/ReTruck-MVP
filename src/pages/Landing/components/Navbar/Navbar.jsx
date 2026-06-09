import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import Logo from '../Logo/Logo.jsx';

function Navbar() {
  var menuOpen = useState(false);
  var isOpen = menuOpen[0];
  var setIsOpen = menuOpen[1];

  var navigate = useNavigate();

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  function handleLogin() {
    navigate('/auth');
  }

  function handleGetStarted() {
    navigate('/auth');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <a href="#home" className="navbar-logo-link">
          <Logo theme="light" />
        </a>

        <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <ul className={isOpen ? 'nav-links open' : 'nav-links'}>
          <li><a href="#home" className="nav-link active">Home</a></li>
          <li><a href="#how-it-works" className="nav-link">How it Works</a></li>
          <li><a href="#for-drivers" className="nav-link">For Drivers</a></li>
          <li><a href="#for-shippers" className="nav-link">For Shippers</a></li>
          <li><a href="#about" className="nav-link">About</a></li>
        </ul>

        <div className={isOpen ? 'nav-actions open' : 'nav-actions'}>
          <button className="btn-login" onClick={handleLogin}>Login</button>
          <button className="btn-get-started" onClick={handleGetStarted}>Get Started</button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
