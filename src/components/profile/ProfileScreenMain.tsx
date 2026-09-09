import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Camera, CheckCircle2, Clock, Home, Leaf, LogOut, Map, Medal, PartyPopper, QrCode, Settings, ShoppingBag, ShoppingBag as ShoppingBagIcon, SlidersHorizontal, User, Wifi } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';

const getTierTheme = (tier: string) => {
  const t = tier ? tier.toLowerCase() : '';
  if (t.includes('premium')) {
    return {
      colors: ['#FEF3C7', '#F59E0B'] as const,
      title: 'Thẻ thành viên Premium',
      superTitle: 'THÀNH VIÊN PREMIUM',
      textColor: '#78350F',
      subColor: '#B45309',
    };
  }
  // Medium / default
  return {
    colors: ['#E0F2FE', '#0284C7'] as const,
    title: 'Thẻ thành viên Medium',
    superTitle: 'THÀNH VIÊN MEDIUM',
    textColor: '#FFFFFF',
    subColor: '#E0F2FE',
  };
};

export default function ProfileScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadProfile = async () => {
        setIsLoadingProfile(true);
        await refreshProfile();
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      };
      loadProfile();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    router.replace('/');
  };

  return (
    <>
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
            <TouchableOpacity 
              style={styles.avatarContainer}
              activeOpacity={0.8}
              onPress={() => router.push('/personal-info')}
            >
              <Image source={{ uri: profile?.avatarUrl || profile?.facePath || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }} style={styles.avatar} />
              <View style={[styles.verifiedBadge, { backgroundColor: '#059669' }]}>
                <Camera color="white" size={12} />
              </View>
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{profile?.fullName || 'Đang tải...'}</Text>
              <View style={styles.userTierRow}>
                <Medal color="#059669" size={14} />
                <Text style={styles.userTierText}>{profile?.membershipTier || 'Đang tải...'}</Text>
              </View>
            </View>
          </Animated.View>

            {/* Membership Card */}
            <Animated.View entering={FadeInDown.delay(200)}>
              {(() => {
                const theme = getTierTheme(profile?.membershipTier || '');
                return (
                  <LinearGradient
                    colors={theme.colors as unknown as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.membershipCard, { overflow: 'hidden', minHeight: 200, padding: 24, justifyContent: 'space-between', borderColor: 'transparent', position: 'relative' }]}
                  >
                    {/* Wave Pattern Background */}
                    <View style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
                      <Svg width="300" height="300" viewBox="0 0 200 200">
                        <Path fill="#FFFFFF" d="M45,-23C59.6,-4.9,73.6,12.7,69.5,25.9C65.5,39.2,43.5,48.1,23.3,55.9C3.1,63.6,-15.4,70.2,-31.2,65.2C-47,60.1,-60.2,43.3,-64.9,23.6C-69.6,3.9,-65.7,-18.8,-53.4,-36C-41.2,-53.1,-20.6,-64.7,-1.8,-62.9C17,-61,30.3,-41.2,45,-23Z" transform="translate(100 100)" />
                      </Svg>
                    </View>
                    <View style={{ position: 'absolute', bottom: -100, left: -50, opacity: 0.1 }}>
                      <Svg width="250" height="250" viewBox="0 0 200 200">
                        <Path fill="#FFFFFF" d="M41.5,-63.9C52.6,-53.4,59.5,-38.7,66.1,-23.4C72.7,-8.1,79,7.9,75.1,21.8C71.3,35.7,57.3,47.4,42.5,56.8C27.6,66.2,11.8,73.4,-3.8,78.7C-19.4,84,-34.8,87.4,-47.9,80.1C-61,72.9,-71.8,55.1,-78.3,36.5C-84.8,17.9,-87,-1.5,-80.6,-17.7C-74.2,-34,-59.1,-47.2,-44.1,-56.9C-29.2,-66.6,-14.6,-72.7,0.7,-73.7C16,-74.7,30.4,-74.5,41.5,-63.9Z" transform="translate(100 100)" />
                      </Svg>
                    </View>

                    {/* Top Row: Chip & Contactless */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{
                        width: 45, height: 32, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
                        justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
                      }}>
                        <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', top: 10 }} />
                        <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', bottom: 10 }} />
                        <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', left: 15 }} />
                        <View style={{ width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.3)', position: 'absolute', right: 15 }} />
                        <View style={{ width: 20, height: 16, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                      </View>
                      <Wifi color={theme.textColor} size={28} style={{ transform: [{ rotate: '90deg' }], opacity: 0.8 }} />
                    </View>

                    {/* Middle Row: Title (Card Number equivalent) */}
                    <View style={{ marginTop: 24 }}>
                      <Text style={{ color: theme.textColor, fontWeight: '800', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                        {theme.superTitle}
                      </Text>
                      <Text style={{ color: theme.textColor, opacity: 0.8, fontSize: 11, letterSpacing: 1.5, marginTop: 4 }}>
                        {theme.title}
                      </Text>
                    </View>

                    {/* Bottom Row: Name & Points */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32 }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ color: theme.textColor, opacity: 0.7, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Chủ thẻ</Text>
                        <Text style={{ color: theme.textColor, fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }} numberOfLines={1}>
                          {profile?.fullName || 'THÀNH VIÊN'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: theme.textColor, opacity: 0.7, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Tổng chi tiêu</Text>
                        <Text style={{ color: theme.textColor, fontSize: 20, fontWeight: '700' }}>
                          {profile?.totalSpent !== undefined ? profile.totalSpent.toLocaleString('vi-VN') : '0'}<Text style={{ fontSize: 14 }}> đ</Text>
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                );
              })()}
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

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  if (profile?.membershipTier?.toLowerCase() !== 'premium') {
                    alert('Tính năng này chỉ dành cho thành viên Premium (chi tiêu trên 10,000,000đ)');
                  } else {
                    router.push('/shopping-preferences');
                  }
                }}
              >
                <View style={styles.menuIconBox}>
                  <SlidersHorizontal color="#4B5563" size={20} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemTitle}>Thiết lập cá nhân hoá</Text>
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

            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/map')}>
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

        </SafeAreaView>
      </LinearGradient>

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
    </>
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
