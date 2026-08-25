import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { StoreContext } from '../context/StoreContext';

const { width, height } = Dimensions.get('window');

const AddressModal = ({ visible, onClose, onSave, defaultAddress = '', regionName = '', theme }) => {
  const { mapboxToken } = useContext(StoreContext);
  const hasValidMapKey = !!(
    mapboxToken &&
    typeof mapboxToken === 'string' &&
    mapboxToken.trim().length > 0 &&
    mapboxToken.trim() !== 'null' &&
    mapboxToken.trim() !== 'undefined'
  );
  const [addressText, setAddressText] = useState(defaultAddress);
  const [coordinates, setCoordinates] = useState({ lat: 31.5204, lng: 74.3587 });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const webviewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setAddressText(defaultAddress);
    }
  }, [visible, defaultAddress]);

  const fetchAddressFromCoords = async (lat, lng) => {
    if (!mapboxToken) return;
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`);
      const json = await res.json();
      if (json && json.features && json.features.length > 0) {
        const placeName = json.features[0].place_name;
        setAddressText(placeName);
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsFetchingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      setCoordinates({ lat: latitude, lng: longitude });
      fetchAddressFromCoords(latitude, longitude);
      
      // Tell webview to move map
      if (webviewRef.current) {
        webviewRef.current.injectJavaScript(`
          if (window.updateMapCenter) {
            window.updateMapCenter(${latitude}, ${longitude});
          }
          true;
        `);
      }
    } catch (error) {
      alert('Could not fetch location.');
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_MOVED') {
        const { lat, lng } = data;
        setCoordinates({ lat, lng });
        fetchAddressFromCoords(lat, lng);
      }
    } catch (e) {
      console.warn('Error parsing webview message', e);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js'></script>
      <link href='https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css' rel='stylesheet' />
      <style>
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
        #map { width: 100%; height: 100%; position: absolute; top: 0; bottom: 0; left: 0; right: 0; }
      </style>
    </head>
    <body>
      ${mapboxToken ? '<div id="map"></div>' : '<div style="padding:20px; text-align:center; font-family:sans-serif; color:#666;">Map cannot be loaded. Mapbox API key is missing.</div>'}
      
      <script>
        ${mapboxToken ? `
          mapboxgl.accessToken = '${mapboxToken}';
          var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [${coordinates.lng}, ${coordinates.lat}],
            zoom: 15
          });

          var marker = new mapboxgl.Marker({ draggable: true, color: '#FF6600' })
            .setLngLat([${coordinates.lng}, ${coordinates.lat}])
            .addTo(map);

          function sendCoords(lat, lng) {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_MOVED', lat: lat, lng: lng }));
            }
          }

          marker.on('dragend', function() {
            var lngLat = marker.getLngLat();
            map.flyTo({ center: lngLat });
            sendCoords(lngLat.lat, lngLat.lng);
          });

          map.on('click', function(e) {
            marker.setLngLat(e.lngLat);
            map.flyTo({ center: e.lngLat });
            sendCoords(e.lngLat.lat, e.lngLat.lng);
          });

          window.updateMapCenter = function(lat, lng) {
            marker.setLngLat([lng, lat]);
            map.flyTo({ center: [lng, lat], zoom: 15 });
            sendCoords(lat, lng);
          };
        ` : ''}
      </script>
    </body>
    </html>
  `;

  const isLight = !theme?.dark;
  const cardBg = isLight ? '#FFFFFF' : '#1E1E1E';
  const borderColor = isLight ? '#E0E0E0' : '#333333';
  const ORANGE = '#FF6600';

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme?.colors?.text || '#000' }]}>Add new Address</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false}>
            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: theme?.colors?.textSecondary || '#666' }]}>
                Address (with post code if applicable)
              </Text>
              <TextInput
                style={[styles.input, { borderColor, color: theme?.colors?.text || '#000' }]}
                placeholder="Enter your complete street address"
                placeholderTextColor="#999"
                value={addressText}
                onChangeText={setAddressText}
              />

              <Text style={[styles.label, { color: theme?.colors?.textSecondary || '#666', marginTop: 12 }]}>
                Region
              </Text>
              <TextInput
                style={[styles.input, { borderColor, backgroundColor: isLight ? '#F5F5F5' : '#2A2A2A', color: '#888' }]}
                value={regionName || 'Region not selected'}
                editable={false}
              />
              <Text style={styles.helpText}>To change your region, go back to Location Selection.</Text>
            </View>

            {hasValidMapKey ? (
              <View style={styles.mapContainer}>
                <WebView
                  ref={webviewRef}
                  source={{ html: mapHtml }}
                  style={{ flex: 1 }}
                  scrollEnabled={false}
                  javaScriptEnabled={true}
                  onMessage={handleWebViewMessage}
                />
                <TouchableOpacity 
                  style={styles.crosshairNativeBtn} 
                  onPress={handleUseCurrentLocation}
                  disabled={isFetchingLocation}
                >
                  {isFetchingLocation ? (
                    <ActivityIndicator size="small" color={ORANGE} />
                  ) : (
                    <Text style={{ fontSize: 20 }}>📍</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: ORANGE }]}
            onPress={() => onSave({
              address: addressText,
              latitude: coordinates.lat,
              longitude: coordinates.lng,
              regionName
            })}
          >
            <Text style={styles.saveBtnText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  helpText: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  mapContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    position: 'relative',
  },
  crosshairNativeBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddressModal;
