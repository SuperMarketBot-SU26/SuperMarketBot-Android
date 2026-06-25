import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, ShieldAlert, CheckCircle2, Circle, Droplets, Fish, Leaf, Wheat, Egg, Sprout } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

const ALLERGIES = [
  { id: '1', title: 'Đậu phộng (Peanut)', subtitle: 'Bao gồm các loại đậu và hạt', icon: Leaf, color: '#D97706' },
  { id: '2', title: 'Hải sản (Seafood)', subtitle: 'Tôm, cua, mực, cá biển', icon: Fish, color: '#EA580C' },
  { id: '3', title: 'Lactose (Milk)', subtitle: 'Sữa tươi và các chế phẩm từ sữa', icon: Droplets, color: '#8B5CF6' },
  { id: '4', title: 'Gluten (Lúa mì)', subtitle: 'Bánh mì, mì sợi, lúa mạch', icon: Wheat, color: '#EAB308' },
  { id: '5', title: 'Trứng (Egg)', subtitle: 'Trứng gà, vịt, chim cút', icon: Egg, color: '#FCD34D' },
  { id: '6', title: 'Đậu nành (Soy)', subtitle: 'Nước tương, đậu hũ, sữa đậu nành', icon: Sprout, color: '#22C55E' },
];

export default function AllergiesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['2']); // Default selected for mockup
  const insets = useSafeAreaInsets();

  const toggleSelection = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleNext = async () => {
    try {
      await SecureStore.setItemAsync('userAllergies', JSON.stringify(selected));
    } catch (e) {
      console.warn('Error saving allergies:', e);
    }
    router.push('/onboarding/budget');
  };

  const handleSkip = async () => {
    try {
      await SecureStore.deleteItemAsync('userAllergies');
    } catch (e) {
      console.warn('Error clearing allergies:', e);
    }
    router.push('/onboarding/budget');
  };

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
        <View style={styles.progressSegment} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.stepIndicator}>
          <View style={styles.shieldIcon}>
            <ShieldAlert color="#EA580C" size={16} />
          </View>
          <Text style={stepIndicatorTextStyles()}>BƯỚC 2: CẢNH BÁO SỨC KHỎE</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.titleSection}>
          <Text style={styles.mainTitle}>Bạn có bị dị ứng với thực phẩm nào không?</Text>
          <Text style={styles.subtitle}>AI của chúng tôi sẽ tự động gắn nhãn cảnh báo đỏ cho các sản phẩm chứa thành phần gây hại cho bạn.</Text>
        </Animated.View>

        <View style={styles.listContainer}>
          {ALLERGIES.map((item, index) => {
            const isSelected = selected.includes(item.id);
            const Icon = item.icon;
            return (
              <Animated.View key={item.id} entering={FadeInLeft.delay(300 + index * 100).springify()}>
                <TouchableOpacity
                   style={[styles.listItem, isSelected && styles.listItemSelected]}
                  onPress={() => toggleSelection(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.itemIconContainer}>
                    <Icon color={item.color} size={24} strokeWidth={1.5} />
                  </View>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                  {isSelected ? (
                    <CheckCircle2 color="#EA580C" size={24} />
                  ) : (
                    <Circle color="#D1D5DB" size={24} />
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Tôi không có dị ứng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function stepIndicatorTextStyles(): import("react-native").StyleProp<import("react-native").TextStyle> {
  return styles.stepText;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 16 },
  backButton: { padding: 8, marginLeft: -8 },
  brandName: { flex: 1, fontSize: 18, fontWeight: '800', color: '#059669', fontStyle: 'italic', textAlign: 'center' },
  progressBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  progressSegment: { flex: 1, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 },
  progressActive: { backgroundColor: '#059669' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  shieldIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFEDD5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stepText: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  titleSection: { marginBottom: 32 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#4B5563', lineHeight: 22 },
  listContainer: { gap: 16, marginBottom: 40 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  listItemSelected: { borderColor: '#4ADE80', backgroundColor: '#F0FDF4' },
  itemIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemTextContainer: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  itemSubtitle: { fontSize: 13, color: '#6B7280' },
  bannerContainer: { width: '100%', height: 140, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { position: 'absolute', bottom: 16, left: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bannerText: { color: 'white', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  footer: { padding: 24, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 10 },
  nextButton: { backgroundColor: '#22C55E', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 },
  skipButton: { height: 48, justifyContent: 'center', alignItems: 'center' },
  skipButtonText: { color: '#6B7280', fontSize: 15, fontWeight: '600' }
});
