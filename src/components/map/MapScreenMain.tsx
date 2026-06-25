import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Home, Bot, MapPin, Star, Compass, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Waypoint {
  x: number;
  y: number;
  name: string;
}

export default function MapScreenMain() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [routePoints, setRoutePoints] = useState<Waypoint[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  
  const gridWidth = 10;
  const gridHeight = 10;
  const canvasSize = 320;
  
  const scaleX = (x: number) => (x / gridWidth) * canvasSize;
  const scaleY = (y: number) => (y / gridHeight) * canvasSize;

  // Animated Robot Position
  const robotPos = useRef(new Animated.ValueXY({ x: scaleX(1), y: scaleY(9) })).current;

  useEffect(() => {
    // 1. Phân tích Route Plan từ params
    let waypoints: Waypoint[] = [];
    if (params.routePlan) {
      try {
        const parsed = JSON.parse(params.routePlan as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          waypoints = parsed;
        }
      } catch (e) {
        console.warn('Error parsing routePlan parameter:', e);
      }
    }

    // 2. Phân tích Hóa đơn từ params
    if (params.invoice) {
      try {
        setInvoiceData(JSON.parse(params.invoice as string));
      } catch (e) {
        console.warn('Error parsing invoice parameter:', e);
      }
    }

    // 3. Fallback Route Plan nếu trống
    if (waypoints.length === 0) {
      waypoints = [
        { x: 1, y: 9, name: "Cổng vào" },
        { x: 2, y: 3, name: "Kệ Rau Củ" },
        { x: 5, y: 2, name: "Kệ Thịt/Cá" },
        { x: 8, y: 6, name: "Kệ Sữa/Bơ" },
        { x: 9, y: 9, name: "Quầy Thu Ngân" }
      ];
    }
    setRoutePoints(waypoints);
    
    // Khởi chạy hoạt ảnh Robot di chuyển
    startRobotAnimation(waypoints);
  }, [params.routePlan, params.invoice]);

  const startRobotAnimation = (points: Waypoint[]) => {
    if (points.length < 2) return;
    
    // Đưa robot về vị trí đầu tiên
    robotPos.setValue({ x: scaleX(points[0].x), y: scaleY(points[0].y) });
    
    const animations = points.slice(1).map((pt) => {
      const targetX = scaleX(pt.x);
      const targetY = scaleY(pt.y);
      return Animated.timing(robotPos, {
        toValue: { x: targetX, y: targetY },
        duration: 2500, // 2.5s mỗi chặng
        useNativeDriver: false
      });
    });

    // Lặp lại hoạt ảnh di chuyển
    Animated.loop(
      Animated.sequence(animations)
    ).start();
  };

  const renderPathLines = () => {
    const lines = [];
    const points = routePoints;
    for (let i = 0; i < points.length - 1; i++) {
      const pt1 = points[i];
      const pt2 = points[i + 1];
      
      const x1 = scaleX(pt1.x);
      const y1 = scaleY(pt1.y);
      const x2 = scaleX(pt2.x);
      const y2 = scaleY(pt2.y);
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Tính tâm để xoay chính xác trên tất cả phiên bản React Native
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      
      lines.push(
        <View
          key={`line-${i}`}
          style={[
            styles.pathLine,
            {
              width: distance,
              left: cx - distance / 2,
              top: cy - 2, // 2 là một nửa độ dày
              transform: [
                { rotate: `${angle}deg` }
              ],
            }
          ]}
        />
      );
    }
    return lines;
  };

  // Định dạng hiển thị tiền VNĐ
  const formatPrice = (price: number) => {
    return price ? price.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ';
  };

  const earnedPoints = invoiceData?.totalPrice ? Math.floor(invoiceData.totalPrice * 0.1) : 245;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>CHỈ ĐƯỜNG SIÊU THỊ</Text>
          <Text style={styles.headerTitle}>Lộ trình của Robot</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Visualization */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Compass color="#059669" size={18} />
            <Text style={styles.mapHeaderText}>Sơ đồ kệ hàng trong siêu thị</Text>
          </View>
          
          <View style={styles.mapWrapper}>
            {/* Grid background */}
            <View style={styles.mapGrid}>
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={`grid-v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 10}%` }]} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={`grid-h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 10}%` }]} />
              ))}
              
              {/* Vẽ các Kệ Siêu Thị */}
              <View style={[styles.shelfBlock, { left: scaleX(2), top: scaleY(2), width: 60, height: 40 }]}>
                <Text style={styles.shelfBlockText}>Rau Củ</Text>
              </View>
              <View style={[styles.shelfBlock, { left: scaleX(5), top: scaleY(1), width: 60, height: 40 }]}>
                <Text style={styles.shelfBlockText}>Thịt/Cá</Text>
              </View>
              <View style={[styles.shelfBlock, { left: scaleX(7.5), top: scaleY(4), width: 60, height: 40 }]}>
                <Text style={styles.shelfBlockText}>Sữa/Bơ</Text>
              </View>
              <View style={[styles.shelfBlock, { left: scaleX(2.5), top: scaleY(6), width: 80, height: 40 }]}>
                <Text style={styles.shelfBlockText}>Đồ Khô</Text>
              </View>

              {/* Vẽ Đường đi Lộ Trình */}
              {renderPathLines()}

              {/* Điểm Waypoints */}
              {routePoints.map((pt, idx) => (
                <View
                  key={`pt-${idx}`}
                  style={[
                    styles.waypointNode,
                    {
                      left: scaleX(pt.x) - 10,
                      top: scaleY(pt.y) - 10,
                      backgroundColor: idx === 0 ? '#3B82F6' : idx === routePoints.length - 1 ? '#EF4444' : '#059669'
                    }
                  ]}
                >
                  <Text style={styles.waypointNodeText}>{idx + 1}</Text>
                  
                  {/* Nhãn nhỏ mô tả tên vị trí */}
                  <View style={styles.waypointLabelBox}>
                    <Text style={styles.waypointLabelText} numberOfLines={1}>{pt.name}</Text>
                  </View>
                </View>
              ))}

              {/* Robot Đang di chuyển (Animated Marker) */}
              <Animated.View
                style={[
                  styles.robotMarker,
                  {
                    left: Animated.subtract(robotPos.x, 15),
                    top: Animated.subtract(robotPos.y, 15),
                  }
                ]}
              >
                <View style={styles.robotMarkerCore}>
                  <Bot color="white" size={18} />
                </View>
              </Animated.View>
            </View>
          </View>

          <View style={styles.statusLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Bắt đầu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
              <Text style={styles.legendText}>Kệ hàng</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Thu ngân</Text>
            </View>
          </View>
        </View>

        {/* Invoice & Points Info */}
        <View style={styles.infoCard}>
          <View style={styles.pointsEarnedContainer}>
            <View style={styles.pointsIconContainer}>
              <Star color="#EA580C" size={24} fill="#EA580C" />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>Điểm thưởng tích lũy (+10%)</Text>
              <Text style={styles.pointsValue}>+{earnedPoints} Điểm</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.successBanner}>
            <CheckCircle2 color="#059669" size={22} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.successTitle}>Đặt mua & Tạo lộ trình thành công!</Text>
              <Text style={styles.successDesc}>
                Robot đã nhận lệnh và bắt đầu di chuyển dẫn đường cho bạn trong siêu thị.
              </Text>
            </View>
          </View>

          {invoiceData?.totalPrice && (
            <View style={styles.invoiceSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Hóa đơn:</Text>
                <Text style={styles.summaryValueText}>#{invoiceData.invoiceId || 'SM-8293'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tổng giá trị thanh toán:</Text>
                <Text style={styles.summaryPriceText}>{formatPrice(invoiceData.totalPrice)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.btnHome} onPress={() => router.replace('/home')}>
          <Home color="white" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnHomeText}>Về trang chủ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  mapWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 10,
    width: '100%',
  },
  mapGrid: {
    width: 320,
    height: 320,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  shelfBlock: {
    position: 'absolute',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shelfBlockText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  pathLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#059669',
    borderRadius: 2,
    opacity: 0.6,
  },
  waypointNode: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  waypointNodeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  waypointLabelBox: {
    position: 'absolute',
    top: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'center',
    width: 80,
    alignItems: 'center',
  },
  waypointLabelText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '600',
  },
  robotMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    zIndex: 20,
  },
  robotMarkerCore: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'white',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  statusLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 24,
  },
  pointsEarnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  successBanner: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  successDesc: {
    fontSize: 12,
    color: '#047857',
    marginTop: 4,
    lineHeight: 18,
  },
  invoiceSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryValueText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  summaryPriceText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '800',
  },
  btnHome: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnHomeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
