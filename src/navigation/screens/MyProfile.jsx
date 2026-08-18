import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import Config from '../../constants/Config';

export function MyProfile() {
  const { theme } = useContext(ThemeContext);
  const { customerInfo } = useContext(StoreContext);
  const styles = getStyles(theme);

  const [formData, setFormData] = useState({
    first_name: customerInfo?.name?.split(' ')[0] || customerInfo?.first_name || '',
    last_name: customerInfo?.name?.split(' ').slice(1).join(' ') || customerInfo?.last_name || '',
    email: customerInfo?.email || '',
    mobile: customerInfo?.phone || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(`${Config.BASE_URL}/customer/profile`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password || undefined
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={formData.first_name}
        onChangeText={t => handleChange('first_name', t)}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={formData.last_name}
        onChangeText={t => handleChange('last_name', t)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={formData.email}
        onChangeText={t => handleChange('email', t)}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.colors.border }]}
        value={formData.mobile}
        editable={false}
      />

      <Text style={styles.label}>New Password (Optional)</Text>
      <TextInput
        style={styles.input}
        value={formData.password}
        onChangeText={t => handleChange('password', t)}
        secureTextEntry
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Update Profile</Text>}
      </TouchableOpacity>
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
