import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StoreContext } from '../context/StoreContext';
import { getDealDetails } from '../services/APIservice';
import Config from '../constants/Config';

export default function DealCarousel({ deals }) {
  const { selectedBranch } = useContext(StoreContext);
  const navigation = useNavigation();
  const focused = useIsFocused();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const slides = deals.filter(deal => deal.image);
  const deal = slides[index % (slides.length || 1)];
  useEffect(() => {
    if (!focused || busy || slides.length < 2) return;
    const timer = setTimeout(() => setIndex(previous => (previous + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [index, focused, busy, slides.length]);
  if (!deal) return null;
  const open = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await getDealDetails(deal.id, Config.COMPANY_ID, selectedBranch.id);
      const detail = response.deal || response.data?.deal;
      if (!detail) throw new Error('Could not load this deal.');
      navigation.navigate('DealOptions', { ...deal, ...detail, price: detail.final_price ?? detail.price, attached_items: detail.lines || [] });
    } catch { setError('Could not open this deal. Tap to retry.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.wrapper}><View style={styles.hero}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View ${deal.name}`} disabled={busy} onPress={open} style={{ flex: 1 }}><Image source={{ uri: deal.image }} style={styles.image}/></TouchableOpacity>
    {slides.length > 1 && <><TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous deal" style={[styles.arrow,{left:12}]} onPress={()=>setIndex(previous=>(previous-1+slides.length)%slides.length)}><ChevronLeft color="#fff" size={21}/></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel="Next deal" style={[styles.arrow,{right:12}]} onPress={()=>setIndex(previous=>(previous+1)%slides.length)}><ChevronRight color="#fff" size={21}/></TouchableOpacity></>}
    <View pointerEvents="none" style={styles.caption}><Text numberOfLines={1} style={styles.name}>{deal.name}</Text><Text style={styles.count}>{index % slides.length + 1} / {slides.length}</Text></View>
    {busy && <View pointerEvents="none" style={styles.loading}><ActivityIndicator color="#ff5c00"/></View>}
  </View>{!!error && <Text style={styles.error}>{error}</Text>}</View>;
}
const styles=StyleSheet.create({wrapper:{marginBottom:24},hero:{width:'100%',aspectRatio:1.65,backgroundColor:'#181818',borderRadius:14,overflow:'hidden'},image:{width:'100%',height:'100%',resizeMode:'cover'},arrow:{position:'absolute',top:'42%',width:36,height:36,backgroundColor:'#181818bb',borderRadius:18,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#ffffff55'},caption:{position:'absolute',bottom:12,left:12,right:12,flexDirection:'row',gap:12,justifyContent:'space-between'},name:{backgroundColor:'#181818dd',color:'#fff',fontSize:10,fontWeight:'800',padding:9,borderRadius:5,maxWidth:'80%'},count:{backgroundColor:'#181818dd',color:'#fff',fontSize:10,fontWeight:'800',padding:9,borderRadius:5},loading:{position:'absolute',inset:0,justifyContent:'center',alignItems:'center',backgroundColor:'#18181844'},error:{fontSize:12,color:'#b42318',marginTop:10}});
