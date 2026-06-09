import React from 'react';
import { useToast } from '../../../context/ToastContext.jsx';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

var TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

function Toast() {
  var toast = useToast();
  var toasts = toast.toasts;
  var dismissToast = toast.dismissToast;

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(function (t, index) {
        var Icon = TOAST_ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            className={'toast toast--' + t.type}
            style={{ animationDelay: (index * 50) + 'ms' }}
          >
            <Icon size={18} className="toast__icon" aria-hidden="true" />
            <span className="toast__message">{t.message}</span>
            <button
              className="toast__close"
              onClick={function () { dismissToast(t.id); }}
              type="button"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
