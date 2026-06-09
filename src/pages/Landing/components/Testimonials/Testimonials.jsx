import React from 'react';
import './Testimonials.css';
import { IconStar } from '../Icons/Icons.jsx';

var testimonials = [
  {
    rating: 4,
    text: 'Using ReTruck for return trips has considerably changed my margins. I no longer drive empty from Delhi to Jaipur.',
    name: 'Raju Prasad',
    role: 'Fleet Owner',
    initials: 'RP',
  },
  {
    rating: 4,
    text: 'The digital PODs and instant matching saves us countless hours of calling brokers. It\'s a very professional platform.',
    name: 'Anita Sharma',
    role: 'Logistics Head',
    initials: 'AS',
  },
  {
    rating: 4,
    text: 'Finding verified trucks during peak season used to be a nightmare. ReTruck ensures we always have capacity when needed.',
    name: 'Vikram Singh',
    role: 'Distributor',
    initials: 'VS',
  },
];

function StarRating(props) {
  var rating = props.rating;
  var stars = [];
  var i;
  for (i = 1; i <= 5; i++) {
    stars.push(
      <IconStar key={i} filled={i <= rating} size={16} />
    );
  }
  return <div className="stars">{stars}</div>;
}

function Testimonials() {
  return (
    <section className="testimonials">
      <div className="tm-inner">
        <div className="tm-header">
          <h2 className="tm-title">Trusted by India's Movers</h2>
        </div>
        <div className="tm-cards">
          {testimonials.map(function(tm, index) {
            return (
              <div className="tm-card" key={index}>
                <StarRating rating={tm.rating} />
                <p className="tm-text">"{tm.text}"</p>
                <div className="tm-author">
                  <div className="tm-avatar">{tm.initials}</div>
                  <div className="tm-info">
                    <span className="tm-name">{tm.name}</span>
                    <span className="tm-role">{tm.role}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
