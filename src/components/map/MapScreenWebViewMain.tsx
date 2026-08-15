import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Maximize2, Home, Map, ShoppingBag, User } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { MAP_HTML } from './MapHtml';
import { HARDCODED_MASTER_ROUTE } from './MapScreenMain';

const { width } = Dimensions.get('window');

export default function MapScreenWebViewMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const webViewRef = useRef<any>(null);
  
  // We can pass routePlan from params if available, otherwise use hardcoded master route
  const routePlan = params.routePlan ? JSON.parse(params.routePlan as string) : HARDCODED_MASTER_ROUTE;

  const injectRoute = () => {
    if (webViewRef.current) {
      const jsCode = `
        if (window.setRouteData) {
          window.setRouteData({ waypoints: ${JSON.stringify(routePlan)} });
        }
        true;
      `;
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ Siêu thị</Text>
        <TouchableOpacity style={styles.backButton}>
          <Maximize2 color="#1F2937" size={20} />
        </TouchableOpacity>
      </View>

      {/* Map WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          style={{ flex: 1 }}
          onLoadEnd={() => injectRoute()}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
          <View style={styles.navTabBox}>
            <Home color="#9CA3AF" size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={[styles.navTabBox, styles.navTabBoxActive]}>
            <Map color="white" size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/cart')}>
          <View style={styles.navTabBox}>
            <ShoppingBag color="#9CA3AF" size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
          <View style={styles.navTabBox}>
            <User color="#9CA3AF" size={24} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navTabBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabBoxActive: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
});
