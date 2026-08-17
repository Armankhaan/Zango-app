// src/components/FoodDisplay.jsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { StoreContext } from '../context/StoreContext';
import { useNavigation } from '@react-navigation/native';
import FoodItem from './FoodItem';
import DealItem from './DealItem';
import { ThemeContext } from '../context/ThemeContext';
import { ShoppingCart } from 'lucide-react-native';

const FoodDisplay = ({ category }) => {
  const { cartItems = {}, menuData = {}, loading, addToCart } = useContext(StoreContext);
  const { categories: rawCategories = [], deals = [], branch } = menuData;
  const categories = deals.length > 0
    ? [{ id: 'deals-cat', name: 'Deals', products: deals.map(d => ({ ...d, is_deal: true })) }, ...rawCategories]
    : rawCategories;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // Initial category selection
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // cart totals
  const values = Object.values(cartItems);
  const itemCount = values.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = values.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(0);

  // scroll refs
  const scrollViewRef = useRef(null);
  const offsets = useRef({});

  const scrollTo = (catName) => {
    setSelectedCategory(catName);
    const y = offsets.current[catName.toLowerCase()] || 0;
    scrollViewRef.current?.scrollTo({ x: 0, y, animated: true });
  };

  const onSectionLayout = (e, catName) => {
    offsets.current[catName.toLowerCase()] = e.nativeEvent.layout.y;
  };

  if (loading && categories.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, color: theme.colors.textSecondary || theme.colors.text, textAlign: 'center' }}>
          No menu available. Please select a valid location.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Category Tabs */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryPill,
                selectedCategory === cat.name && styles.categoryPillActive,
              ]}
              onPress={() => scrollTo(cat.name)}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat.name && styles.categoryPillTextActive,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainContent}
        contentContainerStyle={{ paddingBottom: itemCount > 0 ? 100 : 40 }}
      >
        {categories.map(cat => (
          <View
            key={cat.id}
            onLayout={e => onSectionLayout(e, cat.name)}
            style={styles.section}
          >
            <Text style={styles.sectionHeading}>{cat.name}</Text>

            {(cat.id === 'deals-cat' || cat.name?.toLowerCase() === 'deals') ? (
              <Image source={require('../assets/dealsbanner.jpg.jpeg')} style={styles.categoryImage} />
            ) : cat.image ? (
              <Image source={{ uri: cat.image }} style={styles.categoryImage} />
            ) : null}

            {cat.products && cat.products.map(item => (
              <View key={item.id}>
                {item.is_deal
                  ? <DealItem {...item} onAddToCart={() => addToCart(item, true)} />
                  : <FoodItem {...item} categoryName={cat.name} onAddToCart={() => addToCart(item, false)} />
                }
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Cart Footer */}
      {itemCount > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
        >
          <View style={styles.cartLeft}>
            <View style={styles.cartBadge}>
              <ShoppingCart size={18} color="#fff" />
              <View style={styles.cartCount}>
                <Text style={styles.cartCountText}>{itemCount}</Text>
              </View>
            </View>
            <Text style={styles.cartText}>View Cart</Text>
          </View>
          <Text style={styles.cartAmount}>Rs. {totalAmount}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    categoryBar: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoryScroll: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    categoryPill: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    categoryPillActive: {
      backgroundColor: theme.colors.primary,
    },
    categoryPillText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary || theme.colors.text,
    },
    categoryPillTextActive: {
      color: '#fff',
      fontWeight: '700',
    },
    mainContent: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 8,
    },
    sectionHeading: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 12,
    },
    categoryImage: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      marginBottom: 12,
      resizeMode: 'cover',
    },
    cartBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 14,
      ...theme.shadows?.large,
    },
    cartLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cartBadge: {
      position: 'relative',
    },
    cartCount: {
      position: 'absolute',
      top: -8,
      right: -10,
      backgroundColor: '#fff',
      borderRadius: 10,
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartCountText: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: '800',
    },
    cartText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    cartAmount: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '800',
    },
  });

export default FoodDisplay;
