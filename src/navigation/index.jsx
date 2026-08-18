// src/navigation/index.jsx

import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavDefault,
  DarkTheme as NavDark
} from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { StoreContext } from '../context/StoreContext';

// screens
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import { DealOptions } from './screens/DealOptions';
import { ItemOptions } from './screens/ItemOptions';
import { Cart } from './screens/Cart';
import OrderSuccess from './screens/OrderSuccess';
import { LocationSelection } from './screens/LocationSelection';
import { Checkout } from './screens/Checkout';
import { Login } from './screens/Login';

// User Screens
import { MyProfile } from './screens/MyProfile';
import { MyAddresses } from './screens/MyAddresses';
import { MyOrders } from './screens/MyOrders';
import { MyFavourites } from './screens/MyFavourites';
import { LoyaltyPoints } from './screens/LoyaltyPoints';
import { Wallet } from './screens/Wallet';
import { AccountDeletion } from './screens/AccountDeletion';

// custom components
import { CustomDrawerContent } from '../components/CustomDrawerContent';

// ——— Main Stack Navigator ———
const Stack = createNativeStackNavigator();

export function RootStackNavigator() {
  const { theme } = useContext(ThemeContext);
  const { selectedBranch, loading } = useContext(StoreContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={selectedBranch ? 'HomeTabs' : 'LocationSelection'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LocationSelection" component={LocationSelection} />
      <Stack.Screen name="HomeTabs" component={Updates} />

      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />

      <Stack.Screen
        name="DealOptions"
        component={DealOptions}
        options={{
          headerShown: true,
          title: 'Deal Options',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="ItemOptions"
        component={ItemOptions}
        options={{
          headerShown: true,
          title: 'Item Options',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="Cart"
        component={Cart}
        options={{
          headerShown: true,
          title: 'My Cart',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="Checkout"
        component={Checkout}
        options={{
          headerShown: true,
          title: 'Checkout',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccess}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          headerShown: true,
          title: 'My Profile',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="MyAddresses"
        component={MyAddresses}
        options={{
          headerShown: true,
          title: 'My Addresses',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="MyOrders"
        component={MyOrders}
        options={{
          headerShown: true,
          title: 'My Orders',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="MyFavourites"
        component={MyFavourites}
        options={{
          headerShown: true,
          title: 'My Favourites',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="LoyaltyPoints"
        component={LoyaltyPoints}
        options={{
          headerShown: true,
          title: 'Loyalty Points',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Wallet"
        component={Wallet}
        options={{
          headerShown: true,
          title: 'Wallet Balance',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="AccountDeletion"
        component={AccountDeletion}
        options={{
          headerShown: true,
          title: 'Account Deletion',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />

      <Stack.Screen
        name="NotFound"
        component={NotFound}
        options={{
          title: '404',
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

// ——— Drawer Navigator & App Container ———
const Drawer = createDrawerNavigator();

export function Navigation({ onReady }) {
  const { theme } = useContext(ThemeContext);
  const baseTheme = theme.dark ? NavDark : NavDefault;

  const navTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.notification,
    },
    fonts: theme.fonts || {},
  };

  return (
    <NavigationContainer theme={navTheme} onReady={onReady}>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Root" component={RootStackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
