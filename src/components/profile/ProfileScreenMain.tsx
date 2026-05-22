import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CheckCircle2, Clock, Home, Leaf, LogOut, Map, Medal, PartyPopper, QrCode, Settings, ShoppingBag, ShoppingBag as ShoppingBagIcon, SlidersHorizontal, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    router.replace('/');
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings color="#6B7280" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* User Info */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.userInfoSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <CheckCircle2 color="white" size={12} fill="#16A34A" />
              </View>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Duy Nguyễn</Text>
              <View style={styles.userTierRow}>
                <Medal color="#059669" size={14} />
                <Text style={styles.userTierText}>Vàng (Gold)</Text>
              </View>
            </View>
          </Animated.View>

          {/* Platinum Card */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <LinearGradient
              colors={['#F1F5F9', '#F8FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.membershipCard}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardSuperTitle}>THÀNH VIÊN CAO CẤP</Text>
                  <Text style={styles.cardTitle}>Thẻ thành viên Platinum</Text>
                </View>
                <View style={styles.qrIconBox}>
                  <QrCode color="#6B7280" size={24} />
                </View>
              </View>

              <View style={styles.cardPointsRow}>
                <View>
                  <Text style={styles.pointsLabel}>Điểm tích lũy hiện tại</Text>
                  <Text style={styles.pointsValue}>1.650 <Text style={styles.pointsUnit}>điểm</Text></Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.expiryText}>Hết hạn: 31/12/2024</Text>
                <TouchableOpacity style={styles.btnRedeem}>
                  <Text style={styles.btnRedeemText}>Đổi thưởng</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Account Menu */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>TÀI KHOẢN</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/personal-info')}>
              <View style={styles.menuIconBox}>
                <User color="#4B5563" size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>Thông tin cá nhân</Text>
                <Text style={styles.menuItemSub}>Quản lý thông tin & bảo mật</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/shopping-preferences')}>
              <View style={styles.menuIconBox}>
                <SlidersHorizontal color="#4B5563" size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>Tùy chọn mua sắm</Text>
                <Text style={styles.menuItemSub}>Chỉnh sửa sở thích & ngân sách</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/member-tier')}>
              <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Medal color="#059669" size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>Hạng thành viên</Text>
                <Text style={styles.menuItemSub}>Xem lộ trình thăng hạng & đặc quyền Bạch Kim</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/order-history')}>
              <View style={styles.menuIconBox}>
                <Clock color="#4B5563" size={20} />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuItemTitle}>Lịch sử đơn hàng</Text>
                <Text style={styles.menuItemSub}>Theo dõi các đơn hàng đã đặt</Text>
              </View>
              <ChevronRightIcon />
            </TouchableOpacity>
          </Animated.View>

          {/* Points History */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Lịch sử tích điểm</Text>

            <View style={styles.historyCard}>
              <View style={styles.historyItem}>
                <View style={styles.historyIconBox}>
                  <ShoppingBag color="#6B7280" size={18} />
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyTitle}>Mua sắm rau củ tươi</Text>
                  <Text style={styles.historyTime}>Hôm nay, 08:45</Text>
                </View>
                <Text style={styles.historyPoints}>+120</Text>
              </View>
              <View style={styles.historyDivider} />

              <View style={styles.historyItem}>
                <View style={styles.historyIconBox}>
                  <Leaf color="#6B7280" size={18} />
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyTitle}>Tái chế túi nhựa</Text>
                  <Text style={styles.historyTime}>12 Th04, 15:20</Text>
                </View>
                <Text style={styles.historyPoints}>+50</Text>
              </View>
              <View style={styles.historyDivider} />

              <View style={styles.historyItem}>
                <View style={styles.historyIconBox}>
                  <PartyPopper color="#6B7280" size={18} />
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyTitle}>Thưởng thăng hạng Vàng</Text>
                  <Text style={styles.historyTime}>10 Th04, 10:00</Text>
                </View>
                <Text style={styles.historyPoints}>+500</Text>
              </View>
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.logoutSection}>
            <TouchableOpacity style={styles.btnLogout} onPress={() => setLogoutModalVisible(true)}>
              <LogOut color="#DC2626" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.btnLogoutText}>Đăng xuất</Text>
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
              <ShoppingBagIcon color="#9CA3AF" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={[styles.navTabBox, styles.navTabBoxActive]}>
              <User color="white" size={24} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Confirmation Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isLogoutModalVisible}
          onRequestClose={() => setLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconBox}>
                <LogOut color="#DC2626" size={28} />
              </View>
              <Text style={styles.modalTitle}>Xác nhận đăng xuất</Text>
              <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?</Text>
              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setLogoutModalVisible(false)} activeOpacity={0.7}>
                  <Text style={styles.modalBtnCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnConfirm} onPress={confirmLogout} activeOpacity={0.7}>
                  <Text style={styles.modalBtnConfirmText}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
}

const ChevronRightIcon = () => (
  <Text style={{ color: '#D1D5DB', fontSize: 16 }}>›</Text>
);

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
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  settingsBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTierText: {
    fontSize: 14,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '500',
  },
  membershipCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardSuperTitle: {
    fontSize: 12,
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: '#374151',
  },
  qrIconBox: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPointsRow: {
    marginBottom: 24,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  pointsUnit: {
    fontSize: 16,
    color: '#059669',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  btnRedeem: {
    backgroundColor: '#00702A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
  },
  btnRedeemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyPoints: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  historyDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 56,
  },
  logoutSection: {
    marginTop: 8,
    marginBottom: 24,
  },
  btnLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnLogoutText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '600',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  }
});
