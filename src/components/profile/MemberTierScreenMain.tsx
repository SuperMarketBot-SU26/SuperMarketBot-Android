import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Cake, ChevronLeft, ChevronRight, Clock, Gift, Home, Map, Medal, Percent, ShoppingBag, Sparkles, Truck, User } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileService, ProfileDto } from '../../services/ProfileService';

const getTierTheme = (tier: string) => {
  const t = tier ? tier.toLowerCase() : '';
  if (t.includes('gold') || t.includes('vàng')) {
    return {
      colors: ['#FEF3C7', '#F59E0B'] as const,
      title: 'Thẻ thành viên Gold',
      superTitle: 'THÀNH VIÊN VÀNG',
      textColor: '#78350F',
      subColor: '#B45309',
    };
  }
  if (t.includes('platinum') || t.includes('bạch kim')) {
    return {
      colors: ['#E0F2FE', '#0284C7'] as const,
      title: 'Thẻ thành viên Platinum',
      superTitle: 'THÀNH VIÊN BẠCH KIM',
      textColor: '#FFFFFF',
      subColor: '#E0F2FE',
    };
  }
  if (t.includes('silver') || t.includes('bạc')) {
    return {
      colors: ['#F1F5F9', '#94A3B8'] as const,
      title: 'Thẻ thành viên Silver',
      superTitle: 'THÀNH VIÊN BẠC',
      textColor: '#1E293B',
      subColor: '#475569',
    };
  }
  // Bronze / Đồng / default
  return {
    colors: ['#FFEDD5', '#EA580C'] as const,
    title: 'Thẻ thành viên Bronze',
    superTitle: 'THÀNH VIÊN ĐỒNG',
    textColor: '#78350F',
    subColor: '#B45309',
  };
};

