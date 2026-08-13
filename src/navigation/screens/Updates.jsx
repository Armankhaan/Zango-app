// src/screens/Updates.jsx — Main Menu Screen
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import FoodDisplay from '../../components/FoodDisplay';
import NavBar from '../../components/NavBar';
import { ThemeContext } from '../../context/ThemeContext';
import { StoreContext } from '../../context/StoreContext';

export function Updates() {
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { theme } = useContext(ThemeContext);
  const { selectedBranch } = useContext(StoreContext);

  const [category, setCategory] = useState('All');

  useEffect(() => {
    const categoryFromUrl = route.params?.category;
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);
    }
  }, [route.params]);

  // If no branch is selected, go to location selection
  useEffect(() => {
    if (!isFocused) return;
    if (!selectedBranch) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'LocationSelection' }],
      });
    }
  }, [selectedBranch, navigation, isFocused]);

  return (
    <>
      <NavBar />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FoodDisplay category={category} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Updates;
