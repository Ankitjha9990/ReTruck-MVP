import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  LayoutDashboard, List, Inbox, UserCircle, Plus, LogOut,
  Truck, HelpCircle, Settings, Menu, X, Bell, ChevronRight,
  Search, ClipboardList, Star, Building2
} from 'lucide-react';
import { getNotifications, markAllAsRead as markAllReadService, markAsRead } from '../services/notificationService.js';
import { adaptNotifications } from '../services/dataAdapters.js';
import useRealtime from '../hooks/useRealtime.js';
import retruckLogo from '../assets/logos/retruck-logo.png';
import retruckText from '../assets/logos/Retruck-text.png';
import './layouts.css';

/* ─── Sidebar Navigation Items (Driver) ────────────── */
var DRIVER_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'listings', label: 'My Listings', icon: List, path: '/dashboard/listings' },
  { id: 'requests', label: 'Booking Requests', icon: Inbox, path: '/dashboard/requests' },
  { id: 'confirmed', label: 'Confirmed Bookings', icon: Truck, path: '/dashboard/confirmed' },
  { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/profile' },
  { id: 'truck', label: 'My Truck', icon: Truck, path: '/dashboard/my-truck' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

var DRIVER_MOBILE_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'listings', label: 'Listings', icon: List, path: '/dashboard/listings' },
  { id: 'add', label: 'Add Route', icon: Plus, path: '/driver/add-route', isAction: true },
  { id: 'requests', label: 'Requests', icon: Inbox, path: '/dashboard/requests' },
  { id: 'profile', label: 'Profile', icon: UserCircle, path: '/profile' }
];

/* ─── Sidebar Navigation Items (Shipper) ────────────── */
var SHIPPER_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'bookings', label: 'My Bookings', icon: ClipboardList, path: '/dashboard/bookings' },
  { id: 'search', label: 'Find Trucks', icon: Search, path: '/trucks' },
  { id: 'saved', label: 'Saved', icon: Star, path: '/dashboard/saved' },
  { id: 'profile', label: 'Business Profile', icon: Building2, path: '/shipper/profile' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

var SHIPPER_MOBILE_TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList, path: '/dashboard/bookings' },
  { id: 'search', label: 'Search', icon: Search, path: '/trucks', isAction: true },
  { id: 'saved', label: 'Saved', icon: Star, path: '/dashboard/saved' },
  { id: 'profile', label: 'Profile', icon: UserCircle, path: '/shipper/profile' }
];

