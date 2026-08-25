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
  Dimensions,
} from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Config from '../../constants/Config';
import { X, ArrowLeft } from 'lucide-react-native';

export const Login = () => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const { requestOtp, verifyOtpAndLogin } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const handleClose = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTabs');
    }
  };

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Email Required', text2: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    const res = await requestOtp(email);
    setLoading(false);

    if (res.success) {
      setIsNewUser(res.is_new);
      setStep(2);
      Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your email for the OTP' });
    } else {
      Toast.show({ type: 'error', text1: 'Failed', text2: res.message });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Toast.show({ type: 'error', text1: 'OTP Required', text2: 'Please enter the OTP' });
      return;
    }
    if (isNewUser && (!firstName.trim() || !phone.trim())) {
      Toast.show({ type: 'error', text1: 'Details Required', text2: 'Please enter name and phone' });
      return;
    }

    setLoading(true);
    const payload = { email, otp };
    if (isNewUser) {
      payload.first_name = firstName;
      payload.phone = phone;
    }

    const res = await verifyOtpAndLogin(payload);
    setLoading(false);

    if (res.success) {
      Toast.show({ type: 'success', text1: 'Welcome', text2: 'Logged in successfully!' });
      setTimeout(() => handleClose(), 400);
    } else {
      Toast.show({ type: 'error', text1: 'Failed', text2: res.message });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.overlayContainer}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

          <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 48 : 32) + 16 }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <X size={20} color="#666" />
            </TouchableOpacity>

            {step === 2 && (
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <ArrowLeft size={20} color="#666" />
              </TouchableOpacity>
            )}

            <View style={styles.logoSection}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.tagline}>Your way Everyday!</Text>
            </View>

            <View style={styles.formSection}>
              {step === 1 ? (
                <>
                  <Text style={styles.title}>Enter Email</Text>
                  <Text style={styles.subtitle}>You'll receive a 6 digits OTP for verification</Text>

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
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.btnDisabled]}
                    onPress={handleRequestOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.loginBtnText}>Send OTP</Text>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.title}>Verify OTP</Text>
                  <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

                  <View style={styles.inputFieldBox}>
                    <Text style={styles.inputLabel}>OTP Code</Text>
                    <TextInput
                      style={styles.input}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="number-pad"
                    />
                  </View>

                  {isNewUser && (
                    <>
                      <View style={styles.inputFieldBox}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <TextInput
                          style={styles.input}
                          value={firstName}
                          onChangeText={setFirstName}
                          placeholder="Your Name"
                          placeholderTextColor="#A0A0A0"
                        />
                      </View>
                      <View style={styles.inputFieldBox}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                          style={styles.input}
                          value={phone}
                          onChangeText={setPhone}
                          placeholder="03xxxxxxxxx"
                          placeholderTextColor="#A0A0A0"
                          keyboardType="phone-pad"
                        />
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.loginBtn, loading && styles.btnDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.loginBtnText}>Verify & Login</Text>}
                  </TouchableOpacity>
                </>
              )}
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
  overlayContainer: { flex: 1, backgroundColor: 'rgba(230, 81, 0, 0.85)' },
  wrapper: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheetContainer: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    position: 'relative', elevation: 10,
  },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 6 },
  backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10, padding: 6 },
  logoSection: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  logo: {
    width: Math.min(Dimensions.get('window').width * 0.7, 260),
    height: 80,
    resizeMode: 'contain',
  },
  tagline: { color: '#333333', fontSize: 13, fontWeight: '500', fontStyle: 'italic', marginTop: 2 },
  formSection: { width: '100%' },
  title: { fontSize: 22, fontWeight: '800', color: '#000000', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777777', marginBottom: 24, fontWeight: '400' },
  inputFieldBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12 },
  inputLabel: { fontSize: 11, color: '#444444', fontWeight: '700', marginBottom: 2 },
  input: { fontSize: 15, color: '#000000', paddingVertical: 2, height: 36 },
  loginBtn: { height: 52, backgroundColor: '#FF6600', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
