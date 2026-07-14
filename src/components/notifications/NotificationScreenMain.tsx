import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, CheckCircle2, Tag, Star, Leaf, AlertTriangle, Wallet, ShoppingBag } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { NotificationService, NotificationDto } from '../../services/NotificationService';
import { useNotification } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Allergy':
      return { Icon: AlertTriangle, color: '#EF4444' };
    case 'BudgetExceeded':
      return { Icon: Wallet, color: '#F59E0B' };
    case 'DuplicatePurchase':
      return { Icon: ShoppingBag, color: '#3B82F6' };
    case 'PointsEarned':
      return { Icon: Star, color: '#EAB308' };
    case 'CartUpdate':
      return { Icon: ShoppingBag, color: '#10B981' };
    default:
      return { Icon: Bell, color: '#6B7280' };
  }
};

export default function NotificationScreenMain() {
  const router = useRouter();
  const { unreadCount, refreshUnreadCount } = useNotification();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await NotificationService.getNotifications(1, 50); // Get top 50 for now
      setNotifications(data.items);
    } catch (e) {
      console.warn('Lỗi lấy danh sách thông báo:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    refreshUnreadCount();
  };

  const handleReadAll = async () => {
    try {
      await NotificationService.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch (e) {
      console.warn('Lỗi đọc tất cả:', e);
    }
  };

  const handleRead = async (id: number) => {
    try {
      await NotificationService.read(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      refreshUnreadCount();
    } catch (e) {
      console.warn('Lỗi đọc thông báo:', e);
    }
  };

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

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#059669']} />
          }
        >
          {/* Title Area */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.titleArea}>
            <View style={styles.titleLeft}>
              <Text style={styles.mainTitle}>Thông báo</Text>
              <Text style={styles.subTitle}>
                Bạn có <Text style={styles.subTitleHighlight}>{unreadCount} tin nhắn mới</Text>
              </Text>
            </View>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.readAllBtn} onPress={handleReadAll}>
                <CheckCircle2 color="#059669" size={16} style={{ marginRight: 4 }} />
                <Text style={styles.readAllText}>Đọc tất cả</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {loading ? (
            <ActivityIndicator size="large" color="#059669" style={{ marginTop: 50 }} />
          ) : notifications.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Bell color="#9CA3AF" size={48} />
              <Text style={{ color: '#6B7280', marginTop: 16 }}>Chưa có thông báo nào</Text>
            </View>
          ) : (
            notifications.map((item, index) => {
              const { Icon, color } = getNotificationIcon(item.type);
              
              let timeText = '';
              try {
                timeText = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi });
              } catch (e) {
                timeText = item.createdAt;
              }

              return (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInRight.delay(200 + index * 50)} 
                  style={[styles.listCard, !item.isRead ? styles.listCardActive : styles.listCardRead]}
                >
                  <TouchableOpacity style={{ flex: 1, flexDirection: 'row' }} onPress={() => !item.isRead && handleRead(item.id)}>
                    {!item.isRead && <View style={styles.unreadDot} />}
                    <View style={[styles.iconContainer, { backgroundColor: color }]}>
                      <Icon color="white" size={24} />
                    </View>
                    <View style={styles.listCardContent}>
                      <View style={styles.listCardHeader}>
                        <Text style={styles.listCardTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.listCardTime}>{timeText}</Text>
                      </View>
                      <Text style={styles.listCardDesc}>
                        {item.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })
          )}
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
    top: 0,
    right: 0,
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
    flex: 1,
    marginRight: 8,
  },
  listCardTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  listCardDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
});
