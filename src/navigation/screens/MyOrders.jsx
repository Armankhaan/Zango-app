import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { apiClient } from '../../services/APIservice';
import { Package, ChevronRight } from 'lucide-react-native';

export function MyOrders() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/customer/orders');
        setOrders(res.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      {loading ? <ActivityIndicator size="large" color="#FF5C00" /> : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <View style={styles.cardHeader}>
                <View style={styles.orderNoWrap}>
                  <Package color="#FF5C00" size={20} />
                  <Text style={styles.orderNo}>#{item.order_number}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status || 'Pending'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                <Text style={styles.price}>Rs. {item.order_info?.totals?.grand_total || item.order_info?.subtotal || item.order_info?.total || item.grand_total || '0'}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.text}>You haven't placed any orders yet.</Text>}
        />
      )}
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  text: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderNo: { fontSize: 16, fontWeight: 'bold', color: '#000', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  date: { fontSize: 14, color: '#666' },
  price: { fontSize: 16, fontWeight: '900', color: '#FF5C00' }
});
