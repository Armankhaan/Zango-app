import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { apiClient } from '../../services/APIservice';
import Toast from 'react-native-toast-message';
import { Trash2 } from 'lucide-react-native';

export function MyAddresses() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState('');

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get('/customer/addresses');
      setAddresses(res.data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load addresses' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleAdd = async () => {
    if (!newAddress.trim()) return;
    try {
      setLoading(true);
      await apiClient.post('/customer/addresses', { address: newAddress, is_default: 1 });
      setNewAddress('');
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Success', text2: 'Address added' });
    } catch (e) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add address' });
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await apiClient.delete(`/customer/addresses/${id}`);
      await fetchAddresses();
      Toast.show({ type: 'success', text1: 'Success', text2: 'Address deleted' });
    } catch (e) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete address' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>
      
      <View style={styles.addBox}>
        <TextInput style={styles.input} value={newAddress} onChangeText={setNewAddress} placeholder="Enter new address..." placeholderTextColor="#999" />
        <TouchableOpacity style={styles.btn} onPress={handleAdd}><Text style={styles.btnText}>Add</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#C40C0C" /> : (
        <FlatList
          data={addresses}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.card}>
              <View style={{flex: 1}}><Text style={styles.addressText}>{item.address}</Text></View>
              <TouchableOpacity onPress={() => handleDelete(item.id)}><Trash2 color="#C40C0C" size={20} /></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No addresses found.</Text>}
        />
      )}
      <Toast />
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  text: { fontSize: 16, color: '#666' },
  addBox: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 45, backgroundColor: '#fff', color: '#000' },
  btn: { backgroundColor: '#C40C0C', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, alignItems: 'center' },
  addressText: { color: '#000', fontSize: 15 }
});
