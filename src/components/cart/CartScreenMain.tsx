import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, Home, Map, Minus, Plus, ShoppingBag, User, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_CART = [
  {
    id: '1',
    name: 'Cá basa tươi',
    variant: 'Phi lê • 500g',
    price: 85000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=400&auto=format&fit=crop', // Cá hồi placeholder
    isSpecial: true, // Has purple border
  },
  {
    id: '2',
    name: 'Đùi gà CP',
    variant: 'Khay • 450g',
    price: 54000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop', // Chicken placeholder
  },
  {
    id: '3',
    name: 'Súp lơ xanh',
    variant: 'Đà Lạt • 1 cái',
    price: 32000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=400&auto=format&fit=crop', // Broccoli placeholder
  }
];

export default function CartScreenMain() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(MOCK_CART);
  const insets = useSafeAreaInsets();

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  };

  const calculateSubTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const aiDiscount = 12000;
  const subTotal = calculateSubTotal();
  const total = subTotal - aiDiscount;

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  return (
    <LinearGradient
      colors={['#F8FAFC', '#F8FAFC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Image source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }} style={styles.headerAvatar} />
            <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
            <Bell color="#059669" size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Cart Items */}
          <View style={styles.itemsContainer}>
            {cartItems.map((item, index) => (
              <Animated.View
                entering={FadeInDown.delay(index * 100)}
                key={item.id}
                style={[styles.cartItem, item.isSpecial && styles.cartItemSpecial]}
              >
                <View style={styles.itemImageContainer}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                </View>

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemVariant}>{item.variant}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>

                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.qtyBtnMinus}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Minus color="#9CA3AF" size={14} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtnPlus}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Plus color="white" size={14} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Checkout Summary */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Chi tiết thanh toán</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatPrice(subTotal)}</Text>
            </View>

            <View style={styles.aiDiscountRow}>
              <View style={styles.aiDiscountLeft}>
                <Zap color="#059669" size={14} fill="#059669" style={{ marginRight: 6 }} />
                <Text style={styles.aiDiscountText}>Tiết kiệm bởi AI</Text>
              </View>
              <Text style={styles.aiDiscountValue}>-{formatPrice(aiDiscount)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </Animated.View>

        </ScrollView>

        {/* Bottom Action */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.bottomAction}>
          <TouchableOpacity style={styles.btnCheckout}>
            <Text style={styles.btnCheckoutText}>Xem lộ trình</Text>
          </TouchableOpacity>
        </Animated.View>

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

          <TouchableOpacity style={styles.navItem}>
            <View style={[styles.navTabBox, styles.navTabBoxActive]}>
              <ShoppingBag color="white" size={24} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
            <View style={styles.navTabBox}>
              <User color="#9CA3AF" size={24} />
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cartItemSpecial: {
    borderColor: '#818CF8', // Purple border for the first item
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  qtyBtnMinus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    width: 24,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  qtyBtnPlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optimizeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  btnOptimize: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnOptimizeText: {
    color: '#78350F',
    fontSize: 16,
    fontWeight: '700',
  },
  optimizeDesc: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  aiDiscountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  aiDiscountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiDiscountText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  aiDiscountValue: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  btnCheckout: {
    backgroundColor: '#00702A',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00702A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnCheckoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
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
