import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../context/ThemeContext';
import { StoreContext } from '../context/StoreContext';
import { getDealDetails } from '../services/APIservice';
import { Plus } from 'lucide-react-native';

const DealItem = (props) => {
  const { id, name, final_price, price, image, description, pos_code, deal_items = [], attached_items = [] } = props;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const { menuData } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);

  const handleNavigateToModal = async () => {
    // Start with whatever we already have from the list API
    let dealData = { ...props };

    // Check if we already have deal lines/slots loaded
    const existingSlots = props.lines || props.attached_items || props.deal_items || props.slots || props.deal_product_slots || [];

    if (existingSlots.length === 0) {
      // Lazy fetch: get full deal details from API
      try {
        setLoading(true);
        const branch = menuData?.branch;
        const companyId = branch?.company_id;
        const branchId = branch?.id;

        if (companyId && branchId) {
          const detailRes = await getDealDetails(id, companyId, branchId);
          const fullDeal = detailRes?.data?.deal || detailRes?.deal || detailRes?.data || {};

          // Merge full deal data over basic props (keeps id, name etc but adds lines, variants etc)
          dealData = { ...dealData, ...fullDeal };
        }
      } catch (err) {
        console.error('Failed to fetch deal details:', err);
      } finally {
        setLoading(false);
      }
    }

    // Filter out non-serializable props like functions
    const { onAddToCart, ...serializableProps } = dealData;

    navigation.navigate("DealOptions", {
      ...serializableProps,
      price: serializableProps.final_price || serializableProps.price || final_price || price,
      attached_items: serializableProps.lines || serializableProps.attached_items || existingSlots,
    });
  };

  const displayPrice = final_price || price;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleNavigateToModal}
      disabled={loading}
      activeOpacity={0.7}
    >
      {/* Left: Text */}
      <View style={styles.textSection}>
        <Text style={styles.dealName} numberOfLines={2}>{name}</Text>
        {description ? (
          <Text style={styles.dealDesc} numberOfLines={2}>{description}</Text>
        ) : null}
        <Text style={styles.dealPrice}>Rs. {displayPrice}</Text>
      </View>

      {/* Right: Image + Add Button */}
      <View style={styles.imageSection}>
        {image ? (
          <Image source={{ uri: image }} style={styles.dealImage} />
        ) : (
          <View style={[styles.dealImage, styles.placeholder]} />
        )}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleNavigateToModal}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Plus size={18} color="#fff" strokeWidth={3} />
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
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border || '#EEE',
    },
    textSection: {
      flex: 1,
      paddingRight: 12,
    },
    dealName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    dealDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary || '#666',
      marginBottom: 6,
      lineHeight: 18,
    },
    dealPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    imageSection: {
      position: 'relative',
    },
    dealImage: {
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

export default DealItem;
