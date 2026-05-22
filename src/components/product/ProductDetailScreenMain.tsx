import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Award, Clock, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock data (in a real app, you would fetch this based on the ID)
const PRODUCT_DATA = {
  id: '1',
  title: 'Cá Basa Phi Lê CP Khay 500g',
  image: 'https://i.pinimg.com/736x/5e/e8/f8/5ee8f8e1d20352068b8ee84f7e462e64.jpg',
  price: '65.000đ',
  originalPrice: '75.000đ',
  rating: 4.8,
  reviews: 130,
  sold: '1.2k',
  tags: ['ĐỀ XUẤT', 'GIẢM GIÁ'],
  brand: 'CP',
  origin: 'Việt Nam',
  expiry: '3 ngày từ NSX',
  description: 'Cá basa phi lê CP được chọn lọc từ những con cá tươi ngon nhất, nuôi theo quy trình chuẩn VietGAP. Thịt cá trắng, dai ngon, giàu Omega-3, thích hợp chế biến nhiều món ăn như canh chua, chiên giòn, kho tộ...',
  nutrition: [
    { label: 'Năng lượng', value: '135 kcal' },
    { label: 'Protein', value: '18g' },
    { label: 'Omega-3', value: '1.5g' },
    { label: 'Chất béo', value: '6g' },
  ]
};

export default function ProductDetailScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // In a real app, fetch data based on `id`
  const product = PRODUCT_DATA;

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <View style={styles.container}>
      {/* Header (Absolute positioned over image) */}
      <View style={[styles.header, { top: Math.max(insets.top, 20) }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsLiked(!isLiked)}>
            <Heart color={isLiked ? "#EF4444" : "#1E293B"} size={20} fill={isLiked ? "#EF4444" : "none"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </Animated.View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View style={styles.infoContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{product.price}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>{product.originalPrice}</Text>
              )}
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-13%</Text>
              </View>
            </View>

            <Text style={styles.productTitle}>{product.title}</Text>

            <View style={styles.statsRow}>
              <View style={styles.ratingContainer}>
                <Star color="#F59E0B" size={16} fill="#F59E0B" />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.reviewText}>({product.reviews})</Text>
              </View>
              <View style={styles.statsDivider} />
              <Text style={styles.soldText}>Đã bán {product.sold}</Text>
            </View>

            {/* Guarantees */}
            <View style={styles.guaranteeRow}>
              <View style={styles.guaranteeItem}>
                <ShieldCheck color="#059669" size={16} />
                <Text style={styles.guaranteeText}>100% Chính hãng</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Clock color="#059669" size={16} />
                <Text style={styles.guaranteeText}>Giao trong 2h</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Award color="#059669" size={16} />
                <Text style={styles.guaranteeText}>Hoàn tiền 200%</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Details Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thương hiệu</Text>
            <Text style={styles.detailValue}>{product.brand}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Xuất xứ</Text>
            <Text style={styles.detailValue}>{product.origin}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hạn sử dụng</Text>
            <Text style={styles.detailValue}>{product.expiry}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Giá trị dinh dưỡng (trên 100g)</Text>
          <View style={styles.nutritionGrid}>
            {product.nutrition.map((item, index) => (
              <View key={index} style={styles.nutritionCard}>
                <Text style={styles.nutritionValue}>{item.value}</Text>
                <Text style={styles.nutritionLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Fixed Action Bar */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.quantityController}>
          <TouchableOpacity style={styles.quantityBtn} onPress={decreaseQuantity}>
            <Minus color={quantity > 1 ? "#1E293B" : "#CBD5E1"} size={20} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityBtn} onPress={increaseQuantity}>
            <Plus color="#1E293B" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartButton} onPress={() => router.push('/cart')}>
          <ShoppingBag color="white" size={20} />
          <Text style={styles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  productImage: {
    width: width,
    height: width * 1.15,
    resizeMode: 'cover',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#059669',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 28,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  reviewText: {
    fontSize: 14,
    color: '#64748B',
  },
  statsDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  soldText: {
    fontSize: 14,
    color: '#64748B',
  },
  guaranteeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  nutritionCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  quantityController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    width: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#059669',
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  }
});
