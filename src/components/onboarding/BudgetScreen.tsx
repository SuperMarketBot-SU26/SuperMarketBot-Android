import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Banknote, Leaf, Sparkles, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

export default function BudgetScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('2500000');
  const insets = useSafeAreaInsets();

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

  const handleComplete = async () => {
    try {
      await SecureStore.setItemAsync('userBudget', amount);
      await SecureStore.setItemAsync('onboardingCompleted', 'true');
    } catch (e) {
      console.warn('Error saving budget preferences:', e);
    }
    router.replace('/home');
  };

  const formattedAmount = amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0';
  const percent = Math.min(Math.max((Number(amount) / 5000000) * 100, 0), 100);
  const displayM = (Number(amount) / 1000000).toFixed(1).replace('.0', '');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.brandName}>SmartMarketBot</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={[styles.progressSegment, styles.progressActive]} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerIcon}>
          <View style={styles.iconWrapper}>
            <Banknote color="#059669" size={28} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.titleSection}>
          <Text style={styles.mainTitle}>Ngân sách mua sắm hàng tuần của bạn?</Text>
          <Text style={styles.subtitle}>SmartMarketBot AI sẽ tối ưu hóa thực đơn dựa trên ngân sách tiết kiệm nhất cho bạn.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.budgetCard}>
          <Text style={styles.budgetLabel}>SỐ TIỀN ƯỚC TÍNH</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountValue}
              value={formattedAmount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              maxLength={11} // including dots
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
            <View style={[styles.sliderThumb, { left: `${percent}%` }]}>
              <View style={styles.sliderThumbInner} />
            </View>
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>0</Text>
            <Text style={styles.sliderLabelText}>5.000.000+</Text>
          </View>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagItem}>
              <Leaf color="#059669" size={20} />
              <View style={styles.tagTextContainer}>
                <Text style={styles.tagTitle}>Ăn Sạch</Text>
                <Text style={styles.tagSubtitle}>Tiêu chuẩn Organic</Text>
              </View>
            </View>
            <View style={styles.tagItem}>
              <Zap color="#D97706" size={20} />
              <View style={styles.tagTextContainer}>
                <Text style={styles.tagTitle}>Siêu Tốc</Text>
                <Text style={styles.tagSubtitle}>Giao trong 2 giờ</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.aiBanner}>
          <View style={styles.aiIconWrapper}>
            <Sparkles color="#10B981" size={20} />
          </View>
          <Text style={styles.aiBannerText}>
            <Text style={{ fontWeight: '700', color: '#065F46' }}>Gợi ý AI: </Text>
            Với {displayM}M/tuần, bạn có thể mua đủ thực phẩm cao cấp cho gia đình 4 người với 80% rau củ sạch.
          </Text>
        </Animated.View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleComplete}>
          <Text style={styles.nextButtonText}>Hoàn tất</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
        <Text style={styles.securityText}>Dữ liệu của bạn được bảo mật theo tiêu chuẩn SmartMarketBot.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 16 },
  backButton: { padding: 8, marginLeft: -8 },
  brandName: { flex: 1, fontSize: 18, fontWeight: '800', color: '#059669', fontStyle: 'italic', textAlign: 'center' },
  progressBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  progressSegment: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  progressActive: { backgroundColor: '#059669' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 }, // Increased padding to prevent footer overlap
  headerIcon: { alignItems: 'center', marginBottom: 24 },
  iconWrapper: { width: 64, height: 64, borderRadius: 24, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 5 },
  titleSection: { alignItems: 'center', marginBottom: 32 },
  mainTitle: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  budgetCard: { backgroundColor: 'white', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, marginBottom: 24 },
  budgetLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  amountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  amountValue: { fontSize: 40, fontWeight: '800', color: '#059669', minWidth: 100, textAlign: 'center', padding: 0, margin: 0 },
  amountCurrency: { fontSize: 16, fontWeight: '700', color: '#6EE7B7', marginLeft: 8, marginTop: 16 },
  sliderContainer: { position: 'relative', height: 40, justifyContent: 'center', marginBottom: 8 },
  sliderTrack: { width: '100%', height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: '#F59E0B' }, // Orange to green gradient conceptually
  sliderThumb: { position: 'absolute', marginLeft: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  sliderThumbInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  sliderLabelText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  tagsContainer: { flexDirection: 'row', gap: 12 },
  tagItem: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center' },
  tagTextContainer: { marginLeft: 8 },
  tagTitle: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  tagSubtitle: { fontSize: 11, color: '#6B7280' },
  aiBanner: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  aiIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  aiBannerText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 20 },
  footer: { padding: 24, backgroundColor: '#F8FAFC' },
  nextButton: { backgroundColor: '#059669', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 },
  securityText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 20 }
});
