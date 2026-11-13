import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { StoreContext } from '../context/StoreContext';
import { getProductDetails } from '../services/APIservice';
import { Plus } from 'lucide-react-native';

const FoodItem = (props) => {
  const {
    id, name, price, description, image, ref_number, sizes = [],
    toppings = [], crusts = [], options = [], optionTypes = [], flavours = [],
    variants = [], modifier_groups = []
  } = props;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { menuData } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);

  const handleNavigate = async () => {
    let itemData = { ...props };

    // Check if we already have detailed arrays (variants, modifier_groups etc)
    const hasDetails = (variants && variants.length > 0) ||
      (modifier_groups && modifier_groups.length > 0) ||
      (optionTypes && optionTypes.length > 0) ||
      (sizes && sizes.length > 0);

    if (!hasDetails) {
      try {
        setLoading(true);
        const branch = menuData?.branch;
        const companyId = branch?.company_id;
        const branchId = branch?.id;

        if (companyId && branchId) {
          const detailRes = await getProductDetails(id, companyId, branchId);
          const fullProduct = detailRes?.data?.product || detailRes?.product || detailRes?.data || {};

          // Merge full product data over the basic props
          itemData = { ...itemData, ...fullProduct };
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    }

    // Filter out non-serializable props like functions
    const { onAddToCart, ...serializableProps } = itemData;

    navigation.navigate("ItemOptions", {
      ...serializableProps
    });
  };

  return (
    <TouchableOpacity
      accessibilityRole="button" accessibilityLabel={`View ${name}`}
      style={styles.card}
      onPress={handleNavigate}
      disabled={loading}
      activeOpacity={0.7}
    >
      {/* Left: Text */}
      <View style={styles.textSection}>
        <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
        {description ? (
          <Text style={styles.itemDesc} numberOfLines={2}>{description}</Text>
        ) : null}
        <Text style={styles.itemPrice}>Rs. {price}</Text>
      </View>

      {/* Right: Image + Add Button */}
      <View style={styles.imageSection}>
        {image ? (
          <Image source={{ uri: image }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholder]} />
        )}
        <TouchableOpacity
          accessibilityRole="button" accessibilityLabel={`Customize ${name}`}
          style={styles.addBtn}
          onPress={event => { event.stopPropagation(); handleNavigate(); }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#181818" />
          ) : (
            <Plus size={18} color="#181818" strokeWidth={3} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

function getStyles(theme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom:12,
      backgroundColor:theme.colors.card,
      borderRadius:12,
      borderWidth: 1,
      borderBottomColor: theme.colors.border || '#EEE',
    },
    textSection: {
      flex: 1,
      paddingRight: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    itemDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary || '#666',
      marginBottom: 6,
      lineHeight: 18,
    },
    itemPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    imageSection: {
      position: 'relative',
    },
    itemImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: theme.colors.surface || '#F5F5F5',
    },
    placeholder: {
      backgroundColor: theme.colors.surface || '#F5F5F5',
    },
    addBtn: {
      position: 'absolute',
      bottom: -6,
      right: -6,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows?.small,
    },
  });
}

export default FoodItem;
