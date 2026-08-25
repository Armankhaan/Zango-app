import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { apiClient } from '../../services/APIservice';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { MapPin, ChevronDown, CheckCircle } from 'lucide-react-native';

export function LocationSelection() {
  const { theme } = useContext(ThemeContext);
  const { tradeAreas, handleSelectSubRegion, handleSelectBranch, loading, selectedBranch, updateOrderDetails, mapboxToken } = useContext(StoreContext);
  const navigation = useNavigation();

  const [orderType, setOrderType] = useState(null);
  const [selectedCityIdx, setSelectedCityIdx] = useState(null);
  const [selectedAreaIdx, setSelectedAreaIdx] = useState(null);
  const [selectedBranchIdx, setSelectedBranchIdx] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const cities = tradeAreas || [];
  const selectedCity = selectedCityIdx !== null ? cities[selectedCityIdx] : null;
  const areas = selectedCity?.sub_regions || [];
  const selectedArea = selectedAreaIdx !== null ? areas[selectedAreaIdx] : null;

  const regionBranches = selectedCity ? Array.from(
    new Map(areas.filter(sr => sr.branch).map(sr => [sr.branch.id, sr.branch])).values()
  ) : [];
  const pickedBranch = selectedBranchIdx !== null ? regionBranches[selectedBranchIdx] : null;

  const handleConfirm = async () => {
    if (!orderType) return;
    if (orderType === 'Delivery') {
      if (!selectedArea) return;
      if (updateOrderDetails) {
        updateOrderDetails({ orderType });
      }
      await handleSelectSubRegion(selectedArea);
    } else {
      if (!pickedBranch) return;
      if (updateOrderDetails) {
        updateOrderDetails({ orderType });
      }
      await handleSelectBranch(pickedBranch);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeTabs' }],
    });
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsFetchingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      const resp = await apiClient.post(`/trade-areas/resolve-by-location`, { latitude, longitude });

      if (resp.data && resp.data.status && resp.data.data) {
        const data = resp.data.data;
        const foundRegionId = data.trade_area?.region?.id || null;
        const foundSubRegionId = data.trade_area?.id || null;
        const foundBranchId = data.branch?.id || null;

        if (foundRegionId) {
          const cIdx = cities.findIndex(c => c.id === foundRegionId);
          if (cIdx !== -1) {
            setSelectedCityIdx(cIdx);
            
            if (orderType === 'Delivery' && foundSubRegionId) {
              const subRegions = cities[cIdx].sub_regions || [];
              const sIdx = subRegions.findIndex(s => s.id === foundSubRegionId);
              if (sIdx !== -1) setSelectedAreaIdx(sIdx);
            } else if (orderType === 'Pick-Up' && foundBranchId) {
              const sr = cities[cIdx].sub_regions || [];
              const rBranches = Array.from(new Map(sr.filter(s => s.branch).map(s => [s.branch.id, s.branch])).values());
              const bIdx = rBranches.findIndex(b => b.id === foundBranchId);
              if (bIdx !== -1) setSelectedBranchIdx(bIdx);
            }
          }
        }
      }
    } catch (err) {
      alert('Could not find a branch near your location.');
      console.warn(err);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const styles = getStyles(theme);

  // Step 1: Order Type Selection
  if (!orderType) {
    return (
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome to Zango 👋</Text>
          <Text style={styles.welcomeSubtitle}>Please select your order type to continue</Text>

          <TouchableOpacity
            style={styles.orderTypeBtn}
            onPress={() => setOrderType('Delivery')}
            activeOpacity={0.7}
          >
            <View style={styles.orderTypeIconWrap}>
              <Image source={require('../../assets/Delivery.png')} style={styles.orderTypeIcon} />
            </View>
            <Text style={styles.orderTypeBtnText}>Delivery</Text>
            <Text style={styles.orderTypeArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orderTypeBtn}
            onPress={() => setOrderType('Pick-Up')}
            activeOpacity={0.7}
          >
            <View style={styles.orderTypeIconWrap}>
              <Image source={require('../../assets/Pickup.png')} style={styles.orderTypeIcon} />
            </View>
            <Text style={styles.orderTypeBtnText}>Pick-Up</Text>
            <Text style={styles.orderTypeArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Step 2: Location Selection
  if (loading && !tradeAreas.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loaderText}>Loading locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container2}>
      {/* Red Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setOrderType(null)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Order type badge */}
      <View style={styles.orderBadge}>
        <Text style={styles.orderBadgeText}>
          {orderType === 'Delivery' ? '🛵' : '🛍️'} {orderType}
        </Text>
        <TouchableOpacity onPress={() => setOrderType(null)}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Location Icon */}
        <View style={styles.iconCircle}>
          <MapPin size={32} color={theme.colors.primary} />
        </View>

        <Text style={styles.title}>Please select your location</Text>
        <Text style={styles.subtitle}>Choose your city and area to find the nearest branch</Text>

        {mapboxToken ? (
          <TouchableOpacity 
            style={styles.currentLocationBtn}
            onPress={handleUseCurrentLocation}
            disabled={isFetchingLocation}
          >
            {isFetchingLocation ? (
               <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.currentLocationBtnText}>Use Current Location</Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* City / Region Picker */}
        <View style={styles.pickerSection}>
          <Text style={styles.pickerLabel}>City / Region</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCityIdx}
              onValueChange={(val) => {
                setSelectedCityIdx(val);
                setSelectedAreaIdx(null);
                setSelectedBranchIdx(null);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select City" value={null} color={theme.colors.textMuted || '#999'} />
              {cities.map((city, idx) => (
                <Picker.Item key={city.id} label={city.name} value={idx} color={theme.colors.text} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Area / Sub-Region or Branch Picker */}
        {selectedCity && orderType === 'Delivery' && (
          <Animated.View style={[styles.pickerSection, { opacity: fadeAnim }]}>
            <Text style={styles.pickerLabel}>Area / Sub-Region</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedAreaIdx}
                onValueChange={(val) => setSelectedAreaIdx(val)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select Area" value={null} color={theme.colors.textMuted || '#999'} />
                {areas.map((area, idx) => (
                  <Picker.Item key={area.id} label={area.name} value={idx} color={theme.colors.text} />
                ))}
              </Picker>
            </View>
          </Animated.View>
        )}

        {selectedCity && orderType === 'Pick-Up' && (
          <Animated.View style={[styles.pickerSection, { opacity: fadeAnim }]}>
            <Text style={styles.pickerLabel}>Branch</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedBranchIdx}
                onValueChange={(val) => setSelectedBranchIdx(val)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select Branch" value={null} color={theme.colors.textMuted || '#999'} />
                {regionBranches.map((branch, idx) => (
                  <Picker.Item key={branch.id} label={branch.name} value={idx} color={theme.colors.text} />
                ))}
              </Picker>
            </View>
          </Animated.View>
        )}

      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            ((orderType === 'Delivery' && !selectedArea) || (orderType === 'Pick-Up' && !pickedBranch) || loading) && styles.confirmBtnDisabled,
          ]}
          onPress={handleConfirm}
          disabled={(orderType === 'Delivery' ? !selectedArea : !pickedBranch) || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm Location</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading && selectedArea && (
        <View style={styles.overlayLoader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>Resolving Branch...</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  // ——— Step 1: Order Type ———
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  logoSection: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  logo: {
    width: Math.min(Dimensions.get('window').width * 0.75, 280),
    height: 90,
    resizeMode: 'contain',
  },
  welcomeCard: {
    flex: 0.5,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    ...theme.shadows?.large,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary || theme.colors.muted,
    marginBottom: 24,
  },
  orderTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  orderTypeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight || '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  orderTypeIcon: {
    width: 28,
    height: 28,
    tintColor: theme.colors.primary,
  },
  orderTypeBtnText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  orderTypeArrow: {
    fontSize: 28,
    color: theme.colors.textMuted || '#999',
    fontWeight: '300',
  },

  // ——— Step 2: Location ———
  container2: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: 12,
  },
  loaderText: {
    color: theme.colors.textSecondary || theme.colors.muted,
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderBadgeText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 120,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight || '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary || theme.colors.muted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  currentLocationBtn: {
    backgroundColor: theme.colors.primaryLight || '#FFCDD2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  currentLocationBtnText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerSection: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: theme.colors.borderMedium || theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface || theme.colors.card,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 160 : 52,
    color: theme.colors.text,
  },
  pickerItem: {
    fontSize: 16,
    color: theme.colors.text,
  },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.success || '#4CAF50',
    gap: 12,
  },
  branchInfo: {
    flex: 1,
  },
  branchLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary || theme.colors.muted,
    fontWeight: '500',
  },
  branchNameText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  confirmBtn: {
    height: 54,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  overlayLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlayText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '700',
    fontSize: 16,
  },
});
