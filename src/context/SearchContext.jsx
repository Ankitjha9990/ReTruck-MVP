import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getListings } from '../services/listingService.js';
import supabase from '../services/supabaseClient.js';

var SearchContext = createContext(null);

var DEFAULT_FILTERS = {
  from: '',
  to: '',
  date: '',
  tripType: 'all',
  truckType: [],
  minCapacity: '',
  maxCapacity: '',
  minPrice: '',
  maxPrice: ''
};

function SearchProvider({ children }) {
  var filtersState = useState(Object.assign({}, DEFAULT_FILTERS));
  var filters = filtersState[0];
  var setFiltersState = filtersState[1];

  var resultsState = useState([]);
  var results = resultsState[0];
  var setResults = resultsState[1];

  var sortState = useState('price_asc');
  var sort = sortState[0];
  var setSortState = sortState[1];

  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var hasSearchedState = useState(false);
  var hasSearched = hasSearchedState[0];
  var setHasSearched = hasSearchedState[1];

  var runSearch = useCallback(async function (overrideFilters) {
    setIsLoading(true);
    setHasSearched(true);

    var activeFilters = overrideFilters || filters;
    var searchFilters = Object.assign({}, activeFilters, { sort: sort });

    var result = await getListings(searchFilters);

    if (result.data) {
      // Transform listing data to match the format pages expect
      var transformed = result.data.map(function (listing) {
        return {
          id: listing.id,
          driverId: listing.driver_id,
          driverName: listing.driver ? (listing.driver.name || 'Unknown') : 'Unknown',
          driverAvatar: listing.driver ? (listing.driver.avatar_url || '') : '',
          driverRating: listing.driver ? (listing.driver.rating || 0) : 0,
          driverVerified: listing.driver ? (listing.driver.verified || false) : false,
          driverPhone: listing.driver ? (listing.driver.phone || '') : '',
          driverCity: listing.driver ? (listing.driver.city || '') : '',
          driverExperience: listing.driver ? (listing.driver.experience || 0) : 0,
          truckType: listing.truck ? (listing.truck.truck_type || 'full') : 'full',
          truckCapacity: listing.truck ? Number(listing.truck.capacity || 0) : 0,
          truckNumber: listing.truck ? (listing.truck.truck_number || '') : '',
          truckPhoto: listing.truck ? (listing.truck.photo_url || '') : '',
          truckInsurance: listing.truck ? (listing.truck.insurance_valid || false) : false,
          truckGps: listing.truck ? (listing.truck.gps_enabled || false) : false,
          from: listing.from_city || '',
          to: listing.to_city || '',
          fromState: listing.from_state || '',
          toState: listing.to_state || '',
          departureDate: listing.departure_date || '',
          tripType: listing.trip_type || 'standard',
          availableCapacity: Number(listing.available_capacity || 0),
          pricePerKm: listing.price_per_km || 40,
          cargoTypes: listing.cargo_types || [],
          notes: listing.notes || '',
          estimatedDistance: listing.estimated_distance || 500,
          estimatedTotal: listing.estimated_total || ((listing.estimated_distance || 500) * (listing.price_per_km || 40)),
          marketRate: listing.market_rate || 0,
          discountPercent: listing.discount_percent || 0,
          status: listing.status || 'active',
          tripsCompleted: listing.driver ? (listing.driver.trips_completed || 0) : 0,
          createdAt: listing.created_at || '',
          // Keep raw for detail pages
          _raw: listing
        };
      });
      setResults(transformed);
    } else {
      setResults([]);
    }

    setIsLoading(false);
  }, [filters, sort]);

  function setFilter(key, value) {
    setFiltersState(function (prev) {
      var updated = Object.assign({}, prev);
      updated[key] = value;
      return updated;
    });
  }

  function setFilters(obj) {
    setFiltersState(function (prev) {
      return Object.assign({}, prev, obj);
    });
  }

  function setSort(sortKey) {
    setSortState(sortKey);
  }

  function resetFilters() {
    setFiltersState(Object.assign({}, DEFAULT_FILTERS));
    setResults([]);
    setHasSearched(false);
  }

  // Realtime: when any listing changes in DB, re-run the current search
  useEffect(function () {
    var channel = supabase
      .channel('search_context_listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, function () {
        runSearch();
      })
      .subscribe();

    return function () {
      supabase.removeChannel(channel);
    };
  // Only re-subscribe if runSearch reference changes (i.e. filters/sort changed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runSearch]);

  var value = {
    filters: filters,
    results: results,
    sort: sort,
    isLoading: isLoading,
    hasSearched: hasSearched,
    setFilter: setFilter,
    setFilters: setFilters,
    setSort: setSort,
    resetFilters: resetFilters,
    runSearch: runSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

function useSearch() {
  var context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

export { SearchProvider, useSearch };
export default SearchContext;
