import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Zap, AlertTriangle, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ProductDto } from '../../services/ProductService';
import { CartService } from '../../services/CartService';

interface ProductCardProps {
  product: ProductDto;
  userTier: string;
  spendingLimit?: number;
  hideBudgetWarning?: boolean;
}

const ProductCard = ({ product, userTier, spendingLimit, hideBudgetWarning = false }: ProductCardProps) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await CartService.addItem(product.productId, 1);
      ToastAndroid.show("Đã thêm sản phẩm vào giỏ hàng", ToastAndroid.SHORT);
    } catch (e: any) {
      ToastAndroid.show(e.message, ToastAndroid.LONG);
    } finally {
      setIsAdding(false);
    }
  };

  const isOverBudget = !hideBudgetWarning && spendingLimit ? spendingLimit > 0 && product.unitPrice > spendingLimit : false;
  const isRestricted = (product as any).hasAllergenConflict || (product as any).isRestricted;

  return (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/product', params: { id: product.productId } })}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={product.imageUrl ? { uri: product.imageUrl } : { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' }}
          style={styles.productImage}
          contentFit="cover"
          transition={200}
        />
        {userTier === 'PREMIUM' && (
          <View style={styles.aiRecommendBadge}>
            <Zap color="white" size={10} fill="white" style={{ marginRight: 4 }} />
            <Text style={styles.aiRecommendText}>AI Đề xuất</Text>
          </View>
        )}
        {isRestricted && (
          <View style={[styles.restrictedBadge, { top: 8 }]}>
            <AlertTriangle color="white" size={10} />
            <Text style={styles.restrictedText}>VI PHẠM DỊ ỨNG</Text>
          </View>
        )}
        {isOverBudget && (
          <View style={[styles.restrictedBadge, { backgroundColor: '#3B82F6', top: isRestricted ? 32 : 8 }]}>
            <AlertTriangle color="white" size={10} />
            <Text style={styles.restrictedText}>VƯỢT NGÂN SÁCH</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{product.productName}</Text>
        <Text style={styles.productSubtitle}>
          Trạng thái: {product.status === 'Available' ? 'Có trong kho' : product.status === 'Active' ? 'Có trên kệ hàng' : product.status}
        </Text>
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>{product.unitPrice.toLocaleString('vi-VN')} đ</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Plus color="white" size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden'
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6'
  },
  productImage: {
    width: '100%',
    height: '100%'
  },
  aiRecommendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  aiRecommendText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700'
  },
  restrictedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  restrictedText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4
  },
  productInfo: {
    padding: 12
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  productSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669'
  },
  addButton: {
    backgroundColor: '#059669',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
