import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import Config from '../../constants/Config';
import getErrorMessage from '../../utils/errorHelper';
import { User, Phone, Mail, MapPin, CreditCard } from 'lucide-react-native';
import AddressModal from '../../components/AddressModal';

export function Checkout() {
  const navigation = useNavigation();
  const { cartItems, orderDetails, clearCart, selectedBranch, customerInfo } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const styles = getStyles(theme);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  React.useEffect(() => {
    if (customerInfo) {
      if (!name) setName(customerInfo.first_name ? `${customerInfo.first_name} ${customerInfo.last_name || ''}`.trim() : customerInfo.name || '');
      if (!phone) setPhone(customerInfo.phone || customerInfo.phone_number || '');
      if (!email) setEmail(customerInfo.email || '');
      if (!address && customerInfo.addresses && customerInfo.addresses.length > 0) {
        setAddress(customerInfo.addresses[0].address || '');
        setLatitude(customerInfo.addresses[0].latitude || null);
        setLongitude(customerInfo.addresses[0].longitude || null);
      }
    }
  }, [customerInfo]);


  const subtotal = Object.values(cartItems).reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0
  );
  const deliveryFee = orderDetails?.orderType === 'Pick-Up' ? 0 : 130;
  // Inclusive Tax Math: total includes tax, so GST = subtotal * (16 / 116)
  const tax = subtotal * (16 / 116);
  const grandTotal = subtotal + deliveryFee;

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

  const handlePlaceOrder = async () => {
    if (!name.trim()) return Alert.alert('Required', 'Please enter your name.');
    if (!phone.trim()) return Alert.alert('Required', 'Please enter your phone number.');
    if (orderDetails?.orderType === 'Delivery' && !address.trim()) {
      return Alert.alert('Required', 'Please enter your delivery address.');
    }

    setLoading(true);
    try {
      const transformedCart = transformCartItems(cartItems);
      const payload = {
        company_id: Config.COMPANY_ID || 2,
        branch_id: selectedBranch?.id,
        username: name,
        email: email,
        order_info: {
          cart: transformedCart,
          orderType: orderDetails?.orderType || 'Delivery',
          paymentMethod: paymentMethod === 'COD' ? 'Cash' : 'Card',
          customerInfo: {
            name,
            phone,
            email,
            address,
            latitude,
            longitude,
            instructions
            },
            source: 'krunceese'
          }
      };

      const response = await axios.post(`${Config.BASE_URL}/orders`, payload);
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Customer Details Section */}
        <View style={styles.sectionHeader}>
          <User size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Customer Details</Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.colors.textMuted || '#999'}
            />
          </View>

          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.phoneInputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇵🇰 +92</Text>
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <TextInput
                style={styles.input}
                placeholder="3001234567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor={theme.colors.textMuted || '#999'}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Email (Optional)</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={theme.colors.textMuted || '#999'}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Delivery Address Section */}
        {orderDetails?.orderType === 'Delivery' && (
          <View style={styles.addressContainer}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>
                {customerInfo ? 'Your Delivery Addresses' : 'Delivery Address'}
              </Text>
            </View>

            {customerInfo && customerInfo.addresses && customerInfo.addresses.length > 0 ? (
              <View style={styles.savedAddressesList}>
                {customerInfo.addresses.map((addr, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.savedAddressCard,
                      address === addr.address && styles.savedAddressCardSelected
                    ]}
                    onPress={() => {
                      setAddress(addr.address);
                      setLatitude(addr.latitude);
                      setLongitude(addr.longitude);
                    }}
                  >
                    <Text style={[styles.savedAddressText, address === addr.address && { color: theme.colors.primary, fontWeight: '700' }]}>
                      {addr.address}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {(!customerInfo || (!customerInfo?.addresses?.find(a => a.address === address) && address)) && (
              <TouchableOpacity
                style={styles.addressCard}
                onPress={() => setIsAddressModalOpen(true)}
                activeOpacity={0.8}
              >
                <View style={styles.addressLeft}>
                  <View style={styles.addressIconWrap}>
                    <MapPin size={22} color={theme.colors.primary} />
                  </View>
                  <View style={styles.addressTextColumn}>
                    <Text style={styles.addressTitle}>
                      {address ? 'Selected Address' : 'No Address Selected'}
                    </Text>
                    <Text style={styles.addressInput}>
                      {address ? address : 'Tap to select location on map'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.addNewAddressBtn} 
              onPress={() => setIsAddressModalOpen(true)}
            >
              <Text style={styles.addNewAddressText}>+ Add new Address</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order Instructions Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>+ Add any instructions for your order</Text>
        </View>
        <View style={styles.inputCard}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Make it spicy, no onions, etc."
              value={instructions}
              onChangeText={setInstructions}
              placeholderTextColor={theme.colors.textMuted || '#999'}
            />
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <CreditCard size={20} color={theme.colors.primary} />
          <Text style={styles.sectionTitle}>Payment Method</Text>
        </View>
        <View style={styles.paymentContainer}>
          <View style={[styles.paymentBtn, styles.paymentBtnSelected]}>
            <Text style={[styles.paymentText, styles.paymentTextSelected]}>COD</Text>
          </View>
        </View>

        {/* Bill Details Section */}
        <View style={styles.billDetailsCard}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billVal}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billVal}>Rs. {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.grandTotalLabel}>Grand Total <Text style={styles.inclusiveTaxLabel}>(Incl. 16% Tax)</Text></Text>
            <Text style={styles.grandTotalVal}>Rs. {grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.placeOrderText}>
            {loading ? 'Confirming Order...' : 'Confirm Order'}
          </Text>
        </TouchableOpacity>
      </View>

      <AddressModal
        visible={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        defaultAddress={address}
        regionName={selectedBranch?.name || ''}
        theme={theme}
        onSave={(data) => {
          setAddress(data.address);
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setIsAddressModalOpen(false);
        }}
      />
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  inputCard: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary || '#666',
    marginBottom: -4,
  },
  inputWrapper: {
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: theme.colors.text,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCode: {
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  paymentBtnSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary || '#666',
  },
  paymentTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  billDetailsCard: {
    marginTop: 24,
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
  },
  billVal: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
  },
  inclusiveTaxLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary || '#666',
    fontWeight: '400',
  },
  grandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  addressContainer: {
    marginTop: 24,
  },
  addressCard: {
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  addressLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addressIconWrap: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  addressTextColumn: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  addressInput: {
    fontSize: 14,
    color: theme.colors.textSecondary || '#666',
    paddingTop: 2,
  },
  savedAddressesList: {
    gap: 10,
    marginBottom: 12,
  },
  savedAddressCard: {
    backgroundColor: theme.colors.surface || '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
  },
  savedAddressCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
  },
  savedAddressText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  addNewAddressBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addNewAddressText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
  },
  placeOrderBtn: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
