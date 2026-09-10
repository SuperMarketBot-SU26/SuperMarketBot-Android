import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Home, Map, MapPin, Maximize2, ShoppingBag, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationService } from '../../services/NavigationService';
import CartGuideMap from './CartGuideMap';

const { width } = Dimensions.get('window');

export default function MapScreenWebViewMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [routePlan, setRoutePlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    async function loadRoute() {
      console.warn('\n======================================================');
      console.warn('🚀 [CHỈ ĐƯỜNG MUA SẮM] BẮT ĐẦU TẢI LỘ TRÌNH');
      console.warn('📌 Params productIds:', params.productIds);
      console.warn('📌 Params startNodeId:', params.startNodeId);
      console.warn('📌 Params routePlan:', params.routePlan);

      // 1. Dùng productIds để tự gọi API
      if (params.productIds) {
        setLoading(true);
        try {
          let ids: any = [];
          if (typeof params.productIds === 'string') {
            try {
              ids = JSON.parse(params.productIds);
            } catch {
              ids = [];
            }
          } else {
            ids = params.productIds;
          }

          const startNodeId = params.startNodeId ? parseInt(String(params.startNodeId), 10) : 7;
          console.warn('🛒 Product IDs đã parse:', ids);
          console.warn(`📍 Start Node ID sử dụng: ${startNodeId} (${startNodeId === 7 ? 'Thu Ngân (Node 7)' : 'Kệ Hàng Scanned QR (Node ' + startNodeId + ')'})`);

          if (Array.isArray(ids) && ids.length > 0) {
            console.warn(`📡 Đang gửi request API: POST /api/Navigation/optimize-shopping-route (ids: ${JSON.stringify(ids)}, startNodeId: ${startNodeId})`);
            const data: any = await NavigationService.optimizeShoppingRoute(ids, startNodeId);
            console.warn('📥 KẾT QUẢ API TRẢ VỀ TỪ BACKEND:', JSON.stringify(data, null, 2));

            if (data) {
              const route = data.optimizedRoute || data.waypoints || data.Waypoints || data.routeNodes || data.RouteNodes || (Array.isArray(data) ? data : []);
              console.warn(`📍 Danh sách Lộ trình (${route.length} Nodes):`);
              route.forEach((node: any, idx: number) => {
                console.warn(`   [Node ${idx + 1}] NodeId: ${node.nodeId || node.NodeId} | Tên: "${node.nodeName || node.NodeName || 'Trạm'}" | X: ${node.xCoord ?? node.x}, Y: ${node.yCoord ?? node.y}`);
              });
              setRoutePlan(route);
            }
          }
        } catch (e: any) {
          console.error('❌ LỖI KHI GỌI API OPTIMIZE ROUTE:', e);
          setErrorMsg(e.message || 'Lỗi tìm lộ trình');
        } finally {
          setLoading(false);
        }
        console.warn('======================================================\n');
        return;
      }

      // 2. Fallback: Dùng routePlan truyền thẳng từ params
      if (params.routePlan) {
        try {
          const parsed = typeof params.routePlan === 'string' ? JSON.parse(params.routePlan) : params.routePlan;
          console.log('📦 Parse routePlan từ params:', parsed);
          if (Array.isArray(parsed)) {
            setRoutePlan(parsed);
          } else if (parsed && Array.isArray(parsed.optimizedRoute)) {
            setRoutePlan(parsed.optimizedRoute);
          } else if (parsed && Array.isArray(parsed.waypoints)) {
            setRoutePlan(parsed.waypoints);
          } else if (parsed && Array.isArray(parsed.routeNodes)) {
            setRoutePlan(parsed.routeNodes);
          } else if (parsed && Array.isArray(parsed.items)) {
            setRoutePlan(parsed.items);
          }
        } catch (e) {
          console.warn('Error parsing routePlan', e);
        }
      }
      console.log('======================================================\n');
    }
    loadRoute();
  }, [params.productIds, params.routePlan]);

  const mapDestinations = routePlan.map((p: any, index: number) => ({
    nodeId: p.nodeId ?? p.NodeId ?? 0,
    xCoord: p.xCoord ?? p.x ?? p.X ?? 0,
    yCoord: p.yCoord ?? p.y ?? p.Y ?? 0,
    nodeName: p.nodeName || p.NodeName || p.locationName || 'Trạm',
    productName: p.productName || p.ProductName || '',
    productNames: p.productName || p.ProductName ? [p.productName || p.ProductName] : [],
    slotCode: p.slotCode || p.SlotCode || '',
    shelfLocation: p.shelfLocation || p.ShelfLocation || '',
    productId: p.productId || p.ProductId || null,
    isDoor: p.nodeName === 'Cửa' || p.NodeName === 'Cửa'
  }));

  const highlightedShelves = mapDestinations.map(d => {
    if (d.nodeId === 7 || (d.nodeName || '').toUpperCase().includes('THU NGÂN') || (d.nodeName || '').toUpperCase().includes('CỬA')) {
      return 'KV7';
    }

    // Chỉ làm sáng các Kệ có sản phẩm cần mua trong giỏ hàng (bỏ qua các trạm đi ngang qua)
    const hasProduct = d.productId || d.productName || (d.productNames && d.productNames.length > 0) || d.slotCode;
    if (!hasProduct) return '';

    const slotMatch = (d.slotCode || '').match(/K(\d+)_/i);
    if (slotMatch) return `KV${slotMatch[1]}`;

    const locMatch = (d.shelfLocation || '').match(/Kệ\s*(\d+)/i) || (d.shelfLocation || '').match(/Slot\s*K(\d+)/i);
    if (locMatch) return `KV${locMatch[1]}`;

    if (d.nodeId && Number(d.nodeId) >= 1 && Number(d.nodeId) <= 6) {
      return `KV${d.nodeId}`;
    }

    if (!d.nodeName) return '';
    const nameMatch = d.nodeName.match(/Kệ\s*(\d+)/i);
    return nameMatch ? `KV${nameMatch[1]}` : d.nodeName;
  }).filter(Boolean);
  const hasRoute = mapDestinations.length > 0;

  // Tự động tạo danh sách các bước Hướng dẫn Lộ trình dạng Text cho Khách hàng
  const SHELF_NAME_MAP: Record<number, string> = {
    1: 'Kệ 1 (Ăn vặt)',
    2: 'Kệ 2 (Giải khát)',
    3: 'Kệ 3 (Tươi sống)',
    4: 'Kệ 4 (Mỳ ăn liền)',
    5: 'Kệ 5 (Đồ gia dụng)',
    6: 'Kệ 6 (Gia vị & Trà)',
    7: 'Quầy Thu Ngân (Lối vào)',
  };

  const getLandmarkDescription = (x: number, y: number, nodeId?: number): string => {
    if (nodeId === 5 || (x >= 1.8 && y >= 1.8)) return 'Kệ 5 (Đồ gia dụng)';
    if (nodeId === 4 || (x <= 1.2 && y >= 1.8)) return 'Kệ 4 (Mỳ ăn liền)';
    if (nodeId === 3 || (x <= 1.2 && y >= 1.0 && y < 1.8)) return 'Kệ 3 (Tươi sống)';
    if (nodeId === 2 || (x <= 1.2 && y < 1.0)) return 'Kệ 2 (Giải khát)';
    if (nodeId === 1 || (x >= 1.8 && y < 1.0)) return 'Kệ 1 (Ăn vặt)';
    if (nodeId === 7 || (x <= 1.0 && y >= 2.0)) return 'Quầy Thu Ngân';
    if (nodeId === 6 || (x >= 1.8 && y >= 1.0 && y < 1.8)) return 'Kệ 6 (Gia vị & Trà)';
    return 'lối đi';
  };

  const AISLE_WAYPOINTS_MAP: Record<string, { x: number; y: number }> = {
    '1': { x: 5.6, y: 3.0 },
    '2': { x: 6.8, y: 3.0 },
    '3': { x: 6.8, y: 6.4 },
    '4': { x: 5.6, y: 6.8 },
    '5': { x: 2.0, y: 6.8 },
    '6': { x: 3.8, y: 4.7 },
    '7': { x: 2.0, y: 3.0 },
    '8': { x: 0.5, y: 3.0 },
  };

  const getAislePoint = (item: any): { x: number; y: number } => {
    const rawNodeId = item?.nodeId ?? item?.NodeId;
    const nodeId = typeof rawNodeId === 'number' ? rawNodeId : (rawNodeId ? parseInt(rawNodeId, 10) : undefined);
    if (nodeId && AISLE_WAYPOINTS_MAP[String(nodeId)]) {
      return AISLE_WAYPOINTS_MAP[String(nodeId)];
    }
    const slotCode = (item?.slotCode || item?.SlotCode || '').toUpperCase();
    const slotMatch = slotCode.match(/K(\d+)_/i);
    if (slotMatch && AISLE_WAYPOINTS_MAP[slotMatch[1]]) {
      return AISLE_WAYPOINTS_MAP[slotMatch[1]];
    }
    const x = Number(item?.xCoord ?? item?.x ?? item?.X ?? 0);
    const y = Number(item?.yCoord ?? item?.y ?? item?.Y ?? 0);
    return { x: x > 4.0 ? 6.8 : 2.0, y: y > 1.5 ? 6.8 : 3.0 };
  };

  // Lọc chỉ lấy các điểm dừng quan trọng (Xuất phát, Kệ chứa sản phẩm, Quầy Thu Ngân kết thúc)
  const keyStops: any[] = [];
  routePlan.forEach((node: any, idx: number) => {
    const rawNodeId = node.nodeId ?? node.NodeId;
    const nodeId = typeof rawNodeId === 'number' ? rawNodeId : (rawNodeId ? parseInt(rawNodeId, 10) : undefined);

    if (idx === 0) {
      keyStops.push({ ...node, isStart: true });
      return;
    }

    if (idx === routePlan.length - 1) {
      keyStops.push({ ...node, isEnd: true });
      return;
    }

    if (nodeId && nodeId >= 1 && nodeId <= 6) {
      const prevStop = keyStops[keyStops.length - 1];
      const prevNodeId = prevStop ? (prevStop.nodeId ?? prevStop.NodeId) : null;
      if (prevNodeId !== nodeId) {
        keyStops.push({ ...node, isShelfStop: true });
      }
    }
  });

  const activeStops = keyStops.length > 0 ? keyStops : routePlan;

  const navSteps = activeStops.map((curr: any, i: number) => {
    const rawNodeId = curr.nodeId ?? curr.NodeId;
    const nodeId = typeof rawNodeId === 'number' ? rawNodeId : (rawNodeId ? parseInt(rawNodeId, 10) : undefined);
    const rawName = curr.nodeName || curr.NodeName || curr.locationName || '';
    const pName = curr.productName || curr.ProductName || (curr.productNames && curr.productNames[0]);

    let locationLabel = '';
    if (nodeId && SHELF_NAME_MAP[nodeId]) {
      locationLabel = SHELF_NAME_MAP[nodeId];
    } else if (rawName && rawName !== 'Trạm' && !rawName.includes(',')) {
      locationLabel = rawName;
    }

    // Bước 1: Điểm Bắt Đầu
    if (i === 0) {
      const startName = locationLabel || (nodeId === 7 || rawName.includes('Thu') ? 'Quầy Thu Ngân (Lối vào)' : (nodeId ? `Kệ ${nodeId}` : 'Vị trí hiện tại'));
      return {
        id: `step-${i + 1}`,
        stepNumber: 1,
        icon: '📍',
        badgeBg: '#10B981',
        title: `Bắt đầu tại ${startName}`,
        instruction: `Xuất phát tại ${startName}.`,
        locationLabel: startName,
      };
    }

    // Bước Cuối: Điểm Kết Thúc
    if (i === activeStops.length - 1) {
      const endName = locationLabel || (nodeId === 7 || rawName.includes('Thu') ? 'Quầy Thu Ngân (Lối vào)' : `Trạm ${nodeId || i + 1}`);
      return {
        id: `step-${i + 1}`,
        stepNumber: i + 1,
        icon: '🏁',
        badgeBg: '#EF4444',
        title: `Đến ${endName}`,
        instruction: `Di chuyển đến ${endName} để thanh toán và hoàn tất đơn hàng.`,
        locationLabel: endName,
      };
    }

    // Các Bước Ghé Kệ lấy hàng
    const shelfTitle = locationLabel || `Kệ ${nodeId}`;
    const isGenericProduct = !pName || pName.startsWith('Product #') || pName.startsWith('Trạm');
    const itemDetail = isGenericProduct ? 'lấy các sản phẩm cần mua' : `lấy "${pName}"`;

    return {
      id: `step-${i + 1}`,
      stepNumber: i + 1,
      icon: '🛒',
      badgeBg: '#3B82F6',
      title: `Ghé ${shelfTitle}`,
      instruction: `Di chuyển đến ${shelfTitle} và ${itemDetail}.`,
      locationLabel: shelfTitle,
    };
  });


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ Siêu thị</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setIsFullScreen(true)}>
          <Maximize2 color="#1F2937" size={20} />
        </TouchableOpacity>
      </View>

      <Modal visible={isFullScreen} animationType="fade" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          <View style={[styles.header, { paddingHorizontal: 16 }]}>
            <TouchableOpacity onPress={() => setIsFullScreen(false)} style={styles.backButton}>
              <Text style={{ fontSize: 24, color: '#1F2937' }}>×</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bản đồ Toàn màn hình</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={{ flex: 1, padding: 0 }}>
            <CartGuideMap
              destinations={mapDestinations}
              currentWaypointIndex={0}
              robotPose={null}
              highlightedShelves={highlightedShelves}
              fullScreen={true}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Map Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {loading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={{ marginTop: 12, color: '#64748B' }}>Đang tính toán lộ trình tối ưu...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.emptyCard}>
            <MapPin size={40} color="#EF4444" style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTextTitle, { color: '#EF4444' }]}>Lỗi lộ trình</Text>
            <Text style={styles.emptyText}>{errorMsg}</Text>
          </View>
        ) : hasRoute ? (
          <>
            <View style={styles.mapCard}>
              <CartGuideMap
                destinations={mapDestinations}
                currentWaypointIndex={0}
                robotPose={null}
                highlightedShelves={highlightedShelves}
              />
              <Text style={styles.mapNote}>
                Sơ đồ chỉ đường thu gọn dựa trên danh sách sản phẩm trong giỏ hàng.
              </Text>
            </View>

            {/* Text Navigation Card */}
            <View style={styles.textNavCard}>
              <View style={styles.textNavHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                  <Text style={styles.textNavTitle}>Hướng dẫn Lộ trình từng bước</Text>
                </View>
                <View style={styles.stepCountBadge}>
                  <Text style={styles.stepCountText}>{navSteps.length} bước</Text>
                </View>
              </View>

              <View style={styles.timelineContainer}>
                {navSteps.map((step: any, idx: number) => {
                  const isLast = idx === navSteps.length - 1;
                  return (
                    <View key={step.id} style={styles.stepRow}>
                      <View style={styles.timelineCol}>
                        <View style={[styles.stepIconCircle, { backgroundColor: step.badgeBg }]}>
                          <Text style={{ fontSize: 14 }}>{step.icon}</Text>
                        </View>
                        {!isLast && <View style={styles.timelineLine} />}
                      </View>

                      <View style={styles.stepContentCol}>
                        <Text style={styles.stepTitleText}>
                          {`Bước ${step.stepNumber}: ${step.title}`}
                        </Text>
                        <Text style={styles.stepInstructionText}>{step.instruction}</Text>

                        {step.locationLabel ? (
                          <View style={styles.tagRow}>
                            <View style={styles.shelfTag}>
                              <Text style={styles.shelfTagText}>{step.locationLabel}</Text>
                            </View>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
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
  },
  textNavCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  textNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  textNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepCountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  stepCountText: {
    color: '#059669',
    fontWeight: '800',
    fontSize: 12,
  },
  timelineContainer: {
    paddingTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineCol: {
    alignItems: 'center',
    width: 36,
    marginRight: 12,
  },
  stepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: -16,
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  stepContentCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepInstructionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  coordTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  coordTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  shelfTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shelfTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
});
