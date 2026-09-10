import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, ArrowRight, Plus, ShoppingBag, Star, Zap } from 'lucide-react-native';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { CartService } from '../../services/CartService';
import { PersonalizationService } from '../../services/PersonalizationService';
import { ProductDto, ProductService } from '../../services/ProductService';
import { SearchResultItemDto, SearchService } from '../../services/SearchService';
import { fixMojibake } from '../../utils/textUtils';
import SearchResultItem from './SearchResultItem';

const { width } = Dimensions.get('window');

const FILTERS = ['Tất cả sản phẩm'];

export default function SearchScreenMain() {
  const router = useRouter();
  const { query, mode, sortBy } = useLocalSearchParams();
  const searchQuery = query;
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const [activeFilter, setActiveFilter] = useState('Tất cả sản phẩm');
  const [cartCount, setCartCount] = useState(0);

  const [results, setResults] = useState<SearchResultItemDto[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<ProductDto[]>([]);
  const [aiRanked, setAiRanked] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [restrictedInfo, setRestrictedInfo] = useState<{ isRestricted: boolean; productName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  const totalSearchPrice = useMemo(() => {
    return results.reduce((sum, item) => sum + (item.promotionPrice ?? item.unitPrice ?? 0), 0);
  }, [results]);

  const budgetLimit = auth?.profile?.spendingLimit || 0;
  const isSearchOverBudget = budgetLimit > 0 && totalSearchPrice > budgetLimit;
  const overBudgetAmount = isSearchOverBudget ? totalSearchPrice - budgetLimit : 0;

  const handleAddAllToCart = async () => {
    if (results.length === 0) return;
    setIsAddingAll(true);
    let successCount = 0;
    try {
      for (const item of results) {
        await CartService.addItem(item.productId, 1);
        successCount++;
      }
      ToastAndroid.show(`Đã thêm ${successCount} sản phẩm vào giỏ hàng`, ToastAndroid.SHORT);
      if (auth?.profile?.memberId) {
        const cartData = await CartService.getCart();
        setCartCount(cartData.items.reduce((sum: number, item: any) => sum + item.quantity, 0));
      }
    } catch (e: any) {
      ToastAndroid.show(`Lỗi khi thêm: ${e.message}`, ToastAndroid.LONG);
    } finally {
      setIsAddingAll(false);
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      console.log(`[SearchScreenMain] Bắt đầu tìm kiếm với Query: "${searchQuery}", Mode: "${mode}", MemberId: ${auth?.profile?.memberId || 'N/A'}`);
      setLoading(true);
      setError(null);
      setRestrictedInfo(null);
      try {
        const isPersonal = mode === 'personal';
        const intent = SearchService.classifyIntent(searchQuery as string);
        let searchResults: any = {
          query: searchQuery as string,
          totalMatches: 0,
          results: [],
          aiRanked: false,
          aiExplanation: null,
        };

        let userAllergies: string[] = [];
        let userAvoids: string[] = [];
        let userDiets: string[] = [];
        let userSpendingLimit: number = auth?.profile?.spendingLimit || 0;

        if (isPersonal) {
          try {
            const prefs = await PersonalizationService.getHealthPreferences();
            if (Array.isArray(prefs?.allergies)) {
              userAllergies = prefs.allergies.map((p: any) => (p.tagName || '').toLowerCase());
            }
            if (Array.isArray(prefs?.avoids)) {
              userAvoids = prefs.avoids.map((p: any) => (p.tagName || '').toLowerCase());
            }
            if (Array.isArray(prefs?.preferreds)) {
              userDiets = prefs.preferreds.map((p: any) => (p.tagName || '').toLowerCase());
            }
          } catch (e) {
            console.warn('[SearchScreenMain] Lỗi lấy health preferences:', e);
          }
        }

        if (intent === 'recipe') {
          console.log(`[SearchScreenMain] Phát hiện ý định tìm công thức nấu ăn (Recipe AI)...`);
          let finalQuery = searchQuery as string;
          if (auth?.profile) {
            try {
              let notes: string[] = [];
              if (auth.profile.spendingLimit) {
                notes.push(`Ngân sách tối đa: ${auth.profile.spendingLimit.toLocaleString('vi-VN')}đ.`);
              }
              if (userDiets.length > 0 || userAllergies.length > 0 || userAvoids.length > 0) {
                notes.push(
                  `CỰC KỲ QUAN TRỌNG: Người dùng có Chế độ ăn: [${userDiets.join(', ')}] và Dị ứng/Tránh: [${[...userAllergies, ...userAvoids].join(', ')}]. BẮT BUỘC GIỮ NGUYÊN TẤT CẢ NGUYÊN LIỆU GỐC CỦA MÓN ĂN TRONG DANH SÁCH "ingredients" (Bao gồm Thịt/Sườn/Cá/Nước mắm). TUYỆT ĐỐI KHÔNG TỰ XÓA HAY BỎ BỚT SẢN PHẨM THỊT/CÁ KHỎI DANH SÁCH. Nếu nguyên liệu gốc vi phạm chế độ ăn hoặc dị ứng, CHỈ ĐẶT "isRestricted": true và đưa sản phẩm chay/an toàn thay thế vào "altName".`
                );
              }
              if (notes.length > 0) {
                finalQuery = `${finalQuery} (Lưu ý: ${notes.join(' | ')})`;
              }
            } catch (e) {
              console.warn('[SearchScreenMain] Lỗi profile:', e);
            }
          }

          const recipeData = await SearchService.recommendIngredients(finalQuery);
          if (recipeData && recipeData.ingredients) {
            searchResults.results = recipeData.ingredients.map((ing: any) => {
              let isRestricted = ing.isRestricted === true;
              let altName = ing.altName || null;
              let desc = ing.reason || ing.quantityText;

              if (desc && desc.startsWith('[VI PHẠM]')) {
                desc = desc.replace('[VI PHẠM]', '').trim();
              }

              // Kiểm tra an toàn bổ sung cho người dùng ăn chay
              const pNameLower = (ing.productName || '').toLowerCase();
              const isVeganUser = userDiets.some(d => d.includes('vegan') || d.includes('chay') || d.includes('vegetarian'));
              const isMeatOrFish = /(^|\s)(thịt|ba\s*chỉ|sườn|gà|bò|heo|cá|tôm|mực|chả|nước\s*mắm)(\s|$|[.,])/i.test(pNameLower);

              if (isPersonal && isVeganUser && isMeatOrFish) {
                isRestricted = true;
                if (!altName || altName === 'null' || altName === 'Không có sản phẩm thay thế') {
                  if (pNameLower.includes('nước mắm')) {
                    altName = 'Nước Tương Chin-su Tỏi Ớt 330ml';
                  } else {
                    altName = 'Đậu Hũ Non Hộp 220g';
                  }
                }
              }

              return {
                productId: ing.productId,
                productName: ing.productName,
                description: desc,
                unitPrice: ing.unitPrice,
                promotionPrice: null,
                imageUrl: ing.imageUrl,
                status: 'instock',
                categoryName: 'Nguyên liệu gợi ý',
                subcategoryName: null,
                productTypeName: null,
                healthTags: [],
                isRestricted: isPersonal ? isRestricted : false,
                isOverBudget: isPersonal ? (ing.isOverBudget || false) : false,
                altName: isPersonal ? altName : null,
              };
            });
            searchResults.totalMatches = recipeData.ingredients.length;
            searchResults.aiRanked = true;
            searchResults.aiExplanation = 'Đây là các nguyên liệu AI đề xuất cho món ăn của bạn.';
          }
        } else if (isPersonal) {
          // Tìm kiếm từ khóa sản phẩm cá nhân hóa
          const activeSortBy = (sortBy as string) || 'relevance';
          searchResults = await SearchService.searchPersonalized({
            q: searchQuery as string,
            sortBy: activeSortBy,
            useAi: false,
          });
        } else {
          // Tìm kiếm tất cả thông thường (KHÔNG dùng AI, KHÔNG gắn tag cá nhân)
          const activeSortBy = (sortBy as string) || 'relevance';
          searchResults = await SearchService.searchAll({
            q: searchQuery as string,
            sortBy: activeSortBy,
            useAi: false,
          });
        }

        const rawList = searchResults.results || [];
        const inStockResults = rawList.filter(
          (r: any) =>
            !r.status ||
            r.status.toLowerCase() === 'instock' ||
            r.status.toLowerCase() === 'available' ||
            r.status.toLowerCase() === 'active'
        );

        // Xử lý gắn Tag Vi phạm / Ngân sách theo chế độ Tìm kiếm
        const processedResults = inStockResults.map((r: any) => {
          if (!isPersonal) {
            // Tìm tất cả: Bỏ hết các tag cảnh báo cá nhân
            return {
              ...r,
              isRestricted: false,
              isOverBudget: false,
              altName: null,
            };
          }

          // 1. Kiểm tra HealthTags có sẵn trong DB
          const productHealthTags = Array.isArray(r.healthTags)
            ? r.healthTags.map((t: any) => (typeof t === 'string' ? t : t.tagName || '').toLowerCase())
            : [];
          const hasTagConflict = productHealthTags.some((tag: string) =>
            userAllergies.some(a => tag.includes(a) || a.includes(tag)) ||
            userAvoids.some(a => tag.includes(a) || a.includes(tag))
          );

          // 2. Kiểm tra Keyword & Alias từ tên/mô tả/danh mục sản phẩm nếu DB chưa gắn healthTags đầy đủ
          const fullNameText = `${r.productName || ''} ${r.description || ''} ${r.categoryName || ''} ${r.subcategoryName || ''} ${r.productTypeName || ''}`.toLowerCase();
          
          const ALLERGY_ALIASES: Record<string, string[]> = {
            'sữa': ['sữa', 'milk', 'yogurt', 'phô mai', 'cheese', 'bơ', 'butter', 'cream', 'kem', 'lactose', 'whey'],
            'sữa tươi': ['sữa', 'sữa tươi', 'milk', 'fresh milk'],
            'đậu nành': ['đậu nành', 'soy', 'soya', 'tofu', 'đậu hũ'],
            'đậu phộng': ['đậu phộng', 'lạc', 'peanut'],
            'hạt': ['hạt', 'nut', 'almond', 'óc chó', 'hạt dẻ', 'cashew', 'macca'],
            'các loại hạt': ['hạt', 'nut', 'almond', 'óc chó', 'hạt dẻ', 'cashew', 'macca'],
            'gluten': ['gluten', 'lúa mì', 'wheat', 'bột mì'],
            'hải sản': ['hải sản', 'tôm', 'cua', 'ốc', 'sò', 'mực', 'seafood', 'shrimp', 'crab'],
            'hải sản có vỏ': ['hải sản', 'tôm', 'cua', 'ốc', 'sò', 'seafood', 'shrimp', 'crab'],
            'trứng': ['trứng', 'egg'],
          };

          let matchedAllergy = userAllergies.find(allergy => {
            const clean = allergy.replace(/dị\s*ứng/gi, '').trim().toLowerCase();
            if (clean.length <= 1) return false;
            if (fullNameText.includes(clean)) return true;
            const aliases = ALLERGY_ALIASES[clean] || [];
            return aliases.some(alias => fullNameText.includes(alias));
          });
          if (!matchedAllergy) {
            matchedAllergy = userAvoids.find(avoid => {
              const clean = avoid.replace(/tránh/gi, '').trim().toLowerCase();
              if (clean.length <= 1) return false;
              if (fullNameText.includes(clean)) return true;
              const aliases = ALLERGY_ALIASES[clean] || [];
              return aliases.some(alias => fullNameText.includes(alias));
            });
          }

          const hasKeywordConflict = !!matchedAllergy;
          const isAllergyConflict = hasTagConflict || hasKeywordConflict;

          // 3. Kiểm tra Chế độ ăn (Diet) như Vegan / Ăn chay / Vegetarian
          const productNameOnly = (r.productName || '').toLowerCase();
          const isExplicitVegan = /(^|\s)(gạo|nước\s*tương|đậu\s*hũ|đậu\s*phụ|chay|nấm|thực\s*vật|rau|củ|quả|trái|dầu\s*ăn|đường|muối|tiêu|bột)(\s|$|[.,])/i.test(productNameOnly);
          const isVeganUser = userDiets.some(d => d.includes('vegan') || d.includes('chay') || d.includes('vegetarian'));
          const isMeatOrFish = !isExplicitVegan && /(^|\s)(thịt|ba\s*chỉ|sườn|gà|bò|heo|cá|tôm|mực|chả|nước\s*mắm)(\s|$|[.,])/i.test(productNameOnly);
          const isDietConflict = isVeganUser && isMeatOrFish;

          const isRestricted = r.isRestricted || isAllergyConflict || isDietConflict;
          const isOverBudget = userSpendingLimit > 0 && (r.promotionPrice ?? r.unitPrice ?? 0) > userSpendingLimit;

          let restrictionLabel = r.restrictionLabel;
          if (!restrictionLabel || restrictionLabel === '⚠️ VI PHẠM CHẾ ĐỘ ĂN') {
            if (isAllergyConflict) {
              const allergyName = matchedAllergy 
                ? matchedAllergy.replace(/dị\s*ứng/gi, '').trim() 
                : (userAllergies[0] ? userAllergies[0].replace(/dị\s*ứng/gi, '').trim() : 'sản phẩm');
              restrictionLabel = `⚠️ DỊ ỨNG ${allergyName.toUpperCase()}`;
            } else if (isDietConflict || isRestricted) {
              restrictionLabel = '⚠️ VI PHẠM CHẾ ĐỘ ĂN';
            }
          }

          let altName = r.altName;
          if (isRestricted && (!altName || altName === 'null' || altName === 'Không có sản phẩm thay thế')) {
            if (productNameOnly.includes('nước mắm')) {
              altName = 'Nước Tương Chin-su Tỏi Ớt 330ml';
            } else if (isMeatOrFish) {
              altName = 'Đậu Hũ Non Hộp 220g';
            }
          }

          return {
            ...r,
            isRestricted,
            restrictionLabel,
            isOverBudget: r.isOverBudget || isOverBudget,
            altName,
          };
        });

        if (activeSortBy === 'price_asc' && userSpendingLimit > 0) {
          processedResults = processedResults.filter(r => !r.isOverBudget);
        }

        setResults(processedResults);
        setAiRanked(searchResults.aiRanked || false);
        setAiExplanation(searchResults.aiExplanation || null);

        let products: ProductDto[] = [];
        try {
          if (isPersonal) {
            products = (await PersonalizationService.getPersonalizedProducts()) as any;
          } else {
            products = await ProductService.getProducts();
          }
        } catch (e) {
          products = await ProductService.getProducts();
        }

        setAiSuggestions(products.slice(0, 3));
      } catch (err: any) {
        console.error('[SearchScreenMain] Lỗi tìm kiếm:', err);
        setError(err.message || 'Có lỗi xảy ra khi tìm kiếm');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, mode, sortBy, auth?.profile?.memberId]);

  const getTagStyle = (type: string) => {
    switch (type) {
      case 'suggest': return { bg: '#D1FAE5', text: '#059669' };
      case 'discount': return { bg: '#FFF7ED', text: '#EA580C' };
      case 'organic': return { bg: '#F3F4F6', text: '#4B5563' };
      case 'popular': return { bg: '#D1FAE5', text: '#059669' };
      case 'danger': return { bg: '#FEF2F2', text: '#DC2626' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const mappedResults = results.map((item) => {
    const tags: { text: string; type: string }[] = [];
    if (item.healthTags && item.healthTags.length > 0) {
      item.healthTags.slice(0, 2).forEach((t) => tags.push({ text: t.toUpperCase(), type: 'organic' }));
    }
    if (item.promotionPrice && item.promotionPrice < item.unitPrice) {
      tags.push({ text: 'GIẢM GIÁ', type: 'discount' });
    }
    if (tags.length === 0) {
      const isAvailable = !item.status || item.status.toLowerCase() === 'instock' || item.status.toLowerCase() === 'available' || item.status.toLowerCase() === 'active';
      tags.push({ text: isAvailable ? 'CÒN HÀNG' : 'HẾT HÀNG', type: 'popular' });
    }

    const currentPrice = item.promotionPrice ?? item.unitPrice ?? 0;
    const price = `${currentPrice.toLocaleString('vi-VN')}đ`;
    const isOverBudget = item.isOverBudget || (auth?.profile?.spendingLimit ? auth.profile.spendingLimit > 0 && currentPrice > auth.profile.spendingLimit : false);

    const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';

    return {
      id: item.productId.toString(),
      title: fixMojibake(item.productName),
      image: item.imageUrl || fallbackImage,
      tags,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 80) + 20,
      price,
      isRestricted: item.isRestricted,
      restrictionLabel: item.restrictionLabel,
      isOverBudget,
      altName: item.altName,
      categoryName: item.categoryName,
      subcategoryName: item.subcategoryName,
    };
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>
            {mode === 'personal' ? 'TÌM KIẾM CÁ NHÂN HÓA' : 'TÌM KIẾM TẤT CẢ'}
          </Text>
          <Text style={styles.headerTitle}>{searchQuery}</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
          <ShoppingBag color="#059669" size={20} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color="#059669" size="large" />
            <Text style={styles.loadingText}>Đang tìm kiếm nguyên liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                // Trigger refetch by resetting states if needed, but useEffect handles query changes
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Results Info */}
            <Animated.View entering={FadeInDown.delay(150)} style={styles.resultsInfo}>
              <Text style={styles.resultsTitle}>Kết quả phù hợp</Text>
              <Text style={styles.resultsCount}>{mappedResults.length} sản phẩm</Text>
            </Animated.View>

            {mappedResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào phù hợp.</Text>
              </View>
            ) : mappedResults.length > 0 ? (
              /* Product List */
              <View style={styles.productList}>
                {mappedResults.map((product, index) => (
                  <SearchResultItem 
                    key={product.id}
                    product={product}
                    index={index}
                    getTagStyle={getTagStyle}
                    setCartCount={setCartCount}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}

        {/* AI Suggestions */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBox}>
              <Zap color="white" size={16} fill="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiTitle}>
                Gợi ý dành cho bạn
              </Text>
              <Text style={styles.aiSubtitle}>
                Lựa chọn thay thế tốt cho sức khỏe
              </Text>
            </View>
          </View>

          {aiSuggestions.length >= 3 && (
            <View style={styles.aiGrid}>
              {/* Large Card */}
              <View style={styles.aiLargeCard}>
                <View style={styles.aiLargeImageContainer}>
                  <Image source={{ uri: aiSuggestions[0].imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' }} style={styles.aiLargeImage} />
                </View>
                <View style={styles.aiLargeContent}>
                  <View style={styles.aiTag}>
                    <Star color="#EA580C" size={12} fill="#EA580C" style={{ marginRight: 4 }} />
                    <Text style={styles.aiTagText}>Đề xuất AI</Text>
                  </View>
                  <Text style={styles.aiLargeTitle}>{fixMojibake(aiSuggestions[0].productName)}</Text>
                  <Text style={styles.aiLargeDesc}>Sản phẩm thay thế tuyệt vời từ cửa hàng.</Text>
                  <View style={styles.aiPriceRow}>
                    <Text style={styles.aiLargePrice}>{aiSuggestions[0].unitPrice.toLocaleString('vi-VN')}đ</Text>
                    <TouchableOpacity style={styles.aiArrowButton} onPress={() => router.push({ pathname: '/product', params: { id: aiSuggestions[0].productId } })}>
                      <ArrowRight color="white" size={16} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Small Cards */}
              <View style={styles.aiSmallCardsRow}>
                {aiSuggestions.slice(1, 3).map((item) => (
                  <TouchableOpacity key={item.productId} style={styles.aiSmallCard} onPress={() => router.push({ pathname: '/product', params: { id: item.productId } })}>
                    <Image source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' }} style={styles.aiSmallImage} />
                    <Text style={styles.aiSmallTitle} numberOfLines={1}>{fixMojibake(item.productName)}</Text>
                    <Text style={styles.aiSmallDesc} numberOfLines={2}>Phù hợp với nhu cầu của bạn.</Text>
                    <Text style={styles.aiSmallPrice}>{item.unitPrice.toLocaleString('vi-VN')}đ</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      {results.length > 0 && !loading && !error && (
        <Animated.View entering={FadeInDown.delay(200)} style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.stickyContent}>
            <View style={styles.stickyTextContainer}>
              <Text style={styles.stickyTotalLabel}>TỔNG ĐƠN HÀNG</Text>
              <Text style={styles.stickyTotalPrice}>{totalSearchPrice.toLocaleString('vi-VN')}đ</Text>
              {isSearchOverBudget && (
                <Text style={styles.stickyBudgetWarning}>
                  ⚠️ Vượt ngân sách: {overBudgetAmount.toLocaleString('vi-VN')}đ
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.stickyAddAllButton, isAddingAll && { opacity: 0.7 }]} 
              onPress={handleAddAllToCart}
              disabled={isAddingAll}
            >
              {isAddingAll ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.stickyAddAllText}>Thêm tất cả</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

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
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTextActive: {
    color: 'white',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  resultsCount: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginLeft: 4,
  },
  reviewText: {
    color: '#94A3B8',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  aiSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  aiGrid: {
    gap: 12,
  },
  aiLargeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  aiLargeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  aiLargeImage: {
    width: '100%',
    height: '100%',
  },
  aiLargeContent: {
    flex: 1,
    marginLeft: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  aiLargeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  aiLargeDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 16,
  },
  aiPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  aiLargePrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  aiArrowButton: {
    backgroundColor: '#22C55E',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSmallCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  aiSmallCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiSmallImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  aiSmallTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  aiSmallDesc: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
    height: 28,
  },
  aiSmallPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    height: 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navCenterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#059669',
  },
  centerContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  aiExplanationCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiExplanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiExplanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  aiExplanationText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  allergyCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  allergyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  allergyText: {
    fontSize: 13,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  allergyBold: {
    fontWeight: '800',
    color: '#DC2626',
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  stickyTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  stickyTotalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },
  stickyBudgetWarning: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginTop: 2,
  },
  stickyAddAllButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  stickyAddAllText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
