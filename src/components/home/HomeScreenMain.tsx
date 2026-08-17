import Voice from '@react-native-voice/voice';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AlertTriangle, Bell, Bot, CheckCircle2, Home, Lock, Map, Mic, Plus, Search, ShoppingBag, ShoppingCart, Sparkles, User, X, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Modal, PermissionsAndroid, Platform, Animated as RNAnimated, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { CartService } from '../../services/CartService';
import { MealSuggestionService, MenuAssistantResponseDto } from '../../services/MealSuggestionService';
import { MemberAdService, SponsoredRecommendationDto } from '../../services/MemberAdService';
import { PersonalizationService, RecipeDto } from '../../services/PersonalizationService';
import { ProductDto, ProductService } from '../../services/ProductService';
import { RobotService } from '../../services/RobotService';
import { SearchService } from '../../services/SearchService';
import { fixMojibake } from '../../utils/textUtils';
const cleanSearchQuery = (query: string): string => {
  if (!query) return '';
  let cleaned = query.trim();
  const lower = cleaned.toLowerCase();
  const prefixes = [
    'tôi muốn mua',
    'tôi muốn tìm',
    'tìm cho tôi',
    'mua cho tôi',
    'tìm kiếm',
    'cho tôi',
    'tôi cần',
    'bán cho',
    'kiếm',
    'tìm',
    'mua',
    'có'
  ];
  for (const prefix of prefixes) {
    if (lower.startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  const suffixes = [' không', ' nhé', ' nha', ' ạ', ' với'];
  for (const suffix of suffixes) {
    if (cleaned.toLowerCase().endsWith(suffix)) {
      cleaned = cleaned.substring(0, cleaned.length - suffix.length).trim();
    }
  }
  return cleaned || query;
};

const getGreetingText = () => {
  const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const today = new Date();
  const dayName = dayNames[today.getDay()];

  const greetings = [
    'vui vẻ',
    'ngập tràn niềm vui',
    'tràn đầy năng lượng',
    'bình an',
    'may mắn',
    'hạnh phúc',
    'ấm áp'
  ];
  const greetingText = greetings[today.getDay()];

  return `${dayName} ${greetingText}`;
};

const { width, height } = Dimensions.get('window');

// Data Mocks cho các phần khác (giữ nguyên AI recommend dummy)

const getTierTheme = (tier: string) => {
  switch (tier) {
    case 'PREMIUM':
      return {
        gradient: ['#FEFCE8', '#FEF08A'] as const, // Vàng (Gold style for Premium)
        border: '#FDE047',
        iconBg: '#FEF08A',
        iconColor: '#A16207',
        badgeText: 'PREMIUM',
        badgeBg: '#EAB308'
      };
    default:
      return {
        gradient: ['#F3F4F6', '#E5E7EB'] as const, // Mặc định Medium
        border: '#D1D5DB',
        iconBg: '#E5E7EB',
        iconColor: '#4B5563',
        badgeText: 'MEDIUM',
        badgeBg: '#6B7280'
      };
  }
};

export default function HomeScreenMain() {
  const [searchMode, setSearchMode] = useState<'personal' | 'all'>('personal');
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [meals, setMeals] = useState<RecipeDto[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const router = useRouter();
  const { profile, refreshProfile } = useAuth();
  const { unreadCount } = useNotification();
  const userTier = (profile?.membershipTier || 'MEDIUM').toUpperCase();
  const tierTheme = getTierTheme(userTier);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkUpgrade = async () => {
      if (!profile?.membershipTier) return;
      const lastTier = await SecureStore.getItemAsync('lastKnownTier');

      if ((userTier === 'PREMIUM') && lastTier && lastTier !== 'PREMIUM') {
        Alert.alert(
          "🎉 Chúc mừng!",
          "Tài khoản của bạn đã được nâng cấp hạng thành viên cao cấp.\n\nĐã mở khóa tính năng Tìm kiếm cá nhân hóa, gợi ý món ăn bằng AI và nhiều đặc quyền khác!",
          [{ text: "Khám phá ngay" }]
        );
      }

      if (userTier !== lastTier) {
        await SecureStore.setItemAsync('lastKnownTier', userTier);
      }
    };
    checkUpgrade();
  }, [userTier, profile?.membershipTier]);

  // Recipe Assistant Modal states
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const [recipeModalVisible, setRecipeModalVisible] = useState(false);
  const [portions, setPortions] = useState(2);
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const [assistantData, setAssistantData] = useState<MenuAssistantResponseDto | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedRobotName, setSelectedRobotName] = useState<string | null>(null);
  const [selectedRobotCode, setSelectedRobotCode] = useState<string | null>(null);
  const [robotBattery, setRobotBattery] = useState<number | null>(null);
  const [robotStatus, setRobotStatus] = useState<string | null>(null);
  const [sponsoredAds, setSponsoredAds] = useState<SponsoredRecommendationDto[]>([]);
  const [systemDeals, setSystemDeals] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const pulseAnim = React.useRef(new RNAnimated.Value(1)).current;

  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    try {
      Voice.removeAllListeners();
      Voice.onSpeechStart = () => { if (isMounted.current) setIsListening(true); };
      Voice.onSpeechEnd = () => { if (isMounted.current) setIsListening(false); };
      Voice.onSpeechPartialResults = (e) => {
        if (isMounted.current && e.value && e.value.length > 0) {
          setVoiceText(e.value[0]);
        }
      };
      Voice.onSpeechResults = (e) => {
        if (isMounted.current && e.value && e.value.length > 0) {
          const resultText = e.value[0];
          if (/[\u4e00-\u9fa5]/.test(resultText)) {
            console.warn('Chinese noise ignored');
            return;
          }
          setVoiceText(resultText);
          setTimeout(() => {
            if (isMounted.current) {
              setIsListening(false);
              const cleanedQuery = cleanSearchQuery(resultText);
              if (cleanedQuery) {
                router.push({ pathname: '/search', params: { query: cleanedQuery, mode: searchMode } });
              }
            }
          }, 1000);
        }
      };
      Voice.onSpeechError = (e) => {
        if (isMounted.current) {
          setIsListening(false);
          ToastAndroid.show('Không thể nhận diện giọng nói', ToastAndroid.SHORT);
        }
      };
    } catch (err) {
      console.warn("Voice module not available yet", err);
    }
    return () => {
      isMounted.current = false;
      try {
        Voice.destroy().then(() => Voice.removeAllListeners());
      } catch (err) { }
    };
  }, [searchMode]);

  useEffect(() => {
    if (isListening) {
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
          RNAnimated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = async () => {
    try {
      setVoiceText('');
      setIsListening(true);
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền truy cập Micro',
            message: 'Ứng dụng cần sử dụng micro để tìm kiếm bằng giọng nói.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Cho phép',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          ToastAndroid.show('Quyền micro bị từ chối, chuyển sang giọng nói mô phỏng', ToastAndroid.SHORT);
          setTimeout(() => setVoiceText('Sữa chua không đường'), 1500);
          setTimeout(() => {
            setIsListening(false);
            router.push({ pathname: '/search', params: { query: 'Sữa chua không đường', mode: searchMode } });
          }, 3000);
          return;
        }
      }
      try {
        await Voice.cancel();
        await Voice.destroy();
      } catch (err) { }

      const isAvailable = await Voice.isAvailable().catch(() => false);
      if (!isAvailable) {
        ToastAndroid.show('Mô phỏng Voice (Thiết bị dùng MI AI không hỗ trợ vi-VN)', ToastAndroid.SHORT);
        setTimeout(() => setVoiceText('Sữa chua không đường'), 1500);
        setTimeout(() => {
          if (isMounted.current) {
            setIsListening(false);
            router.push({ pathname: '/search', params: { query: 'Sữa chua không đường', mode: searchMode } });
          }
        }, 3000);
        return;
      }

      await Voice.start('vi-VN');
    } catch (e) {
      console.error(e);
      ToastAndroid.show('Mô phỏng Voice (chưa link native module)', ToastAndroid.SHORT);
      setTimeout(() => setVoiceText('Sữa chua không đường'), 2000);
      setTimeout(() => {
        setIsListening(false);
        router.push({ pathname: '/search', params: { query: 'Sữa chua không đường', mode: searchMode } });
      }, 3500);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Voice.stop();
      await Voice.destroy();
      if (voiceText) {
        const cleaned = cleanSearchQuery(voiceText);
        router.push({ pathname: '/search', params: { query: cleaned, mode: searchMode } });
      }
    } catch (e) {
      setIsListening(false);
    }
  };

  const openRecipeAssistant = (recipe: any) => {
    setSelectedRecipe(recipe);
    setPortions(recipe.yieldPortions || 2);
    setRecipeModalVisible(true);
    loadMenuAssistant(recipe.recipeId, recipe.yieldPortions || 2, recipe.recipeName, recipe);
  };

  const loadMenuAssistant = async (recipeId: number, portionsCount: number, fallbackRecipeName?: string, currentRecipe?: any) => {
    try {
      setLoadingAssistant(true);
      const data = await MealSuggestionService.getMenuAssistant(recipeId, portionsCount);

      // Nếu không có nguyên liệu, ưu tiên dùng nguyên liệu đã được AI sinh từ trước
      if (!data.ingredients || data.ingredients.length === 0) {
        const recipeToUse = currentRecipe || selectedRecipe;
        if (recipeToUse && recipeToUse.ingredients && recipeToUse.ingredients.length > 0) {
          const basePortions = recipeToUse.yieldPortions || 2;
          data.ingredients = recipeToUse.ingredients.map((ing: any) => ({
            ...ing,
            quantityRequired: (ing.quantityRequired / basePortions) * portionsCount
          }));
          data.estimatedTotalCost = data.ingredients.reduce((sum: number, ing: any) => sum + (ing.unitPrice * ing.quantityRequired), 0);
        } else {
          // Fallback gọi AI (chỉ khi thực sự chưa có nguyên liệu)
          const rName = fallbackRecipeName || recipeToUse?.recipeName;
          if (rName) {
            let aiQuery = rName;
            try {
              const prefs = await PersonalizationService.getHealthPreferences();
              const diets = Array.isArray(prefs?.preferreds) ? prefs.preferreds.map((p: any) => p.tagName) : [];
              const allergiesList = [
                ...(Array.isArray(prefs?.allergies) ? prefs.allergies : []),
                ...(Array.isArray(prefs?.avoids) ? prefs.avoids : [])
              ];
              const allergies = allergiesList.map((p: any) => p.tagName);
              if (diets.length > 0 || allergies.length > 0) {
                aiQuery += ` (HƯỚNG DẪN 2 BƯỚC: Bước 1: Liệt kê ĐẦY ĐỦ nguyên liệu GỐC chuẩn truyền thống (không tự ý bỏ thịt/cá nếu món gốc có). Bước 2: Kiểm tra danh sách với Chế độ ăn: [${diets.join(', ')}] / Dị ứng: [${allergies.join(', ')}]. NẾU nguyên liệu gốc VI PHẠM, hãy set "isRestricted": true và điền tên sản phẩm chay/an toàn thay thế vào "altName". Nếu an toàn thì set "isRestricted": false và "altName": null.)`;
              }
            } catch (e) {
              console.warn('Lỗi lấy prefs:', e);
            }

            const aiData = await SearchService.recommendIngredients(aiQuery);
            if (aiData && aiData.ingredients && aiData.ingredients.length > 0) {
              data.ingredients = aiData.ingredients.map((ing: any) => {
                let isRestricted = ing.isRestricted === true;
                let altName = ing.altName || null;
                let desc = ing.reason || ing.quantityText;

                return {
                  productId: ing.productId,
                  productName: ing.productName,
                  unitPrice: ing.unitPrice,
                  imageUrl: ing.imageUrl,
                  quantityRequired: ing.quantity * (portionsCount / (recipeToUse?.yieldPortions || 2)),
                  unitOfMeasure: ing.quantityText || 'phần',
                  inStock: true,
                  currentStock: 10,
                  isRestricted,
                  altName,
                  description: desc
                };
              });
              data.estimatedTotalCost = data.ingredients.reduce((sum: number, ing: any) => sum + (ing.unitPrice * ing.quantityRequired), 0);
            }
          }
        }
      }

      setAssistantData(data);
    } catch (e) {
      console.error('Error fetching recipe assistant details:', e);
      ToastAndroid.show('Không thể tải thông tin công thức', ToastAndroid.SHORT);
    } finally {
      setLoadingAssistant(false);
    }
  };

  const changePortions = (delta: number) => {
    if (!selectedRecipe) return;
    const newPortions = Math.max(1, Math.min(20, portions + delta));
    setPortions(newPortions);
    loadMenuAssistant(selectedRecipe.recipeId, newPortions, selectedRecipe.recipeName);
  };

  const handleAddAllIngredientsToCart = async () => {
    if (!assistantData || !assistantData.ingredients) return;
    const inStockItems = assistantData.ingredients.filter(ing => ing.inStock);
    if (inStockItems.length === 0) {
      Alert.alert('Thông báo', 'Tất cả nguyên liệu cần thiết cho món ăn này hiện tại đều đã hết hàng.');
      return;
    }

    try {
      setAddingToCart(true);
      // Add all available items in parallel
      await Promise.all(inStockItems.map(item => CartService.addItem(item.productId, Math.ceil(item.quantityRequired))));

      setRecipeModalVisible(false);

      Alert.alert(
        'Đã thêm vào giỏ hàng',
        `Đã thêm thành công ${inStockItems.length} nguyên liệu có sẵn vào giỏ hàng! Bạn có muốn mở Bản đồ Siêu thị để Robot dẫn đường đi gom đồ không?`,
        [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Đồng ý',
            onPress: () => {
              const mockInvoice = {
                items: inStockItems.map(i => ({ productName: i.productName })),
                totalPrice: assistantData.estimatedTotalCost
              };
              const nodeIdsStr = assistantData.optimizedShoppingRoute ? assistantData.optimizedShoppingRoute.join(',') : '';

              router.push({
                pathname: '/map',
                params: {
                  invoice: JSON.stringify(mockInvoice),
                  nodeIds: nodeIdsStr
                }
              });
            }
          }
        ]
      );
    } catch (e: any) {
      console.error('Error adding ingredients to cart:', e);
      Alert.alert('Thất bại', e.message || 'Có lỗi xảy ra khi thêm nguyên liệu vào giỏ hàng.');
    } finally {
      setAddingToCart(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkConnectedRobot();
      refreshProfile();
      fetchProducts();
      fetchSponsoredAds();
      fetchCartTotal();
    }, [searchMode])
  );

  const fetchCartTotal = async () => {
    try {
      const cart = await CartService.getCart();
      setCartTotal(cart.totalPrice || 0);
    } catch (e) {
      console.warn('Error fetching cart total:', e);
    }
  };

  const checkConnectedRobot = async () => {
    try {
      const code = await SecureStore.getItemAsync('selectedRobotCode');
      const name = await SecureStore.getItemAsync('selectedRobotName');
      setSelectedRobotCode(code);
      setSelectedRobotName(name);

      if (code) {
        // Fetch current robot status to get latest battery and status
        const robots = await RobotService.getRobots();
        const curRobot = robots.find(r => r.robotCode === code);
        if (curRobot) {
          setRobotBattery(curRobot.batteryPct);
          setRobotStatus(curRobot.status);
        }
      } else {
        setRobotBattery(null);
        setRobotStatus(null);
      }
    } catch (e) {
      console.warn('Error checking connected robot:', e);
    }
  };

  const fetchSponsoredAds = async () => {
    try {
      setLoadingAds(true);
      if (profile?.memberId) {
        const ads = await MemberAdService.getSponsoredRecommendations(profile.memberId as number);
        setSponsoredAds(ads);

        const deals = await ProductService.getDeals(profile.memberId as number);
        setSystemDeals(deals);
      } else {
        const deals = await ProductService.getDeals();
        setSystemDeals(deals);
      }
    } catch (e) {
      console.warn('Failed to fetch sponsored ads or deals:', e);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      let data;
      if (searchMode === 'personal') {
        data = await PersonalizationService.getPersonalizedProducts();
      } else {
        data = await ProductService.getProducts();
      }
      setProducts(data as any);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (searchMode === 'personal') {
        const fallbackData = await ProductService.getProducts();
        setProducts(fallbackData);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchMeals = async () => {
    if (userTier !== 'PREMIUM') {
      setLoadingMeals(false);
      return;
    }
    try {
      setLoadingMeals(true);
      const data = await PersonalizationService.getPersonalizedMeals();

      const mealsWithIngredients = await Promise.all(
        data.map(async (meal: any) => {
          try {
            const assistantData = await MealSuggestionService.getMenuAssistant(meal.recipeId, meal.yieldPortions || 2);
            let finalIngredients = assistantData.ingredients || [];
            let estCost = assistantData.estimatedTotalCost || 0;

            if (finalIngredients.length === 0) {
              let aiQuery = meal.recipeName;
              try {
                const prefs = await PersonalizationService.getHealthPreferences();
                const diets = Array.isArray(prefs?.preferreds) ? prefs.preferreds.map((p: any) => p.tagName) : [];
                const allergiesList = [
                  ...(Array.isArray(prefs?.allergies) ? prefs.allergies : []),
                  ...(Array.isArray(prefs?.avoids) ? prefs.avoids : [])
                ];
                const allergies = allergiesList.map((p: any) => p.tagName);
                if (diets.length > 0 || allergies.length > 0) {
                  aiQuery += ` (HƯỚNG DẪN 2 BƯỚC: Bước 1: Liệt kê ĐẦY ĐỦ nguyên liệu GỐC chuẩn truyền thống (không tự ý bỏ thịt/cá nếu món gốc có). Bước 2: Kiểm tra danh sách với Chế độ ăn: [${diets.join(', ')}] / Dị ứng: [${allergies.join(', ')}]. NẾU nguyên liệu gốc VI PHẠM, hãy set "isRestricted": true và điền tên sản phẩm chay/an toàn thay thế vào "altName". Nếu an toàn thì set "isRestricted": false và "altName": null.)`;
                }
              } catch (e) {
                console.warn('Lỗi lấy prefs:', e);
              }

              const aiData = await SearchService.recommendIngredients(aiQuery);
              if (aiData && aiData.ingredients && aiData.ingredients.length > 0) {
                finalIngredients = aiData.ingredients.map((ing: any) => {
                  let isRestricted = ing.isRestricted === true;
                  let altName = ing.altName || null;
                  let desc = ing.reason || ing.quantityText;

                  return {
                    productId: ing.productId,
                    productName: ing.productName,
                    unitPrice: ing.unitPrice,
                    imageUrl: ing.imageUrl,
                    quantityRequired: ing.quantity,
                    unitOfMeasure: ing.quantityText || 'phần',
                    inStock: true,
                    currentStock: 10,
                    isRestricted,
                    altName,
                    description: desc
                  };
                });
                estCost = finalIngredients.reduce((sum: number, ing: any) => sum + (ing.unitPrice * ing.quantityRequired), 0);
              }
            }
            return { ...meal, ingredients: finalIngredients, estimatedTotalCost: estCost };
          } catch (e) {
            return { ...meal, ingredients: [] };
          }
        })
      );
      setMeals(mealsWithIngredients);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoadingMeals(false);
    }
  };

  const handleAddMealToCart = async (meal: any) => {
    if (!meal.ingredients || meal.ingredients.length === 0) {
      ToastAndroid.show('Đang tải nguyên liệu hoặc không có nguyên liệu', ToastAndroid.SHORT);
      return;
    }
    const inStockItems = meal.ingredients.filter((ing: any) => ing.inStock);
    if (inStockItems.length === 0) {
      ToastAndroid.show('Nguyên liệu đã hết hàng', ToastAndroid.SHORT);
      return;
    }

    try {
      setAddingToCart(true);
      await Promise.all(inStockItems.map((item: any) => CartService.addItem(item.productId, Math.ceil(item.quantityRequired))));
      ToastAndroid.show(`Đã thêm ${inStockItems.length} nguyên liệu vào giỏ hàng`, ToastAndroid.SHORT);
      fetchCartTotal();
    } catch (e: any) {
      ToastAndroid.show('Có lỗi xảy ra khi thêm vào giỏ hàng', ToastAndroid.SHORT);
    } finally {
      setAddingToCart(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeals();
    }, [])
  );

  const spendingLimit = profile?.spendingLimit || 0;
  const budgetPercentage = spendingLimit > 0 ? Math.min((cartTotal / spendingLimit) * 100, 100) : 0;
  const gaugeDashoffset = 251 - (251 * budgetPercentage) / 100;
  const isOverBudget = spendingLimit > 0 && cartTotal > spendingLimit;
  const remainingBudget = Math.max(spendingLimit - cartTotal, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.userInfo, { flex: 1, paddingRight: 12 }]} onPress={() => router.push('/profile')}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile?.avatarUrl || profile?.facePath || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }} style={styles.avatar} />
              <View style={[styles.badge, { backgroundColor: tierTheme.badgeBg }]}>
                <Text style={styles.badgeText}>{tierTheme.badgeText}</Text>
              </View>
            </View>
            <View style={[styles.greetingContainer, { flex: 1 }]}>
              <Text style={styles.greetingText} numberOfLines={1}>Chào {profile?.fullName ? profile.fullName.split(' ').pop() : 'bạn'}!</Text>
              <Text style={styles.subGreetingText} numberOfLines={1}>{getGreetingText()}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <Animated.View style={styles.iconButton} sharedTransitionTag="shared-bell-icon">
              <TouchableOpacity style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => router.push('/notifications')}>
                <Bell color="#4B5563" size={22} />
                {unreadCount > 0 && (
                  <View style={styles.notificationDot}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <User color="#4B5563" size={22} />
            </TouchableOpacity>
          </View>
        </View>



        {/* Search Section */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.searchSection}>
          <View style={styles.searchToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, searchMode === 'personal' && styles.toggleBtnActive]}
              onPress={() => {
                if (userTier === 'PREMIUM') {
                  setSearchMode('personal');
                } else {
                  Alert.alert(
                    "Tính năng khóa",
                    "Tìm kiếm cá nhân hóa chỉ dành cho thành viên Premium trở lên. Vui lòng nâng cấp tài khoản để sử dụng."
                  );
                }
              }}
              activeOpacity={0.8}
            >
              {searchMode === 'personal' ? (
                <CheckCircle2 color="white" size={16} style={{ marginRight: 6 }} />
              ) : (userTier !== 'PREMIUM') ? (
                <Lock color="#9CA3AF" size={14} style={{ marginRight: 4 }} />
              ) : null}
              <Text style={[styles.toggleBtnText, searchMode === 'personal' && styles.toggleBtnTextActive]}>Tìm cá nhân hóa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, searchMode === 'all' && styles.toggleBtnActive]}
              onPress={() => setSearchMode('all')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, searchMode === 'all' && styles.toggleBtnTextActive]}>Tìm tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
            <TextInput
              placeholder="Bạn đang tìm gì?"
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={(e) => {
                const query = e.nativeEvent.text;
                if (query.trim().length > 0) {
                  router.push({ pathname: '/search', params: { query, mode: searchMode } });
                }
              }}
            />
            <TouchableOpacity style={styles.actionIcon} onPress={startListening}>
              <Mic color="#059669" size={20} />
            </TouchableOpacity>

          </View>
        </Animated.View>

        {/* Personalization Notification Banner */}
        {searchMode === 'personal' && (
          <Animated.View entering={FadeInDown.delay(350)} style={{ backgroundColor: '#ECFDF5', padding: 12, marginHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Sparkles color="#059669" size={18} style={{ marginRight: 8 }} />
            <Text style={{ color: '#065F46', fontSize: 12, flex: 1, fontWeight: '500' }}>
              ✨ AI đã tự động loại bỏ các nguyên liệu bạn dị ứng và gợi ý theo đúng ngân sách, chế độ ăn của bạn!
            </Text>
          </Animated.View>
        )}

        {/* Smart Utilities */}
        <Animated.View entering={FadeInRight.delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tiện ích thông minh</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {/* Personalized Meals */}
            {userTier !== 'PREMIUM' ? (
              <View style={[styles.smartCard, { width: width * 0.85, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' }]}>
                <Sparkles color="#9CA3AF" size={32} style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#4B5563', marginBottom: 8 }}>Tính năng khóa</Text>
                <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                  Tiện ích cá nhân hóa đề xuất món ăn và nguyên liệu bằng AI chỉ dành cho thành viên Premium (chi tiêu trên 10,000,000đ).
                </Text>
              </View>
            ) : loadingMeals ? (
              <View style={[styles.smartCard, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="small" color="#059669" />
              </View>
            ) : meals.length > 0 ? (
              meals.map((meal) => (
                <View key={meal.recipeId} style={styles.smartCard}>
                  <View style={styles.smartCardImageWrapper}>
                    <Image source={{ uri: meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop' }} style={styles.smartCardImage} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.smartCardOverlay}>
                      <View style={styles.smartBadge}>
                        <Zap color="white" size={10} style={{ marginRight: 4 }} />
                        <Text style={styles.smartBadgeText} numberOfLines={1}>
                          Khớp {meal.matchScore}%
                        </Text>
                      </View>
                      <Text style={styles.smartCardTitle} numberOfLines={1}>{fixMojibake(meal.recipeName)}</Text>
                    </LinearGradient>
                  </View>
                  <View style={styles.smartCardFooter}>
                    <Text style={styles.smartCardDesc} numberOfLines={1}>
                      {fixMojibake(meal.matchReasons?.[0]) || `K.Phần: ${meal.yieldPortions} người • ${meal.calories ? meal.calories + ' kcal' : 'Ngon miệng'}`}
                    </Text>
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#374151', marginBottom: 4 }}>Nguyên liệu cần có:</Text>
                        <Text style={{ fontSize: 11, color: '#6B7280' }} numberOfLines={2}>
                          {meal.ingredients.map((ing: any, idx: number) => (
                            <Text key={idx} style={{ color: ing.isRestricted ? '#DC2626' : '#6B7280' }}>
                              {ing.productName}{ing.isRestricted ? ' (⚠️)' : ''}{idx < meal.ingredients!.length - 1 ? ', ' : ''}
                            </Text>
                          ))}
                        </Text>
                        {meal.estimatedTotalCost && (
                          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#059669', marginTop: 4 }}>
                            Dự tính: {meal.estimatedTotalCost.toLocaleString('vi-VN')} đ
                          </Text>
                        )}
                      </View>
                    )}
                    <View style={styles.smartCardActions}>
                      <TouchableOpacity style={[styles.btnSecondary, { flex: 1, alignItems: 'center', paddingHorizontal: 4 }]} onPress={() => openRecipeAssistant(meal)}>
                        <Text style={[styles.btnSecondaryText, { fontSize: 11 }]} numberOfLines={1}>Xem trước</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnPrimary, { flex: 1, flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 4 }, addingToCart && { opacity: 0.7 }]}
                        onPress={() => handleAddMealToCart(meal)}
                        disabled={addingToCart}
                      >
                        {addingToCart ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <ShoppingCart color="white" size={12} style={{ marginRight: 2 }} />
                            <Text style={[styles.btnPrimaryText, { fontSize: 11, flexShrink: 1 }]} numberOfLines={1}>Thêm vào giỏ</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.smartCard}>
                <View style={styles.smartCardImageWrapper}>
                  <Image source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop' }} style={styles.smartCardImage} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.smartCardOverlay}>
                    <View style={styles.smartBadge}>
                      <Text style={styles.smartBadgeText} numberOfLines={1}>Lập kế hoạch bữa ăn thông minh</Text>
                    </View>
                    <Text style={styles.smartCardTitle} numberOfLines={1}> Salad cá hồi sốt cam chanh</Text>
                  </LinearGradient>
                </View>
                <View style={styles.smartCardFooter}>
                  <Text style={styles.smartCardDesc}>
                    Ngân sách tối đa: {profile?.spendingLimit ? profile.spendingLimit.toLocaleString('vi-VN') + 'đ' : 'Chưa thiết lập'}
                  </Text>
                  <View style={styles.smartCardActions}>
                    <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/robots')}>
                      <Text style={styles.btnPrimaryText}>Xem lộ trình</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSecondary}>
                      <Text style={styles.btnSecondaryText}>Tối ưu</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}


          </ScrollView>
        </Animated.View>

        {/* Weekly Budget */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={styles.budgetTitle}>Chi tiêu tối đa</Text>
              <Text style={styles.budgetSubtitle}>Cập nhật 5 phút trước</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.budgetValue}>
                {spendingLimit > 0 ? `${cartTotal.toLocaleString('vi-VN')}đ / ${(spendingLimit / 1000000).toFixed(1)}tr vnđ` : 'Chưa thiết lập'}
              </Text>
              <View style={[styles.budgetStatusBadge, !spendingLimit && { backgroundColor: '#F3F4F6' }, isOverBudget && { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.budgetStatusText, !spendingLimit && { color: '#6B7280' }, isOverBudget && { color: '#DC2626' }]}>
                  {spendingLimit > 0 ? (isOverBudget ? 'Vượt ngân sách' : 'Vẫn trong ngân sách') : 'Thiết lập ngay'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.budgetGaugeContainer}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={200} height={100} viewBox="0 0 200 100">
                {/* Background arc */}
                <Circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251 251"
                  strokeDashoffset="0"
                />
                {/* Foreground arc (Dynamic) */}
                <Circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={isOverBudget ? "#DC2626" : "#059669"}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251 251"
                  strokeDashoffset={spendingLimit > 0 ? gaugeDashoffset : 251}
                />
              </Svg>
              <View style={styles.budgetGaugeTextContainer}>
                <Text style={[styles.budgetGaugeSpent, isOverBudget && { color: '#DC2626' }]}>{cartTotal.toLocaleString('vi-VN')}đ</Text>
                <Text style={styles.budgetGaugeLabel}>Đã chi tiêu</Text>
              </View>
            </View>
            <View style={styles.budgetGaugeDetails}>
              <Text style={styles.budgetGaugeDetailText}>
                Ngân sách: <Text style={{ fontWeight: '700', color: '#111827' }}>{spendingLimit > 0 ? spendingLimit.toLocaleString('vi-VN') + 'đ' : 'Chưa đặt'}</Text>
              </Text>
              <Text style={[styles.budgetGaugeDetailText, { color: isOverBudget ? '#DC2626' : '#059669', fontWeight: 'bold' }]}>
                Còn lại: {spendingLimit > 0 ? remainingBudget.toLocaleString('vi-VN') + 'đ' : '0đ'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Sponsored Ads */}
        {sponsoredAds.length > 0 && (
          <Animated.View entering={FadeInRight.delay(550)}>
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={[styles.sectionTitle, { color: '#EAB308' }]}>Tài trợ nổi bật</Text>
              <View style={{ backgroundColor: '#FEF08A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, color: '#A16207', fontWeight: 'bold' }}>AD</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {sponsoredAds.map((ad, idx) => (
                <TouchableOpacity
                  key={`ad-${ad.sponsoredId}-${idx}`}
                  style={[styles.smartCard, { width: width * 0.6 }]}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/product', params: { id: ad.productId } })}
                >
                  <View style={styles.smartCardImageWrapper}>
                    <Image source={{ uri: ad.imageUrl }} style={styles.smartCardImage} />
                    {ad.allergyWarning && (
                      <View style={styles.restrictedBadge}>
                        <AlertTriangle color="white" size={12} />
                        <Text style={styles.restrictedText}>VI PHẠM</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.smartCardFooter, { padding: 12 }]}>
                    <Text style={[styles.smartCardTitle, { color: '#111827', fontSize: 16 }]} numberOfLines={1}>{ad.productName}</Text>
                    <Text style={[styles.productPrice, { marginTop: 4, fontSize: 14 }]}>{ad.productPrice.toLocaleString('vi-VN')} đ</Text>
                    {ad.allergyWarning && (
                      <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }} numberOfLines={1}>
                        Chứa: {ad.allergyDetails}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* System Deals */}
        {systemDeals.length > 0 && (
          <Animated.View entering={FadeInRight.delay(580)}>
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Khuyến mãi hệ thống & cá nhân</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {systemDeals.map((deal, idx) => (
                <TouchableOpacity
                  key={`deal-${deal.productId}-${idx}`}
                  style={[styles.smartCard, { width: width * 0.45 }]}
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/product', params: { id: deal.productId } })}
                >
                  <View style={styles.smartCardImageWrapper}>
                    <Image source={{ uri: deal.imageUrl || 'https://via.placeholder.com/400x400.png?text=No+Image' }} style={styles.smartCardImage} />
                    {deal.discountPercent ? (
                      <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#eab308', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>-{deal.discountPercent}%</Text>
                      </View>
                    ) : null}
                    {deal.hasAllergenConflict && (
                      <View style={styles.restrictedBadge}>
                        <AlertTriangle color="white" size={12} />
                        <Text style={styles.restrictedText}>VI PHẠM</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.smartCardFooter, { padding: 12 }]}>
                    <Text style={[styles.smartCardTitle, { color: '#111827', fontSize: 14 }]} numberOfLines={2}>{deal.productName}</Text>
                    {deal.promotionPrice ? (
                      <View style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 11, color: '#6B7280', textDecorationLine: 'line-through' }}>{deal.unitPrice.toLocaleString('vi-VN')} đ</Text>
                        <Text style={{ fontSize: 15, color: '#059669', fontWeight: 'bold' }}>{deal.promotionPrice.toLocaleString('vi-VN')} đ</Text>
                      </View>
                    ) : (
                      <Text style={[styles.productPrice, { marginTop: 4, fontSize: 15 }]}>{deal.unitPrice.toLocaleString('vi-VN')} đ</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Promotions */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.promoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm dành cho bạn</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productGrid}>
            {loadingProducts ? (
              <ActivityIndicator size="large" color="#059669" style={{ marginVertical: 20 }} />
            ) : products.length === 0 ? (
              <Text style={{ textAlign: 'center', marginVertical: 20, color: '#6B7280' }}>Không có sản phẩm nào</Text>
            ) : (
              products.map(product => (
                <TouchableOpacity
                  key={product.productId}
                  style={styles.productCard}
                  activeOpacity={0.8}
                  onPress={() => router.push({ pathname: '/product', params: { id: product.productId } })}
                >
                  <View style={styles.productImageContainer}>
                    <Image
                      source={product.imageUrl ? { uri: product.imageUrl } : { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop' }}
                      style={styles.productImage}
                    />
                    <View style={styles.aiRecommendBadge}>
                      <Zap color="white" size={10} fill="white" style={{ marginRight: 4 }} />
                      <Text style={styles.aiRecommendText}>AI Đề xuất</Text>
                    </View>
                    {(product as any).hasAllergenConflict && (
                      <View style={styles.restrictedBadge}>
                        <AlertTriangle color="white" size={12} />
                        <Text style={styles.restrictedText}>VI PHẠM</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productTitle} numberOfLines={1}>{product.productName}</Text>
                    <Text style={styles.productSubtitle}>Trạng thái: {product.status}</Text>
                    <View style={styles.productPriceRow}>
                      <Text style={styles.productPrice}>{product.unitPrice.toLocaleString('vi-VN')} đ</Text>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={async () => {
                          try {
                            await CartService.addItem(product.productId, 1);
                            ToastAndroid.show("Đã thêm sản phẩm vào giỏ hàng", ToastAndroid.SHORT);
                          } catch (e: any) {
                            ToastAndroid.show(e.message, ToastAndroid.LONG);
                          }
                        }}
                      >
                        <Plus color="white" size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* View More Card */}
            <TouchableOpacity style={styles.viewMoreCard} activeOpacity={0.8} onPress={() => router.push({ pathname: '/search', params: { mode: 'personal' } })}>
              <View style={styles.viewMoreIconBox}>
                <Plus color="#059669" size={24} />
              </View>
              <Text style={styles.viewMoreTitle}>Xem thêm sản phẩm</Text>
              <Text style={styles.viewMoreSubtitle}>Dựa trên thói quen mua sắm</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <View style={[styles.navTabBox, activeTab === 'home' && styles.navTabBoxActive]}>
            <Home color={activeTab === 'home' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/map')}>
          <View style={[styles.navTabBox, activeTab === 'route' && styles.navTabBoxActive]}>
            <Map color={activeTab === 'route' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/cart')}>
          <View style={[styles.navTabBox, activeTab === 'cart' && styles.navTabBoxActive]}>
            <ShoppingBag color={activeTab === 'cart' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/profile')}>
          <View style={[styles.navTabBox, activeTab === 'profile' && styles.navTabBoxActive]}>
            <User color={activeTab === 'profile' ? 'white' : '#9CA3AF'} size={24} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Voice Search Modal */}
      {isListening && (
        <View style={styles.voiceModalOverlay}>
          <View style={styles.voiceModalContent}>
            <View style={{ position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
              <RNAnimated.View style={[styles.voicePulseCircle, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.voiceMicContainer}>
                <Mic color="white" size={32} />
              </View>
            </View>
            <Text style={styles.voiceListeningText}>Đang nghe...</Text>
            <Text style={styles.voiceResultText}>{voiceText || 'Hãy nói nội dung bạn muốn tìm kiếm'}</Text>
            <TouchableOpacity style={styles.voiceCancelBtn} onPress={stopListening}>
              <Text style={styles.voiceCancelBtnText}>Dừng lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recipe Details & Ingredients modal ("Nấu ngay") */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={recipeModalVisible}
        onRequestClose={() => setRecipeModalVisible(false)}
      >
        <View style={styles.recipeModalOverlay}>
          <View style={styles.recipeModalContent}>
            {/* Header with image */}
            <View style={styles.recipeHeaderWrapper}>
              <Image
                source={{ uri: selectedRecipe?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop' }}
                style={styles.recipeModalImage}
              />
              <LinearGradient colors={['transparent', 'rgba(15, 23, 42, 0.9)']} style={styles.recipeImageGradient}>
                <View style={styles.recipeTitleRow}>
                  <Text style={styles.recipeTitleText} numberOfLines={2}>
                    {fixMojibake(selectedRecipe?.recipeName) || 'Công thức chi tiết'}
                  </Text>
                  {selectedRecipe?.matchScore && (
                    <View style={styles.recipeScoreBadge}>
                      <Text style={styles.recipeScoreText}>Hợp {selectedRecipe.matchScore}%</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
              <TouchableOpacity style={styles.recipeCloseBtn} onPress={() => setRecipeModalVisible(false)}>
                <X color="white" size={20} />
              </TouchableOpacity>
            </View>

            {/* Portions adjustments */}
            <View style={styles.recipePortionRow}>
              <View>
                <Text style={styles.portionLabel}>Khẩu phần ăn</Text>
                <Text style={styles.portionSub}>Điều chỉnh lượng nguyên liệu</Text>
              </View>
              <View style={styles.portionControlGroup}>
                <TouchableOpacity style={styles.portionBtn} onPress={() => changePortions(-1)} disabled={loadingAssistant}>
                  <Text style={styles.portionBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.portionValue}>{portions}</Text>
                <TouchableOpacity style={styles.portionBtn} onPress={() => changePortions(1)} disabled={loadingAssistant}>
                  <Text style={styles.portionBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loadingAssistant ? (
              <View style={styles.recipeLoadingContainer}>
                <ActivityIndicator size="large" color="#059669" />
                <Text style={styles.recipeLoadingText}>Đang tính toán nguyên liệu tối ưu...</Text>
              </View>
            ) : (
              <View style={{ flexShrink: 1, width: '100%' }}>
                {/* Ingredients list */}
                <Text style={styles.ingredientsSectionTitle}>Danh sách nguyên liệu cần thiết</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                  {assistantData?.ingredients && assistantData.ingredients.length > 0 ? (
                    assistantData.ingredients.map((ing, idx) => (
                      <View key={`ing-${ing.productId}-${idx}`} style={styles.ingredientRowCard}>
                        <Image
                          source={{ uri: ing.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop' }}
                          style={styles.ingredientImg}
                        />
                        <View style={styles.ingredientInfoBox}>
                          <Text style={[styles.ingredientNameText, ing.isRestricted && { color: '#DC2626' }]} numberOfLines={1}>
                            {ing.productName}
                          </Text>
                          <Text style={styles.ingredientQtyText}>
                            Yêu cầu: {ing.quantityRequired} {ing.unitOfMeasure} {ing.shelfLocation ? `• Kệ: ${ing.shelfLocation}` : ''}
                          </Text>
                          {ing.isRestricted && (
                            <TouchableOpacity
                              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, flexWrap: 'wrap' }}
                              onPress={() => {
                                if (ing.altName) {
                                  setRecipeModalVisible(false);
                                  router.push({ pathname: '/search', params: { query: ing.altName, mode: 'personal' } });
                                }
                              }}
                            >
                              <AlertTriangle color="#DC2626" size={12} />
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#DC2626', marginLeft: 4 }}>
                                ⚠️ Bấm để tìm thay thế: {ing.altName}
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Text style={styles.ingredientPriceText}>{(ing.unitPrice * ing.quantityRequired).toLocaleString('vi-VN')} đ</Text>
                          <View style={[styles.stockBadge, { backgroundColor: ing.inStock ? '#E6F4EA' : '#FCE8E6' }]}>
                            <Text style={[styles.stockBadgeText, { color: ing.inStock ? '#137333' : '#C5221F' }]}>
                              {ing.inStock ? 'Còn hàng' : 'Hết hàng'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>Không tìm thấy nguyên liệu phù hợp trong kho.</Text>
                  )}
                </ScrollView>

                {/* Bottom summary and action */}
                <View style={styles.recipeModalFooter}>
                  <View style={styles.priceSummaryRow}>
                    <Text style={styles.totalPriceLabel}>Dự tính chi phí:</Text>
                    <Text style={styles.totalPriceValue}>
                      {assistantData?.estimatedTotalCost ? assistantData.estimatedTotalCost.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
                    </Text>
                  </View>

                  <View style={styles.recipeFooterActions}>
                    <TouchableOpacity style={styles.recipeCancelActionBtn} onPress={() => setRecipeModalVisible(false)}>
                      <Text style={styles.recipeCancelActionText}>Đóng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.recipeSubmitActionBtn, addingToCart && { opacity: 0.7 }]}
                      onPress={handleAddAllIngredientsToCart}
                      disabled={addingToCart}
                    >
                      {addingToCart ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Bot color="white" size={18} style={{ marginRight: 6 }} />
                          <Text style={styles.recipeSubmitActionText}>Mua & Gom hàng</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -30 }], // 60/2 to center
    width: 60,
    backgroundColor: '#F59E0B',
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  subGreetingText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'white',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  searchToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#059669',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleBtnTextActive: {
    color: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  horizontalScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  smartCard: {
    width: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  smartCardImageWrapper: {
    height: 140,
    margin: 8,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  smartCardImage: {
    width: '100%',
    height: '100%',
  },
  smartCardOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: 16,
  },
  smartBadge: {
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  smartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },
  voiceModalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 999,
  },
  voiceModalContent: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '80%',
  },
  voicePulseCircle: {
    position: 'absolute',
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
  },
  voiceMicContainer: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  voiceListeningText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  voiceResultText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    minHeight: 40,
  },
  voiceCancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
  },
  voiceCancelBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 15,
  },
  smartCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  smartCardFooter: {
    padding: 16,
  },
  smartCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  smartCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimary: {
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#047857',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSecondaryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  cartCardGradient: {
    width: width * 0.65,
    borderRadius: 24,
    padding: 3, // Thicker gradient border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cartCardInner: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 21,
    padding: 16,
  },
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cartIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '700',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cartSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  cartProgressTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cartProgressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  cartButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  budgetSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  budgetValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  budgetStatusBadge: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  budgetStatusText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '600',
  },
  budgetGaugeContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
    alignItems: 'center',
  },
  budgetGaugeTextContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: '100%',
  },
  budgetGaugeSpent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  budgetGaugeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  budgetGaugeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  budgetGaugeDetailText: {
    fontSize: 13,
    color: '#4B5563',
  },
  promoSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: (width - 56) / 2, // 20 padding each side, 16 gap
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    height: 140,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  aiRecommendBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiRecommendText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewMoreCard: {
    width: (width - 56) / 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewMoreIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewMoreTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: 4,
  },
  viewMoreSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  },
  robotWidgetContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  robotWidget: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
  },
  robotWidgetConnected: {
    borderColor: '#D1FAE5',
    backgroundColor: '#F0FDF4',
  },
  robotWidgetDisconnected: {
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    backgroundColor: 'white',
  },
  robotWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  robotIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotWidgetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  robotWidgetLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  robotWidgetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  robotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  statusOnlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusOnlineText: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '800',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  connectLink: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  connectLinkText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  // Recipe Modal Styles
  recipeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  recipeModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 20,
    maxHeight: height * 0.9,
    alignItems: 'center',
  },
  recipeHeaderWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  recipeModalImage: {
    width: '100%',
    height: '100%',
  },
  recipeImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: '40%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  recipeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recipeTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
    flex: 1,
    marginRight: 12,
  },
  recipeScoreBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recipeScoreText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  recipeCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 20,
    padding: 6,
  },
  recipePortionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  portionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  portionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  portionControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
  },
  portionBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  portionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  portionValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    paddingHorizontal: 16,
  },
  recipeLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recipeLoadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  ingredientsSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  ingredientRowCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  ingredientImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  ingredientInfoBox: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  ingredientNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  ingredientQtyText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  ingredientPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  stockBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginVertical: 20,
    fontWeight: '500',
  },
  recipeModalFooter: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#059669',
  },
  recipeFooterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  recipeCancelActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeCancelActionText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  recipeSubmitActionBtn: {
    flex: 2,
    backgroundColor: '#059669',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeSubmitActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
  restrictedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  restrictedText: {
    color: 'white',
    fontSize: 9,
    fontFamily: 'Inter-Bold',
  }
});

