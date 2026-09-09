import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ToastAndroid, ActivityIndicator, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { CartService } from '../../services/CartService';

interface SearchResultItemProps {
  product: any;
  index: number;
  getTagStyle: (type: string) => { bg: string, text: string };
  setCartCount: (cb: (c: number) => number) => void;
}

const SearchResultItem = ({ product, index, getTagStyle, setCartCount }: SearchResultItemProps) => {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await CartService.addItem(Number(product.id), 1);
      setCartCount(c => c + 1);
      ToastAndroid.show("Đã thêm sản phẩm vào giỏ hàng", ToastAndroid.SHORT);
    } catch (e: any) {
      ToastAndroid.show(e.message, ToastAndroid.LONG);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.productCardWrapper}>
        <TouchableOpacity style={styles.productCard} onPress={() => router.push({ pathname: '/product', params: { id: product.id } })}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImageContainer}
            contentFit="cover"
            transition={200}
          />
          <Animated.View entering={FadeInRight.delay(200 + Math.min(index, 10) * 100)} style={styles.productContent}>
            <View style={styles.tagRow}>
              {product.tags.map((tag: any, idx: number) => {
                const style = getTagStyle(tag.type);
                return (
                  <View key={idx} style={[styles.tag, { backgroundColor: style.bg }]}>
                    <Text style={[styles.tagText, { color: style.text }]}>{tag.text}</Text>
                  </View>
                );
              })}
            </View>
            {product.isRestricted && (
              <TouchableOpacity
                style={styles.violationBadge}
                onPress={() => setExpanded(!expanded)}
              >
                <Text style={styles.violationText}>
                  ⚠️ VI PHẠM CHẾ ĐỘ ĂN
                </Text>
              </TouchableOpacity>
            )}
            {product.isOverBudget && (
              <TouchableOpacity style={[styles.violationBadge, { backgroundColor: '#3B82F6' }]} onPress={() => setExpanded(!expanded)}>
                <Text style={[styles.violationText, { color: 'white' }]}>
                  ⚠️ VƯỢT NGÂN SÁCH
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>{product.price}</Text>
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
                <Text style={styles.addButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        {expanded && (
          <Animated.View entering={FadeInRight} style={styles.alternativeBox}>
             <Text style={styles.alternativeText}>
                {product.altName ? (
                  <>Gợi ý thay thế: <Text style={{fontWeight: '700', color: '#1E293B'}}>{product.altName}</Text></>
                ) : (
                  <>Gợi ý: Tìm <Text style={{fontWeight: '700', color: '#1E293B'}}>{product.subcategoryName || product.categoryName || 'sản phẩm cùng loại'}</Text> có giá tốt hơn</>
                )}
             </Text>
             <TouchableOpacity style={styles.alternativeBtn} onPress={() => {
                const query = product.altName || product.subcategoryName || product.categoryName || 'sản phẩm';
                router.setParams({ query });
             }}>
                <Text style={styles.alternativeBtnText}>Tìm ngay</Text>
             </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default React.memo(SearchResultItem, (prev, next) => {
  return prev.product.id === next.product.id;
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  productCardWrapper: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  productCard: {
    flexDirection: 'row',
  },
  productImageContainer: {
    width: 120,
    backgroundColor: '#F3F4F6'
  },
  productContent: {
    flex: 1,
    padding: 16
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600'
  },
  violationBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6, 
    backgroundColor: '#FEF2F2', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 6, 
    paddingVertical: 4, 
    borderRadius: 6, 
    flexWrap: 'wrap'
  },
  violationText: {
    fontSize: 11, 
    fontWeight: '700', 
    color: '#DC2626', 
    marginLeft: 4
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 20
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto'
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  addButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600'
  },
  alternativeBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  alternativeText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    marginRight: 8
  },
  alternativeBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  alternativeBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700'
  }
});
