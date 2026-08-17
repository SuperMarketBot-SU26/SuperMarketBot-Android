import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, TextInput, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, HelpCircle, Utensils, AlertTriangle, Wallet, Leaf, FlaskConical, Zap, UtensilsCrossed, Flame, RefreshCw, Fish, Clock, Dumbbell, TrendingDown, Save, Info } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { PersonalizationService, HealthPreferenceItemDto } from '../../services/PersonalizationService';
import { ProfileService } from '../../services/ProfileService';
import { useAuth } from '../../context/AuthContext';
import { ToastAndroid, ActivityIndicator } from 'react-native';

const DIET_UI_MAP: Record<number, any> = {
  8: { icon: Leaf },
  6: { icon: RefreshCw },
  10: { icon: Zap },
  7: { icon: Dumbbell },
};

const DEFAULT_DIET_UI = { icon: UtensilsCrossed };

const ALLERGY_UI_MAP: Record<number, any> = {
  1: { icon: Leaf },
  2: { icon: Flame },
  3: { icon: FlaskConical },
  4: { icon: Clock },
  5: { icon: Fish },
};

const DEFAULT_ALLERGY_UI = { icon: AlertTriangle };

interface HealthItem {
  id: string;
  name: string;
  icon: any;
}

export default function ShoppingPreferencesScreenMain() {
  const router = useRouter();

  const { profile } = useAuth();
  
  const [availableDiets, setAvailableDiets] = useState<HealthItem[]>([]);
  const [availableAllergies, setAvailableAllergies] = useState<HealthItem[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<Record<string, boolean>>({});
  const [budgetPeriod, setBudgetPeriod] = useState('Tuần');
  const [amount, setAmount] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const tags = await PersonalizationService.getHealthTags();
        
        const dietTags = tags.filter(t => t.tagType === 'diet').map(t => ({
          id: t.healthTagId.toString(),
          name: t.tagName,
          icon: DIET_UI_MAP[t.healthTagId]?.icon || DEFAULT_DIET_UI.icon
        }));
        
        const allergyTags = tags.filter(t => t.tagType === 'allergy').map(t => ({
          id: t.healthTagId.toString(),
          name: t.tagName,
          icon: ALLERGY_UI_MAP[t.healthTagId]?.icon || DEFAULT_ALLERGY_UI.icon
        }));

        setAvailableDiets(dietTags);
        setAvailableAllergies(allergyTags);

        // Lấy preferences hiện tại
        let myPrefsObj: any = null;
        try {
          myPrefsObj = await PersonalizationService.getHealthPreferences();
        } catch (e) {
          // Bỏ qua nếu chưa có
        }

        const currentDiets: string[] = [];
        const currentAllergies: Record<string, boolean> = {};

        if (myPrefsObj) {
          if (Array.isArray(myPrefsObj.preferreds)) {
            myPrefsObj.preferreds.forEach((p: any) => {
              currentDiets.push(p.healthTagId.toString());
            });
          }
          if (Array.isArray(myPrefsObj.allergies)) {
            myPrefsObj.allergies.forEach((p: any) => {
              currentAllergies[p.healthTagId.toString()] = true;
            });
          }
        }

        setSelectedDiets(currentDiets);
        setAllergies(currentAllergies);

        // Load budget từ profile nếu có
        if (profile?.spendingLimit) {
          setAmount(profile.spendingLimit.toString());
        }
      } catch (err) {
        console.warn('Lỗi load shopping preferences:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [profile]);

  const sliderWidthRef = useRef(0);
  const amountRef = useRef(amount);
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  const startPercentRef = useRef(50);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        startPercentRef.current = Math.min(Math.max((Number(amountRef.current) / 5000000) * 100, 0), 100);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (sliderWidthRef.current > 0) {
          let newPercent = startPercentRef.current + (gestureState.dx / sliderWidthRef.current) * 100;
          newPercent = Math.min(Math.max(newPercent, 0), 100);

          let newAmount = Math.round((newPercent / 100) * 5000000);
          // Snap to 100,000 increments for smoother UX while dragging
          newAmount = Math.round(newAmount / 100000) * 100000;

          setAmount(newAmount.toString());
        }
      },
    })
  ).current;

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 8) { // max 99M
      setAmount(numericValue);
    }
  };

  const formattedAmount = amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0';
  const percent = Math.min(Math.max((Number(amount) / 5000000) * 100, 0), 100);

  const toggleDiet = (id: string) => {
    setSelectedDiets(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const toggleAllergy = (id: string) => {
    setAllergies(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Cập nhật health preferences
      const preferences: HealthPreferenceItemDto[] = [];
      
      // Diets
      selectedDiets.forEach(id => {
        preferences.push({ healthTagId: Number(id), status: 'Preferred' });
      });

      // Allergies
      Object.keys(allergies).forEach(id => {
        if (allergies[id]) {
          preferences.push({ healthTagId: Number(id), status: 'Allergy' });
        }
      });

      await PersonalizationService.updateHealthPreferences(preferences);

      // Cập nhật ngân sách
      await PersonalizationService.updateBudget(Number(amount));
      if (profile) {
        // Update local context manually to avoid waiting for another network request
        profile.spendingLimit = Number(amount);
      }

      ToastAndroid.show('Đã lưu tùy chọn mua sắm', ToastAndroid.SHORT);
      router.back();
    } catch (err: any) {
      ToastAndroid.show(err.message || 'Có lỗi xảy ra', ToastAndroid.LONG);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F0FDF4', '#F8FAFC', '#F8FAFC']}
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
          <View style={styles.headerRight}>
            {/* <TouchableOpacity style={styles.iconBtnRight}>
              <HelpCircle color="#4B5563" size={20} />
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.iconBtnRight}>
              <Bell color="#4B5563" size={20} />
            </TouchableOpacity> */}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <Animated.View entering={FadeInDown.delay(100)} style={styles.pageTitleSection}>
            <Text style={styles.pageTitle}>Tùy chọn mua sắm</Text>
            <Text style={styles.pageSubtitle}>Điều chỉnh hồ sơ AI của bạn để nhận được gợi ý thực phẩm tốt nhất.</Text>
          </Animated.View>

          {/* Diets Section */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Utensils color="#059669" size={20} />
              <Text style={styles.sectionTitle}>Chế độ ăn uống</Text>
            </View>

            <View style={styles.dietsGrid}>
              {availableDiets.map((diet) => {
                const isSelected = selectedDiets.includes(diet.id);
                return (
                  <TouchableOpacity
                    key={diet.id}
                    style={[styles.dietCard, isSelected && styles.dietCardSelected]}
                    onPress={() => toggleDiet(diet.id)}
                    activeOpacity={0.7}
                  >
                    <diet.icon
                      color={isSelected ? "#059669" : "#6B7280"}
                      size={24}
                      strokeWidth={isSelected ? 2.5 : 2}
                      style={styles.dietIcon}
                    />
                    <Text style={[styles.dietText, isSelected && styles.dietTextSelected]}>
                      {diet.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Allergies Section */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle color="#DC2626" size={20} />
              <Text style={styles.sectionTitle}>Cảnh báo sức khỏe</Text>
            </View>

            <View style={styles.allergiesList}>
              {availableAllergies.map((allergy) => {
                const isOn = allergies[allergy.id] || false;
                return (
                  <View key={allergy.id} style={styles.allergyItem}>
                    <View style={styles.allergyIconBox}>
                      <allergy.icon color="#DC2626" size={16} strokeWidth={isOn ? 2.5 : 2} />
                    </View>
                    <Text style={[styles.allergyText, isOn && styles.allergyTextActive]}>
                      Dị ứng {allergy.name}
                    </Text>
                    <Switch
                      value={isOn}
                      onValueChange={() => toggleAllergy(allergy.id)}
                      trackColor={{ false: '#E5E7EB', true: '#059669' }}
                      thumbColor="white"
                      ios_backgroundColor="#E5E7EB"
                    />
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* Budget Section */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Wallet color="#92400E" size={20} />
              <Text style={styles.sectionTitle}>Chi tiêu tối đa cho 1 đơn hàng</Text>
            </View>

            {/* Budget Card */}
            <View style={styles.budgetCard}>
              <View style={styles.budgetTargetRow}>
                <Text style={styles.budgetTargetLabel}>MỤC{'\n'}TIÊU</Text>
                <TextInput
                  style={styles.budgetValue}
                  value={formattedAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  maxLength={11}
                  selectionColor="#059669"
                />
                <Text style={styles.amountCurrency}>VNĐ</Text>
              </View>

              {/* Interactive Slider */}
              <View style={styles.sliderContainer} {...panResponder.panHandlers}>
                <View
                  style={styles.sliderTrack}
                  onLayout={(e) => { sliderWidthRef.current = e.nativeEvent.layout.width; }}
                >
                  <View style={[styles.sliderFill, { width: `${percent}%` }]} />
                </View>
                <View style={[styles.sliderThumb, { left: `${percent}%` }]} />
              </View>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0 VNĐ</Text>
                <Text style={styles.sliderLabelText}>5.000.000 VNĐ</Text>
              </View>

              <View style={styles.budgetTipBox}>
                <Info color="#059669" size={16} style={{ marginTop: 2 }} />
                <Text style={styles.budgetTipText}>
                  "Với ngân sách này, bạn có thể mua đủ thực phẩm Organic cho gia đình 4 người trong 1 tuần!"
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.actionSection}>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.btnSaveText}>Lưu thay đổi</Text>
                  <Save color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
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
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitleSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  dietsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dietCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dietCardSelected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  dietIcon: {
    marginBottom: 8,
  },
  dietText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  dietTextSelected: {
    color: '#059669',
    fontWeight: '700',
  },
  allergiesList: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  allergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  allergyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  allergyText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  allergyTextActive: {
    fontWeight: '700',
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  budgetCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  budgetTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  budgetTargetLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginRight: 12,
    textAlign: 'right',
  },
  budgetValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
    padding: 0,
    margin: 0,
  },
  amountCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 8,
    marginTop: 8,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    width: '100%',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    top: '50%',
    marginTop: -12,
    marginLeft: -12,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  budgetTipBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  budgetTipText: {
    flex: 1,
    fontSize: 12,
    color: '#065F46',
    marginLeft: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionSection: {
    marginTop: 16,
  },
  btnSave: {
    flexDirection: 'row',
    backgroundColor: '#00702A',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00702A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
