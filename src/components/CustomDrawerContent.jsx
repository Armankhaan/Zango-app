// src/components/CustomDrawerContent.jsx
import React, { useContext, useState } from 'react';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Switch,
  Platform,
} from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { StoreContext } from '../context/StoreContext';
import { ThemeContext } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import { Headphones, LogIn, LogOut, Bell } from 'lucide-react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export function CustomDrawerContent({ navigation, ...props }) {
  const { customerInfo, clearCustomerInfo } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const [offerNotifications, setOfferNotifications] = useState(true);

  const closeDrawer = () => navigation.dispatch(DrawerActions.closeDrawer());

  const handleLoginLogout = async () => {
    closeDrawer();
    if (customerInfo) {
      await clearCustomerInfo();
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully.',
      });
    } else {
      navigation.navigate('Root', { screen: 'Login' });
    }
  };

  const handleSupportCall = () => {
    Linking.openURL('tel:(042)111434434').catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Support',
        text2: 'Could not open phone dialer',
      });
    });
  };

  const openSocial = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  const isLight = !theme.dark;
  const bgColor = isLight ? '#FFFFFF' : '#121212';
  const textColor = isLight ? '#000000' : '#FFFFFF';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: bgColor }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Drawer Top Header */}
      <View style={styles.header}>
        <Text style={[styles.greetingText, { color: textColor }]}>
          Hi, {customerInfo?.name || customerInfo?.username || 'Guest'}
        </Text>
      </View>

      {/* Menu List */}
      <View style={styles.menuList}>
        {/* Support Center */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSupportCall}
          activeOpacity={0.7}
        >
          <Headphones size={22} color={textColor} strokeWidth={2} />
          <Text style={[styles.menuText, { color: textColor }]}>Support Center</Text>
        </TouchableOpacity>

        {/* Login / Logout */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleLoginLogout}
          activeOpacity={0.7}
        >
          {customerInfo ? (
            <LogOut size={22} color={textColor} strokeWidth={2} />
          ) : (
            <LogIn size={22} color={textColor} strokeWidth={2} />
          )}
          <Text style={[styles.menuText, { color: textColor }]}>
            {customerInfo ? 'Logout' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Offer Notifications */}
        <View style={styles.menuItemWithToggle}>
          <View style={styles.menuItemLeft}>
            <Bell size={22} color={textColor} strokeWidth={2} />
            <Text style={[styles.menuText, { color: textColor }]}>
              Offer Notifications
            </Text>
          </View>
          <Switch
            value={offerNotifications}
            onValueChange={setOfferNotifications}
            trackColor={{ true: '#C40C0C', false: '#E0E0E0' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Flexible Spacer */}
      <View style={{ flex: 1, minHeight: 120 }} />

      {/* Footer Section */}
      <View style={styles.footerContainer}>
        {/* Social Icons Row */}
        <View style={styles.socialRow}>
          {/* Facebook */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#1877F2' }]}
            onPress={() => openSocial('https://facebook.com')}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
            </Svg>
          </TouchableOpacity>

          {/* Instagram */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#E4405F' }]}
            onPress={() => openSocial('https://instagram.com')}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </Svg>
          </TouchableOpacity>

          {/* X (Twitter) */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#000000' }]}
            onPress={() => openSocial('https://x.com')}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </Svg>
          </TouchableOpacity>

          {/* LinkedIn */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#0A66C2' }]}
            onPress={() => openSocial('https://linkedin.com')}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </Svg>
          </TouchableOpacity>

          {/* TikTok */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#000000' }]}
            onPress={() => openSocial('https://tiktok.com')}
          >
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-3.08 1.56-6.14 4.41-7.24 1.17-.45 2.46-.57 3.69-.37v4.22c-.66-.19-1.38-.17-2.03.06-1.13.39-1.99 1.4-2.12 2.58-.19 1.5.76 2.97 2.21 3.4 1.48.45 3.14-.15 3.97-1.42.44-.66.63-1.46.62-2.25V.02z" />
            </Svg>
          </TouchableOpacity>

          {/* YouTube */}
          <TouchableOpacity
            style={[styles.socialIconBox, { backgroundColor: '#FF0000' }]}
            onPress={() => openSocial('https://youtube.com')}
          >
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="#FFF">
              <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Powered by blink logo */}
        <View style={styles.blinkBrandRow}>
          <View style={styles.blinkLogoShape}>
            <Svg width="36" height="24" viewBox="0 0 36 24">
              <Circle cx="12" cy="8" r="7" fill="#00C4EE" />
              <Circle cx="12" cy="16" r="7" fill="#E80070" />
            </Svg>
          </View>
          <View style={styles.blinkTextWrap}>
            <Text style={styles.poweredByText}>Powered by</Text>
            <Text style={styles.blinkTitle}>blink</Text>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Version 3.0+2</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  menuList: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  menuItemWithToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  socialIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blinkBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  blinkLogoShape: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blinkTextWrap: {
    alignItems: 'flex-start',
  },
  poweredByText: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
    marginBottom: -3,
  },
  blinkTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    marginTop: 4,
  },
});

