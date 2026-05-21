import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, HelpCircle, ShoppingBag, Truck, Package, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Dummy data for filter tabs
const FILTERS = ['Tất cả', 'Tháng này', 'Đã giao', 'Đang xử lý'];

export default function OrderHistoryScreenMain() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('Tất cả');

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
          {/* <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtnRight}>
              <Bell color="#4B5563" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Image
                source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View> */}
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

          {/* This Month Section */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionMarker} />
              <Text style={styles.sectionTitle}>Tháng này</Text>
            </View>

            {/* Order Card 1 */}
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
                  <ShoppingBag color="#059669" size={24} />
                </View>
                <View style={styles.orderHeaderInfo}>
                  <Text style={styles.orderId}>Đơn hàng #FA-92834</Text>
                  <Text style={styles.orderDate}>15 Tháng 10, 2023 • 14:30</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                    <CheckCircle2 color="#16A34A" size={14} />
                    <Text style={[styles.statusText, { color: '#16A34A' }]}>Đã giao</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View>
                  <Text style={[styles.orderPrice, { color: '#059669' }]}>450.000đ</Text>
                  <Text style={styles.itemCount}>6 sản phẩm</Text>
                </View>
              </View>

              <View style={styles.productImages}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=100' }} style={styles.productThumbnail} />
                <Image source={{ uri: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=100' }} style={styles.productThumbnail} />
                <Image source={{ uri: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=100' }} style={styles.productThumbnail} />
                <View style={styles.moreProductsBadge}>
                  <Text style={styles.moreProductsText}>+3</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]}>
                  <Text style={styles.btnOutlineText}>Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSolid, { flex: 1, marginLeft: 12 }]}>
                  <RefreshCw color="white" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.btnSolidText}>Mua lại</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Card 2 */}
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Truck color="#EA580C" size={24} />
                </View>
                <View style={styles.orderHeaderInfo}>
                  <Text style={styles.orderId}>Đơn hàng #FA-92841</Text>
                  <Text style={styles.orderDate}>Hôm nay • 09:15</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#FFEDD5' }]}>
                    <RefreshCw color="#EA580C" size={14} />
                    <Text style={[styles.statusText, { color: '#EA580C' }]}>Đang xử lý</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View>
                  <Text style={styles.orderPrice}>1.250.000đ</Text>
                  <Text style={styles.itemCount}>12 sản phẩm</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]}>
                  <Text style={styles.btnOutlineText}>Xem lộ trình</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Last Month Section */}
          <Animated.View entering={FadeInDown.delay(400)} style={{ marginTop: 16 }}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionMarker, { backgroundColor: '#9CA3AF' }]} />
              <Text style={styles.sectionTitle}>Tháng trước</Text>
            </View>

            {/* Order Card 3 */}
            <View style={[styles.orderCard, { opacity: 0.7 }]}>
              <View style={styles.orderHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                  <Package color="#9CA3AF" size={24} />
                </View>
                <View style={styles.orderHeaderInfo}>
                  <Text style={styles.orderId}>Đơn hàng #FA-91022</Text>
                  <Text style={styles.orderDate}>28 Tháng 9, 2023 • 18:45</Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                    <Text style={[styles.statusText, { color: '#6B7280', marginLeft: 0 }]}>Đã hoàn thành</Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View>
                  <Text style={[styles.orderPrice, { color: '#6B7280' }]}>320.000đ</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btnOutline, { flex: 1, borderColor: '#F3F4F6', backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.btnOutlineText, { color: '#9CA3AF' }]}>Xem chi tiết</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSolid, { flex: 1, marginLeft: 12, backgroundColor: '#DCFCE7' }]}>
                  <RefreshCw color="#16A34A" size={16} style={{ marginRight: 6 }} />
                  <Text style={[styles.btnSolidText, { color: '#16A34A' }]}>Mua lại</Text>
                </TouchableOpacity>
              </View>
            </View>
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
