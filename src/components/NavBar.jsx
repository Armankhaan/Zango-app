import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StoreContext } from '../context/StoreContext';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { ChevronDown, ShoppingBag } from 'lucide-react-native';

export const CustomNavBar = () => {
  const navigation = useNavigation();
  const ctx = useContext(StoreContext) || {};
  const { selectedBranch, orderDetails } = ctx;
  const { theme } = useContext(ThemeContext);


  return (
    <View style={styles.navBar}>
      {/* Left: Hamburger Menu */}
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={styles.menuBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.hamburgerLine} />
        <View style={[styles.hamburgerLine, { width: 20 }]} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      {/* Center: Branch Info */}
      <TouchableOpacity
        style={styles.centerWrap}
        onPress={() => navigation.navigate('LocationSelection')}
        activeOpacity={0.7}
      >
        <Text style={styles.deliverLabel}>
          {orderDetails?.orderType === 'Dine In' ? 'Dine In at' : 'Branch'}
          {' '}
          <ChevronDown size={12} color="rgba(255,255,255,0.8)" />
        </Text>
        <Text style={styles.branchName} numberOfLines={1}>
          {selectedBranch?.name || 'Select Location'}
        </Text>
      </TouchableOpacity>

      {/* Right: Order Type Icon */}
      <TouchableOpacity
        style={styles.rightBtn}
        onPress={() => navigation.navigate('Cart')}
      >
        <ShoppingBag size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  menuBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    gap: 5,
  },
  hamburgerLine: {
    width: 24,
    height: 2.5,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  centerWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  deliverLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  branchName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  rightBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomNavBar;
