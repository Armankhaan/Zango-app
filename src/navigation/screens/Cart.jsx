import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { StoreContext } from '../../context/StoreContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ThemeContext } from '../../context/ThemeContext';
import axios from 'axios';
import Config from '../../constants/Config';
import getErrorMessage from '../../utils/errorHelper';
import { Minus, Plus, Trash2 } from 'lucide-react-native';


const RenderDetails = ({ details }) => {
  const sel = details || {};
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  return (
    <View style={styles.detailsContainer}>

      {/* Selected Size */}
      {sel.size && (
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>Size: </Text>
          {sel.size.item_name} {Number(sel.size.price) > 0 ? `(Rs ${Number(sel.size.price).toFixed(0)})` : ''}
        </Text>
      )}

      {/* Slots & Toppings (for Deal Items) */}
      {sel.slots && (
        <>
          <Text style={styles.subHeading}>Selections:</Text>
          {Object.entries(sel.slots).map(([slotId, prod]) => {
            const slotToppings = prod.selected_toppings || [];
            return (
              <View key={slotId} style={{ marginBottom: 6, paddingLeft: 8 }}>
                <Text style={[styles.detailLine, { fontWeight: '700' }]}>
                  • {prod.name || prod.product?.name || prod.display_name}
                </Text>

                {(prod.firstHalf || prod.secondHalf) ? (
                  <View style={{ marginTop: 6, marginLeft: 8 }}>
                    {prod.firstHalf && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={styles.subHeading}>1st Half: {prod.firstHalf.pizza?.item_name}</Text>
                        {prod.firstHalf.crust && (
                          <Text style={[styles.detailLine, { paddingLeft: 8 }]}>
                            • Crust: {prod.firstHalf.crust.item_name}
                          </Text>
                        )}
                        {prod.firstHalf.toppings && prod.firstHalf.toppings.length > 0 && (
                          <>
                            <Text style={[styles.detailLine, { paddingLeft: 8, fontWeight: '600', marginTop: 2 }]}>Toppings:</Text>
                            {prod.firstHalf.toppings.map((t, idx) => {
                              const isRemoved = t.quantity === -0.5 || t.quantity === -1;
                              return (
                                <Text key={idx} style={[styles.detailLine, { paddingLeft: 16, opacity: isRemoved ? 0.5 : 1, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                                  {isRemoved ? '– [Removed] ' : '+ '} {t.item_name} {Number(t.price) > 0 ? `(Rs ${(Number(t.price) * 0.5).toFixed(0)})` : ''}
                                </Text>
                              );
                            })}
                          </>
                        )}
                      </View>
                    )}
                    {prod.secondHalf && (
                      <View style={{ marginBottom: 8 }}>
                        <Text style={styles.subHeading}>2nd Half: {prod.secondHalf.pizza?.item_name}</Text>
                        {prod.secondHalf.crust && (
                          <Text style={[styles.detailLine, { paddingLeft: 8 }]}>
                            • Crust: {prod.secondHalf.crust.item_name}
                          </Text>
                        )}
                        {prod.secondHalf.toppings && prod.secondHalf.toppings.length > 0 && (
                          <>
                            <Text style={[styles.detailLine, { paddingLeft: 8, fontWeight: '600', marginTop: 2 }]}>Toppings:</Text>
                            {prod.secondHalf.toppings.map((t, idx) => {
                              const isRemoved = t.quantity === -0.5 || t.quantity === -1;
                              return (
                                <Text key={idx} style={[styles.detailLine, { paddingLeft: 16, opacity: isRemoved ? 0.5 : 1, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                                  {isRemoved ? '– [Removed] ' : '+ '} {t.item_name} {Number(t.price) > 0 ? `(Rs ${(Number(t.price) * 0.5).toFixed(0)})` : ''}
                                </Text>
                              );
                            })}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                ) : (
                  slotToppings.map(t => {
                    const isRemoved = t.quantity === -1;
                    return (
                      <Text key={t.id} style={[styles.detailLine, { paddingLeft: 12, fontSize: 13, opacity: isRemoved ? 0.5 : 0.8, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                        {isRemoved ? '– [Removed] ' : '+ '} {t.name} {Number(t.price) > 0 ? `(Rs ${t.price})` : ''}
                      </Text>
                    );
                  })
                )}
              </View>
            );
          })}
        </>
      )}

      {/* Customizations / Options */}
      {sel.customizations && sel.customizations.length > 0 && (
        <>
          <Text style={styles.subHeading}>Options:</Text>
          {sel.customizations.map((item, idx) => {
            const isRemoved = item.quantity === -1;
            return (
              <Text key={item.item_id || idx} style={[styles.detailLine, { paddingLeft: 8, opacity: isRemoved ? 0.5 : 1, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                {isRemoved ? '– [Removed] ' : '• '} {item.item_name} {Number(item.price) > 0 ? `(Rs ${(Number(item.price) * (item.quantity || 1)).toFixed(0)})` : ''}
              </Text>
            );
          })}
        </>
      )}
      {/* Half & Half details */}
      {(sel.firstHalf || sel.secondHalf) && (
        <View style={{ marginTop: 6 }}>
          {sel.firstHalf && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.subHeading}>1st Half: {sel.firstHalf.pizza?.item_name}</Text>
              {sel.firstHalf.crust && (
                <Text style={[styles.detailLine, { paddingLeft: 8 }]}>
                  • Crust: {sel.firstHalf.crust.item_name}
                </Text>
              )}
              {sel.firstHalf.toppings && sel.firstHalf.toppings.length > 0 && (
                <>
                  <Text style={[styles.detailLine, { paddingLeft: 8, fontWeight: '600', marginTop: 2 }]}>Toppings:</Text>
                  {sel.firstHalf.toppings.map((t, idx) => {
                    const isRemoved = t.quantity === -0.5 || t.quantity === -1;
                    return (
                      <Text key={idx} style={[styles.detailLine, { paddingLeft: 16, opacity: isRemoved ? 0.5 : 1, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                        {isRemoved ? '– [Removed] ' : '+ '} {t.item_name} {Number(t.price) > 0 ? `(Rs ${(Number(t.price) * 0.5).toFixed(0)})` : ''}
                      </Text>
                    );
                  })}
                </>
              )}
            </View>
          )}
          {sel.secondHalf && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.subHeading}>2nd Half: {sel.secondHalf.pizza?.item_name}</Text>
              {sel.secondHalf.crust && (
                <Text style={[styles.detailLine, { paddingLeft: 8 }]}>
                  • Crust: {sel.secondHalf.crust.item_name}
                </Text>
              )}
              {sel.secondHalf.toppings && sel.secondHalf.toppings.length > 0 && (
                <>
                  <Text style={[styles.detailLine, { paddingLeft: 8, fontWeight: '600', marginTop: 2 }]}>Toppings:</Text>
                  {sel.secondHalf.toppings.map((t, idx) => {
                    const isRemoved = t.quantity === -0.5 || t.quantity === -1;
                    return (
                      <Text key={idx} style={[styles.detailLine, { paddingLeft: 16, opacity: isRemoved ? 0.5 : 1, textDecorationLine: isRemoved ? 'line-through' : 'none' }]}>
                        {isRemoved ? '– [Removed] ' : '+ '} {t.item_name} {Number(t.price) > 0 ? `(Rs ${(Number(t.price) * 0.5).toFixed(0)})` : ''}
                      </Text>
                    );
                  })}
                </>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export function Cart() {
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    customerInfo,
    selectedBranch,
    orderDetails,
    clearCart
  } = useContext(StoreContext);
  const [showDetails, setShowDetails] = useState({});
  const entries = Object.values(cartItems);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [quantities, setQuantities] = useState(
    entries.reduce((acc, item) => ({ ...acc, [item.key]: item.quantity }), {})
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuantities(
      Object.values(cartItems).reduce(
        (acc, item) => ({ ...acc, [item.key]: item.quantity }),
        {}
      )
    );
  }, [cartItems]);

  const handleQuantityChange = (key, change) => {
    const currentQty = quantities[key] || cartItems[key]?.quantity || 1;
    const newQuantity = Math.max(1, currentQty + change);
    setQuantities(prev => ({ ...prev, [key]: newQuantity }));
    updateCartQuantity(key, newQuantity);
  };

  const transformCartItems = (cart) => {
    const transformed = {};
    Object.keys(cart).forEach(key => {
      const item = cart[key];
      if (key.startsWith('deal-') || (item.details && item.details.slots)) {
        transformed[key] = item;
      } else if (item.details && (item.details.firstHalf || item.details.secondHalf)) {
        const productIdStr = key.split('-')[0];
        const productId = parseInt(productIdStr) || item.details?.id || 1;
        transformed[key] = {
          ...item,
          details: {
            id: productId,
            name: item.name,
            price: parseFloat(item.price || 0),
            pos_code: item.pos_code || item.details?.pos_code || item.details?.size?.pos_code || null,
            ref_code: item.ref_code || item.details?.ref_code || item.details?.size?.ref_code || '',
            firstHalf: item.details.firstHalf,
            secondHalf: item.details.secondHalf
          }
        };
      } else {
        const productIdStr = key.split('-')[0];
        const productId = parseInt(productIdStr) || item.details?.size?.item_id || 1;
        transformed[key] = {
          ...item,
          details: {
            id: productId,
            name: item.name,
            price: parseFloat(item.details?.size?.price || 0),
            pos_code: item.details?.size?.pos_code || item.pos_code || null,
            ref_code: item.details?.size?.ref_code || item.ref_code || '',
            selected_toppings: (item.details?.customizations || []).map(c => ({
              id: c.item_id || c.id,
              name: c.item_name || c.name,
              price: parseFloat(c.price || 0),
              pos_code: c.pos_code || '',
              quantity: c.quantity !== undefined ? c.quantity : 1,
              ref_code: c.ref_code || ''
            }))
          }
        };
      }
    });
    return transformed;
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!entries || !entries.length) return;

    setLoading(true);

    try {
      const transformedCart = transformCartItems(cartItems);

      const payload = {
        company_id: customerInfo?.company_id || selectedBranch?.company_id,
        branch_id: selectedBranch?.id,
        username: customerInfo?.username || customerInfo?.name || 'Guest',
        email: customerInfo?.email || '',
        employee_id: customerInfo?.employee_id,
        order_info: {
          cart: transformedCart,
          orderType: orderDetails?.orderType || "Delivery",
          paymentMethod: 'Cash',
          customerInfo: customerInfo
        }
      };

      const response = await axios.post(
        `${Config.BASE_URL}/orders`,
        payload
      );

      clearCart();
      navigation.navigate('OrderSuccess', { apiData: response.data || null });
    } catch (err) {
      console.error('Order Placement Error:', err);
      const apiMessage = getErrorMessage(err, 'An error occurred while placing the order.');
      Alert.alert('Error', apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = key => {
    setShowDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const subtotal = entries.reduce(
    (sum, item) => sum + item.price * (quantities[item.key] || item.quantity),
    0
  );
  const total = subtotal;

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from the menu to get started</Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.browseBtnText}>Browse Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Deliver To */}
      {selectedBranch && (
        <View style={styles.deliverRow}>
          <View>
            <Text style={styles.deliverLabel}>
              {orderDetails?.orderType === 'Pick-Up' ? 'Pick up from' : 'Deliver To'}
            </Text>
            <Text style={styles.deliverBranch} numberOfLines={1}>{selectedBranch.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('LocationSelection')}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Items Header */}
        <Text style={styles.itemsHeader}>Items</Text>

        {entries.map(item => (
          <View key={item.key} style={styles.cartItem}>
            <View style={styles.itemRow}>
              {/* Product Image Placeholder */}
              <View style={styles.itemImageWrap}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: theme.colors.surface || '#F5F5F5' }]} />
                )}
              </View>

              {/* Item Info */}
              <View style={styles.itemInfo}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemPrice}>Rs. {(item.price * (quantities[item.key] || item.quantity)).toFixed(0)}</Text>
                </View>

                {/* Quantity Controls */}
                <View style={styles.qtyRow}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.key, -1)}
                      style={styles.qtyBtn}
                    >
                      <Minus size={16} color={theme.colors.primary} strokeWidth={3} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{quantities[item.key] || item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(item.key, 1)}
                      style={styles.qtyBtn}
                    >
                      <Plus size={16} color={theme.colors.primary} strokeWidth={3} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => removeFromCart(item.key)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={18} color={theme.colors.error || '#F44336'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Details Toggle */}
            {item.details && (
              <TouchableOpacity
                onPress={() => toggleDetails(item.key)}
                style={styles.detailsToggle}
              >
                <Text style={styles.detailsToggleText}>
                  {showDetails[item.key] ? 'Hide Details ▲' : 'Show Details ▼'}
                </Text>
              </TouchableOpacity>
            )}

            {showDetails[item.key] && item.details && (
              <RenderDetails details={item.details} />
            )}
          </View>
        ))}

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>Rs. {total.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.bottomTotal}>Total</Text>
          <Text style={styles.bottomTotalAmount}>Rs. {total.toFixed(0)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Checkout')}
          style={styles.checkoutBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutBtnText}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = theme => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Delivery row
    deliverRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    deliverLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary || '#666',
    },
    deliverBranch: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      maxWidth: 250,
    },
    changeLink: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    // Scroll
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 200 },
    itemsHeader: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    // Cart Item
    cartItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    itemRow: {
      flexDirection: 'row',
    },
    itemImageWrap: {
      marginRight: 14,
    },
    itemImage: {
      width: 64,
      height: 64,
      borderRadius: 10,
    },
    itemInfo: {
      flex: 1,
    },
    itemHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    itemPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    qtyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    qtyControls: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderMedium || theme.colors.border,
      borderRadius: 8,
    },
    qtyBtn: {
      width: 36,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      minWidth: 24,
      textAlign: 'center',
    },
    // Details
    detailsToggle: {
      marginTop: 8,
    },
    detailsToggleText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    detailsContainer: {
      backgroundColor: theme.colors.surface || '#F9F9F9',
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: 8,
    },
    subHeading: {
      fontSize: 14,
      fontWeight: '600',
      marginVertical: 4,
      color: theme.colors.primary,
    },
    detailLine: {
      fontSize: 13,
      marginBottom: 3,
      color: theme.colors.text,
    },
    detailLabel: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    // Summary
    summaryCard: {
      marginTop: 20,
      padding: 16,
      backgroundColor: theme.colors.surface || '#F9F9F9',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    summaryLabel: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '600',
    },
    summaryValue: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 8,
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
    },
    // Bottom bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    bottomTotal: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    bottomTotalAmount: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
    },
    checkoutBtn: {
      backgroundColor: theme.colors.primary,
      height: 52,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkoutBtnText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
    },
    // Empty State
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 24,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary || '#666',
      marginBottom: 24,
      textAlign: 'center',
    },
    browseBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    browseBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
  });
};


export default Cart;
