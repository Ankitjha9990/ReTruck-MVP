/**
 * useRealtime — ReTruck MVP
 * Reusable hook that subscribes to Supabase Realtime postgres_changes
 * for a given table. Calls onRefresh whenever any row in that table changes.
 *
 * Usage:
 *   useRealtime('bookings', loadBookings);
 *   useRealtime('listings', loadListings);
 *   useRealtime('notifications', loadNotifications);
 */

import { useEffect } from 'react';
import supabase from '../services/supabaseClient.js';

/**
 * @param {string} table         - The Postgres table name to watch
 * @param {Function} onRefresh   - Async callback to re-fetch/refresh UI data
 * @param {string} [channelSuffix] - Optional suffix to make channel name unique per component
 */
function useRealtime(table, onRefresh, channelSuffix) {
  useEffect(function () {
    var channelName = 'realtime_' + table + '_' + (channelSuffix || Math.random().toString(36).slice(2));

    var channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: table },
        function (payload) {
          // Any change (INSERT, UPDATE, DELETE) triggers a full refresh
          if (typeof onRefresh === 'function') {
            onRefresh(payload);
          }
        }
      )
      .subscribe();

    return function () {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
}

export default useRealtime;
