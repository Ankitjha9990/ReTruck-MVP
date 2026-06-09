import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabaseClient.js';

var AuthContext = createContext(null);

function AuthProvider({ children }) {
  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];

  var roleState = useState(null);
  var role = roleState[0];
  var setRole = roleState[1];

  var authState = useState(false);
  var isAuthenticated = authState[0];
  var setIsAuthenticated = authState[1];

  var loadingState = useState(true);
  var loading = loadingState[0];
  var setLoading = loadingState[1];

  // Listen to Supabase auth state changes
  useEffect(function () {
    // Get initial session
    supabase.auth.getSession().then(function (result) {
      if (result.data.session) {
        fetchProfile(result.data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth changes
    var subscription = supabase.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_IN' && session) {
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return function () {
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    var result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (result.data) {
      var profileData = result.data;

      // Map DB snake_case columns to frontend camelCase properties
      profileData.avatar = profileData.avatar_url;
      profileData.businessName = profileData.business_name;
      profileData.gstNo = profileData.gst_number;
      profileData.licenseNo = profileData.license_no;

      // Fetch driver's truck details if applicable
      if (profileData.role === 'driver') {
        var truckResult = await supabase
          .from('trucks')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();

        if (truckResult.data) {
          profileData.truck = {
            number: truckResult.data.truck_number,
            type: truckResult.data.truck_type,
            capacity: parseFloat(truckResult.data.capacity) || 0,
            photo: truckResult.data.photo_url,
            insuranceValid: truckResult.data.insurance_valid,
            gpsEnabled: truckResult.data.gps_enabled
          };
        }
      }

      setUser(profileData);
      setRole(profileData.role);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }

  async function signUp(email, password, metadata) {
    var result = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          role: metadata.role,
          name: metadata.name,
          phone: metadata.phone
        }
      }
    });

    if (result.error) {
      return { error: result.error };
    }

    // The handle_new_user trigger auto-creates a profile
    // Wait briefly for the trigger, then update with additional data
    if (result.data.user) {
      // Update profile with extra fields from signup form
      var profileUpdate = {
        city: metadata.city || null,
        experience: metadata.experience || null,
        license_no: metadata.licenseNo || null,
        business_name: metadata.businessName || null
      };

      // Small delay for trigger to complete
      await new Promise(function (resolve) { setTimeout(resolve, 500); });

      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', result.data.user.id);

      // Fetch the full profile
      await fetchProfile(result.data.user.id);
    }

    return { data: result.data, error: null };
  }

  async function login(email, password) {
    var result = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (result.error) {
      return { error: result.error };
    }

    if (result.data.user) {
      await fetchProfile(result.data.user.id);
    }

    return { data: result.data, error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }

  async function updateUser(data) {
    if (!user) return;

    // Separate truck data from profile updates
    var truckData = data.truck;
    var profileData = Object.assign({}, data);
    delete profileData.truck;

    // Map camelCase fields to snake_case DB columns for profiles
    if ('avatar' in profileData) {
      profileData.avatar_url = profileData.avatar;
      delete profileData.avatar;
    }
    if ('businessName' in profileData) {
      profileData.business_name = profileData.businessName;
      delete profileData.businessName;
    }
    if ('gstNo' in profileData) {
      profileData.gst_number = profileData.gstNo;
      delete profileData.gstNo;
    }
    if ('licenseNo' in profileData) {
      profileData.license_no = profileData.licenseNo;
      delete profileData.licenseNo;
    }

    var updatedUser;

    // Only update profiles if there are actual profile fields to update
    var profileKeys = Object.keys(profileData);
    if (profileKeys.length > 0) {
      var result = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();

      if (result.error) {
        return { error: result.error };
      }

      updatedUser = result.data;
    } else {
      // No profile fields to update — fetch the current profile
      var fetchResult = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchResult.error) {
        return { error: fetchResult.error };
      }

      updatedUser = fetchResult.data;
    }

    // If there is truck details to update
    if (truckData) {
      // Check if truck record exists
      var truckCheck = await supabase
        .from('trucks')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      var dbTruckData = {
        truck_number: truckData.number,
        truck_type: truckData.type,
        capacity: truckData.capacity,
        photo_url: truckData.photo
      };

      var truckResult;
      if (truckCheck.data) {
        truckResult = await supabase
          .from('trucks')
          .update(dbTruckData)
          .eq('owner_id', user.id)
          .select()
          .single();
      } else {
        dbTruckData.owner_id = user.id;
        truckResult = await supabase
          .from('trucks')
          .insert(dbTruckData)
          .select()
          .single();
      }

      if (truckResult.data) {
        updatedUser.truck = {
          number: truckResult.data.truck_number,
          type: truckResult.data.truck_type,
          capacity: parseFloat(truckResult.data.capacity) || 0,
          photo: truckResult.data.photo_url,
          insuranceValid: truckResult.data.insurance_valid,
          gpsEnabled: truckResult.data.gps_enabled
        };
      }
    } else if (user.truck) {
      // Keep old truck details
      updatedUser.truck = user.truck;
    }

    // Map DB snake_case columns back to camelCase frontend properties
    updatedUser.avatar = updatedUser.avatar_url;
    updatedUser.businessName = updatedUser.business_name;
    updatedUser.gstNo = updatedUser.gst_number;
    updatedUser.licenseNo = updatedUser.license_no;

    setUser(updatedUser);
    return { data: updatedUser, error: null };
  }

  var value = {
    user: user,
    role: role,
    isAuthenticated: isAuthenticated,
    loading: loading,
    login: login,
    signUp: signUp,
    logout: logout,
    updateUser: updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  var context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
export default AuthContext;
