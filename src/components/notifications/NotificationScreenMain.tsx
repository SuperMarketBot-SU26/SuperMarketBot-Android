import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, CheckCircle2, ArrowRight, Tag, Star, Leaf } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, SharedTransition, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function NotificationScreenMain() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#ECFDF5', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ChevronLeft color="#059669" size={24} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.logoBox}>
              <Leaf color="white" size={16} />
            </View>
            <Text style={styles.headerTitle}>Smart Market Bot</Text>
          </View>
          <Animated.View style={styles.bellBtn} sharedTransitionTag="shared-bell-icon">
            <Bell color="#059669" size={40} />
          </Animated.View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title Area */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.titleArea}>
            <View style={styles.titleLeft}>
              <Text style={styles.mainTitle}>Thông báo</Text>
              <Text style={styles.subTitle}>Bạn có <Text style={styles.subTitleHighlight}>3 tin nhắn mới</Text></Text>
            </View>
            <TouchableOpacity style={styles.readAllBtn}>
              <CheckCircle2 color="#059669" size={16} style={{ marginRight: 4 }} />
              <Text style={styles.readAllText}>Đọc tất cả</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Hero Notification (Salmon) */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.heroCard}>
            <View style={styles.heroImageContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=600&auto=format&fit=crop' }}
                style={styles.heroImage}
              />
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>TIN HOT NHẤT</Text>
              </View>
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroTitleRow}>
                <Text style={styles.heroTitle}>Cá hồi Na Uy thượng hạng</Text>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>Vừa xong</Text>
                </View>
              </View>
              <Text style={styles.heroDesc}>
                Đợt hàng cá hồi tươi ngon nhất vừa hạ cánh. Nhập mã <Text style={styles.heroDescHighlight}>SALMON24</Text> để được...
              </Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Mua ngay ngay bây giờ</Text>
                <ArrowRight color="white" size={16} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* List Card 1 (Promo) */}
          <Animated.View entering={FadeInRight.delay(300)} style={[styles.listCard, styles.listCardActive]}>
            <View style={styles.unreadDot} />
            <View style={[styles.iconContainer, { backgroundColor: '#22C55E' }]}>
              <Tag color="white" size={24} fill="white" />
            </View>
            <View style={styles.listCardContent}>
              <View style={styles.listCardHeader}>
                <Text style={styles.listCardTitle}>Khuyến mãi thường nhật</Text>
                <Text style={styles.listCardTime}>2 giờ trước</Text>
              </View>
              <Text style={styles.listCardDesc}>
                Giảm giá <Text style={styles.descHighlightGreen}>20%</Text> cho đùi gà hữu cơ bạn thường mua. Ưu đãi hết hạn sau 4 tiếng.
              </Text>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>GIẢM GIÁ 20%</Text>
              </View>
            </View>
          </Animated.View>

          {/* List Card 2 (Member) */}
          <Animated.View entering={FadeInRight.delay(400)} style={[styles.listCard, styles.listCardRead]}>
            <View style={[styles.iconContainer, { backgroundColor: '#D97706' }]}>
              <Star color="white" size={24} fill="white" />
            </View>
            <View style={styles.listCardContent}>
              <View style={styles.listCardHeader}>
                <Text style={styles.listCardTitle}>Ưu đãi thành viên</Text>
                <Text style={styles.listCardTime}>5 giờ trước</Text>
              </View>
              <Text style={styles.listCardDesc}>
                Tặng voucher <Text style={styles.descHighlightOrange}>50.000 VNĐ</Text> cho đơn trên 500k. Ưu đãi độc quyền Hạng Vàng.
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.btnBrown}>
                  <Text style={styles.btnBrownText}>Nhận Voucher</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnLight}>
                  <Text style={styles.btnLightText}>Chi tiết</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#064E3B',
  },
  bellBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  titleLeft: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  subTitleHighlight: {
    color: '#059669',
    fontWeight: '700',
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  readAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  heroImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  heroContent: {
    padding: 20,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginRight: 12,
  },
  timeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  heroDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroDescHighlight: {
    color: '#059669',
    fontWeight: '700',
  },
  heroButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 100,
  },
  heroButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  listCardActive: {
    borderWidth: 2,
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  listCardRead: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  listCardContent: {
    flex: 1,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingRight: 12,
  },
  listCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  listCardTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  listCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  descHighlightGreen: {
    color: '#16A34A',
    fontWeight: '700',
  },
  descHighlightOrange: {
    color: '#D97706',
    fontWeight: '700',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  btnBrown: {
    backgroundColor: '#B45309',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  btnBrownText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  btnLight: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  btnLightText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '600',
  }
});
