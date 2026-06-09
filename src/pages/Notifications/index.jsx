import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import {
  Bell, CheckCircle, Clock, XCircle, Info, Inbox, CheckSquare,
  Trash2, ChevronRight, FileText, Award, RefreshCcw, Sparkles
} from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead as markAllReadService } from '../../services/notificationService.js';
import { adaptNotifications } from '../../services/dataAdapters.js';
import useRealtime from '../../hooks/useRealtime.js';
import './Notifications.css';

function Notifications() {
  var navigate = useNavigate();
  var toast = useToast();

  var [notifications, setNotifications] = useState([]);
  var [activeCategory, setActiveCategory] = useState('all');

  var loadNotifications = useCallback(async function () {
    var result = await getNotifications();
    if (result.data) {
      setNotifications(adaptNotifications(result.data));
    }
  }, []);

  useEffect(function () {
    loadNotifications();
  }, [loadNotifications]);

  // Realtime: new notifications (e.g. booking confirmed) pop up automatically
  useRealtime('notifications', loadNotifications, 'notifications_page');

  async function handleMarkAllRead() {
    await markAllReadService();
    var updated = notifications.map(function (n) {
      return Object.assign({}, n, { read: true });
    });
    setNotifications(updated);
    toast.showToast('All alerts marked as read', 'success');
  }

  function handleClearAll() {
    setNotifications([]);
    toast.showToast('All notifications cleared', 'success');
  }

  async function handleNotifClick(notif) {
    // Mark as read
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    var updated = notifications.map(function (n) {
      if (n.id === notif.id) {
        return Object.assign({}, n, { read: true });
      }
      return n;
    });
    setNotifications(updated);

    // Redirect if booking or truck is present
    if (notif.bookingId) {
      navigate('/dashboard/bookings/' + notif.bookingId);
    } else if (notif.truckId) {
      navigate('/trucks/' + notif.truckId);
    }
  }

  function getNotifIcon(type) {
    if (type === 'booking') return CheckCircle;
    if (type === 'opportunity') return Sparkles;
    return Info;
  }

  function getIconColorClass(type) {
    if (type === 'booking') return 'nt-icon--green';
    if (type === 'opportunity') return 'nt-icon--purple';
    return 'nt-icon--blue';
  }

  var filteredNotifications = notifications.filter(function (n) {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unread') return !n.read;
    return n.type === activeCategory;
  });

  return (
    <DashboardLayout activeTab="notifications">
      <div className="notifications-page">
        {/* Header */}
        <div className="nt-header">
          <div className="nt-header__text">
            <h1 className="nt-title">Notifications</h1>
            <p className="nt-subtitle">Stay updated with carrier logs, booking confirmations, and return fleets match alerts.</p>
          </div>
          {notifications.length > 0 && (
            <div className="nt-actions">
              <button className="nt-action-btn" onClick={handleMarkAllRead} type="button">
                <CheckSquare size={14} /> Mark all read
              </button>
              <button className="nt-action-btn nt-action-btn--clear" onClick={handleClearAll} type="button">
                <Trash2 size={14} /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Categories Chips */}
        <div className="nt-categories">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread' },
            { id: 'booking', label: 'Bookings' },
            { id: 'opportunity', label: 'Opportunities' },
            { id: 'system', label: 'System' }
          ].map(function (cat) {
            var count = 0;
            if (cat.id === 'all') count = notifications.length;
            else if (cat.id === 'unread') count = notifications.filter(function (n) { return !n.read; }).length;
            else count = notifications.filter(function (n) { return n.type === cat.id; }).length;

            return (
              <button
                key={cat.id}
                className={'nt-cat-btn' + (activeCategory === cat.id ? ' nt-cat-btn--active' : '')}
                onClick={function () { setActiveCategory(cat.id); }}
                type="button"
              >
                {cat.label}
                <span className="nt-cat-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Cards */}
        {filteredNotifications.length === 0 ? (
          <div className="nt-empty">
            <div className="nt-empty__icon-wrap">
              <Bell size={40} color="var(--color-text-muted)" aria-hidden="true" />
            </div>
            <h3 className="nt-empty__title">All Caught Up!</h3>
            <p className="nt-empty__subtitle">You don't have any notifications in this filter group. We'll alert you when something happens!</p>
          </div>
        ) : (
          <div className="nt-list">
            {filteredNotifications.map(function (notif, idx) {
              var Icon = getNotifIcon(notif.type);
              return (
                <div
                  key={notif.id}
                  className={'nt-card' + (!notif.read ? ' nt-card--unread' : '')}
                  style={{ animationDelay: (idx * 50) + 'ms' }}
                  onClick={function () { handleNotifClick(notif); }}
                >
                  <div className={'nt-card__icon-wrap ' + getIconColorClass(notif.type)}>
                    <Icon size={18} />
                  </div>
                  
                  <div className="nt-card__content">
                    <div className="nt-card__header-row">
                      <h4 className="nt-card__title">
                        {!notif.read && <span className="nt-card__unread-dot" />}
                        {notif.title}
                      </h4>
                      <span className="nt-card__time">{notif.time}</span>
                    </div>
                    <p className="nt-card__message">{notif.message}</p>
                    
                    {(notif.bookingId || notif.truckId) && (
                      <span className="nt-card__link">
                        View details <ChevronRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
