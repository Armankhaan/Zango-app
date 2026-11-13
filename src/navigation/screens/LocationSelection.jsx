import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Truck, Store, MapPin, ArrowRight, Crosshair, X } from 'lucide-react-native';
import { StoreContext } from '../../context/StoreContext';
import { ThemeContext } from '../../context/ThemeContext';
import { apiClient } from '../../services/APIservice';
import SelectField from '../../components/SelectField';

export function LocationSelection({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { tradeAreas, selectedBranch, cartItems, orderDetails, handleSelectSubRegion, handleSelectBranch, updateOrderDetails, locationError, refreshLocations, mapboxToken } = useContext(StoreContext);
  const [type, setType] = useState(orderDetails?.orderType === 'Pick-Up' ? 'Pick-Up' : 'Delivery');
  const [cityId, setCityId] = useState('');
  const [selection, setSelection] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmChange, setConfirmChange] = useState(false);
  useEffect(() => { if (tradeAreas.length === 1) setCityId(String(tradeAreas[0].id)); }, [tradeAreas]);
  const city = tradeAreas.find(item => String(item.id) === cityId);
  const areas = city?.sub_regions || city?.subRegions || [];
  const stores = Array.from(new Map(areas.filter(area => area.branch).map(area => [area.branch.id, area.branch])).values());
  const chosenArea = areas.find(area => String(area.id) === selection);
  const chosenBranch = type === 'Delivery' ? chosenArea?.branch : stores.find(branch => String(branch.id) === selection);
  const confirm = async () => {
    if (!chosenBranch || busy) return;
    setBusy(true); setError('');
    try {
      if (type === 'Delivery') await handleSelectSubRegion(chosenArea);
      else await handleSelectBranch(chosenBranch);
      updateOrderDetails({ ...orderDetails, orderType: type });
      navigation.reset({ index: 0, routes: [{ name: 'HomeTabs' }] });
    } catch (err) { setError(err.message || 'Could not select this store. Please retry.'); }
    finally { setBusy(false); }
  };
  const submit = () => {
    if (selectedBranch && chosenBranch && String(selectedBranch.id) !== String(chosenBranch.id) && Object.keys(cartItems).length) {
      if (!confirmChange) { setConfirmChange(true); return; }
      confirm();
    } else confirm();
  };
  const locate = async () => {
    setBusy(true); setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('Location access is unavailable. Please choose your area below.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const response = await apiClient.post('/trade-areas/resolve-by-location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
      const data = response.data.data;
      const region = tradeAreas.find(region => (region.sub_regions || region.subRegions || []).some(area => String(area.id) === String(data?.trade_area?.id)));
      if (!response.data.status || !region) throw new Error('No Zango delivery area found here. Please choose an area below.');
      setCityId(String(region.id));
      setSelection(String(type === 'Delivery' ? data.trade_area.id : data.branch.id));
    } catch (err) { setError(err.message || 'Could not find your location.'); }
    finally { setBusy(false); }
  };
  return <View style={{ flex: 1, backgroundColor: c.background }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(24,insets.bottom) }]}>
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.top}><Image source={require('../../assets/logo.png')} resizeMode="contain" style={styles.logo}/>{selectedBranch && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close store selection" onPress={() => navigation.goBack()} style={{ padding: 12 }}><X size={20} color="#fff"/></TouchableOpacity>}</View>
      <View style={styles.body}><Text style={[styles.eyebrow,{color:c.primaryDark}]}>LET'S GET YOU SORTED</Text><Text style={[styles.title,{color:c.text}]}>Your order.{"\n"}<Text style={{color:c.primaryDark}}>Your way.</Text></Text><Text style={[styles.subtitle,{color:c.textSecondary}]}>Choose how you'd like your Zango fix.</Text>
      <View style={styles.toggle}>{[{value:'Delivery',label:'Delivery',subtitle:'To your doorstep',Icon:Truck},{value:'Pick-Up',label:'Pick-up',subtitle:'Fresh from the store',Icon:Store}].map(({value,label,subtitle,Icon}) => <TouchableOpacity accessibilityRole="button" accessibilityState={{selected:type===value}} disabled={busy} key={value} onPress={() => {setType(value);setSelection('');setError('');setConfirmChange(false);}} style={[styles.option,{borderColor:type===value?c.primary:c.border,backgroundColor:type===value?c.primaryLight:c.card}]}><Icon size={22} color={type===value?c.primaryDark:c.text}/><View style={{flex:1}}><Text style={{fontWeight:'700',fontSize:13,color:c.text}}>{label}</Text><Text style={{fontSize:10,color:c.textSecondary,marginTop:3}}>{subtitle}</Text></View></TouchableOpacity>)}</View>
      {(locationError || !tradeAreas.length) && <View style={styles.message}><Text style={{color:c.primaryDark}}>{locationError || 'No Zango stores are available right now.'}</Text><TouchableOpacity onPress={async()=>{try{await refreshLocations();}catch{}}}><Text style={{color:c.primaryDark,fontWeight:'700',marginTop:10}}>Retry stores</Text></TouchableOpacity></View>}
      {mapboxToken && <TouchableOpacity disabled={busy} onPress={locate} style={styles.locate}><Crosshair size={18} color={c.primaryDark}/><Text style={{color:c.primaryDark,fontWeight:'700',fontSize:12}}>Use my current location</Text></TouchableOpacity>}
      <SelectField label="City" placeholder="Choose your city" value={cityId} options={tradeAreas.map(item=>({value:String(item.id),label:item.name}))} disabled={busy} onChange={value=>{setCityId(value);setSelection('');setError('');setConfirmChange(false);}}/>
      <SelectField label={type==='Delivery'?'Delivery area':'Pick-up store'} placeholder={type==='Delivery'?'Choose your neighbourhood':'Choose a Zango store'} value={selection} options={(type==='Delivery'?areas:stores).map(item=>({value:String(item.id),label:item.name}))} disabled={!cityId||busy} onChange={value=>{setSelection(value);setError('');setConfirmChange(false);}}/>
      {chosenBranch && <View style={[styles.chosen,{backgroundColor:c.surface}]}><MapPin size={18} color={c.primaryDark}/><View style={{flex:1}}><Text style={{fontSize:12,fontWeight:'700',color:c.text}}>{chosenBranch.name}</Text><Text style={{fontSize:11,color:c.textSecondary,marginTop:4}}>{chosenBranch.address}</Text></View></View>}
      {confirmChange && <Text style={[styles.message,{color:c.primaryDark}]}>Switching stores clears your current bag because menus and prices may differ. Press continue to confirm.</Text>}
      {!!error && <Text accessibilityRole="alert" style={[styles.message,{color:c.error}]}>{error}</Text>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Continue to menu" disabled={!chosenBranch||busy} onPress={submit} style={[styles.submit,{backgroundColor:!chosenBranch||busy?c.borderMedium:c.primary}]}>{busy?<ActivityIndicator color={c.text}/>:<><Text style={{fontWeight:'800',color:'#181818',fontSize:14}}>Continue to menu</Text><ArrowRight size={19} color="#181818"/></>}</TouchableOpacity>
      <Text style={[styles.help,{color:c.textSecondary}]}>Your menu and availability are based on your selected store.</Text></View>
    </View>
  </ScrollView></View>;
}
const styles=StyleSheet.create({
 scroll:{flexGrow:1,padding:20,justifyContent:'center',alignItems:'center'},card:{width:'100%',maxWidth:520,borderWidth:1,borderRadius:18,overflow:'hidden'},top:{backgroundColor:'#181818',padding:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},logo:{width:122,height:42,backgroundColor:'#fff',borderRadius:5},body:{padding:24},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:2,marginBottom:14},title:{fontSize:36,fontWeight:'900',letterSpacing:-1.5,lineHeight:39},subtitle:{fontSize:13,lineHeight:20,marginTop:12},toggle:{flexDirection:'row',gap:10,marginVertical:24},option:{flex:1,minHeight:70,flexDirection:'row',alignItems:'center',gap:9,padding:12,borderRadius:10,borderWidth:1},locate:{flexDirection:'row',gap:8,alignItems:'center',marginBottom:20},chosen:{flexDirection:'row',gap:10,padding:14,borderRadius:10,marginBottom:18},submit:{minHeight:50,padding:14,borderRadius:10,flexDirection:'row',gap:12,alignItems:'center',justifyContent:'center'},help:{fontSize:10,lineHeight:16,textAlign:'center',marginTop:16},message:{padding:12,backgroundColor:'#fff0e6',borderRadius:8,marginBottom:16,fontSize:12,lineHeight:18}
});
