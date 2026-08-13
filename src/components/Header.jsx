import React, { useRef, useEffect, useState, useContext } from 'react';
import { View, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { StoreContext } from '../context/StoreContext';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function Header() {
  const { banners = [] } = useContext(StoreContext);
  const { theme } = useContext(ThemeContext);
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (banners.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % banners.length;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: next * width, animated: true });
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <View style={styles.headerContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
      >
        {banners.map((banner, idx) => (
          <Image
            key={banner.id ?? idx}
            source={{ uri: banner.image_url }}
            style={[styles.headerImage, { width }]}
          />
        ))}
      </ScrollView>

      {/* Dot Indicators */}
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx && { backgroundColor: theme.colors.primary, width: 18 },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    height: 160,
    resizeMode: 'cover',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
});
