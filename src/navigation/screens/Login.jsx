// src/navigation/screens/Login.jsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Config from '../../constants/Config';
import { X } from 'lucide-react-native';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateCustomerInfo } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTabs');
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address',
      });
      return;
    }

    setLoading(true);
    try {
      const nameFromEmail = email.split('@')[0] || 'Guest User';
      const customer = {
        id: Date.now(),
        name: nameFromEmail,
        email: email.trim(),
        phone_number: '923000000000',
        company_id: Config.COMPANY_ID,
      };

      await updateCustomerInfo(customer);

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: `Welcome back, ${nameFromEmail}!`,
      });

      setTimeout(() => {
        setLoading(false);
        handleClose();
      }, 400);
    } catch (e) {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: e.message || 'Something went wrong',
      });
    }
  };

  const handleForgotEmail = () => {
    Toast.show({
      type: 'info',
      text1: 'Forgot Email',
      text2: 'Please contact support to recover your email.',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.overlayContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          {/* Top backdrop - tap to dismiss */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={handleClose}
          />

          {/* Bottom Sheet Card */}
          <View style={styles.sheetContainer}>
            {/* Close icon */}
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={20} color="#666" />
            </TouchableOpacity>

            {/* Centered Logo */}
            <View style={styles.logoSection}>
              <Image
                source={require('../../assets/Kruncheese.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.tagline}>Your way Everyday!</Text>
            </View>

            {/* Form Content */}
            <View style={styles.formSection}>
              <Text style={styles.title}>Enter Email</Text>
              <Text style={styles.subtitle}>
                You'll receive a 6 digits OTP for email verification
              </Text>

              {/* Email Input Field */}
              <View style={styles.inputFieldBox}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter email address"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Forgot Email Link */}
              <TouchableOpacity
                onPress={handleForgotEmail}
                style={styles.forgotWrap}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Email?</Text>
              </TouchableOpacity>

              {/* Red Login Button */}
              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.loginBtnText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(100, 0, 15, 0.75)',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 6,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 200,
    height: 60,
    tintColor: '#C40C0C',
  },
  tagline: {
    color: '#333333',
    fontSize: 13,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 24,
    fontWeight: '400',
  },
  inputFieldBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    color: '#444444',
    fontWeight: '700',
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    color: '#000000',
    paddingVertical: 2,
    height: 36,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#C40C0C',
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    height: 52,
    backgroundColor: '#C40C0C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C40C0C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