const getProgressDetails = (points: number) => {
  if (points < 1000) {
    return {
      nextTier: 'Bạc',
      remaining: 1000 - points,
      percent: (points / 1000) * 100,
    };
  } else if (points < 5000) {
    return {
      nextTier: 'Vàng',
      remaining: 5000 - points,
      percent: ((points - 1000) / 4000) * 100,
    };
  } else if (points < 15000) {
    return {
      nextTier: 'Bạch Kim',
      remaining: 15000 - points,
      percent: ((points - 5000) / 10000) * 100,
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
  
  if (tn === 'đồng' && (ut.includes('bronze') || ut.includes('đồng') || ut === '')) return true;
  if (tn === 'bạc' && (ut.includes('silver') || ut.includes('bạc'))) return true;
  if (tn === 'vàng' && (ut.includes('gold') || ut.includes('vàng'))) return true;
  if (tn === 'bạch kim' && (ut.includes('platinum') || ut.includes('bạch kim'))) return true;
  
  return false;
};

const getTierPrivileges = (tier: string) => {
  const t = tier ? tier.toLowerCase() : '';
  if (t.includes('gold') || t.includes('vàng')) {
    return [
      {
        title: 'Giảm giá 10%',
        desc: 'Áp dụng cho mọi đơn hàng thực phẩm tươi sống',
        icon: Percent,
        iconBg: '#DCFCE7',
        iconColor: '#059669',
      },
      {
        title: 'Freeship',
        desc: 'Miễn phí vận chuyển cho đơn hàng từ 200k',
        icon: Truck,
        iconBg: '#FFEDD5',
        iconColor: '#EA580C',
      },
      {
        title: 'Quà tặng sinh nhật',
        desc: 'Voucher 500k và giỏ trái cây cao cấp',
        icon: Cake,
        iconBg: '#F3F4F6',
        iconColor: '#6B7280',
      },
    ];
  }
  if (t.includes('platinum') || t.includes('bạch kim')) {
    return [
      {
        title: 'Giảm giá 15%',
        desc: 'Áp dụng cho toàn bộ hóa đơn mua sắm',
        icon: Percent,
        iconBg: '#ECFDF5',
        iconColor: '#10B981',
      },
      {
        title: 'Freeship trọn đời',
        desc: 'Miễn phí vận chuyển cho mọi đơn hàng',
        icon: Truck,
        iconBg: '#DBEAFE',
        iconColor: '#2563EB',
      },
      {
        title: 'Quà sinh nhật VIP',
        desc: 'Voucher 1.000k và hộp quà đặc biệt từ SmartMarket',
        icon: Cake,
        iconBg: '#F3E8FF',
        iconColor: '#9333EA',
      },
    ];
  }
  if (t.includes('silver') || t.includes('bạc')) {
    return [
      {
        title: 'Giảm giá 5%',
        desc: 'Áp dụng cho các sản phẩm nhãn hàng riêng',
        icon: Percent,
        iconBg: '#F1F5F9',
        iconColor: '#64748B',
      },
      {
        title: 'Freeship đơn từ 500k',
        desc: 'Miễn phí vận chuyển cho đơn hàng từ 500k',
        icon: Truck,
        iconBg: '#E0F2FE',
        iconColor: '#0369A1',
      },
      {
        title: 'Quà sinh nhật Bạc',
        desc: 'Voucher mua sắm trị giá 200k',
        icon: Cake,
        iconBg: '#F3F4F6',
        iconColor: '#6B7280',
      },
    ];
  }
  // Bronze / Đồng / default
  return [
    {
      title: 'Giảm giá 2%',
      desc: 'Áp dụng cho các sản phẩm thiết yếu',
      icon: Percent,
      iconBg: '#FFEDD5',
      iconColor: '#EA580C',
    },
    {
      title: 'Freeship đơn từ 1M',
      desc: 'Miễn phí vận chuyển cho đơn từ 1.000.000đ',
      icon: Truck,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      title: 'Quà sinh nhật Đồng',
      desc: 'Voucher mua sắm trị giá 100k',
      icon: Cake,
      iconBg: '#F3F4F6',
      iconColor: '#6B7280',
    },
  ];
};

export default function MemberTierScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchProfile = async () => {
        try {
          const data = await ProfileService.getProfile();
          if (isMounted) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Failed to load profile in MemberTierScreen', error);
        } finally {
          if (isMounted) {
            setIsLoadingProfile(false);
          }
        }
      };
      fetchProfile();
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
            const progress = getProgressDetails(profile?.totalPoints || 0);
            const privileges = getTierPrivileges(profile?.membershipTier || '');
            const userTier = profile?.membershipTier || 'Thành viên';
            
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
                        <Text style={[styles.pointsLabel, { color: theme.textColor, opacity: 0.8 }]}>TOTAL POINTS</Text>
                        <Text style={[styles.pointsValue, { color: theme.textColor === '#FFFFFF' ? '#0284C7' : theme.textColor }]}>
                          {(profile?.totalPoints || 0).toLocaleString('vi-VN')}
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
                        ? `Còn ${progress.remaining.toLocaleString('vi-VN')} điểm để đạt ${progress.nextTier}` 
                        : 'Bạn đã đạt hạng cao nhất!'}
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBg} />
                    <LinearGradient
                      colors={['#F97316', '#3B82F6', '#EAB308', '#22C55E']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressBarFill, { width: `${progress.percent}%` }]}
                    />
                  </View>

                  <View style={styles.tierLabels}>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#F97316' }]} />
                      <Text style={isTierActive(userTier, 'đồng') ? styles.tierTextActive : styles.tierText}>Đồng</Text>
                    </View>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#3B82F6' }]} />
                      <Text style={isTierActive(userTier, 'bạc') ? styles.tierTextActive : styles.tierText}>Bạc</Text>
                    </View>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#EAB308' }]} />
                      <Text style={isTierActive(userTier, 'vàng') ? styles.tierTextActive : styles.tierText}>Vàng</Text>
                    </View>
                    <View style={styles.tierLabelItem}>
                      <View style={[styles.tierDot, { backgroundColor: '#22C55E', width: 10, height: 10 }]} />
                      <Text style={isTierActive(userTier, 'bạch kim') ? styles.tierTextActive : styles.tierText}>Bạch Kim</Text>
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
