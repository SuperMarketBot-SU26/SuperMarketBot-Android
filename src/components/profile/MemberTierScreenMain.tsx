import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Bot, Cake, ChevronLeft, ChevronRight, Clock, Gift, Home, Map, Medal, Navigation, Percent, Search, ShoppingBag, Sparkles, Star, Truck, User } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileService, ProfileDto } from '../../services/ProfileService';
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

const getProgressDetails = (totalSpent: number) => {
  const THRESHOLD = 10000000;
  if (totalSpent < THRESHOLD) {
    return {
      nextTier: 'Premium',
      remaining: THRESHOLD - totalSpent,
      percent: (totalSpent / THRESHOLD) * 100,
    };
  } else {
    return {
      nextTier: 'Tối đa',
      remaining: 0,
      percent: 100,
    };
  }
};

const isTierActive = (userTier: string, tierName: string) => {
  const ut = userTier ? userTier.toLowerCase() : '';
  const tn = tierName.toLowerCase();
  
  if (tn === 'medium' && (ut.includes('medium') || ut === '')) return true;
  if (tn === 'premium' && ut.includes('premium')) return true;
  
  return false;
};

const getTierPrivileges = (tier: string) => {
  const t = tier ? tier.toLowerCase() : '';
  const mediumPrivileges = [
    {
      title: 'Tương tác với robot',
      desc: 'Trải nghiệm mua sắm thông minh cùng robot',
      icon: Bot,
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
    },
    {
      title: 'Tìm kiếm nguyên liệu bằng AI',
      desc: 'Tìm kiếm nhanh chóng món ăn và nguyên liệu',
      icon: Search,
      iconBg: '#F1F5F9',
      iconColor: '#64748B',
    },
    {
      title: 'Chỉ đường đến các nguyên liệu',
      desc: 'Robot dẫn đường trực tiếp đến kệ hàng',
      icon: Navigation,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
    },
    {
      title: 'Sản phẩm khuyến mãi',
      desc: 'Cập nhật nhanh các sản phẩm đang giảm giá',
      icon: Percent,
      iconBg: '#FFEDD5',
      iconColor: '#EA580C',
    },
  ];

  if (t.includes('premium')) {
    return [
      ...mediumPrivileges,
      {
        title: 'Cá nhân hóa món ăn',
        desc: 'Đề xuất món ăn phù hợp ngân sách & sở thích',
        icon: Sparkles,
        iconBg: '#FEF3C7',
        iconColor: '#D97706',
      },
      {
        title: 'Quảng cáo cá nhân hóa',
        desc: 'Nhận ưu đãi độc quyền dành riêng cho bạn',
        icon: Star,
        iconBg: '#FCE7F3',
        iconColor: '#DB2777',
      },
      {
        title: 'Tìm kiếm cá nhân hoá',
        desc: 'Lọc kết quả tìm kiếm theo chế độ ăn uống',
        icon: User,
        iconBg: '#E0E7FF',
        iconColor: '#4F46E5',
      },
    ];
  }
  
  return mediumPrivileges;
};

export default function MemberTierScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  if (isLoadingProfile) {
    return (
      <LinearGradient
        colors={['#F8FAFC', '#F8FAFC']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#059669" />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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

          {(() => {
            const theme = getTierTheme(profile?.membershipTier || '');
            const progress = getProgressDetails(profile?.totalSpent || 0);
            const privileges = getTierPrivileges(profile?.membershipTier || '');
            const rawTier = profile?.membershipTier || '';
            const userTier = rawTier.toLowerCase().includes('premium') ? 'Premium' : 'Medium';
            
            return (
              <>
                {/* Member Card */}
                <Animated.View entering={FadeInDown.delay(100)}>
                  <LinearGradient
                    colors={theme.colors as unknown as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.memberCard}
                  >
                    <View style={styles.cardTop}>
                      <View>
                        <Text style={[styles.cardLabel, { color: theme.textColor, opacity: 0.8 }]}>Hạng khách hàng</Text>
                        <Text style={[styles.cardStatusText, { color: theme.textColor, fontWeight: '700' }]}>{userTier}</Text>
                      </View>
                      <View style={[styles.medalBadge, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                        <Medal color={theme.textColor} size={24} />
                      </View>
                    </View>

                    <View style={styles.cardBottom}>
                      <View>
                        <Text style={[styles.cardLabel, { color: theme.textColor, opacity: 0.8 }]}>MEMBER ID</Text>
                        <Text style={[styles.cardIdText, { color: theme.textColor }]}>
                          {profile?.memberId ? `MB-${profile.memberId.toString().padStart(6, '0')}` : 'MB-000000'}
                        </Text>
                      </View>
                      <View style={[styles.pointsBox, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}>
                        <Text style={[styles.pointsLabel, { color: theme.textColor, opacity: 0.8 }]}>TỔNG CHI TIÊU</Text>
                        <Text style={[styles.pointsValue, { color: theme.textColor === '#FFFFFF' ? '#0284C7' : theme.textColor }]}>
                          {(profile?.totalSpent || 0).toLocaleString('vi-VN')}đ
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>

                {/* Progress Section */}
                <Animated.View entering={FadeInDown.delay(200)} style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Tiến trình thăng hạng</Text>
                    <Text style={styles.progressSubtitle}>
                      {progress.remaining > 0 
                        ? `Còn ${progress.remaining.toLocaleString('vi-VN')}đ để đạt ${progress.nextTier}` 
                        : 'Bạn đã đạt hạng cao nhất!'}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg} />
                    <LinearGradient
                      colors={['#0284C7', '#F59E0B']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progress.percent}%` }]}
                    />
                  </View>

                  <View style={styles.tierLabels}>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#0284C7' }]} />
                      <Text style={isTierActive(userTier, 'medium') ? styles.tierTextActive : styles.tierText}>Medium</Text>
                    </View>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={isTierActive(userTier, 'premium') ? styles.tierTextActive : styles.tierText}>Premium</Text>
                    </View>
                  </View>
                </Animated.View>



                {/* Privileges Section */}
                <Animated.View entering={FadeInDown.delay(400)} style={styles.privilegesSection}>
                  <Text style={styles.sectionTitle}>Đặc quyền {userTier}</Text>

                  {privileges.map((priv, idx) => {
                    const PrivIcon = priv.icon;
                    return (
                      <TouchableOpacity key={idx} style={styles.privilegeItem}>
                        <View style={[styles.privilegeIconBox, { backgroundColor: priv.iconBg }]}>
                          <PrivIcon color={priv.iconColor} size={20} />
                        </View>
                        <View style={styles.privilegeTextContainer}>
                          <Text style={styles.privilegeTitle}>{priv.title}</Text>
                          <Text style={styles.privilegeDesc}>{priv.desc}</Text>
                        </View>
                        <ChevronRight color="#D1D5DB" size={20} />
                      </TouchableOpacity>
                    );
                  })}
                </Animated.View>
              </>
            );
          })()}

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
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
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
    flexShrink: 1,
    paddingRight: 16,
  },
  privilegeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  privilegeDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    flexWrap: 'wrap',
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
