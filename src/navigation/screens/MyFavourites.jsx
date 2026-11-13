import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { apiClient } from '../../services/APIservice';

export function MyFavourites() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const res = await apiClient.get('/customer/favourites');
        setFavourites(res.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchFavs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favourites</Text>
      {loading ? <ActivityIndicator size="large" color="#FF5C00" /> : (
        <FlatList
          data={favourites}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Image source={{ uri: item.product?.image }} style={styles.img} />
              <Text style={styles.name} numberOfLines={2}>{item.product?.name}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.text}>No favourite items yet.</Text>}
        />
      )}
    </View>
  );
}

const getStyles = theme => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20 },
  text: { fontSize: 16, color: '#666' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 15, elevation: 3 },
  img: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  name: { fontSize: 14, fontWeight: 'bold', color: '#000', textAlign: 'center' }
});
