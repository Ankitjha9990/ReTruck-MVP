import React from 'react';
import './FeaturesGrid.css';
import {
  IconShield,
  IconBan,
  IconPin,
  IconBolt,
  IconFileCheck,
  IconClock,
} from '../Icons/Icons.jsx';

var features = [
  {
    Icon: IconShield,
    title: 'Verified Fleet',
    desc: 'Every driver and vehicle undergoes strict KYC and documentation checks.',
  },
  {
    Icon: IconBan,
    title: 'Zero Commission',
    desc: 'No hidden fees, no broker commissions. Connect directly, pay only what you see.',
  },
  {
    Icon: IconPin,
    title: 'Live Tracking',
    desc: 'Monitor your freight in real time from pickup to drop off.',
  },
  {
    Icon: IconBolt,
    title: 'Fast Matching',
    desc: 'Our smart algorithm matches needs to trucks in seconds, cutting hours.',
  },
  {
    Icon: IconFileCheck,
    title: 'Digital Documentation',
    desc: 'Paperless ePODs, digital contracts, and instant invoicing built in.',
  },
  {
    Icon: IconClock,
    title: '24/7 Support',
    desc: 'Dedicated on-ground and phone support whenever you need assistance.',
  },
];

function FeaturesGrid() {
  return (
    <section className="features-grid" id="for-shippers">
      <div className="fg-inner">
        <div className="fg-header">
          <h2 className="fg-title">Why Choose ReTruck</h2>
        </div>
        <div className="fg-cards">
          {features.map(function(feature, index) {
            var FeatureIcon = feature.Icon;
            return (
              <div className="fg-card" key={index}>
                <div className="fg-icon-wrap">
                  <FeatureIcon size={26} />
                </div>
                <h4 className="fg-card-title">{feature.title}</h4>
                <p className="fg-card-desc">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesGrid;
