import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, Camera, CheckCircle2, Home, Map, Mic, Navigation, Plus, Search, ShoppingBag, Star, User, Wallet, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Data Mocks
const PRODUCTS = [
  { id: '1', title: 'Sữa Tươi Organic', subtitle: '98% Độ tươi mới', price: '54,000 đ', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop', aiRecommend: true },
  { id: '2', title: 'Cá Hồi Tươi Nauy', subtitle: 'Vừa nhập kho lúc 5am', price: '125,000 đ', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop', aiRecommend: true },
  { id: '3', title: 'Bơ Sáp 034', subtitle: 'Đang có deal hời', price: '45,000 đ', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=400&auto=format&fit=crop', aiRecommend: true },
];

const getTierTheme = (tier: string) => {
  switch (tier) {
    case 'PLATINUM':
      return {
        gradient: ['#93C5FD', '#3B82F6'] as const, // Bạch kim (Blue) đậm hơn
        border: '#BFDBFE',
        iconBg: '#DBEAFE',
        iconColor: '#1D4ED8',
        badgeText: 'PLATINUM',
        badgeBg: '#3B82F6'
      };
    case 'GOLD':
      return {
        gradient: ['#FEFCE8', '#FEF08A'] as const, // Vàng (Gold)
        border: '#FDE047',
        iconBg: '#FEF08A',
        iconColor: '#A16207',
        badgeText: 'GOLD',
        badgeBg: '#EAB308'
      };
    case 'SILVER':
      return {
        gradient: ['#F8FAFC', '#E2E8F0'] as const, // Bạc (Silver)
        border: '#CBD5E1',
        iconBg: '#E2E8F0',
        iconColor: '#334155',
        badgeText: 'SILVER',
        badgeBg: '#64748B'
      };
    case 'BRONZE':
      return {
        gradient: ['#FFF7ED', '#FED7AA'] as const, // Đồng (Bronze)
        border: '#FDBA74',
        iconBg: '#FFEDD5',
        iconColor: '#9A3412',
        badgeText: 'BRONZE',
        badgeBg: '#C2410C'
      };
    default:
      return {
        gradient: ['#F3F4F6', '#E5E7EB'] as const, // Mặc định
        border: '#D1D5DB',
        iconBg: '#E5E7EB',
        iconColor: '#4B5563',
        badgeText: 'MEMBER',
        badgeBg: '#6B7280'
      };
  }
};

export default function HomeScreenMain() {
  const [searchMode, setSearchMode] = useState<'personal' | 'all'>('personal');
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  const userTier = 'PLATINUM'; // Các hạng: BRONZE, SILVER, GOLD, PLATINUM
  const tierTheme = getTierTheme(userTier);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/profile')}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }} style={styles.avatar} />
              <View style={[styles.badge, { backgroundColor: tierTheme.badgeBg }]}>
                <Text style={styles.badgeText}>{tierTheme.badgeText}</Text>
              </View>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Chào Duy!</Text>
              <Text style={styles.subGreetingText}>Thứ 3 vui vẻ 🥗</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
              <Bell color="#4B5563" size={22} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <User color="#4B5563" size={22} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Summary Cards */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FFEDD5' }]}>
              <Star color="#EA580C" size={20} fill="#EA580C" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Điểm tích lũy</Text>
              <Text style={styles.summaryValue}>2,450</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Wallet color="#16A34A" size={20} />
            </View>
            <View>
              <Text style={styles.summaryLabel}>Tiết kiệm tháng</Text>
              <Text style={styles.summaryValue}>450k đ</Text>
            </View>
          </View>
        </Animated.View>

        {/* Search Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.searchSection}>
          <View style={styles.searchToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, searchMode === 'personal' && styles.toggleBtnActive]}
              onPress={() => setSearchMode('personal')}
              activeOpacity={0.8}
            >
              {searchMode === 'personal' && <CheckCircle2 color="white" size={16} style={{ marginRight: 6 }} />}
              <Text style={[styles.toggleBtnText, searchMode === 'personal' && styles.toggleBtnTextActive]}>Tìm cá nhân hóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, searchMode === 'all' && styles.toggleBtnActive]}
              onPress={() => setSearchMode('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, searchMode === 'all' && styles.toggleBtnTextActive]}>Tìm tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
            <TextInput
              placeholder="Bạn đang tìm gì?"
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.actionIcon}>
              <Mic color="#059669" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <Camera color="#059669" size={20} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Smart Utilities */}
        <Animated.View entering={FadeInRight.delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiện ích thông minh</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* Card 1 */}
            <View style={styles.smartCard}>
              <View style={styles.smartCardImageWrapper}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop' }} style={styles.smartCardImage} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.smartCardOverlay}>
                  <View style={styles.smartBadge}>
                    <Text style={styles.smartBadgeText} numberOfLines={1}>Lập kế hoạch bữa ăn thông minh</Text>
                  </View>
                  <Text style={styles.smartCardTitle} numberOfLines={1}> Salad cá hồi sốt cam chanh</Text>
                </LinearGradient>
              </View>
              <View style={styles.smartCardFooter}>
                <Text style={styles.smartCardDesc}>Thực đơn lành mạnh cho 4 người</Text>
                <View style={styles.smartCardActions}>
                  <TouchableOpacity style={styles.btnPrimary}>
                    <Text style={styles.btnPrimaryText}>Xem lộ trình</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSecondary}>
                    <Text style={styles.btnSecondaryText}>Tối ưu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card 2 */}
            <LinearGradient
              colors={tierTheme.gradient as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cartCardGradient}
            >
              <TouchableOpacity activeOpacity={0.9} style={styles.cartCardInner} onPress={() => router.push('/cart')}>
                <View style={styles.cartHeaderRow}>
                  <View style={styles.cartIconBox}>
                    <ShoppingBag color="#059669" size={22} />
                  </View>
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>Tiết kiệm 15%</Text>
                  </View>
                </View>
                <Text style={styles.cartTitle}>Giỏ hàng</Text>
                <Text style={styles.cartSubtitle}>Đã có 3/8 sản phẩm</Text>

                <View style={styles.cartProgressTrack}>
                  <View style={[styles.cartProgressFill, { width: '37.5%', backgroundColor: tierTheme.badgeBg }]} />
                </View>

                <View style={styles.cartButton}>
                  <Navigation color="white" size={16} fill="white" style={{ marginRight: 8 }} />
                  <Text style={styles.cartButtonText}>Đến gian hàng ngay</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </ScrollView>
        </Animated.View>

        {/* Weekly Budget */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetTitle}>Ngân sách tuần</Text>
              <Text style={styles.budgetSubtitle}>Cập nhật 5 phút trước</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.budgetValue}>1.2tr / 2tr vnđ</Text>
              <View style={styles.budgetStatusBadge}>
                <Text style={styles.budgetStatusText}>Sắp đạt hạn mức</Text>
              </View>
            </View>
          </View>

          {/* Chart Mockup */}
          <View style={styles.chartContainer}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => {
              const heights = [30, 50, 70, 100, 20, 40, 30]; // % heights
              const isToday = day === 'T5';
              return (
                <View key={day} style={styles.chartBarCol}>
                  <View style={styles.chartBarWrapper}>
                    {isToday && (
                      <View style={styles.chartTodayBadge}>
                        <Text style={styles.chartTodayText}>T5</Text>
                      </View>
                    )}
                    <View style={[styles.chartBar, { height: `${heights[index]}%`, backgroundColor: isToday ? '#10B981' : '#D1FAE5' }]} />
                  </View>
                  <Text style={[styles.chartDayText, isToday && styles.chartDayTextActive]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Promotions */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.promoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khuyến mãi dành cho bạn</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            {PRODUCTS.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  {product.aiRecommend && (
                    <View style={styles.aiRecommendBadge}>
                      <Zap color="white" size={10} fill="white" style={{ marginRight: 4 }} />
                      <Text style={styles.aiRecommendText}>AI Đề xuất</Text>
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={1}>{product.title}</Text>
                  <Text style={styles.productSubtitle}>{product.subtitle}</Text>
                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>{product.price}</Text>
                    <TouchableOpacity style={styles.addButton}>
                      <Plus color="white" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* View More Card */}
            <TouchableOpacity style={styles.viewMoreCard} activeOpacity={0.8}>
              <View style={styles.viewMoreIconBox}>
                <Plus color="#059669" size={24} />
              </View>
              <Text style={styles.viewMoreTitle}>Xem thêm sản phẩm</Text>
              <Text style={styles.viewMoreSubtitle}>Dựa trên thói quen mua sắm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <View style={[styles.navTabBox, activeTab === 'home' && styles.navTabBoxActive]}>
            <Home color={activeTab === 'home' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('route')}>
          <View style={[styles.navTabBox, activeTab === 'route' && styles.navTabBoxActive]}>
            <Map color={activeTab === 'route' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cart')}>
          <View style={[styles.navTabBox, activeTab === 'cart' && styles.navTabBoxActive]}>
            <ShoppingBag color={activeTab === 'cart' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <View style={[styles.navTabBox, activeTab === 'profile' && styles.navTabBoxActive]}>
            <User color={activeTab === 'profile' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -30 }], // 60/2 to center
    width: 60,
    backgroundColor: '#F59E0B',
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  subGreetingText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  searchToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#059669',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleBtnTextActive: {
    color: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  smartCard: {
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  smartCardImageWrapper: {
    height: 140,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  smartCardImage: {
    width: '100%',
    height: '100%',
  },
  smartCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  smartBadge: {
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  smartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  smartCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  smartCardFooter: {
    padding: 16,
  },
  smartCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  smartCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#047857',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSecondaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  cartCardGradient: {
    width: width * 0.65,
    borderRadius: 24,
    padding: 3, // Thicker gradient border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cartCardInner: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 21,
    padding: 16,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cartIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '700',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cartSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  cartProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cartProgressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  cartButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  budgetSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  budgetStatusBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  budgetStatusText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 40,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarWrapper: {
    height: 100,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    position: 'relative'
  },
  chartBar: {
    width: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  chartDayText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  chartDayTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  chartTodayBadge: {
    position: 'absolute',
    top: -28,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  chartTodayText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  promoSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: (width - 56) / 2, // 20 padding each side, 16 gap
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    height: 140,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  aiRecommendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiRecommendText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreCard: {
    width: (width - 56) / 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewMoreIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewMoreSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navTabBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabBoxActive: {
    backgroundColor: '#059669',
  }
});
