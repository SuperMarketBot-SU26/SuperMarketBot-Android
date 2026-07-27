import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Text } from 'react-native';
import WebView from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Maximize2, Minimize2 } from 'lucide-react-native';
import { MAP_HTML } from './mapHtml';

import { HARDCODED_MASTER_ROUTE } from './MapScreenMain';

export default function Map3DScreen() { 
  const webViewRef = useRef<any>(null);
  const { routeData } = useLocalSearchParams();
  const router = useRouter();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleBack = () => {
    router.back();
    return true;
  };

  const sendRouteToWebView = () => {
    try {
      const parsedData = { waypoints: HARDCODED_MASTER_ROUTE };
      const jsCode = `
        if (window.setRouteData) {
          window.setRouteData(${JSON.stringify(parsedData)});
        } else if (window.visualize3DRoute) {
          window.visualize3DRoute(${JSON.stringify(parsedData)});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(jsCode);
    } catch (e) {
      console.error('Error sending route to webview:', e);
    }
  };

  useEffect(() => {
    if (isLoaded && routeData) {
      sendRouteToWebView();
    }
  }, [isLoaded, routeData]);

  return ( 
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0F17" />
      
      {!isFullScreen && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <ChevronLeft color="white" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bản Đồ Siêu Thị 3D</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsFullScreen(true)}>
            <Maximize2 color="white" size={20} />
          </TouchableOpacity>
        </View>
      )}

      {isFullScreen && (
        <TouchableOpacity style={styles.floatingExitBtn} onPress={() => setIsFullScreen(false)}>
          <Minimize2 color="white" size={24} />
        </TouchableOpacity>
      )}

      <View style={styles.mapContainer}>
        <WebView 
          ref={webViewRef} 
          originWhitelist={['*']}
          source={{ html: MAP_HTML, baseUrl: 'http://localhost:5000' }}
          style={styles.webView} 
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          onLoadEnd={() => {
            setIsLoaded(true);
            if (routeData) {
              setTimeout(sendRouteToWebView, 500);
            }
          }}
        /> 
      </View>
    </SafeAreaView>
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#0B0F17' }, 
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#0B0F17',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 20
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800'
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  floatingExitBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 100,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mapContainer: { flex: 1 },
  webView: { flex: 1, backgroundColor: '#0B0F17' } 
});
