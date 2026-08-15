import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, ChevronUp, Bell, HelpCircle, ShoppingBag, Truck, Package, CheckCircle2, RefreshCw, Sparkles, X, Map as MapIcon } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { ProfileService } from '../../services/ProfileService';
import { MAP_HTML } from '../map/MapHtml';

// Dummy data for filter tabs
const FILTERS = ['Tất cả', 'Tháng này', 'Đã giao', 'Đang xử lý'];

export default function OrderHistoryScreenMain() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ProfileService.getOrderHistory();
        setOrders(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const openMap = (order: any) => {
    // Ideally we would fetch the route for this specific order
    // But for now, we mock the data as requested by the user.
    const mockRoute = {
      path: [
        { x: 2.80, y: 2.00, nodeName: "D01" },
        { x: 2.45, y: 2.00, nodeName: "C03" },
        { x: 2.45, y: 0.80, nodeName: "S04", productId: order.items?.[0]?.productId || 1 },
        { x: 2.10, y: 2.45, nodeName: "Checkout" }
      ]
    };
    
    router.push({
      pathname: '/map' as any,
      params: {
        routePlan: JSON.stringify(mockRoute.path)
      }
    });
  };

  return (
    <LinearGradient
      colors={['#F4FDF8', '#F8FAFC', '#F8FAFC']}
      locations={[0, 0.2, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft color="#4B5563" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SmartMarketBot</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Image
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.delay(100)} style={styles.pageTitleSection}>
            <Text style={styles.pageTitle}>Lịch sử đơn hàng</Text>
            <Text style={styles.pageSubtitle}>Theo dõi và quản lý tất cả các đơn hàng tươi ngon của bạn.</Text>
          </Animated.View>

          {/* Filters */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Filter Section logic - we can keep it but actually apply to real data */}
          {/* Active Filter logic could be applied here if needed. We'll show all. */}

          <Animated.View entering={FadeInDown.delay(300)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionMarker} />
              <Text style={styles.sectionTitle}>Danh sách đơn hàng</Text>
            </View>

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Đang tải...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Chưa có đơn hàng nào</Text>
              </View>
            ) : (
              orders.map((order, idx) => {
                const isExpanded = expandedId === order.invoiceHistoryId;
                return (
                  <View key={order.invoiceHistoryId} style={styles.orderCard}>
                    <TouchableOpacity onPress={() => toggleExpand(order.invoiceHistoryId)} activeOpacity={0.8}>
                      <View style={styles.orderHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                          <ShoppingBag color="#059669" size={24} />
                        </View>
                        <View style={styles.orderHeaderInfo}>
                          <Text style={styles.orderId}>Đơn hàng #{order.invoiceHistoryId}</Text>
                          <Text style={styles.orderDate}>{new Date(order.purchaseDate).toLocaleString('vi-VN')}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                            <CheckCircle2 color="#16A34A" size={14} />
                            <Text style={[styles.statusText, { color: '#16A34A' }]}>Hoàn thành</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.orderDetails}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View>
                            <Text style={[styles.orderPrice, { color: '#059669' }]}>{order.totalPrice.toLocaleString('vi-VN')}đ</Text>
                            <Text style={styles.itemCount}>{order.items?.length || 0} sản phẩm</Text>
                          </View>
                          {isExpanded ? <ChevronUp color="#9CA3AF" size={20} /> : <ChevronDown color="#9CA3AF" size={20} />}
                        </View>
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
                        {order.items?.map((item: any, i: number) => (
                          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                            <Image 
                              source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} 
                              style={styles.productThumbnail} 
                            />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }} numberOfLines={2}>
                                {item.productName}
                              </Text>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 13, color: '#6B7280' }}>{item.unitPrice.toLocaleString('vi-VN')}đ</Text>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937' }}>x{item.quantity}</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                        
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={[styles.btnOutline, { flex: 1 }]}
                            onPress={() => openMap(order)}
                          >
                            <MapIcon color="#059669" size={16} style={{ marginRight: 6 }} />
                            <Text style={styles.btnOutlineText}>Xem lộ trình</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnSolid, { flex: 1, marginLeft: 12 }]}>
                            <RefreshCw color="white" size={16} style={{ marginRight: 6 }} />
                            <Text style={styles.btnSolidText}>Mua lại</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Animated.View>

        </ScrollView>


      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#65A30D',
    zIndex: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnRight: {
    padding: 8,
    marginRight: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 16,
  },
  pageTitleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    paddingRight: 20,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersScroll: {
    flexDirection: 'row',
    gap: 12,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#00702A',
    borderColor: '#00702A',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: 'white',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionMarker: {
    width: 4,
    height: 18,
    backgroundColor: '#059669',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  orderHeaderInfo: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderDetails: {
    marginBottom: 16,
  },
  orderPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  productImages: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  productThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  moreProductsBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreProductsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnOutline: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  btnSolid: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#00702A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSolidText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  }
});
