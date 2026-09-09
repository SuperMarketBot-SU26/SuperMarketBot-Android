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

  const navSteps = routePlan.map((curr: any, i: number) => {
    const rawNodeId = curr.nodeId ?? curr.NodeId;
    const nodeId = typeof rawNodeId === 'number' ? rawNodeId : (rawNodeId ? parseInt(rawNodeId, 10) : undefined);
    const x = Number(curr.xCoord ?? curr.x ?? curr.X ?? 0);
    const y = Number(curr.yCoord ?? curr.y ?? curr.Y ?? 0);
    const rawName = curr.nodeName || curr.NodeName || curr.locationName || '';
    const pName = curr.productName || curr.ProductName || (curr.productNames && curr.productNames[0]);

    let locationLabel = '';
    if (nodeId && SHELF_NAME_MAP[nodeId]) {
      locationLabel = SHELF_NAME_MAP[nodeId];
    } else if (rawName && rawName !== 'Trạm' && !rawName.includes(',')) {
      locationLabel = rawName;
    }

    if (i === 0) {
      const startName = locationLabel || (nodeId ? `Kệ ${nodeId}` : 'Vị trí hiện tại');
      return {
        id: `step-${i}`,
        stepNumber: 1,
        icon: '📍',
        badgeBg: '#10B981',
        title: `Bắt đầu tại ${startName}`,
        instruction: `Xuất phát tại ${startName}.`,
        locationLabel: startName,
      };
    }

    if (i === routePlan.length - 1) {
      const endName = locationLabel || (nodeId === 7 || rawName.includes('Thu') ? 'Quầy Thu Ngân' : `Trạm ${nodeId || i + 1}`);
      return {
        id: `step-${i}`,
        stepNumber: i + 1,
        icon: '🏁',
        badgeBg: '#EF4444',
        title: `Đến ${endName}`,
        instruction: `Đi thẳng đến ${endName} để thanh toán và hoàn tất đơn hàng.`,
        locationLabel: endName,
      };
    }

    // Intermediate step
    const prev = routePlan[i - 1];
    const prevX = Number(prev.xCoord ?? prev.x ?? prev.X ?? 0);
    const prevY = Number(prev.yCoord ?? prev.y ?? prev.Y ?? 0);
    const dx1 = x - prevX;
    const dy1 = y - prevY;

    if (nodeId && nodeId >= 1 && nodeId <= 6) {
      const shelfTitle = locationLabel || `Kệ ${nodeId}`;
      const isGenericProduct = !pName || pName.startsWith('Product #') || pName.startsWith('Trạm');
      const itemDetail = isGenericProduct ? ' lấy sản phẩm cần mua' : ` lấy "${pName}"`;
      return {
        id: `step-${i}`,
        stepNumber: i + 1,
        icon: '🛒',
        badgeBg: '#3B82F6',
        title: `Ghé ${shelfTitle}`,
        instruction: `Đến ${shelfTitle}${itemDetail}.`,
        locationLabel: shelfTitle,
      };
    }

    // Corner / turn waypoint (undefined nodeId)
    const next = routePlan[i + 1] || curr;
    const nextX = Number(next.xCoord ?? next.x ?? next.X ?? x);
    const nextY = Number(next.yCoord ?? next.y ?? next.Y ?? y);
    const dx2 = nextX - x;
    const dy2 = nextY - y;

    // Find next target shelf name
    let nextTargetLabel = '';
    for (let j = i + 1; j < routePlan.length; j++) {
      const targetNode = routePlan[j];
      const targetRawId = targetNode.nodeId ?? targetNode.NodeId;
      const targetId = typeof targetRawId === 'number' ? targetRawId : (targetRawId ? parseInt(targetRawId, 10) : undefined);
      if (targetId && SHELF_NAME_MAP[targetId]) {
        nextTargetLabel = SHELF_NAME_MAP[targetId];
        break;
      }
    }
    if (!nextTargetLabel) nextTargetLabel = 'lối đi';

    let turnDirection = 'Đi thẳng';
    let turnIcon = '⬇️';

    // Calculate 2D cross product for turn orientation relative to map layout
    const cp = dx1 * dy2 - dy1 * dx2;

    // Moving up main corridor (dy1 > 0) towards top aisle and turning right (dx2 > 0) is a LEFT turn on map layout
    if (dy1 > 0.05 && dx2 > 0.05) {
      turnDirection = 'Rẽ trái';
      turnIcon = '⬅️';
    } else if (dy1 < -0.05 && dx2 > 0.05) {
      turnDirection = 'Rẽ phải';
      turnIcon = '➡️';
    } else if (cp > 0.05) {
      turnDirection = 'Rẽ trái';
      turnIcon = '⬅️';
    } else if (cp < -0.05) {
      turnDirection = 'Rẽ phải';
      turnIcon = '➡️';
    }

    const isHeadingToCheckout = nextTargetLabel.includes('Thu Ngân') || (i === routePlan.length - 2);
    if (isHeadingToCheckout) {
      turnIcon = '↩️';
      turnDirection = 'Quay lại';
    }

    // Find intermediate landmark shelf passed along the segment
    let passedShelf = '';
    const prevNodeId = routePlan[i - 1]?.nodeId ?? routePlan[i - 1]?.NodeId;
    if (prevNodeId === 5) {
      passedShelf = 'Kệ 4 (Mỳ ăn liền)';
    } else if (isHeadingToCheckout || nextTargetLabel.includes('Thu Ngân')) {
      passedShelf = 'Kệ 6 (Gia vị & Trà)';
    }

    let titleText = passedShelf
      ? `Đi thẳng qua ${passedShelf.split(' ')[0]} ${passedShelf.split(' ')[1]} & ${turnDirection} sang ${nextTargetLabel}`
      : `${turnDirection} & Đi thẳng sang ${nextTargetLabel}`;
    let detailText = passedShelf
      ? `Đi thẳng qua ${passedShelf} đến ngã rẽ, ${turnDirection.toLowerCase()} rồi đi thẳng tiếp đến ${nextTargetLabel}`
      : `Tại ngã rẽ, ${turnDirection.toLowerCase()} rồi đi thẳng tiếp đến ${nextTargetLabel}`;

    if (isHeadingToCheckout) {
      const checkoutShelf = passedShelf || 'Kệ 6 (Gia vị & Trà)';
      titleText = `Quay lại đi thẳng qua ${checkoutShelf.split(' ')[0]} ${checkoutShelf.split(' ')[1]} về ${nextTargetLabel}`;
      detailText = `Quay lại và đi thẳng qua ${checkoutShelf} về ${nextTargetLabel}`;
    }

    return {
      id: `step-${i}`,
      stepNumber: i + 1,
      icon: turnIcon,
      badgeBg: '#8B5CF6',
      title: titleText,
      instruction: `${detailText}.`,
      locationLabel: `Ngã rẽ → ${nextTargetLabel}`,
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
