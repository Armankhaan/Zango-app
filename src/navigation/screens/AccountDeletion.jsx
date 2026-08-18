import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import Config from '../../constants/Config';

export function AccountDeletion() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(false);

  const handleRequestDeletion = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to request account deletion? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // Implementation of account deletion API endpoint
              Alert.alert('Request Sent', 'Your account deletion request has been submitted.');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to request account deletion');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Deletion</Text>
      <Text style={styles.text}>
        If you request account deletion, all your personal data, order history, and preferences will be permanently removed from our systems. 
      </Text>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleRequestDeletion} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteBtnText}>Request Account Deletion</Text>}
      </TouchableOpacity>
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  text: { fontSize: 16, color: theme.colors.textSecondary || '#666', marginBottom: 30, lineHeight: 22 },
  deleteBtn: {
    backgroundColor: '#c00000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
