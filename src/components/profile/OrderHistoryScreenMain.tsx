import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ToastAndroid, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ProfileService } from '../../services/ProfileService';
import { CartService } from '../../services/CartService';
import { useAuth } from '../../context/AuthContext';

export default function OrderHistoryScreenMain() {
  const router = useRouter();
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const handleBuyAgain = async (order: any) => {
    try {
      if (!order.items || order.items.length === 0) {
        ToastAndroid.show('Đơn hàng không có sản phẩm nào', ToastAndroid.SHORT);
        return;
      }
      
      ToastAndroid.show('Đang thêm vào giỏ hàng...', ToastAndroid.SHORT);
      
      for (const item of order.items) {
        await CartService.addItem(item.productId, item.quantity);
      }
      
      ToastAndroid.show('Đã thêm các sản phẩm vào giỏ hàng', ToastAndroid.SHORT);
      router.push('/cart');
    } catch (e: any) {
      ToastAndroid.show(e.message || 'Có lỗi xảy ra', ToastAndroid.SHORT);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number) => {
    return price ? price.toLocaleString('vi-VN') + ' đ' : '0 đ';
  };

  return (
    <LinearGradient
      colors={['#F4FDF8', '#F8FAFC', '#F8FAFC']}
      locations={[0, 0.2, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SmartMarketBot</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Image
                source={{ uri: profile?.avatarUrl || profile?.facePath || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Page Title Section */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.pageTitleSection}>
            <Text style={styles.pageTitle}>Lịch sử đơn hàng</Text>
            <Text style={styles.pageSubtitle}>Theo dõi và quản lý tất cả các đơn hàng đã mua sắm của bạn.</Text>
          </Animated.View>

          {/* Orders Section */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionMarker} />
              <Text style={styles.sectionTitle}>Danh sách đơn hàng ({orders.length})</Text>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyBox}>
                <ShoppingBag color="#9CA3AF" size={56} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
                <Text style={styles.emptySub}>Bạn chưa thực hiện đơn hàng mua sắm nào trong siêu thị.</Text>
              </View>
            ) : (
              orders.map((order, idx) => {
                const isExpanded = expandedId === order.invoiceHistoryId;
                const itemsList: any[] = order.items || [];
                const previewItems = itemsList.slice(0, 4);
                const remainingCount = itemsList.length - previewItems.length;

                return (
                  <Animated.View
                    key={order.invoiceHistoryId}
                    entering={FadeInDown.delay(150 + idx * 80)}
                    style={styles.orderCard}
                  >
                    <TouchableOpacity onPress={() => toggleExpand(order.invoiceHistoryId)} activeOpacity={0.85}>
                      {/* Top Header Row */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.orderIdBadge}>
                          <ShoppingBag color="#059669" size={16} style={{ marginRight: 6 }} />
                          <Text style={styles.orderIdText}>Đơn #{order.invoiceHistoryId}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <CheckCircle2 color="#059669" size={13} style={{ marginRight: 4 }} />
                          <Text style={styles.statusBadgeText}>Hoàn thành</Text>
                        </View>
                      </View>

                      {/* Date Row */}
                      <Text style={styles.orderDateText}>{formatDate(order.purchaseDate)}</Text>

                      {/* Product Preview Thumbnails Strip */}
                      {previewItems.length > 0 && (
                        <View style={styles.thumbnailsStrip}>
                          {previewItems.map((item, pIdx) => (
                            <View key={pIdx} style={styles.thumbWrapper}>
                              <Image
                                source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' }}
                                style={styles.thumbImage}
                              />
                            </View>
                          ))}
                          {remainingCount > 0 && (
                            <View style={styles.remainingThumbBadge}>
                              <Text style={styles.remainingThumbText}>+{remainingCount}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Price & Items Summary Bar */}
                      <View style={styles.cardSummaryBar}>
                        <View>
                          <Text style={styles.summaryLabel}>Tổng thanh toán</Text>
                          <Text style={styles.summaryPrice}>{formatPrice(order.totalPrice)}</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.summaryItemCount}>{itemsList.length} sản phẩm</Text>
                          <View style={styles.chevronBox}>
                            {isExpanded ? (
                              <ChevronUp color="#059669" size={18} />
                            ) : (
                              <ChevronDown color="#6B7280" size={18} />
                            )}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Expanded Detailed Products */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <Text style={styles.detailSectionTitle}>Chi tiết sản phẩm đã mua:</Text>

                        {itemsList.map((item: any, i: number) => (
                          <View key={i} style={styles.detailProductRow}>
                            <Image
                              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' }}
                              style={styles.detailProductImage}
                            />
                            <View style={styles.detailProductInfo}>
                              <Text style={styles.detailProductName} numberOfLines={2}>
                                {item.productName}
                              </Text>
                              <View style={styles.detailPriceRow}>
                                <Text style={styles.detailUnitPrice}>{formatPrice(item.unitPrice)}</Text>
                                <Text style={styles.detailQty}>x{item.quantity}</Text>
                              </View>
                            </View>
                            <Text style={styles.detailItemTotal}>{formatPrice(item.unitPrice * item.quantity)}</Text>
                          </View>
                        ))}

                        {/* Action Buttons */}
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={styles.btnBuyAgain}
                            onPress={() => handleBuyAgain(order)}
                          >
                            <RefreshCw color="white" size={16} style={{ marginRight: 6 }} />
                            <Text style={styles.btnBuyAgainText}>Mua lại đơn này</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Animated.View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  pageTitleSection: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
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
    fontWeight: '800',
    color: '#1E293B',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  /* Order Card Styles */
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  orderDateText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },

  /* Thumbnails Strip */
  thumbnailsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  thumbWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  remainingThumbBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  remainingThumbText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },

  /* Card Summary Bar */
  cardSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  summaryItemCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginRight: 8,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Expanded Section */
  expandedContent: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  detailProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 14,
  },
  detailProductImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailProductInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  detailProductName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  detailPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailUnitPrice: {
    fontSize: 12,
    color: '#64748B',
  },
  detailQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  detailItemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Action Buttons */
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },

  btnBuyAgain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#059669',
    elevation: 2,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  btnBuyAgainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

