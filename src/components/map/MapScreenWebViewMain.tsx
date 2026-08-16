import * as React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Maximize2, Home, Map, ShoppingBag, User, MapPin } from 'lucide-react-native';
import CartGuideMap from './CartGuideMap';

const { width } = Dimensions.get('window');

export default function MapScreenWebViewMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  // Only use routePlan if it's passed. No fallback to master route.
  let routePlan: any[] = [];
  try {
    if (params.routePlan) {
      routePlan = typeof params.routePlan === 'string' ? JSON.parse(params.routePlan) : params.routePlan;
    }
  } catch (e) {
    console.warn('Error parsing routePlan', e);
  }

  const mapDestinations = routePlan.map((p: any) => ({
    nodeId: p.nodeId || p.id || 0,
    xCoord: p.x || p.xCoord || 0,
    yCoord: p.y || p.yCoord || 0,
    nodeName: p.description || p.nodeName || '',
    productNames: p.productName ? [p.productName] : [],
  }));

  const hasRoute = mapDestinations.length > 0;

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

      {/* Map Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {hasRoute ? (
          <View style={styles.mapCard}>
            <CartGuideMap
              destinations={mapDestinations}
              currentWaypointIndex={0}
              robotPose={null}
            />
            <View style={styles.legendRow}>
              <Text style={styles.legend}>🔵 Điểm cần ghé</Text>
              <Text style={styles.legend}>🟠 Điểm hiện tại</Text>
              <Text style={styles.legend}>🟢 Đã ghé</Text>
            </View>
            <Text style={styles.mapNote}>
              Sơ đồ chỉ đường thu gọn dựa trên danh sách sản phẩm trong giỏ hàng.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <MapPin size={40} color="#9CA3AF" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTextTitle}>Chưa có lộ trình</Text>
            <Text style={styles.emptyText}>
              Vui lòng vào giỏ hàng và chọn "Chỉ đường" để xem lộ trình tối ưu cho các sản phẩm của bạn.
            </Text>
          </View>
        )}
      </ScrollView>

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
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  legend: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: '700' },
  mapNote: { color: '#64748b', fontSize: 11, marginTop: 8, lineHeight: 16 },
  emptyCard: {
    flex: 1,
    minHeight: 300,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTextTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  }
});
