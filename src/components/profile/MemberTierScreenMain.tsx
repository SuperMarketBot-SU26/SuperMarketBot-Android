import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Cake, ChevronLeft, ChevronRight, Clock, Gift, Home, Map, Medal, Percent, ShoppingBag, Sparkles, Truck, User } from 'lucide-react-native';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MemberTierScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <ChevronLeft color="#4B5563" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SmartMarketBot</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Member Card */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <LinearGradient
              colors={['#FEF3C7', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.memberCard}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={[styles.cardLabel, { color: '#B45309' }]}>Hạng khách hàng</Text>
                  <Text style={[styles.cardStatusText, { color: '#78350F' }]}>Vàng</Text>
                </View>
                <View style={[styles.medalBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                  <Medal color="#78350F" size={24} />
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={[styles.cardLabel, { color: '#B45309' }]}>MEMBER ID</Text>
                  <Text style={[styles.cardIdText, { color: '#78350F' }]}>FA-8899-2024</Text>
                </View>
                <View style={[styles.pointsBox, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                  <Text style={[styles.pointsLabel, { color: '#B45309' }]}>TOTAL POINTS</Text>
                  <Text style={[styles.pointsValue, { color: '#D97706' }]}>12,450</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Progress Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Tiến trình thăng hạng</Text>
              <Text style={styles.progressSubtitle}>Còn 2,550 điểm để đạt Bạch kim</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg} />
              <LinearGradient
                colors={['#F97316', '#3B82F6', '#EAB308', '#22C55E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: '80%' }]}
              />
            </View>

            <View style={styles.tierLabels}>
              <View style={styles.tierLabelItem}>
                <View style={[styles.tierDot, { backgroundColor: '#F97316' }]} />
                <Text style={styles.tierText}>Đồng</Text>
              </View>
              <View style={styles.tierLabelItem}>
                <View style={[styles.tierDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.tierText}>Bạc</Text>
              </View>
              <View style={styles.tierLabelItem}>
                <View style={[styles.tierDot, { backgroundColor: '#EAB308' }]} />
                <Text style={styles.tierText}>Vàng</Text>
              </View>
              <View style={styles.tierLabelItem}>
                <View style={[styles.tierDot, { backgroundColor: '#22C55E', width: 10, height: 10 }]} />
                <Text style={styles.tierTextActive}>Bạch Kim</Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
              <Gift color="white" size={20} />
              <Text style={styles.actionBtnPrimaryText}>Đổi thưởng</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnSecondary]}>
              <Clock color="#4B5563" size={20} />
              <Text style={styles.actionBtnSecondaryText}>Lịch sử tích điểm</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Privileges Section */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.privilegesSection}>
            <Text style={styles.sectionTitle}>Đặc quyền Gold</Text>

            <TouchableOpacity style={styles.privilegeItem}>
              <View style={[styles.privilegeIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Percent color="#059669" size={20} />
              </View>
              <View style={styles.privilegeTextContainer}>
                <Text style={styles.privilegeTitle}>Giảm giá 10%</Text>
                <Text style={styles.privilegeDesc}>Áp dụng cho mọi đơn hàng thực phẩm tươi sống</Text>
              </View>
              <ChevronRight color="#D1D5DB" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.privilegeItem}>
              <View style={[styles.privilegeIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Truck color="#EA580C" size={20} />
              </View>
              <View style={styles.privilegeTextContainer}>
                <Text style={styles.privilegeTitle}>Freeship</Text>
                <Text style={styles.privilegeDesc}>Miễn phí vận chuyển cho đơn hàng từ 200k</Text>
              </View>
              <ChevronRight color="#D1D5DB" size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.privilegeItem}>
              <View style={[styles.privilegeIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Cake color="#6B7280" size={20} />
              </View>
              <View style={styles.privilegeTextContainer}>
                <Text style={styles.privilegeTitle}>Quà tặng sinh nhật</Text>
                <Text style={styles.privilegeDesc}>Voucher 500k và giỏ trái cây cao cấp</Text>
              </View>
              <ChevronRight color="#D1D5DB" size={20} />
            </TouchableOpacity>
          </Animated.View>

          {/* AI Banner */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.bannerContainer}>
            <ImageBackground
              source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779358193513/fresh_veggies_banner.png' }} // Replace with appropriate banner image if available
              style={styles.bannerBg}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,100,0,0.8)']}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerSuperTitle}>ƯU ĐÃI RIÊNG CHO BẠN</Text>
                <Text style={styles.bannerTitle}>AI đề xuất giỏ quà sức khỏe giảm 30%</Text>
              </LinearGradient>
            </ImageBackground>

            <TouchableOpacity style={styles.floatingBannerBtn}>
              <Sparkles color="#059669" size={24} />
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
            <View style={styles.navTabBox}>
              <Home color="#9CA3AF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navTabBox}>
              <Map color="#9CA3AF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/cart')}>
            <View style={styles.navTabBox}>
              <ShoppingBag color="#9CA3AF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
            <View style={[styles.navTabBox, styles.navTabBoxActive]}>
              <User color="white" size={24} />
            </View>
          </TouchableOpacity>
        </View>

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
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  memberCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardStatusText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  medalBadge: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 16,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardIdText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  pointsBox: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  progressBarContainer: {
    height: 6,
    position: 'relative',
    marginBottom: 16,
  },
  progressBarBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierLabelItem: {
    alignItems: 'center',
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  tierText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  tierTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnPrimary: {
    backgroundColor: '#00702A',
  },
  actionBtnSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionBtnPrimaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionBtnSecondaryText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  privilegesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  privilegeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  privilegeTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  privilegeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  privilegeDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  bannerContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  bannerBg: {
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerSuperTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDE047', // Yellow text for highlight
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    lineHeight: 24,
    width: '70%',
  },
  floatingBannerBtn: {
    position: 'absolute',
    right: 16,
    bottom: -16,
    width: 48,
    height: 48,
    backgroundColor: '#D1FAE5', // Light green
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'white',
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
