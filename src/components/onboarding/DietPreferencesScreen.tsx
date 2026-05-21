import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Circle, Leaf, Coffee, Sprout, Fish } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withSpring, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const DIET_OPTIONS = [
  { id: '1', title: 'Ăn chay', subtitle: '100% thực vật, không thịt cá', image: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779357368/vegan_lnakmy.jpg', icon: Leaf },
  { id: '2', title: 'Kiêng đường', subtitle: 'Hạn chế thực phẩm nhiều đường', image: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779358369/NoSugar_mxgmes.jpg', icon: Coffee },
  { id: '3', title: 'Organic', subtitle: 'Thực phẩm hữu cơ, sạch 100%', image: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779358450/Organic_otwq79.jpg', icon: Sprout },
  { id: '4', title: 'Eat Clean', subtitle: 'Ưu tiên thực phẩm tươi, ít chế biến', image: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779358480/EatClean_tuseaq.jpg', icon: Fish },
];

const DietOptionCard = ({ item, isSelected, toggleSelection }: any) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isSelected) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1, // infinite
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => toggleSelection(item.id)}
      activeOpacity={0.9}
    >
      {/* Flowing Border */}
      {isSelected && (
        <View style={styles.borderContainer}>
          <AnimatedLinearGradient
            colors={['#10B981', '#F0FDF4', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBorder, animatedStyle]}
          />
        </View>
      )}

      {/* Inner Content */}
      <View style={[styles.innerContent, isSelected && styles.innerContentSelected]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.itemImage} />
          {isSelected && (
            <Animated.View entering={FadeInUp.duration(200)} style={styles.checkBadge}>
              <CheckCircle2 color="#10B981" fill="#D1FAE5" size={24} />
            </Animated.View>
          )}
        </View>
        <Text style={[styles.itemTitle, isSelected && styles.itemTitleSelected]}>{item.title}</Text>
        <Text style={[styles.itemSubtitle, isSelected && styles.itemSubtitleSelected]}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function DietPreferencesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.brandName}>SmartMarketBot</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressSegment, styles.progressActive]} />
        <View style={styles.progressSegment} />
        <View style={styles.progressSegment} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* AI Greeting Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.greetingCard}>
          <View style={styles.botIconContainer}>
            <Bot color="white" size={20} />
          </View>
          <Text style={styles.greetingText}>
            Chào mừng bạn! Để AI của <Text style={styles.boldText}>SmartMarketBot</Text> thiết kế thực đơn cá nhân hóa, hãy cho tôi biết sở thích của bạn nhé.
          </Text>
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.titleSection}>
          <Text style={styles.mainTitle}>Chế độ ăn của bạn là gì?</Text>
          <Text style={styles.subtitle}>Bạn có thể chọn nhiều phương án phù hợp nhất.</Text>
        </Animated.View>

        {/* Grid Options */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.gridContainer}>
            {DIET_OPTIONS.map((item) => (
              <DietOptionCard
                key={item.id}
                item={item}
                isSelected={selected.includes(item.id)}
                toggleSelection={toggleSelection}
              />
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <CheckCircle2 color="#059669" size={16} />
          <Text style={styles.infoText}>Bạn có thể thay đổi các lựa chọn này bất cứ lúc nào</Text>
        </View>
        <TouchableOpacity style={styles.nextButton} onPress={() => router.push('/onboarding/allergies')}>
          <Text style={styles.nextButtonText}>Tiếp tục</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Để sau</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
  greetingCard: { flexDirection: 'row', backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 32 },
  botIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4ADE80', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  greetingText: { flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  boldText: { fontWeight: '700', color: '#166534' },
  titleSection: { marginBottom: 32 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  gridItem: { width: '47%', borderRadius: 24, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, backgroundColor: 'white' },
  borderContainer: { ...StyleSheet.absoluteFillObject, borderRadius: 24, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  gradientBorder: { width: '150%', height: '150%', position: 'absolute' },
  innerContent: { flex: 1, margin: 2, backgroundColor: 'white', borderRadius: 22, padding: 10, alignItems: 'center' },
  innerContentSelected: { backgroundColor: '#F0FDF4' },
  imageContainer: { width: '100%', aspectRatio: 1, position: 'relative', marginBottom: 12 },
  itemImage: { width: '100%', height: '100%', borderRadius: 16 },
  checkBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: 'white', borderRadius: 14, padding: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 2 },
  itemTitleSelected: { color: '#059669', fontWeight: '800' },
  itemSubtitle: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 16, paddingHorizontal: 4 },
  itemSubtitleSelected: { color: '#059669', opacity: 0.8 },
  footer: { padding: 24, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  infoText: { fontSize: 12, color: '#65A30D', marginLeft: 8, fontWeight: '500' },
  nextButton: { backgroundColor: '#059669', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  nextButtonText: { color: 'white', fontSize: 16, fontWeight: '700', marginRight: 8 },
  skipButton: { height: 48, justifyContent: 'center', alignItems: 'center' },
  skipButtonText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' }
});
