// src/App.jsx
import React from 'react'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import StoreContextProvider from './context/StoreContext'
import { ThemeProvider } from './context/ThemeContext'

import { Navigation } from './navigation'
import * as SplashScreen from 'expo-splash-screen'

// Safely instruct splash screen to prevent auto-hiding on startup
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore failure if splash screen can't be registered */
})

export default function App() {
  const scheme = useColorScheme()        // 'light' or 'dark'
  const isDark = scheme === 'dark'

  const handleNavigationReady = async () => {
    try {
      await SplashScreen.hideAsync()
    } catch (e) {
      console.warn('Splash hide warning:', e)
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          {/* paint only the top notch/status-bar area */}
          <SafeAreaView
            edges={['top']}
            style={{ backgroundColor: '#FF6600' }}
          />

          {/* White status bar icons for orange header */}
          <ExpoStatusBar style="light" translucent />

          <StoreContextProvider>
            <Navigation onReady={handleNavigationReady} />
          </StoreContextProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}


