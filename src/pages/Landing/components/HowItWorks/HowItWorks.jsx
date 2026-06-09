import React, { useState } from 'react';
import './HowItWorks.css';
import {
  IconPackage,
  IconSearch,
  IconCheckCircle,
  IconTruck,
  IconDocument,
  IconMap,
  IconMail,
  IconMoney,
} from '../Icons/Icons.jsx';

var shipperSteps = [
  {
    step: '1',
    Icon: IconPackage,
    title: 'Post Load',
    desc: 'Enter your freight details and requirements.',
  },
  {
    step: '2',
    Icon: IconSearch,
    title: 'Match Trucks',
    desc: 'Our algorithm finds the best available carriers.',
  },
  {
    step: '3',
    Icon: IconCheckCircle,
    title: 'Book & Track',
    desc: 'Confirm booking and monitor progress live.',
  },
  {
    step: '4',
    Icon: IconTruck,
    title: 'Delivery',
    desc: 'Proof of delivery and rated performance.',
  },
];

var driverSteps = [
  {
    step: '1',
    Icon: IconDocument,
    title: 'Register',
    desc: 'Create your driver profile and add truck details.',
  },
  {
    step: '2',
    Icon: IconMap,
    title: 'Post Route',
    desc: 'Share your upcoming route and available capacity.',
  },
  {
    step: '3',
    Icon: IconMail,
    title: 'Get Requests',
    desc: 'Receive and accept booking requests from shippers.',
  },
  {
    step: '4',
    Icon: IconMoney,
    title: 'Get Paid',
    desc: 'Complete delivery and receive secure payment.',
  },
];

function HowItWorks() {
  var tabState = useState('shippers');
  var activeTab = tabState[0];
  var setActiveTab = tabState[1];

  var steps = activeTab === 'shippers' ? shipperSteps : driverSteps;

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="hiw-inner">
        <div className="hiw-header">
          <h2 className="hiw-title">How It Works</h2>
          <p className="hiw-subtitle">
            Simple, transparent, and built for scale. See how ReTruck streamlines your logistics.
          </p>
          <div className="hiw-tabs">
            <button
              className={activeTab === 'shippers' ? 'tab-pill active' : 'tab-pill'}
              onClick={function() { setActiveTab('shippers'); }}
            >
              For Shippers
            </button>
            <button
              className={activeTab === 'drivers' ? 'tab-pill active' : 'tab-pill'}
              onClick={function() { setActiveTab('drivers'); }}
            >
              For Drivers
            </button>
          </div>
        </div>

        <div className="hiw-steps">
          {steps.map(function(step, index) {
            var StepIcon = step.Icon;
            return (
              <div className="hiw-card" key={index}>
                <div className="hiw-step-num">{step.step}</div>
                <div className="hiw-icon-wrap">
                  <StepIcon size={26} />
                </div>
                <h4 className="hiw-card-title">{step.title}</h4>
                <p className="hiw-card-desc">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
