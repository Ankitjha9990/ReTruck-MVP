import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

var ToastContext = createContext(null);

var toastIdCounter = 0;

function ToastProvider({ children }) {
  var toastsState = useState([]);
  var toasts = toastsState[0];
  var setToasts = toastsState[1];
  var timersRef = useRef({});

  var showToast = useCallback(function (message, type) {
    type = type || 'success';
    toastIdCounter += 1;
    var id = 'toast_' + toastIdCounter + '_' + Date.now();

    var newToast = { id: id, message: message, type: type };

    setToasts(function (prev) {
      var updated = prev.concat([newToast]);
      // Keep max 3 visible
      if (updated.length > 3) {
        updated = updated.slice(updated.length - 3);
      }
      return updated;
    });

    // Auto-dismiss after 3500ms
    timersRef.current[id] = setTimeout(function () {
      dismissToast(id);
    }, 3500);

    return id;
  }, []);

  var dismissToast = useCallback(function (id) {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts(function (prev) {
      return prev.filter(function (t) { return t.id !== id; });
    });
  }, []);

  var value = {
    toasts: toasts,
    showToast: showToast,
    dismissToast: dismissToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

function useToast() {
  var context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export { ToastProvider, useToast };
export default ToastContext;
