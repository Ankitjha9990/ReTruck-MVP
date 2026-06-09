import React, { createContext, useContext, useState } from 'react';
import { createBooking as createBookingApi } from '../services/bookingService.js';

var BookingContext = createContext(null);

function BookingProvider({ children }) {
  var draftState = useState(null);
  var draftBooking = draftState[0];
  var setDraftBooking = draftState[1];

  var lastBookingState = useState(null);
  var lastBooking = lastBookingState[0];
  var setLastBooking = lastBookingState[1];

  function setDraft(data) {
    setDraftBooking(data);
  }

  function clearDraft() {
    setDraftBooking(null);
  }

  async function submitBooking(bookingData) {
    var result = await createBookingApi(bookingData);

    if (result.data) {
      setLastBooking(result.data);
      setDraftBooking(null);
    }

    return result;
  }

  var value = {
    draftBooking: draftBooking,
    lastBooking: lastBooking,
    setDraft: setDraft,
    clearDraft: clearDraft,
    submitBooking: submitBooking,
    setLastBooking: setLastBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

function useBooking() {
  var context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

export { BookingProvider, useBooking };
export default BookingContext;
