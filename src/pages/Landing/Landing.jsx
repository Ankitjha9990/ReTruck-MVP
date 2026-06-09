import React from 'react';
import './Landing.css';
import Navbar from './components/Navbar/Navbar.jsx';
import HeroSection from './components/HeroSection/HeroSection.jsx';
import StatsBar from './components/StatsBar/StatsBar.jsx';
import HowItWorks from './components/HowItWorks/HowItWorks.jsx';
import ServiceCards from './components/ServiceCards/ServiceCards.jsx';
import FeaturesGrid from './components/FeaturesGrid/FeaturesGrid.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import CTABanner from './components/CTABanner/CTABanner.jsx';
import LandingFooter from './components/LandingFooter/LandingFooter.jsx';

function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <ServiceCards />
      <FeaturesGrid />
      <Testimonials />
      <CTABanner />
      <LandingFooter />
    </div>
  );
}

export default Landing;
