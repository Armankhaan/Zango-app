import React, { createContext, useState, useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '../services/storage';
import md5 from 'md5';
import { isWithinStoreHours } from '../utils/store';
import axios from 'axios';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Location from 'expo-location';
import {
  getTradeAreas,
  resolveBranch,
  getCombinedMenu,
} from '../services/APIservice';
import { apiClient } from '../services/APIservice';
import Config from '../constants/Config';
import getErrorMessage from '../utils/errorHelper';

export const StoreContext = createContext({});

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [menuData, setMenuData] = useState({
    categories: [],
    deals: [],
    branch: null,
  });

  const [tradeAreas, setTradeAreas] = useState([]);
  const [selectedSubRegion, setSelectedSubRegion] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [locationError, setLocationError] = useState('');
  const menuRequest = useRef(0);

  const [username, setUsername] = useState('');
  const [customerInfo, setCustomerInfo] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [mapboxToken, setMapboxToken] = useState(null);

  const readJSON = async (key, fallback = null) => {
    try { return JSON.parse(await AsyncStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  const refreshLocations = async () => {
    setLocationError('');
    try {
      const response = await getTradeAreas(Config.COMPANY_ID);
      if (!response.status) throw new Error(response.message || 'Could not load Zango stores.');
      const regions = (response.trade_areas || response.regions || []).filter(region => Number(region.company_id ?? Config.COMPANY_ID) === Config.COMPANY_ID);
      setTradeAreas(regions);
      setMapboxToken(response.mapbox_access_token || null);
      return regions;
    } catch (error) {
      setLocationError('Could not load stores. Please check your connection and retry.');
      throw error;
    }
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        const regions = await refreshLocations();
        if (!active) return;
        const [savedBranch, timestamp, customer, savedName, savedOrder, savedCart, savedArea] = await Promise.all([
          readJSON('selectedBranch'), AsyncStorage.getItem('locationTimestamp'), readJSON('customerInfo'),
          AsyncStorage.getItem('username'), readJSON('orderDetails'), readJSON('cartItems', {}), readJSON('selectedSubRegion'),
        ]);
        if (!active) return;
        if (customer) setCustomerInfo(customer);
        if (savedName) setUsername(savedName);
        const branches = regions.flatMap(region => (region.sub_regions || region.subRegions || []).map(area => area.branch).filter(Boolean));
        const age = Date.now() - Number(timestamp || 0);
        const restored = branches.find(branch => String(branch.id) === String(savedBranch?.id) && Number(branch.company_id) === Config.COMPANY_ID);
        if (restored && age >= 0 && age < 12 * 60 * 60 * 1000) {
          setSelectedBranch(restored);
          setSelectedSubRegion(savedArea);
          setOrderDetails(savedOrder?.orderType ? savedOrder : { orderType: 'Delivery' });
          setCartItems(savedCart && !Array.isArray(savedCart) ? savedCart : {});
          await fetchMenu(restored.id, Config.COMPANY_ID);
        } else {
          await Promise.all(['selectedBranch','selectedSubRegion','cartItems','menuData'].map(key => AsyncStorage.removeItem(key)));
        }
      } catch (error) { console.warn('Zango initialization:', error.message); }
      finally { if (active) setLoading(false); }
    };
    initialize();
    return () => { active = false; menuRequest.current += 1; };
  }, []);

  const loginUser = async (id, password) => {
    let deviceId = '';
    let deviceDetails = '';
    try {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
      } else if (Platform.OS === 'ios') {
        deviceId = await Application.getIosIdForVendorAsync();
      } else {
        deviceId = 'unknown_device';
      }
      const deviceBrand = Device.brand || 'Unknown';
      const deviceModel = Device.modelName || 'Unknown';
      deviceDetails = `${deviceBrand} ${deviceModel}`;
    } catch (deviceError) {
      console.warn('Failed to retrieve device details:', deviceError.message || deviceError);
    }

    try {
      const payload = {
        company_id: Config.COMPANY_ID,
        username: id,
        password: password,
        deviceId: deviceId,
        device_id: deviceId,
        deviceDetails: deviceDetails,
        device_details: deviceDetails
      };
      const response = await axios.post(`${Config.BASE_URL}/app-users/login`, payload);

      if (response.data && response.data.status) {
        const user = response.data.user;
        if (Number(user.company_id) !== Config.COMPANY_ID) return { success: false, message: 'This account does not belong to Zango.' };
        const userInfo = {
          id: user.id,
          name: user.username,
          username: user.username,
          email: user.email,
          employee_id: user.employee_id,
          company_id: user.company_id,
          access_token: response.data.access_token
        };
        await updateCustomerInfo(userInfo);

        if (user.branches && user.branches.length > 0) {
          const branch = user.branches[0];
          setSelectedBranch(branch);
          await AsyncStorage.setItem('selectedBranch', JSON.stringify(branch));

          // Dynamically fetch combined menu for the branch & company
          try {
            await fetchMenu(branch.id, user.company_id || branch.company_id);
          } catch (menuErr) {
            console.warn('Failed to fetch menu on login:', menuErr.message);
          }
        } else {
          setSelectedBranch(null);
          await AsyncStorage.removeItem('selectedBranch');
          setMenuData({ categories: [], deals: [], branch: null });
          await AsyncStorage.removeItem('menuData');
        }

        // Dynamically fetch trade areas for the user's company
        if (user.company_id) {
          try {
            const tradeAreasData = await getTradeAreas(Config.COMPANY_ID);
            if (tradeAreasData && tradeAreasData.status) {
              setTradeAreas(tradeAreasData.trade_areas);
            }
          } catch (tradeErr) {
            console.warn('Failed to fetch trade areas on login:', tradeErr.message);
          }
        }

        return { success: true };
      }
      return {
        success: false,
        message: response.data && response.data.message ? response.data.message : 'Invalid credentials'
      };
    } catch (error) {
      console.log('Login error:', error.message || error);
      const apiMessage = getErrorMessage(error, 'Login error occurred');
      return { success: false, message: apiMessage };
    }
  };

  const fetchMenu = async (branchId) => {
    if (!branchId) return;
    const requestId = ++menuRequest.current;
    setMenuLoading(true);
    setMenuError('');
    setMenuData({ categories: [], deals: [], branch: null });
    try {
      const response = await getCombinedMenu(Config.COMPANY_ID, branchId);
      if (requestId !== menuRequest.current) return;
      if (!response.status) throw new Error(response.message || 'Menu unavailable.');
      const menu = response.menu || {};
      if (!menu.branch || Number(menu.branch.company_id) !== Config.COMPANY_ID) throw new Error('This store is not a Zango store.');
      setMenuData({ categories: menu.categories || [], deals: menu.deals || [], branch: menu.branch });
      setSelectedBranch(previous => ({ ...previous, ...menu.branch }));
    } catch (error) {
      if (requestId === menuRequest.current) setMenuError('Could not load the menu. Please try again.');
      throw error;
    } finally { if (requestId === menuRequest.current) setMenuLoading(false); }
  };

  const selectStore = async (branch, subRegion = null) => {
    if (!branch?.id || Number(branch.company_id) !== Config.COMPANY_ID) throw new Error('Please choose a valid Zango store.');
    const known = tradeAreas.flatMap(region => (region.sub_regions || region.subRegions || []).map(area => area.branch?.id));
    if (!known.some(id => String(id) === String(branch.id))) throw new Error('This Zango store is no longer available.');
    if (selectedBranch && String(selectedBranch.id) !== String(branch.id)) clearCart();
    menuRequest.current += 1;
    setSelectedBranch(branch);
    setSelectedSubRegion(subRegion);
    await Promise.all([
      AsyncStorage.setItem('selectedBranch', JSON.stringify(branch)),
      AsyncStorage.setItem('locationTimestamp', String(Date.now())),
      AsyncStorage.setItem('selectedSubRegion', JSON.stringify(subRegion)),
    ]);
    // Keep a valid selection even if its menu is temporarily unavailable; the menu has retry.
    try { await fetchMenu(branch.id); } catch { /* Display menuError on the menu screen. */ }
    return true;
  };

  const handleSelectSubRegion = async subRegion => {
    const response = await resolveBranch(subRegion.id);
    if (!response.status) throw new Error(response.message || 'Delivery is unavailable in this area.');
    return selectStore(response.data?.branch || response.branch, subRegion);
  };

  const handleSelectBranch = branch => selectStore(branch);

  const persistCart = async (items) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
  };

  const addToCart = (key, price, name, image, pos_code, details, quantity = 1, options = {}) => {
    if (key.length > 120) key = `${key.startsWith('deal-') ? key.split('-').slice(0,2).join('-') : key.split('-')[0]}-${md5(key)}`;
    if (!isWithinStoreHours(selectedBranch)) { Alert.alert('Store closed', 'Please order when this store reopens.'); return; }
    setCartItems(prev => {
      const existing = prev[key];
      const newQty = existing ? existing.quantity + quantity : quantity;
      const updated = {
        ...prev,
        [key]: { key, price, name, image, pos_code, details, quantity: newQty, options },
      };
      persistCart(updated);
      return updated;
    });
  };

  const updateCartQuantity = (key, qty) => {
    setCartItems(prev => {
      const updated = { ...prev, [key]: { ...prev[key], quantity: qty } };
      persistCart(updated);
      return updated;
    });
  };

  const removeFromCart = (key) => {
    setCartItems(prev => {
      const upd = { ...prev };
      delete upd[key];
      persistCart(upd);
      return upd;
    });
  };

  const clearCart = () => {
    setCartItems({});
    AsyncStorage.removeItem('cartItems');
  };

  const updateUsername = (name) => {
    setUsername(name);
  };

  
  const requestOtp = async (email) => {
    try {
      const company_id = Config.COMPANY_ID;
      const response = await apiClient.post('/customer/request-otp', {
        company_id,
        email
      });
      return { success: true, is_new: response.data.is_new };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtpAndLogin = async (data) => {
    try {
      const company_id = Config.COMPANY_ID;
      const response = await apiClient.post('/customer/verify-otp', {
        company_id,
        ...data
      });
      setCustomerInfo(response.data.customer);
      await AsyncStorage.setItem('customerInfo', JSON.stringify(response.data.customer));
      await AsyncStorage.setItem('krc_customer_token', response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Invalid OTP' };
    }
  };

  const logoutUser = async () => {
    setCustomerInfo(null);
    await AsyncStorage.removeItem('customerInfo');
    await AsyncStorage.removeItem('krc_customer_token');
  };

  const updateCustomerInfo = async (info) => {
    setCustomerInfo(info);
    const name = info.name || '';
    setUsername(name);
    try {
      await AsyncStorage.setItem('customerInfo', JSON.stringify(info));
      await AsyncStorage.setItem('username', name);
    } catch (e) {
      console.warn('Failed to save customer info', e);
    }
  };


  const updateOrderDetails = (details) => {
    setOrderDetails(details);
    AsyncStorage.setItem('orderDetails', JSON.stringify(details)).catch(() => {});
  };

  const clearCustomerInfo = async () => {
    setUsername('');
    setCustomerInfo(null);
    setSelectedBranch(null);
    setMenuData({ categories: [], deals: [], branch: null });
    try {
      await AsyncStorage.removeItem('customerInfo');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('selectedBranch');
      await AsyncStorage.removeItem('menuData');
    } catch (e) {
      console.warn('Failed to clear user data', e);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        menuData,
        loading,
        menuLoading,
        menuError,
        locationError,
        refreshLocations,
        isBranchOpen: () => isWithinStoreHours(selectedBranch),
        tradeAreas,
        selectedSubRegion,
        selectedBranch,
        handleSelectSubRegion,
        handleSelectBranch,
        fetchMenu,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        username,
        customerInfo,
        orderDetails,
        loginStub: loginUser,
        updateUsername,
        updateCustomerInfo,
    requestOtp,
    verifyOtpAndLogin,
    logoutUser,
        updateOrderDetails,
        clearCustomerInfo,
        mapboxToken,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
