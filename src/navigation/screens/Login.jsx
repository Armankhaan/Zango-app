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
  Animated,
} from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Config from '../../constants/Config';
import { User, Lock } from 'lucide-react-native';

export const Login = () => {
  const [username, setInputUsername] = useState(Config.ADMIN_USERNAME || '');
  const [password, setInputPassword] = useState(Config.ADMIN_PASSWORD || '');
  const { loginStub } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const handleLogin = async () => {
    const res = await loginStub(username, password);
    if (res && res.success) {
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
      navigation.navigate('Profile');
    } else {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: res && res.message ? res.message : 'Invalid credentials',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Red Header Section */}
      <View style={styles.headerSection}>
        <Image
          source={require('../../assets/Kruncheese.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Your Way Everyday!</Text>
      </View>

      {/* White Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.welcomeTitle}>Welcome Back</Text>
        <Text style={styles.welcomeSubtitle}>Please login to continue</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <User size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setInputUsername}
              placeholder="Username"
              placeholderTextColor={theme.colors.textMuted || '#999'}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputIconBox}>
              <Lock size={20} color={theme.colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setInputPassword}
              placeholder="Password"
              placeholderTextColor={theme.colors.textMuted || '#999'}
              secureTextEntry
            />
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const getStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  headerSection: {
    flex: 0.35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 200,
    height: 80,
    tintColor: '#fff',
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formSection: {
    flex: 0.65,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary || theme.colors.muted,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 56,
    paddingHorizontal: 4,
  },
  inputIconBox: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingRight: 16,
  },
  loginBtn: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows?.large,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
