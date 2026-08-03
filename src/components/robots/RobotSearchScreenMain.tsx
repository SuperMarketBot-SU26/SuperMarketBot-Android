import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Bot, Battery, BatteryMedium, BatteryLow, Cpu, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { RobotService, RobotDto } from '../../services/RobotService';
import { useRobotNavigation } from '../../context/RobotNavigationContext';

export default function RobotSearchScreenMain() {
  const router = useRouter();
  const { joinRobotGroup } = useRobotNavigation();
  const [robots, setRobots] = useState<RobotDto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ONLINE' | 'BUSY' | 'OFFLINE'>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRobotCode, setSelectedRobotCode] = useState<string | null>(null);

  useEffect(() => {
    loadSelectedRobot();
    fetchRobots();
  }, []);

  const loadSelectedRobot = async () => {
    try {
      const savedRobotCode = await SecureStore.getItemAsync('selectedRobotCode');
      if (savedRobotCode) {
        setSelectedRobotCode(savedRobotCode);
      }
    } catch (e) {
      console.warn('Error loading selected robot code:', e);
    }
  };

  const fetchRobots = async () => {
    try {
      setError(null);
      const data = await RobotService.getRobots();
      setRobots(data);
    } catch (err: any) {
      console.error('Error fetching robots:', err);
      setError(err.message || 'Không thể lấy danh sách Robot từ máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRobots();
  };

  const handleSelectRobot = async (robot: RobotDto) => {
    if (robot.status.toUpperCase() === 'OFFLINE') {
      alert('Robot này hiện đang ngoại tuyến, không thể kết nối.');
      return;
    }
    
    try {
      await SecureStore.setItemAsync('selectedRobotCode', robot.robotCode);
      await SecureStore.setItemAsync('selectedRobotName', robot.robotName);
      setSelectedRobotCode(robot.robotCode);

      // Join SignalR RobotHub group to receive navigationStatus broadcasts
      await joinRobotGroup(robot.robotCode);

      alert(`Đã kết nối thành công với ${robot.robotName} (${robot.robotCode})`);
      router.back();
    } catch (e) {
      console.error('Error saving selected robot:', e);
      alert('Lưu kết nối robot thất bại. Vui lòng thử lại.');
    }
  };

  const getBatteryIcon = (pct: number) => {
    if (pct <= 20) return <BatteryLow color="#EF4444" size={16} />;
    if (pct <= 60) return <BatteryMedium color="#F59E0B" size={16} />;
    return <Battery color="#10B981" size={16} />;
  };

  const getBatteryColor = (pct: number) => {
    if (pct <= 20) return '#EF4444';
    if (pct <= 60) return '#F59E0B';
    return '#10B981';
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'ONLINE') {
      return (
        <View style={[styles.statusBadge, styles.statusOnline]}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusOnlineText}>SẴN SÀNG</Text>
        </View>
      );
    } else if (s === 'BUSY') {
      return (
        <View style={[styles.statusBadge, styles.statusBusy]}>
          <Text style={styles.statusBusyText}>ĐANG BẬN</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBadge, styles.statusOffline]}>
          <Text style={styles.statusOfflineText}>NGOẠI TUYẾN</Text>
        </View>
      );
    }
  };

  const filteredRobots = robots.filter(robot => {
    const matchesSearch = 
      robot.robotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.robotCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ALL') return matchesSearch;
    return matchesSearch && robot.status.toUpperCase() === activeFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>THIẾT BỊ SIÊU THỊ</Text>
          <Text style={styles.headerTitle}>Tìm & Chọn Robot</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw color="#059669" size={20} />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Nhập tên hoặc mã robot..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {(['ALL', 'ONLINE', 'BUSY', 'OFFLINE'] as const).map((filter) => {
            let label = 'Tất cả';
            if (filter === 'ONLINE') label = 'Sẵn sàng';
            if (filter === 'BUSY') label = 'Đang bận';
            if (filter === 'OFFLINE') label = 'Ngoại tuyến';

            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Robot List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Đang quét tìm các Robot trong siêu thị...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <AlertCircle color="#EF4444" size={48} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchRobots}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredRobots.length === 0 ? (
          <View style={styles.centerContainer}>
            <Bot color="#9CA3AF" size={64} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Không tìm thấy robot nào phù hợp.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRobots}
            keyExtractor={(item) => item.robotId.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#059669']} />
            }
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isSelected = selectedRobotCode === item.robotCode;
              const isOffline = item.status.toUpperCase() === 'OFFLINE';
              const isBusy = item.status.toUpperCase() === 'BUSY';

              return (
                <Animated.View entering={FadeInDown.delay(index * 100)} style={styles.robotCardWrapper}>
                  <View style={[styles.robotCard, isSelected && styles.robotCardSelected, isOffline && styles.robotCardOffline]}>
                    <View style={styles.cardHeader}>
                      <View style={styles.robotIconBox}>
                        <Bot color={isSelected ? '#059669' : '#4B5563'} size={28} />
                      </View>
                      <View style={styles.robotInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.robotName}>{item.robotName}</Text>
                          {isSelected && <CheckCircle2 color="#059669" size={16} fill="white" style={{ marginLeft: 6 }} />}
                        </View>
                        <Text style={styles.robotCode}>{item.robotCode}</Text>
                      </View>
                      {getStatusBadge(item.status)}
                    </View>

                    <View style={styles.cardDivider} />

                    <View style={styles.cardFooter}>
                      <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                          {getBatteryIcon(item.batteryPct)}
                          <Text style={[styles.metaText, { color: getBatteryColor(item.batteryPct) }]}>
                            {item.batteryPct}% Pin
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Cpu color="#6B7280" size={16} />
                          <Text style={styles.metaText}>Chế độ: {item.mode || 'N/A'}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.connectButton,
                          isSelected && styles.connectButtonSelected,
                          isOffline && styles.connectButtonDisabled
                        ]}
                        disabled={isOffline}
                        onPress={() => handleSelectRobot(item)}
                      >
                        <Text style={[
                          styles.connectButtonText,
                          isSelected && styles.connectButtonTextSelected,
                          isOffline && styles.connectButtonTextDisabled
                        ]}>
                          {isSelected ? 'Đang kết nối' : isOffline ? 'Ngoại tuyến' : 'Kết nối'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  refreshButton: {
    padding: 8,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 40,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    color: '#EF4444',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  robotCardWrapper: {
    marginBottom: 12,
  },
  robotCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  robotCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  robotCardOffline: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  robotInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  robotCode: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOnline: {
    backgroundColor: '#D1FAE5',
  },
  statusOnlineText: {
    color: '#065F46',
    fontSize: 10,
    fontWeight: '800',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusBusy: {
    backgroundColor: '#DBEAFE',
  },
  statusBusyText: {
    color: '#1E40AF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusOffline: {
    backgroundColor: '#F1F5F9',
  },
  statusOfflineText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  connectButtonSelected: {
    backgroundColor: '#10B981',
  },
  connectButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  connectButtonTextSelected: {
    color: 'white',
  },
  connectButtonTextDisabled: {
    color: '#94A3B8',
  },
});