function DashboardLayout(props) {
  var children = props.children;
  var activeTab = props.activeTab || 'dashboard';
  var onTabChange = props.onTabChange;

  var navigate = useNavigate();
  var location = useLocation();
  var auth = useAuth();
  var toast = useToast();

  var mobileMenuState = useState(false);
  var isMobileMenuOpen = mobileMenuState[0];
  var setIsMobileMenuOpen = mobileMenuState[1];

  var user = auth.user;
  var role = auth.role;

  // Notifications State
  var [showNotifications, setShowNotifications] = useState(false);
  var [notifications, setNotifications] = useState([]);

  // Load notifications — stable ref for realtime
  var loadNotifs = useCallback(async function () {
    var result = await getNotifications(10);
    if (result.data) {
      setNotifications(adaptNotifications(result.data));
    }
  }, []);

  // Load notifications from Supabase on mount
  useEffect(function () {
    if (auth.isAuthenticated) {
      loadNotifs();
    }
  }, [auth.isAuthenticated, loadNotifs]);

  // Realtime: bell badge updates as new notifications arrive
  useRealtime('notifications', loadNotifs, 'dashboard_layout');

  var unreadCount = notifications.filter(function (n) { return !n.read; }).length;

  async function handleMarkAllRead(e) {
    e.stopPropagation();
    await markAllReadService();
    var updated = notifications.map(function (n) {
      return Object.assign({}, n, { read: true });
    });
    setNotifications(updated);
    toast.showToast('All notifications marked as read', 'success');
    setShowNotifications(false);
  }

  async function handleNotifClick(notifId) {
    var notif = notifications.find(function (n) { return n.id === notifId; });
    if (notif && !notif.read) {
      await markAsRead(notifId);
    }
    var updated = notifications.map(function (n) {
      if (n.id === notifId) {
        return Object.assign({}, n, { read: true });
      }
      return n;
    });
    setNotifications(updated);
    // If pending request notification, navigate to requests page
    if (role === 'driver') {
      navigate('/dashboard/requests');
    } else {
      navigate('/dashboard/bookings');
    }
    setShowNotifications(false);
  }

  function handleNavClick(item) {
    if (item.path) {
      navigate(item.path);
    } else if (item.tab && onTabChange) {
      onTabChange(item.tab);
    }
    setIsMobileMenuOpen(false);
  }

  function handleLogout() {
    auth.logout();
    navigate('/');
  }

  function isActive(item) {
    if (activeTab && activeTab === item.id) {
      return true;
    }
    if (item.id === 'dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname === item.path;
  }

  // Greeting helper
  function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  var userName = user ? user.name.split(' ')[0] : (role === 'shipper' ? 'Shipper' : 'Driver');
  var navItems = role === 'shipper' ? SHIPPER_NAV_ITEMS : DRIVER_NAV_ITEMS;
  var mobileTabs = role === 'shipper' ? SHIPPER_MOBILE_TABS : DRIVER_MOBILE_TABS;
  var roleLabel = role === 'shipper' ? (user && user.verified ? 'Verified Shipper' : 'Shipper') : (user && user.verified ? 'Verified Driver' : 'Driver');

  return (
    <div className="dashboard-layout">
      {/* ─── Desktop Sidebar ─────────────────────────── */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__inner">
          {/* Brand */}
          <div className="dashboard-sidebar__brand" onClick={function () { navigate('/'); }}>
            <img src={retruckLogo} alt="ReTruck" className="dashboard-sidebar__logo" />
            <img src={retruckText} alt="ReTruck" className="dashboard-sidebar__logo-text" />
          </div>

          {/* Profile Card */}
          <div className="dashboard-sidebar__profile">
            <div className="dashboard-sidebar__avatar-wrap">
              <img
                src={user ? (user.avatar_url || user.avatar) : 'https://picsum.photos/seed/default/100'}
                alt={userName}
                className="dashboard-sidebar__avatar"
              />
              {user && user.verified && (
                <span className="dashboard-sidebar__verified" aria-label="Verified">✓</span>
              )}
            </div>
            <div className="dashboard-sidebar__profile-info">
              <span className="dashboard-sidebar__name">{user ? user.name : 'Driver'}</span>
              <span className="dashboard-sidebar__role">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="dashboard-sidebar__nav">
            {navItems.map(function (item) {
              var Icon = item.icon;
              var active = isActive(item);
              return (
                <button
                  key={item.id}
                  className={'dashboard-sidebar__nav-item' + (active ? ' dashboard-sidebar__nav-item--active' : '')}
                  onClick={function () { handleNavClick(item); }}
                  type="button"
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{item.label}</span>
                  {active && <div className="dashboard-sidebar__nav-indicator" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="dashboard-sidebar__bottom">
            {role === 'driver' ? (
              <button
                className="dashboard-sidebar__add-btn"
                onClick={function () { navigate('/driver/add-route'); }}
                type="button"
              >
                <Plus size={18} aria-hidden="true" />
                <span>Add New Listing</span>
              </button>
            ) : (
              <button
                className="dashboard-sidebar__add-btn"
                onClick={function () { navigate('/trucks'); }}
                type="button"
              >
                <Search size={18} aria-hidden="true" />
                <span>Find Trucks</span>
              </button>
            )}

            <div className="dashboard-sidebar__bottom-links">
              <button
                className="dashboard-sidebar__bottom-link"
                onClick={function () { }}
                type="button"
              >
                <HelpCircle size={18} aria-hidden="true" />
                <span>Help Center</span>
              </button>
              <button
                className="dashboard-sidebar__bottom-link dashboard-sidebar__bottom-link--logout"
                onClick={handleLogout}
                type="button"
              >
                <LogOut size={18} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Mobile Overlay ──────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="dashboard-mobile-overlay" onClick={function () { setIsMobileMenuOpen(false); }} />
      )}

      {/* ─── Mobile Drawer ───────────────────────────── */}
      <aside className={'dashboard-mobile-drawer' + (isMobileMenuOpen ? ' dashboard-mobile-drawer--open' : '')}>
        <div className="dashboard-mobile-drawer__header">
          <div className="dashboard-sidebar__brand">
            <img src={retruckLogo} alt="ReTruck" className="dashboard-sidebar__logo" />
            <img src={retruckText} alt="ReTruck" className="dashboard-sidebar__logo-text" />
          </div>
          <button
            className="dashboard-mobile-drawer__close"
            onClick={function () { setIsMobileMenuOpen(false); }}
            type="button"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile in drawer */}
        <div className="dashboard-sidebar__profile">
          <div className="dashboard-sidebar__avatar-wrap">
            <img
              src={user ? (user.avatar_url || user.avatar) : 'https://picsum.photos/seed/default/100'}
              alt={userName}
              className="dashboard-sidebar__avatar"
            />
          </div>
          <div className="dashboard-sidebar__profile-info">
            <span className="dashboard-sidebar__name">{user ? user.name : 'Driver'}</span>
            <span className="dashboard-sidebar__role">{roleLabel}</span>
          </div>
        </div>

        <nav className="dashboard-sidebar__nav">
          {navItems.map(function (item) {
            var Icon = item.icon;
            var active = isActive(item);
            return (
              <button
                key={item.id}
                className={'dashboard-sidebar__nav-item' + (active ? ' dashboard-sidebar__nav-item--active' : '')}
                onClick={function () { handleNavClick(item); }}
                type="button"
              >
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="dashboard-sidebar__bottom">
          <button
            className="dashboard-sidebar__bottom-link dashboard-sidebar__bottom-link--logout"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────── */}
      <main className="dashboard-main">
        {/* Header Bar */}
        <header className="dashboard-header">
          <div className="dashboard-header__left">
            <button
              className="dashboard-header__menu-btn"
              onClick={function () { setIsMobileMenuOpen(true); }}
              type="button"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="dashboard-header__greeting">
              <h1 className="dashboard-header__title">
                {getGreeting()}, {userName} <span className="dashboard-header__wave">👋</span>
              </h1>
              <p className="dashboard-header__subtitle">
                {role === 'shipper' ? 'Track your shipments and find trucks.' : "Here's what's happening with your truck today."}
              </p>
            </div>
          </div>

          <div className="dashboard-header__right">
            <div style={{ position: 'relative' }}>
              <button
                className="dashboard-header__icon-btn"
                type="button"
                aria-label="Notifications"
                onClick={function (e) { e.stopPropagation(); setShowNotifications(!showNotifications); }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="dashboard-header__badge">{unreadCount}</span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="dashboard-notif-overlay" onClick={function () { setShowNotifications(false); }} />
                  <div className="dashboard-notif">
                    <div className="dashboard-notif__header">
                      <span className="dashboard-notif__title">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          className="dashboard-notif__mark-read"
                          onClick={handleMarkAllRead}
                          type="button"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="dashboard-notif__list">
                      {notifications.length === 0 ? (
                        <div className="dashboard-notif__empty">
                          <span className="dashboard-notif__empty-text">No notifications yet</span>
                        </div>
                      ) : (
                        notifications.map(function (n) {
                          return (
                            <div
                              key={n.id}
                              className={'dashboard-notif__item' + (!n.read ? ' dashboard-notif__item--unread' : '')}
                              onClick={function () { handleNotifClick(n.id); }}
                            >
                              <div className="dashboard-notif__item-title">
                                {!n.read && <span className="dashboard-notif__item-dot" />}
                                <span>{n.title}</span>
                              </div>
                              <span className="dashboard-notif__item-msg">{n.message}</span>
                              <span className="dashboard-notif__item-time">{n.time}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {role === 'driver' ? (
              <button
                className="dashboard-header__cta"
                onClick={function () { navigate('/driver/add-route'); }}
                type="button"
              >
                <Plus size={18} aria-hidden="true" />
                <span>Add New Listing</span>
              </button>
            ) : (
              <button
                className="dashboard-header__cta"
                onClick={function () { navigate('/trucks'); }}
                type="button"
              >
                <Search size={18} aria-hidden="true" />
                <span>Find Trucks</span>
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* ─── Mobile Tab Bar ──────────────────────────── */}
      <nav className="dashboard-tabbar">
        {mobileTabs.map(function (item) {
          var Icon = item.icon;
          var active = isActive(item);
          return (
            <button
              key={item.id}
              className={
                'dashboard-tabbar__item' +
                (active ? ' dashboard-tabbar__item--active' : '') +
                (item.isAction ? ' dashboard-tabbar__item--action' : '')
              }
              onClick={function () { handleNavClick(item); }}
              type="button"
            >
              {item.isAction ? (
                <div className="dashboard-tabbar__action-icon">
                  <Icon size={22} />
                </div>
              ) : (
                <Icon size={22} aria-hidden="true" />
              )}
              <span className="dashboard-tabbar__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default DashboardLayout;
