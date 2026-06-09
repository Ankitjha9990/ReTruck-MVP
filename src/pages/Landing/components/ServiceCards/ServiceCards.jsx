import React from 'react';
import './ServiceCards.css';

function ServiceCards() {
  return (
    <section className="service-cards">
      <div className="sc-inner">

        {/* Standard Trip Card */}
        <div className="sc-card sc-standard">
          <div className="sc-tag">Standard Trip</div>
          <p className="sc-desc">
            Book dedicated trucks for your specific routes at competitive market rates.
          </p>
          <ul className="sc-features">
            <li className="sc-feature-item">
              <span className="sc-check">✓</span> Guaranteed availability
            </li>
            <li className="sc-feature-item">
              <span className="sc-check">✓</span> Direct negotiation
            </li>
          </ul>
          <button className="sc-btn sc-btn-dark">Know Standard</button>
        </div>

        {/* Return Trip Card */}
        <div className="sc-card sc-return">
          <div className="sc-badge-new">Trending</div>
          <div className="sc-tag">Return Trip</div>
          <p className="sc-desc">
            Tap into our network of trucks looking for return loads at discounted rates.
          </p>
          <ul className="sc-features">
            <li className="sc-feature-item">
              <span className="sc-check-green">✓</span> Upto 60% cost savings
            </li>
            <li className="sc-feature-item">
              <span className="sc-check-green">✓</span> Eco-friendly logistics
            </li>
          </ul>
          <button className="sc-btn sc-btn-green">Find Return Load</button>
        </div>

      </div>
    </section>
  );
}

export default ServiceCards;
