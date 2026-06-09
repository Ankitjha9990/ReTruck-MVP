import React from 'react';

/* All SVG icons used across the landing page.
   No emojis anywhere — pure SVG shapes. */

export function IconPackage({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  );
}

export function IconSearch({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconCheckCircle({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export function IconTruck({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function IconDocument({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconMap({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export function IconMail({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export function IconMoney({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#2ECC8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export function IconShield({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconBan({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

export function IconPin({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconBolt({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconFileCheck({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  );
}

export function IconClock({ size }) {
  var s = size || 28;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#1B2B4B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconStar({ filled, size }) {
  var s = size || 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? '#FF9B6C' : 'none'} stroke="#FF9B6C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconIndiaBadge({ size }) {
  var s = size || 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="5" width="22" height="4" rx="1" fill="#FF9933" />
      <rect x="1" y="9" width="22" height="4" rx="1" fill="#ffffff" />
      <rect x="1" y="13" width="22" height="4" rx="1" fill="#138808" />
      <rect x="1" y="5" width="22" height="12" rx="2" fill="none" stroke="#aaaaaa" strokeWidth="0.5" />
      <circle cx="12" cy="11" r="2" fill="none" stroke="#000080" strokeWidth="0.8" />
    </svg>
  );
}

export function IconTruckButton({ size }) {
  var s = size || 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
