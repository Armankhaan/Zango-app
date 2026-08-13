// src/components/CustomDrawerContent.jsx
import React, { useContext } from 'react';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Switch,
  Platform,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { StoreContext } from '../context/StoreContext';
import { ThemeContext } from '../context/ThemeContext';
import { MapPin, ShoppingCart, UtensilsCrossed, Phone, Sun, Moon } from 'lucide-react-native';

export function CustomDrawerContent({ navigation, ...props }) {
  const { selectedBranch, orderDetails } = useContext(StoreContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const closeDrawer = () => navigation.dispatch(DrawerActions.closeDrawer());

  const navigateTo = (screen, params) => {
    closeDrawer();
    navigation.navigate('Root', { screen, ...(params ? { params } : {}) });
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Image
          source={require('../assets/Kruncheese.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {selectedBranch && (
          <View style={styles.branchRow}>
            <MapPin size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.branchText} numberOfLines={1}>
              {selectedBranch.name}
            </Text>
          </View>
        )}
        {orderDetails?.orderType && (
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>{orderDetails.orderType}</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('HomeTabs')}
        >
          <UtensilsCrossed size={20} color={theme.colors.primary} />
          <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
            Explore Menu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('Cart')}
        >
          <ShoppingCart size={20} color={theme.colors.primary} />
          <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
            My Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo('LocationSelection')}
        >
          <MapPin size={20} color={theme.colors.primary} />
          <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
            Change Location
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      {/* Theme Toggle */}
      <View style={styles.themeRow}>
        {theme.dark
          ? <Moon size={18} color={theme.colors.textSecondary || theme.colors.muted} />
          : <Sun size={18} color={theme.colors.textSecondary || theme.colors.muted} />
        }
        <Text style={[styles.themeText, { color: theme.colors.text }]}>
          {theme.dark ? 'Dark Mode' : 'Light Mode'}
        </Text>
        <Switch
          value={theme.dark}
          onValueChange={toggleTheme}
          trackColor={{ true: theme.colors.primary, false: '#ccc' }}
          thumbColor="#fff"
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <TouchableOpacity onPress={() => { /* T&C */ }}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Terms & Conditions
            </Text>
          </TouchableOpacity>
          <Text style={[styles.footerVersion, { color: theme.colors.textMuted || '#999' }]}>
            V-2.0
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.contactBar, { backgroundColor: theme.colors.primary }]}
          onPress={() => Linking.openURL('tel:(042)111434434')}
        >
          <Phone size={18} color="#fff" />
          <Text style={styles.contactText}>CONTACT US</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 140,
    height: 50,
    tintColor: '#fff',
    marginBottom: 12,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  branchText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  orderBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  menuSection: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  themeText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 13,
  },
  contactBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 12,
  },
  contactText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
