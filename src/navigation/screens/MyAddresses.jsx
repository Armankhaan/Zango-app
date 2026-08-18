import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';

export function MyAddresses() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>
      <Text style={styles.text}>Address list will be displayed here.</Text>
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  text: { fontSize: 16, color: theme.colors.textSecondary || '#666' }
});
