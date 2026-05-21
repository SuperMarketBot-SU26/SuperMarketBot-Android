import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, TextInput, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, HelpCircle, Utensils, AlertTriangle, Wallet, Leaf, FlaskConical, Zap, UtensilsCrossed, Flame, RefreshCw, Fish, Clock, Dumbbell, TrendingDown, Save, Info } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Dummy data for Diets
const DIETS = [
  { id: 'chay', name: 'Ăn chay', icon: Leaf },
  { id: 'duong', name: 'Kiêng đường', icon: FlaskConical },
  { id: 'organic', name: 'Organic', icon: Zap },
  { id: 'clean', name: 'Eat Clean', icon: UtensilsCrossed },
  { id: 'keto', name: 'Keto', icon: Flame },
  { id: 'lowcarb', name: 'Low Carb', icon: RefreshCw },
  { id: 'med', name: 'Địa Trung Hải', icon: Fish },
  { id: 'vegan', name: 'Vegan (thuần chay)', icon: Leaf },
  { id: 'fasting', name: 'Nhịn ăn gián đoạn', icon: Clock },
  { id: 'protein', name: 'Giàu protein', icon: Dumbbell },
  { id: 'calo', name: 'Giảm calo', icon: TrendingDown },
  { id: 'paleo', name: 'Paleo', icon: Flame },
];

// Dummy data for Allergies
const ALLERGIES = [
  { id: 'peanut', name: 'Dị ứng Đậu phộng', defaultOn: true },
  { id: 'seafood', name: 'Dị ứng Hải sản', defaultOn: false },
  { id: 'lactose', name: 'Không dung nạp Lactose', defaultOn: true },
  { id: 'gluten', name: 'Dị ứng Gluten', defaultOn: false },
  { id: 'egg', name: 'Dị ứng Trứng', defaultOn: false },
  { id: 'nut', name: 'Dị ứng Các loại hạt', defaultOn: false },
];

export default function ShoppingPreferencesScreenMain() {
  const router = useRouter();

  // State
  const [selectedDiets, setSelectedDiets] = useState<string[]>(['organic']);
  const [allergies, setAllergies] = useState<Record<string, boolean>>(
    ALLERGIES.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultOn }), {})
  );
  const [budgetPeriod, setBudgetPeriod] = useState('Tuần');
  const [amount, setAmount] = useState('2500000');

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
              {DIETS.map((diet) => {
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
              {ALLERGIES.map((allergy) => {
                const isOn = allergies[allergy.id];
                return (
                  <View key={allergy.id} style={styles.allergyItem}>
                    <View style={styles.allergyIconBox}>
                      <AlertTriangle color="#DC2626" size={16} strokeWidth={isOn ? 2.5 : 2} />
                    </View>
                    <Text style={[styles.allergyText, isOn && styles.allergyTextActive]}>
                      {allergy.name}
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
              <Text style={styles.sectionTitle}>Ngân sách</Text>
            </View>

            {/* Segmented Control */}
            <View style={styles.segmentControl}>
              {['Ngày', 'Tuần', 'Tháng'].map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[styles.segmentBtn, budgetPeriod === period && styles.segmentBtnActive]}
                  onPress={() => setBudgetPeriod(period)}
                >
                  <Text style={[styles.segmentText, budgetPeriod === period && styles.segmentTextActive]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
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
            <TouchableOpacity style={styles.btnSave}>
              <Text style={styles.btnSaveText}>Lưu thay đổi</Text>
              <Save color="white" size={20} />
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
