import React from 'react';
import './StatsBar.css';

function StatsBar() {
  const stats = [
    { value: '13M+', label: 'Commercial Vehicles' },
    { value: '3-4M', label: 'Daily Move Trucks' },
    { value: '40-60%', label: 'Empty Return Rate', highlight: true },
    { value: 'Zero', label: 'Broker Fees', highlight: true },
  ];

  return (
    <section className="stats-bar">
      <div className="stats-inner">
        {stats.map(function(stat, index) {
          return (
            <div className="stat-item" key={index}>
              <span className={stat.highlight ? 'stat-value highlight' : 'stat-value'}>
                {stat.value}
              </span>
              <span className="stat-label">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default StatsBar;
