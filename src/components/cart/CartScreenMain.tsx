import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, Check, Home, Map, Minus, Plus, ShoppingBag, Trash2, User, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '../../context/NotificationContext';
import { CartDto, CartItemDto, CartService } from '../../services/CartService';
import { NavigationService } from '../../services/NavigationService';
import { ProfileDto, ProfileService } from '../../services/ProfileService';
const DELETE_THRESHOLD = -120; // vuốt qua ngưỡng này → tự xóa
const REVEAL_THRESHOLD = -75;  // vuốt qua ngưỡng này → lộ nút đỏ

// ===== Component SwipeableCartItem =====
function SwipeableCartItem({
  item,
  index,
  onDelete,
  onUpdateQuantity,
  onReplaceAlternative,
  formatPrice,
}: {
  item: CartItemDto;
  index: number;
  onDelete: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onReplaceAlternative: (oldProductId: number, newProductId: number, quantity: number) => void;
  formatPrice: (price: number) => string;
}) {
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])   // bắt đầu detect khi vuốt ngang 10px
    .failOffsetY([-5, 5])       // huỷ gesture nếu vuốt dọc
    .onUpdate((e) => {
      // Chỉ cho vuốt sang trái (translationX âm)
      translateX.value = Math.max(DELETE_THRESHOLD - 20, Math.min(0, e.translationX));
      // Hiện nút xóa dần theo độ vuốt
      deleteOpacity.value = Math.min(1, Math.abs(translateX.value) / Math.abs(REVEAL_THRESHOLD));
    })
    .onEnd((e) => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Vuốt đủ xa → xóa
        translateX.value = withTiming(-500, { duration: 250 });
        runOnJS(onDelete)(item.productId);
      } else if (translateX.value < REVEAL_THRESHOLD) {
        // Lộ nút xóa → snap vào vị trí nút đỏ
        translateX.value = withSpring(-80, { damping: 20 });
        deleteOpacity.value = withSpring(1);
      } else {
        // Chưa đủ → snap về
        translateX.value = withSpring(0, { damping: 20 });
        deleteOpacity.value = withSpring(0);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  const handleDelete = () => onDelete(item.productId);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.duration(300)}
      key={item.productId}
      style={styles.swipeWrapper}
    >
      {/* Nút xóa đỏ phía sau */}
      <Animated.View style={[styles.deleteBackground, deleteStyle]}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Trash2 color="white" size={22} />
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Row item có thể vuốt */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.cartItem,
            item.alertType && { borderColor: item.alertType === 'Allergy' ? '#EF4444' : '#F59E0B' },
            rowStyle
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.itemImageContainer}>
                <Image
                  source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' }}
                  style={styles.itemImage}
                />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                <Text style={styles.itemVariant}>Đơn giá: {formatPrice(item.unitPrice)}</Text>

                {item.alertType && (
                  <View style={[
                    styles.alertBadge,
                    item.alertType === 'Allergy' ? styles.alertAllergy :
                      item.alertType === 'Budget' ? styles.alertBudget : styles.alertAvoid
                  ]}>
                    <Text style={styles.alertBadgeText}>
                      {item.alertType === 'Allergy' ? 'Cảnh báo Dị ứng' :
                        item.alertType === 'Budget' ? 'Vượt ngân sách' : 'Cần tránh'}
                    </Text>
                  </View>
                )}

                <Text style={styles.itemPrice}>{formatPrice(item.totalPrice)}</Text>
              </View>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtnMinus}
                  onPress={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                >
                  <Minus color="#9CA3AF" size={14} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtnPlus}
                  onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                >
                  <Plus color="white" size={14} />
                </TouchableOpacity>
              </View>
            </View>

            {item.alertMessage && (
              <Text style={styles.alertMessageText}>{item.alertMessage}</Text>
            )}

            {item.alternativeProducts && item.alternativeProducts.length > 0 && (
              <View style={styles.alternativesContainer}>
                <Text style={styles.alternativesTitle}>
                  {item.alertType === 'Budget' ? 'Sản phẩm thay thế (Rẻ hơn):' : 'Sản phẩm thay thế an toàn:'}
                </Text>
                {item.alternativeProducts.map(alt => (
                  <View key={alt.productId} style={styles.altItem}>
                    <Image
                      source={{ uri: alt.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' }}
                      style={styles.altImage}
                    />
                    <View style={styles.altDetails}>
                      <Text style={styles.altName} numberOfLines={1}>{alt.productName}</Text>
                      <Text style={styles.altReason} numberOfLines={1}>{alt.reason || 'Sản phẩm thay thế an toàn cho bạn.'}</Text>
                      <Text style={styles.altPrice}>{formatPrice(alt.unitPrice)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.altReplaceBtn}
                      onPress={() => onReplaceAlternative(item.productId, alt.productId, item.quantity)}
                    >
                      <Text style={styles.altReplaceBtnText}>Đổi</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export default function CartScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const { hubConnection } = useNotification();

  const formatPrice = (price: number) => {
    return price ? price.toLocaleString('vi-VN') + ' đ' : '0 đ';
  };

  const fetchProfileAndCart = async () => {
    try {
      setLoading(true);
      const profileData = await ProfileService.getProfile();
      setProfile(profileData);

      const cartData = await CartService.getCart();
      setCart(cartData);
    } catch (err) {
      console.warn('Error fetching profile and cart:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe SignalR Hub để đồng bộ Real-time
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanningLocation, setIsScanningLocation] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLocationOptionVisible, setIsLocationOptionVisible] = useState(false);
  const [customAlert, setCustomAlert] = useState<{ visible: boolean, message: string, type: 'success' | 'error' }>({ visible: false, message: '', type: 'success' });
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const cameraRef = React.useRef<CameraView | null>(null);

  useEffect(() => {
    if (!isScanningLocation) {
      setIsCameraReady(false);
    }
  }, [isScanningLocation]);

  const captureAndProcessOcr = async () => {
    if (!cameraRef.current || isOcrProcessing) return;

    if (!isCameraReady || typeof cameraRef.current?.takePictureAsync !== 'function') {
      setCustomAlert({
        visible: true,
        message: 'Camera đang khởi động, vui lòng đợi trong giây lát rồi thử lại!',
        type: 'error'
      });
      return;
    }

    try {
      setIsOcrProcessing(true);
      console.log('Đang chụp ảnh tem dán Kệ để AI phân tích...');
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.65,
        skipProcessing: false,
      });

      if (photo?.base64) {
        const res = await NavigationService.ocrShelfTag(photo.base64);
        console.log('🤖 [AI OCR] Kết quả Gemini OCR:', res);
        if (res.success && res.nodeId) {
          setIsScanningLocation(false);
          setCustomAlert({
            visible: true,
            message: `✨ AI đã đọc thành công tem: ${res.message || 'Kệ ' + res.nodeId}! Bắt đầu tính toán lộ trình...`,
            type: 'success'
          });
          performCheckout(res.nodeId);
          return;
        } else {
          setCustomAlert({
            visible: true,
            message: `⚠️ AI chưa đọc được chữ trên tem Kệ trong ảnh. Vui lòng căn chỉnh góc chụp vuông góc, rõ nét ("ARUCO ID: X" hoặc "KỆ X") hoặc chọn nhanh số Kệ ở bên dưới!`,
            type: 'error'
          });
        }
      }
    } catch (err) {
      console.warn('[AI OCR] Snap error:', err);
      setCustomAlert({
        visible: true,
        message: 'Lỗi khi chụp ảnh từ Camera: ' + (err as Error).message,
        type: 'error'
      });
    } finally {
      setIsOcrProcessing(false);
    }
  };




  useFocusEffect(
    useCallback(() => {
      fetchProfileAndCart();
    }, [])
  );

  useEffect(() => {
    if (hubConnection) {
      const handleCartUpdate = (updatedCart: CartDto) => {
        console.log('[SignalR CartUpdate]', updatedCart);
        setCart(updatedCart);
      };

      hubConnection.on('CartUpdate', handleCartUpdate);

      return () => {
        hubConnection.off('CartUpdate', handleCartUpdate);
      };
    }
  }, [hubConnection]);

  const updateQuantity = useCallback(async (productId: number, newQty: number) => {
    try {
      if (newQty <= 0) {
        const updatedCart = await CartService.removeItem(productId);
        setCart(updatedCart);
      } else {
        const updatedCart = await CartService.updateItemQuantity(productId, newQty);
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Không thể cập nhật số lượng: ' + (error as Error).message);
    }
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    try {
      const updatedCart = await CartService.removeItem(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Không thể xóa sản phẩm khỏi giỏ hàng: ' + (error as Error).message);
    }
  }, []);

  const replaceAlternative = useCallback(async (oldProductId: number, newProductId: number, quantity: number) => {
    try {
      // Xóa sản phẩm cũ trước
      await CartService.removeItem(oldProductId);
      // Thêm sản phẩm thay thế với số lượng cũ
      const updatedCart = await CartService.addItem(newProductId, quantity);
      setCart(updatedCart);
      setCustomAlert({ visible: true, message: 'Đã đổi sang sản phẩm thay thế an toàn hơn.', type: 'success' });
    } catch (error) {
      console.error('Error replacing alternative product:', error);
      setCustomAlert({ visible: true, message: 'Không thể thay thế sản phẩm: ' + (error as Error).message, type: 'error' });
    }
  }, []);

  const performCheckout = async (startNodeId?: number) => {
    const effectiveStartNodeId = startNodeId ?? 7;
    console.log('\n======================================================');
    console.log('🛒 [BẤM CHỈ ĐƯỜNG TRONG GIỎ HÀNG]');
    console.log(`📍 Vị trí bắt đầu (Start Node ID): ${effectiveStartNodeId} (${effectiveStartNodeId === 7 ? 'Quầy Thu Ngân - Node 7' : 'Kệ Hàng Scanned QR - Node ' + effectiveStartNodeId})`);

    try {
      setCheckingOut(true);
      let checkoutResult: any = null;
      try {
        console.log('📡 Gửi API Cart.checkout với startNodeId:', effectiveStartNodeId);
        checkoutResult = await CartService.checkout(effectiveStartNodeId);
        console.log('📥 Kết quả Cart.checkout từ BE:', JSON.stringify(checkoutResult, null, 2));
      } catch (err) {
        console.warn('Cart checkout BE API error:', err);
      }

      const ids = cart?.items ? cart.items.map(i => i.productId) : [];
      console.log('📦 Chuyển hướng sang màn hình Bản đồ với Product IDs:', ids, 'và StartNodeId:', effectiveStartNodeId);
      console.log('======================================================\n');

      router.push({
        pathname: '/map' as any,
        params: {
          productIds: JSON.stringify(ids),
          startNodeId: String(effectiveStartNodeId),
          routePlan: checkoutResult ? JSON.stringify(checkoutResult.waypoints || checkoutResult.routePlan || checkoutResult) : '[]',
          invoice: checkoutResult ? JSON.stringify(checkoutResult.invoice || checkoutResult) : '{}'
        }
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      const ids = cart?.items ? cart.items.map(i => i.productId) : [];
      router.push({ pathname: '/map' as any, params: { productIds: JSON.stringify(ids), startNodeId: String(effectiveStartNodeId) } });
    } finally {
      setCheckingOut(false);
    }
  };



  const handleCheckout = async () => {
    setIsLocationOptionVisible(true);
  };

  const startCameraScan = async () => {
    setIsLocationOptionVisible(false);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert("Cần cấp quyền Camera để quét mã QR vị trí.");
        return;
      }
    }
    setIsScanningLocation(true);
  };

  const startFromCashier = () => {
    setIsLocationOptionVisible(false);
    console.log('🏬 Người dùng chọn xuất phát từ: QUẦY THU NGÂN (Node 7)');
    performCheckout(7); // NodeID 7 is Checkout/Cashier
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setIsScanningLocation(false);
    console.log('📷 Đã quét mã QR Kệ hàng thành công! Data:', data);

    let nodeId: number | undefined = undefined;
    const raw = (data || '').toUpperCase();

    const nodeMatch = raw.match(/NODE[\s:_#-]*(\d+)/i);
    const shelfMatch = raw.match(/SHELF[\s:_#-]*(\d+)/i);
    const idMatch = raw.match(/(?:ARUCO\s*)?ID[\s:_#-]*(\d+)/i);
    const keMatch = raw.match(/(?:KỆ|KE|KV)[\s:_#-]*(\d+)/i);
    const numMatch = raw.match(/(\d+)/);

    if (nodeMatch) nodeId = parseInt(nodeMatch[1], 10);
    else if (shelfMatch) nodeId = parseInt(shelfMatch[1], 10);
    else if (idMatch) nodeId = parseInt(idMatch[1], 10);
    else if (keMatch) nodeId = parseInt(keMatch[1], 10);
    else if (numMatch) {
      const parsedNum = parseInt(numMatch[1], 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 8) nodeId = parsedNum;
    }

    console.log(`📍 Node ID gán từ mã QR: ${nodeId ?? 'Không xác định (dùng Node 7)'}`);
    performCheckout(nodeId);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#F8FAFC', '#F8FAFC']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Image
                source={{ uri: profile?.avatarUrl || profile?.facePath || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png' }}
                style={styles.headerAvatar}
              />
              <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#059669" />
              <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

              {/* Cảnh báo cấp giỏ hàng (ví dụ: Vượt ngân sách) */}
              {cart?.alertMessage && (
                <View style={styles.budgetBanner}>
                  <AlertTriangle color="#78350F" size={20} style={{ marginRight: 10 }} />
                  <Text style={styles.budgetBannerText}>{cart.alertMessage}</Text>
                </View>
              )}

              {/* Ngân sách còn lại */}
              {cart?.remainingBudget !== null && cart?.remainingBudget !== undefined && (
                <View style={styles.budgetContainer}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetLabel, cart.remainingBudget < 0 && { color: '#EF4444' }]}>
                      {cart.remainingBudget < 0 ? 'Vượt ngân sách:' : 'Ngân sách còn lại:'}
                    </Text>
                    <Text style={[styles.budgetValue, cart.remainingBudget < 0 && { color: '#EF4444' }]}>
                      {cart.remainingBudget < 0
                        ? formatPrice(Math.abs(cart.remainingBudget))
                        : formatPrice(cart.remainingBudget)}
                    </Text>
                  </View>
                  <View style={styles.budgetBarBackground}>
                    <View
                      style={[
                        styles.budgetBarFill,
                        {
                          width: `${Math.max(0, Math.min(100, (cart.remainingBudget / 1000000) * 100))}%`,
                          backgroundColor: cart.remainingBudget < 0 ? '#EF4444' : '#059669'
                        }
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Cart Items — Swipe để xóa */}
              {cart?.items && cart.items.length > 0 ? (
                <View style={styles.itemsContainer}>
                  {cart.items.map((item, index) => (
                    <SwipeableCartItem
                      key={item.productId.toString()}
                      item={item}
                      index={index}
                      onDelete={removeItem}
                      onUpdateQuantity={updateQuantity}
                      onReplaceAlternative={replaceAlternative}
                      formatPrice={formatPrice}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCartContainer}>
                  <ShoppingBag color="#9CA3AF" size={64} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống</Text>
                  <TouchableOpacity style={styles.btnShopNow} onPress={() => router.replace('/home')}>
                    <Text style={styles.btnShopNowText}>Mua sắm ngay</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Checkout Summary */}
              {cart?.items && cart.items.length > 0 && (
                <Animated.View entering={FadeInUp.delay(500)} style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Chi tiết thanh toán</Text>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tạm tính</Text>
                    <Text style={styles.summaryValue}>{formatPrice(cart.totalPrice)}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalValue}>{formatPrice(cart.totalPrice)}</Text>
                  </View>
                </Animated.View>
              )}

            </ScrollView>
          )}

          {/* Bottom Action */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.bottomAction}>
            {cart?.items && cart.items.length > 0 && !loading && (
              <TouchableOpacity
                style={[styles.btnCheckout, checkingOut && { opacity: 0.8 }, { marginBottom: 12 }]}
                onPress={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.btnCheckoutText}>Xem lộ trình & Chỉ đường</Text>
                )}
              </TouchableOpacity>
            )}


          </Animated.View>

          {/* Bottom Navigation */}
          <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/home')}>
              <View style={styles.navTabBox}>
                <Home color="#9CA3AF" size={24} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.push('/map' as any)}>
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

        {/* Location Option Modal */}
        <Modal visible={isLocationOptionVisible} transparent={true} animationType="fade" onRequestClose={() => setIsLocationOptionVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Chọn vị trí hiện tại của bạn</Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Hệ thống cần biết vị trí của bạn để tính toán đường đi ngắn nhất.</Text>

              <TouchableOpacity onPress={startFromCashier} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 16, marginBottom: 12 }}>
                <View style={{ width: 48, height: 48, backgroundColor: '#E0E7FF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Map color="#4F46E5" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Quầy thu ngân</Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>Bắt đầu đi từ khu vực cửa ra vào</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={startCameraScan} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 16, marginBottom: 24 }}>
                <View style={{ width: 48, height: 48, backgroundColor: '#D1FAE5', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <Zap color="#059669" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Chụp ảnh tem Kệ </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>Chụp tem dán kệ</Text>
                </View>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => setIsLocationOptionVisible(false)} style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 15 }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Custom Alert Modal */}
        <Modal visible={customAlert.visible} transparent={true} animationType="fade" onRequestClose={() => setCustomAlert({ ...customAlert, visible: false })}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Animated.View entering={FadeInDown.springify()} style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: customAlert.type === 'success' ? '#D1FAE5' : '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                {customAlert.type === 'success' ? (
                  <Check color="#059669" size={32} />
                ) : (
                  <AlertTriangle color="#DC2626" size={32} />
                )}
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
                {customAlert.type === 'success' ? 'Thành công' : 'Lỗi'}
              </Text>
              <Text style={{ fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                {customAlert.message}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: customAlert.type === 'success' ? '#059669' : '#DC2626', width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                onPress={() => setCustomAlert({ ...customAlert, visible: false })}
              >
                <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>Xác nhận</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* AI Camera Photo Capture Modal */}
        <Modal visible={isScanningLocation} animationType="slide" onRequestClose={() => setIsScanningLocation(false)}>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <SafeAreaView style={{ flex: 1, position: 'relative' }}>
              <CameraView
                ref={(ref) => {
                  cameraRef.current = ref;
                }}
                style={{ flex: 1 }}
                facing="back"
                onCameraReady={() => setIsCameraReady(true)}
              />
              {/* Header Banner Guide */}
              <View style={{
                position: 'absolute', top: 50, left: 20, right: 20,
                backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 16, borderRadius: 20, alignItems: 'center'
              }}>
                <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' }}>
                  CHỤP ẢNH TEM DÁN KỆ HÀNG
                </Text>
                <Text style={{ color: 'white', fontSize: 13, textAlign: 'center', fontWeight: '600', lineHeight: 18 }}>
                  Đưa camera vào tem in trên kệ rồi bấm nút Chụp bên dưới.
                </Text>
              </View>

              {/* Shutter Capture Button Container */}
              <View style={{
                position: 'absolute', bottom: 170, left: 0, right: 0,
                alignItems: 'center', justifyContent: 'center'
              }}>
                <TouchableOpacity
                  onPress={captureAndProcessOcr}
                  disabled={isOcrProcessing}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isOcrProcessing ? '#64748B' : '#059669',
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    borderRadius: 30,
                    borderWidth: 3,
                    borderColor: '#A7F3D0',
                    elevation: 8,
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                  }}
                >
                  {isOcrProcessing ? (
                    <>
                      <ActivityIndicator size="small" color="white" style={{ marginRight: 10 }} />
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>AI đang đọc tem Kệ...</Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Chụp Ảnh Tem Kệ</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Quick Shelf Selection Bar */}
              <View style={{
                position: 'absolute', bottom: 90, left: 16, right: 16,
                backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 12, borderRadius: 20, alignItems: 'center'
              }}>
                <Text style={{ color: '#E2E8F0', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
                  Hoặc chọn nhanh vị trí Kệ bạn đang đứng:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                  {[
                    { id: 1, label: 'Kệ 1 (Ăn vặt)' },
                    { id: 2, label: 'Kệ 2 (Giải khát)' },
                    { id: 3, label: 'Kệ 3 (Tươi sống)' },
                    { id: 4, label: 'Kệ 4 (Mỳ gói)' },
                    { id: 5, label: 'Kệ 5 (Gia dụng)' },
                    { id: 6, label: 'Kệ 6 (Gia vị)' },
                    { id: 7, label: 'Kệ 7 (Thu ngân)' },
                  ].map((shelf) => (
                    <TouchableOpacity
                      key={shelf.id}
                      style={{
                        backgroundColor: '#334155',
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#64748B',
                      }}
                      onPress={() => {
                        setIsScanningLocation(false);
                        console.log(`📍 Chọn thủ công vị trí Kệ #${shelf.id} (${shelf.label})`);
                        performCheckout(shelf.id);
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{shelf.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Cancel Button */}
              <TouchableOpacity
                style={{
                  position: 'absolute', bottom: 30, alignSelf: 'center',
                  backgroundColor: '#EF4444', paddingVertical: 10, paddingHorizontal: 28, borderRadius: 24
                }}
                onPress={() => setIsScanningLocation(false)}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Đóng Camera</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </Modal>

      </LinearGradient>
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  swipeWrapper: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
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
    justifyContent: 'center',
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
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
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
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 20,
  },
  btnShopNow: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  btnShopNowText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
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
    marginBottom: 24,
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
    fontWeight: '700',
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
  },

  // Custom Styles for Alerts & Health
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  alertAllergy: {
    backgroundColor: '#EF4444', // Red for Allergy
  },
  alertAvoid: {
    backgroundColor: '#F59E0B', // Amber for Avoid
  },
  alertBudget: {
    backgroundColor: '#3B82F6', // Blue for Budget
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  alertMessageText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  alternativesContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  alternativesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  altItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  altImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  altDetails: {
    flex: 1,
  },
  altName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  altReason: {
    fontSize: 10,
    color: '#6B7280',
  },
  altPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  altReplaceBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  altReplaceBtnText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  budgetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  budgetBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
    flex: 1,
  },
  budgetContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  budgetValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  budgetBarBackground: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
