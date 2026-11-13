import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Menu, MapPin, ShoppingBag, ChevronDown } from 'lucide-react-native';
import { StoreContext } from '../context/StoreContext';

export default function NavBar() {
 const navigation=useNavigation();
 const {selectedBranch,orderDetails,cartItems}=useContext(StoreContext);
 const count=Object.values(cartItems).reduce((sum,item)=>sum+item.quantity,0);
 return <View style={styles.header}><View style={styles.row}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Open menu" onPress={()=>navigation.openDrawer()} style={styles.icon}><Menu size={24} color="#fff"/></TouchableOpacity><Image source={require('../assets/logo.png')} resizeMode="contain" style={styles.logo}/><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open bag, ${count} items`} onPress={()=>navigation.navigate('Cart')} style={styles.icon}><ShoppingBag size={23} color="#fff"/>{count>0&&<View style={styles.badge}><Text style={styles.count}>{count}</Text></View>}</TouchableOpacity></View><TouchableOpacity style={styles.location} onPress={()=>navigation.navigate('LocationSelection')}><MapPin size={15} color="#ff8a46"/><Text style={styles.locationLabel}>{orderDetails?.orderType==='Pick-Up'?'PICKING UP FROM':'DELIVERING TO'}</Text><Text numberOfLines={1} style={styles.branch}>{selectedBranch?.name || 'Choose a store'}</Text><ChevronDown size={14} color="#fff"/></TouchableOpacity></View>;
}
const styles=StyleSheet.create({header:{backgroundColor:'#181818',paddingHorizontal:20,paddingTop:8,paddingBottom:16},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14},icon:{width:40,height:40,alignItems:'center',justifyContent:'center'},logo:{width:122,height:42,backgroundColor:'#fff',borderRadius:6},location:{flexDirection:'row',alignItems:'center',gap:8,paddingTop:12,borderTopWidth:1,borderTopColor:'#383838'},locationLabel:{fontSize:8,fontWeight:'800',letterSpacing:1,color:'#bbb'},branch:{flex:1,fontSize:11,fontWeight:'700',color:'#fff'},badge:{position:'absolute',top:0,right:0,backgroundColor:'#ff5c00',borderRadius:5,minWidth:19,height:19,alignItems:'center',justifyContent:'center'},count:{fontSize:10,fontWeight:'800',color:'#181818'}});
