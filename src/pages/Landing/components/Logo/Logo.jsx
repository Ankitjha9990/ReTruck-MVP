import React from 'react';
import './Logo.css';
import retruckLogo from '../../../../assets/logos/retruck-logo.png';
import retruckText from '../../../../assets/logos/Retruck-text.png';

function Logo({ theme }) {
  /* theme = "light" (default, dark text) | "dark" (white text for footer) */
  var isDark = theme === 'dark';

  return (
    <div className={isDark ? 'logo-wrapper logo-wrapper--dark' : 'logo-wrapper'}>
      <img 
        src={retruckLogo} 
        alt="ReTruck Icon" 
        className={isDark ? 'logo-icon logo-icon--dark' : 'logo-icon'} 
      />
      <img 
        src={retruckText} 
        alt="ReTruck" 
        className={isDark ? 'logo-text logo-text--dark' : 'logo-text'} 
      />
    </div>
  );
}

export default Logo;
