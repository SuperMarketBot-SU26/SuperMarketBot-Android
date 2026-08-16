import * as React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated, ActivityIndicator, Easing, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Home, Bot, Compass, Star, MapPin, Maximize2, X, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import Svg, { Circle, G, Text as SvgText, Path, Rect, Line, Polygon, Polyline, Defs, LinearGradient as SvgLinearGradient, Stop, Ellipse } from 'react-native-svg';
import { MapService, MapData, SemanticObject, RoutePoint, MapNode } from '../../services/MapService';
import { useRobotNavigation } from '../../context/RobotNavigationContext';
import { NavigationService } from '../../services/NavigationService';
import { MAP_HTML } from './MapHtml';

const formatPrice = (price: number) => {
  return price ? price.toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ';
};

const { width, height } = Dimensions.get('window');
const CANVAS_SIZE = width - 40; // Full width minus padding

interface ShelfTheme {
  name: string;
  icon: string;
  color: string;
  topColor: string;
  frontColor: string;
  sideColor: string;
  signColor: string;
  signText: string;
  productColors: string[];
}

export const HARDCODED_MASTER_ROUTE: any[] = [
  { x: 2.80, y: 2.00, description: "Trạm sạc D01 (n-dock)", productName: "Trạm sạc D01 (n-dock)", nodeName: "D01", nodeId: 21 },
  { x: 2.45, y: 2.00, description: "Ngã rẽ chính C03 (c-bright)", productName: "Ngã rẽ chính C03 (c-bright)", nodeName: "C03", nodeId: 5 },
  { x: 2.45, y: 0.80, description: "Kệ 1-Right S04 (Bánh kẹo B)", productId: 1, productName: "Kệ 1-Right S04 (Bánh kẹo B)", nodeName: "S04", nodeId: 9 },
  { x: 2.45, y: 0.48, description: "Khúc cua C02 (c-tright)", productName: "Khúc cua C02 (c-tright)", nodeName: "C02", nodeId: 4 },
  { x: 2.18, y: 0.48, description: "Kệ 1-Top S03 (Đồ uống A)", productId: 2, productName: "Kệ 1-Top S03 (Đồ uống A)", nodeName: "S03", nodeId: 8 },
  { x: 0.80, y: 0.48, description: "Kệ 2-Top S01 (Nông sản A)", productId: 3, productName: "Kệ 2-Top S01 (Nông sản A)", nodeName: "S01", nodeId: 6 },
  { x: 0.48, y: 0.48, description: "Khúc cua C01 (c-tleft)", productName: "Khúc cua C01 (c-tleft)", nodeName: "C01", nodeId: 3 },
  { x: 0.48, y: 0.80, description: "Kệ 2-Left S02 (Nông sản B)", productId: 4, productName: "Kệ 2-Left S02 (Nông sản B)", nodeName: "S02", nodeId: 7 },
  { x: 0.48, y: 2.12, description: "Kệ 3-Left S05 (Hóa mỹ phẩm A)", productId: 5, productName: "Kệ 3-Left S05 (Hóa mỹ phẩm A)", nodeName: "S05", nodeId: 10 },
  { x: 0.48, y: 2.50, description: "Khúc cua C08 (c-z3-bot-left)", productName: "Khúc cua C08 (c-z3-bot-left)", nodeName: "C08", nodeId: 12 },
  { x: 0.80, y: 2.50, description: "Kệ 3-Bottom S06 (Hóa mỹ phẩm B)", productId: 6, productName: "Kệ 3-Bottom S06 (Hóa mỹ phẩm B)", nodeName: "S06", nodeId: 11 },
  { x: 1.28, y: 2.50, description: "Ngoặt C09 (c-z3-bot-right)", productName: "Ngoặt C09 (c-z3-bot-right)", nodeName: "C09", nodeId: 13 },
  { x: 1.28, y: 2.00, description: "Ngoặt C10 (c-z3-step-top)", productName: "Ngoặt C10 (c-z3-step-top)", nodeName: "C10", nodeId: 14 },
  { x: 1.08, y: 2.00, description: "Góc C06 (c-s4-bot-left)", productName: "Góc C06 (c-s4-bot-left)", nodeName: "C06", nodeId: 15 },
  { x: 1.08, y: 1.45, description: "Kệ 4-Left S07 (Kệ Đỏ Trái)", productId: 7, productName: "Kệ 4-Left S07 (Kệ Đỏ Trái)", nodeName: "S07", nodeId: 16 },
  { x: 1.08, y: 0.85, description: "Góc C04 (c-s4-top-left)", productName: "Góc C04 (c-s4-top-left)", nodeName: "C04", nodeId: 17 },
  { x: 1.92, y: 0.85, description: "Góc C05 (c-s4-top-right)", productName: "Góc C05 (c-s4-top-right)", nodeName: "C05", nodeId: 18 },
  { x: 1.92, y: 1.45, description: "Kệ 4-Right S08 (Kệ Đỏ Phải)", productId: 8, productName: "Kệ 4-Right S08 (Kệ Đỏ Phải)", nodeName: "S08", nodeId: 19 },
  { x: 1.92, y: 2.00, description: "Góc C07 (c-s4-bot-right)", productName: "Góc C07 (c-s4-bot-right)", nodeName: "C07", nodeId: 20 },
  { x: 2.10, y: 2.45, description: "Quầy Thu Ngân (Cashier Desk)", productName: "Quầy Thu Ngân (Cashier Desk)", nodeName: "Checkout", nodeId: 2 }
];

export default function MapScreenMain() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    dispatchNavigate,
    isRobotMoving,
    robotNavState,
    currentTargetNodeName,
    toasts,
    dismissToast,
    setOnRobotReached,
  } = useRobotNavigation();
  
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [pins, setPins] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Robot dispatch confirm modal
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [dispatchTarget, setDispatchTarget] = useState<{ nodeId: number; nodeName: string; x: number; y: number } | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);


  // Animations
  const robotPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Register jumpRobotToNode callback for when robot reaches destination
  useEffect(() => {
    setOnRobotReached((nodeId: number, nodeName: string) => {
      // Find node coords from HARDCODED_MASTER_ROUTE
      const node = HARDCODED_MASTER_ROUTE.find(n => n.nodeId === nodeId);
      if (node) {
        const jsCode = `if (window.jumpRobotToNode) { window.jumpRobotToNode(${node.x}, ${node.y}); } true;`;
        // previewWebViewRef.current?.injectJavaScript(jsCode);
        // modalWebViewRef.current?.injectJavaScript(jsCode);
      }
    });
    return () => setOnRobotReached(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Confirm dispatch
  const handleConfirmDispatch = useCallback(async () => {
    if (!dispatchTarget) return;
    setIsDispatching(true);
    await dispatchNavigate(dispatchTarget.nodeId, dispatchTarget.nodeName);
    setIsDispatching(false);
    setDispatchModalVisible(false);
    setDispatchTarget(null);
  }, [dispatchTarget, dispatchNavigate]);

  // Category and visual styling mapping helper
  const getShelfTheme = (label: string): ShelfTheme => {
    const l = label.toLowerCase();
    if (l.includes('rau') || l.includes('củ') || l.includes('quả') || l.includes('trái cây') || l.includes('vegetable') || l.includes('fruit')) {
      return {
        name: 'RAU CỦ TƯƠI',
        icon: '🥬',
        color: '#10B981',
        topColor: '#A7F3D0',
        frontColor: '#059669',
        sideColor: '#047857',
        signColor: '#047857',
        signText: 'white',
        productColors: ['#EF4444', '#F59E0B', '#10B981', '#22C55E']
      };
    }
    if (l.includes('thịt') || l.includes('cá') || l.includes('hải sản') || l.includes('meat') || l.includes('fish') || l.includes('seafood') || l.includes('bò') || l.includes('heo')) {
      return {
        name: 'THỊT & HẢI SẢN',
        icon: '🥩',
        color: '#EF4444',
        topColor: '#FCA5A5',
        frontColor: '#DC2626',
        sideColor: '#B91C1C',
        signColor: '#B91C1C',
        signText: 'white',
        productColors: ['#EF4444', '#F87171', '#FCA5A5']
      };
    }
    if (l.includes('sữa') || l.includes('bơ') || l.includes('milk') || l.includes('cheese') || l.includes('dairy')) {
      return {
        name: 'SỮA & BƠ',
        icon: '🥛',
        color: '#3B82F6',
        topColor: '#BFDBFE',
        frontColor: '#2563EB',
        sideColor: '#1D4ED8',
        signColor: '#1D4ED8',
        signText: 'white',
        productColors: ['#FFFFFF', '#EFF6FF', '#DBEAFE']
      };
    }
    if (l.includes('gia vị') || l.includes('spice') || l.includes('sauce') || l.includes('dầu ăn') || l.includes('hành') || l.includes('tỏi')) {
      return {
        name: 'GIA VỊ',
        icon: '🌶️',
        color: '#F59E0B',
        topColor: '#FDE68A',
        frontColor: '#D97706',
        sideColor: '#B45309',
        signColor: '#B45309',
        signText: 'white',
        productColors: ['#F59E0B', '#EF4444', '#84CC16']
      };
    }
    if (l.includes('bánh') || l.includes('kẹo') || l.includes('snack') || l.includes('ngọt')) {
      return {
        name: 'BÁNH KẸO',
        icon: '🍪',
        color: '#8B5CF6',
        topColor: '#DDD6FE',
        frontColor: '#7C3AED',
        sideColor: '#6D28D9',
        signColor: '#6D28D9',
        signText: 'white',
        productColors: ['#EC4899', '#3B82F6', '#F59E0B']
      };
    }
    if (l.includes('nước') || l.includes('uống') || l.includes('bia') || l.includes('rượu') || l.includes('drink') || l.includes('beverage')) {
      return {
        name: 'NƯỚC GIẢI KHÁT',
        icon: '🥤',
        color: '#06B6D4',
        topColor: '#CFFAFE',
        frontColor: '#0891B2',
        sideColor: '#0E7490',
        signColor: '#0E7490',
        signText: 'white',
        productColors: ['#06B6D4', '#3B82F6', '#10B981']
      };
    }
    if (l.includes('khuyến mãi') || l.includes('quà') || l.includes('promo')) {
      return {
        name: 'KHUYẾN MÃI',
        icon: '🎁',
        color: '#F43F5E',
        topColor: '#FECDD3',
        frontColor: '#E11D48',
        sideColor: '#BE123C',
        signColor: '#BE123C',
        signText: 'white',
        productColors: ['#EF4444', '#F59E0B', '#FFFFFF']
      };
    }
    if (l.includes('thu ngân') || l.includes('cashier') || l.includes('thanh toán') || l.includes('checkout')) {
      return {
        name: 'QUẦY THU NGÂN',
        icon: '💳',
        color: '#0F766E',
        topColor: '#CCFBF1',
        frontColor: '#0D9488',
        sideColor: '#0F766E',
        signColor: '#0F766E',
        signText: 'white',
        productColors: ['#0F766E', '#14B8A6', '#FFFFFF']
      };
    }
    return {
      name: label.toUpperCase(),
      icon: '🛍️',
      color: '#64748B',
      topColor: '#E2E8F0',
      frontColor: '#475569',
      sideColor: '#334155',
      signColor: '#334155',
      signText: 'white',
      productColors: ['#94A3B8', '#CBD5E1', '#E2E8F0']
    };
  };

  // Define shelves (using DB if available, fallback to realistic mock layout if empty)
  const getDisplayShelves = (map: MapData): SemanticObject[] => {
    if (map.semanticObjects && map.semanticObjects.length > 0) {
      return map.semanticObjects;
    }
    // 3m x 3m Whiteboard Layout (4 Zones + Cashier + Dock)
    return [
      { objectId: 101, objectType: 'PRODUCT_SHELF', xMin: 1.9, yMin: 2.65, xMax: 2.5, yMax: 2.95, label: 'Kệ 1A - Bánh kẹo' },
      { objectId: 102, objectType: 'PRODUCT_SHELF', xMin: 2.65, yMin: 1.3, xMax: 2.95, yMax: 2.1, label: 'Kệ 1B - Nước giải khát' },
      { objectId: 103, objectType: 'PRODUCT_SHELF', xMin: 0.5, yMin: 2.65, xMax: 1.1, yMax: 2.95, label: 'Kệ 2A - Sữa & Bơ' },
      { objectId: 104, objectType: 'PRODUCT_SHELF', xMin: 0.05, yMin: 1.9, xMax: 0.35, yMax: 2.5, label: 'Kệ 2B - Thịt & Hải sản' },
      { objectId: 105, objectType: 'PRODUCT_SHELF', xMin: 0.05, yMin: 0.25, xMax: 0.35, yMax: 0.95, label: 'Kệ 3A - Rau Củ Tươi' },
      { objectId: 106, objectType: 'PRODUCT_SHELF', xMin: 0.55, yMin: 0.25, xMax: 0.85, yMax: 0.95, label: 'Kệ 3B - Gia vị & Đóng hộp' },
      { objectId: 107, objectType: 'PRODUCT_SHELF', xMin: 1.3, yMin: 1.2, xMax: 1.7, yMax: 1.8, label: 'Kệ 4 - Đảo Trung Tâm' },
      { objectId: 108, objectType: 'OBSTACLE', xMin: 1.2, yMin: 0.1, xMax: 1.6, yMax: 0.5, label: 'Khu vực cấm [ X ]' },
      { objectId: 109, objectType: 'CASHIER', xMin: 2.0, yMin: 0.1, xMax: 2.6, yMax: 0.5, label: 'Quầy Thu Ngân' },
      { objectId: 110, objectType: 'DOCK', xMin: 2.65, yMin: 0.45, xMax: 2.95, yMax: 0.75, label: 'Vị trí Robot (Start / Dock)' }
    ];
  };

  useEffect(() => {
    if (params.invoice) {
      if (typeof params.invoice === 'string') {
        try { setInvoiceData(JSON.parse(params.invoice)); } catch (e) { setInvoiceData(params.invoice); }
      } else {
        setInvoiceData(params.invoice);
      }
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const map = await MapService.getLatestMap(1);
        setMapData(map);
        
        let path: RoutePoint[] = [];
        if (params.routePlan) {
          try {
            const parsed = typeof params.routePlan === 'string' ? JSON.parse(params.routePlan) : params.routePlan;
            if (Array.isArray(parsed) && parsed.length > 0) {
              path = parsed.map((p: any) => ({
                x: p.x || p.xCoord || 0,
                y: p.y || p.yCoord || 0,
                description: p.description || p.nodeName || '',
                productName: p.productName || '',
                productId: p.productId,
                nodeName: p.nodeName || '',
                nodeId: p.nodeId || p.id
              }));
            }
          } catch (e) {
            console.warn('Error parsing routePlan', e);
          }
        }
        
        if (path.length === 0) {
          path = HARDCODED_MASTER_ROUTE;
        }
        
        setRoutePoints(path);
        
        if (path.length > 0) {
           robotPos.setValue({ 
               x: path[0].x, 
               y: path[0].y 
           });
           
           const animations = path.slice(1).map((pt) => {
               return Animated.timing(robotPos, {
                   toValue: { 
                       x: pt.x, 
                       y: pt.y 
                   },
                   duration: 2800,
                   easing: Easing.inOut(Easing.ease),
                   useNativeDriver: false
               });
           });

           Animated.loop(Animated.sequence(animations)).start();
        }
      } catch (error) {
        console.error('Error loading map:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    Animated.loop(
        Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
    ).start();

  }, [params.routePlan, params.invoice, params.targetSemanticObjectId]);

  // Map invoice items to shelf IDs
  useEffect(() => {
    if (!mapData) return;

    const activeShelves = getDisplayShelves(mapData);
    let itemsToPin: { name: string; icon: string; shelfId: number }[] = [];
    let invoiceItems: any[] = [];
    if (invoiceData) {
      invoiceItems = invoiceData.items || invoiceData.invoiceItems || [];
    }

    if (invoiceItems.length > 0) {
      invoiceItems.forEach((item: any) => {
        const name = item.productName || item.name || '';
        const theme = getShelfTheme(name);
        
        const matchedShelf = activeShelves.find((shelf) => {
          const l = shelf.label.toLowerCase();
          const n = name.toLowerCase();
          
          if (n.includes('rau') || n.includes('củ') || n.includes('quả') || n.includes('trái cây') || n.includes('ớt') || n.includes('hành') || n.includes('tỏi') || n.includes('tây')) {
            return l.includes('rau') || l.includes('củ') || l.includes('trái cây') || l.includes('veg');
          }
          if (n.includes('thịt') || n.includes('cá') || n.includes('hải sản') || n.includes('bò') || n.includes('heo') || n.includes('gà')) {
            return l.includes('thịt') || l.includes('hải sản') || l.includes('meat');
          }
          if (n.includes('sữa') || n.includes('bơ') || n.includes('phô mai')) {
            return l.includes('sữa') || l.includes('dairy') || l.includes('bơ');
          }
          if (n.includes('gia vị') || n.includes('mắm') || n.includes('muối') || n.includes('tiêu')) {
            return l.includes('gia vị') || l.includes('spice');
          }
          if (n.includes('bánh') || n.includes('kẹo') || n.includes('snack')) {
            return l.includes('bánh') || l.includes('kẹo') || l.includes('snack');
          }
          if (n.includes('nước') || n.includes('uống') || n.includes('lon') || n.includes('chai') || n.includes('bia')) {
            return l.includes('nước') || l.includes('uống') || l.includes('drink');
          }
          return false;
        });

        if (matchedShelf) {
          itemsToPin.push({
            name,
            icon: theme.icon,
            shelfId: matchedShelf.objectId
          });
        }
      });
    }

    if (itemsToPin.length === 0) {
      activeShelves.forEach((shelf) => {
        const theme = getShelfTheme(shelf.label);
        if (shelf.objectType === 'PRODUCT_SHELF' && shelf.label !== 'DOCK' && !shelf.label.toLowerCase().includes('thu ngân')) {
          itemsToPin.push({
            name: theme.name,
            icon: theme.icon,
            shelfId: shelf.objectId
          });
        }
      });
    }

    const grouped: { [key: number]: typeof itemsToPin } = {};
    itemsToPin.forEach(item => {
      if (!grouped[item.shelfId]) grouped[item.shelfId] = [];
      grouped[item.shelfId].push(item);
    });

    const finalPins: any[] = [];
    let pinNumber = 1;
    Object.keys(grouped).forEach((shelfIdStr) => {
      const shelfId = Number(shelfIdStr);
      const groupItems = grouped[shelfId];
      const numbers: number[] = [];
      groupItems.forEach(() => {
        numbers.push(pinNumber++);
      });

      finalPins.push({
        shelfId,
        items: groupItems,
        label: numbers.join(', '),
        mainIcon: groupItems[0].icon
      });
    });

    setPins(finalPins);
  }, [mapData, invoiceData]);



  if (loading || !mapData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator size="large" color="#059669" />
         <Text style={{ marginTop: 12, color: '#059669', fontWeight: 'bold', fontSize: 16 }}>Đang thiết lập định vị không gian...</Text>
      </SafeAreaView>
    );
  }

  const isRoutingActive = routePoints && routePoints.length > 1;
  const earnedPoints = invoiceData?.totalPrice ? Math.floor(invoiceData.totalPrice * 0.1) : 245;
  const displayShelves = getDisplayShelves(mapData);

  // ----------------------------------------------------
  // RENDER DETAILED VECTOR SVG MAP COMPONENT
  // ----------------------------------------------------
  const renderMapContent = (widthCanvas: number, isLarge: boolean) => {
    // Math configuration for scale and offsets to avoid overflow
    const padding = isLarge ? 24 : 16;
    const availableWidth = widthCanvas - padding * 2;
    const scale = availableWidth / mapData.widthMeters;
    
    // Dynamic height based on scale
    const mapH = mapData.heightMeters * scale + padding * 2 + (isLarge ? 55 : 40);
    const ox = padding;
    const oy = padding + (isLarge ? 30 : 22); // headroom for 3D walls & signboards

    const project = (x: number, y: number, z: number = 0) => {
      const px = ox + x * scale;
      const py = oy + y * scale - z;
      return { x: px, y: py };
    };

    const floorA = project(0, 0);
    const floorB = project(mapData.widthMeters, 0);
    const floorC = project(mapData.widthMeters, mapData.heightMeters);
    const floorD = project(0, mapData.heightMeters);

    // 3D Walls (Subtle, sleek gray depth)
    const zWall = isLarge ? 12 : 8;
    const wallTopA = project(0, 0, zWall);
    const wallTopB = project(mapData.widthMeters, 0, zWall);
    const wallLeftA = project(0, 0, zWall);
    const wallLeftB = project(0, mapData.heightMeters, zWall);

    // Helper functions for detailed 3D assets rendering
    const renderVeggieAsset = (shelf: SemanticObject) => {
      const zHeight = isLarge ? 12 : 8;
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const t0 = project(shelf.xMin, shelf.yMin, zHeight);
      const t1 = project(shelf.xMax, shelf.yMin, zHeight);
      const t2 = project(shelf.xMax, shelf.yMax, zHeight);
      const t3 = project(shelf.xMin, shelf.yMax, zHeight);

      const stepX = (shelf.xMax - shelf.xMin) / 5;
      const veggiesList = [];
      for (let i = 0; i < 4; i++) {
        const x = shelf.xMin + stepX * (i + 0.5);
        const p1 = project(x, shelf.yMin + 0.12, zHeight + (isLarge ? 1.5 : 1));
        const p2 = project(x, shelf.yMin + 0.28, zHeight + (isLarge ? 1.5 : 1));
        
        veggiesList.push(
          <G key={`cab-${shelf.objectId}-${i}`}>
            <Circle cx={p1.x} cy={p1.y} r={isLarge ? 3 : 2} fill="#10B981" stroke="#047857" strokeWidth={0.4} />
            <Path d={`M ${p1.x - 1} ${p1.y - 1} Q ${p1.x} ${p1.y + 1} ${p1.x + 1} ${p1.y - 1}`} fill="none" stroke="#A7F3D0" strokeWidth={0.3} />
          </G>
        );

        veggiesList.push(
          <G key={`car-${shelf.objectId}-${i}`}>
            <Polygon points={`${p2.x - 1},${p2.y + 1.5} ${p2.x + 1},${p2.y + 1.5} ${p2.x},${p2.y - 1.5}`} fill="#F97316" />
            <Path d={`M ${p2.x} ${p2.y + 1.5} L ${p2.x} ${p2.y + 3}`} fill="none" stroke="#22C55E" strokeWidth={0.5} />
          </G>
        );
      }

      return (
        <G key={`veggie-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="rgba(15, 23, 42, 0.12)" />
          <Polygon points={`${b3.x},${b3.y} ${b2.x},${b2.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="url(#woodLight)" stroke="#5C2607" strokeWidth={0.5} />
          <Polygon points={`${b2.x},${b2.y} ${b1.x},${b1.y} ${t1.x},${t1.y} ${t2.x},${t2.y}`} fill="url(#woodDark)" stroke="#451A03" strokeWidth={0.5} />
          
          <Line x1={b3.x} y1={(b3.y + t3.y)/2} x2={b2.x} y2={(b2.y + t2.y)/2} stroke="#451A03" strokeWidth={0.6} />
          <Line x1={b2.x} y1={(b2.y + t2.y)/2} x2={b1.x} y2={(b1.y + t1.y)/2} stroke="#2D0F02" strokeWidth={0.6} />
          
          <Polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#78350F" stroke="#451A03" strokeWidth={0.4} />
          {veggiesList}
          
          <G>
            <Line x1={(t0.x + t2.x)/2} y1={(t0.y + t2.y)/2} x2={(t0.x + t2.x)/2} y2={(t0.y + t2.y)/2 - (isLarge ? 4 : 3)} stroke="#475569" strokeWidth={0.5} />
            <Rect x={(t0.x + t2.x)/2 - 12} y={(t0.y + t2.y)/2 - 9.5} width={24} height={5.5} rx={0.8} fill="#1E293B" stroke="#B45309" strokeWidth={0.5} />
            <SvgText x={(t0.x + t2.x)/2} y={(t0.y + t2.y)/2 - 5.5} fill="#FCD34D" fontSize="3" fontWeight="bold" textAnchor="middle">🥬 RAU TƯƠI</SvgText>
          </G>
        </G>
      );
    };

    const renderMeatAsset = (shelf: SemanticObject) => {
      const zHeight = isLarge ? 10 : 7;
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const t0 = project(shelf.xMin, shelf.yMin, zHeight);
      const t1 = project(shelf.xMax, shelf.yMin, zHeight);
      const t2 = project(shelf.xMax, shelf.yMax, zHeight);
      const t3 = project(shelf.xMin, shelf.yMax, zHeight);

      const stepX = (shelf.xMax - shelf.xMin) / 4;
      const meatList = [];
      for (let i = 0; i < 3; i++) {
        const x = shelf.xMin + stepX * (i + 0.5);
        const p = project(x, shelf.yMin + 0.2, zHeight - 1);
        meatList.push(
          <G key={`meat-pkg-${shelf.objectId}-${i}`}>
            <Rect x={p.x - 3} y={p.y - 2} width={6} height={4} rx={0.8} fill="#EF4444" stroke="#DC2626" strokeWidth={0.3} />
            <Path d={`M ${p.x - 1.5} ${p.y - 0.5} Q ${p.x} ${p.y + 0.5} ${p.x + 1.5} ${p.y - 0.5}`} stroke="white" strokeWidth={0.4} fill="none" />
          </G>
        );
      }

      return (
        <G key={`meat-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="rgba(15, 23, 42, 0.12)" />
          <Polygon points={`${b3.x},${b3.y} ${b2.x},${b2.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="url(#metalLight)" stroke="#94A3B8" strokeWidth={0.5} />
          <Polygon points={`${b2.x},${b2.y} ${b1.x},${b1.y} ${t1.x},${t1.y} ${t2.x},${t2.y}`} fill="url(#metalDark)" stroke="#64748B" strokeWidth={0.5} />
          <Polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#475569" stroke="#334155" strokeWidth={0.5} />
          <Polygon points={`${t0.x + 1},${t0.y + 1} ${t1.x - 1},${t1.y + 1} ${t2.x - 1},${t2.y - 1} ${t3.x + 1},${t3.y - 1}`} fill="#1E293B" />
          <Polygon points={`${t0.x + 1.2},${t0.y + 1.2} ${t1.x - 1.2},${t1.y + 1.2} ${t2.x - 1.2},${t2.y - 1.2} ${t3.x + 1.2},${t3.y - 1.2}`} fill="rgba(6, 182, 212, 0.25)" />
          
          {meatList}

          <Polygon
            points={`${t3.x},${t3.y} ${t2.x},${t2.y} ${t2.x},${t2.y - (isLarge ? 6 : 4)} ${t3.x},${t3.y - (isLarge ? 6 : 4)}`}
            fill="rgba(165, 243, 252, 0.3)"
            stroke="rgba(6, 182, 212, 0.8)"
            strokeWidth={0.5}
          />
          <Line x1={t3.x + 4} y1={t3.y - 1} x2={t2.x - 4} y2={t2.y - 3} stroke="white" strokeWidth={0.8} strokeOpacity={0.6} />

          <G>
            <Rect x={(t0.x + t2.x)/2 - 12} y={(t0.y + t2.y)/2 - 8.5} width={24} height={5.5} rx={0.8} fill="#EF4444" stroke="white" strokeWidth={0.4} />
            <SvgText x={(t0.x + t2.x)/2} y={(t0.y + t2.y)/2 - 4.5} fill="white" fontSize="3" fontWeight="bold" textAnchor="middle">🥩 THỊT TƯƠI</SvgText>
          </G>
        </G>
      );
    };

    const renderDairyAsset = (shelf: SemanticObject) => {
      const zHeight = isLarge ? 20 : 14;
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const t0 = project(shelf.xMin, shelf.yMin, zHeight);
      const t1 = project(shelf.xMax, shelf.yMin, zHeight);
      const t2 = project(shelf.xMax, shelf.yMax, zHeight);
      const t3 = project(shelf.xMin, shelf.yMax, zHeight);

      const racksJSX = [];
      const tiers = 3;
      for (let t = 1; t <= tiers; t++) {
        const ratio = t / (tiers + 1);
        const rX1 = b3.x + (t3.x - b3.x) * ratio + 1;
        const rY1 = b3.y + (t3.y - b3.y) * ratio - 1;
        const rX2 = b2.x + (t2.x - b2.x) * ratio - 1;
        const rY2 = b2.y + (t2.y - b2.y) * ratio - 1;

        racksJSX.push(
          <Line key={`dairy-rack-${shelf.objectId}-${t}`} x1={rX1} y1={rY1} x2={rX2} y2={rY2} stroke="rgba(255,255,255,0.7)" strokeWidth={0.6} />
        );

        const numCans = 4;
        const step = (rX2 - rX1) / numCans;
        for (let c = 0; c < numCans; c++) {
          const cx = rX1 + step * (c + 0.4);
          const cy = rY1 + step * (c + 0.4) * 0.1 - 2.5;
          racksJSX.push(
            <Rect key={`dairy-prod-${shelf.objectId}-${t}-${c}`} x={cx - 1.5} y={cy} width={3} height={4} fill="#FFFFFF" rx={0.3} stroke="#DBEAFE" strokeWidth={0.2} />
          );
        }
      }

      return (
        <G key={`dairy-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="rgba(15, 23, 42, 0.12)" />
          <Polygon points={`${b3.x},${b3.y} ${b2.x},${b2.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="url(#blueCabinetLight)" stroke="#1D4ED8" strokeWidth={0.5} />
          <Polygon points={`${b2.x},${b2.y} ${b1.x},${b1.y} ${t1.x},${t1.y} ${t2.x},${t2.y}`} fill="url(#blueCabinetDark)" stroke="#1E3A8A" strokeWidth={0.5} />
          <Polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#1E3A8A" stroke="#172554" strokeWidth={0.4} />
          <Polygon points={`${b3.x + 1},${b3.y - 1} ${b2.x - 1},${b2.y - 1} ${t2.x - 1},${t2.y + 1} ${t3.x + 1},${t3.y + 1}`} fill="rgba(219, 234, 254, 0.2)" stroke="#93C5FD" strokeWidth={0.6} />
          
          {racksJSX}

          <Line x1={b3.x + 3} y1={b3.y - 3} x2={t2.x - 3} y2={t2.y + 3} stroke="white" strokeWidth={0.8} strokeOpacity={0.4} />

          <G>
            <Rect x={(t3.x + t2.x)/2 - 12} y={(t3.y + t2.y)/2 - 12.5} width={24} height={5.5} rx={0.8} fill="#3B82F6" stroke="white" strokeWidth={0.4} />
            <SvgText x={(t3.x + t2.x)/2} y={(t3.y + t2.y)/2 - 8.5} fill="white" fontSize="3" fontWeight="bold" textAnchor="middle">🥛 SỮA & BƠ</SvgText>
          </G>
        </G>
      );
    };

    const renderGroceryAsset = (shelf: SemanticObject) => {
      const zHeight = isLarge ? 16 : 11;
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const t0 = project(shelf.xMin, shelf.yMin, zHeight);
      const t1 = project(shelf.xMax, shelf.yMin, zHeight);
      const t2 = project(shelf.xMax, shelf.yMax, zHeight);
      const t3 = project(shelf.xMin, shelf.yMax, zHeight);

      const theme = getShelfTheme(shelf.label);

      const racksJSX = [];
      const tiers = 3;
      for (let t = 1; t <= tiers; t++) {
        const ratio = t / (tiers + 1);
        const rx1 = b3.x + (t3.x - b3.x) * ratio;
        const ry1 = b3.y + (t3.y - b3.y) * ratio;
        const rx2 = b2.x + (t2.x - b2.x) * ratio;
        const ry2 = b2.y + (t2.y - b2.y) * ratio;

        racksJSX.push(
          <Line key={`shelf-line-${shelf.objectId}-${t}`} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#94A3B8" strokeWidth={1} />
        );

        const numProd = 5;
        const step = (rx2 - rx1) / numProd;
        for (let p = 0; p < numProd; p++) {
          const px = rx1 + step * (p + 0.4);
          const py = ry1 + step * (p + 0.4) * 0.1 - 1.5;
          const fill = theme.productColors[p % theme.productColors.length];
          
          if (p % 2 === 0) {
            racksJSX.push(
              <Rect key={`prod-${shelf.objectId}-${t}-${p}`} x={px - 1.2} y={py - 1.2} width={2.4} height={3} fill={fill} rx={0.3} />
            );
          } else {
            racksJSX.push(
              <G key={`prod-${shelf.objectId}-${t}-${p}`}>
                <Rect x={px - 0.8} y={py - 0.8} width={1.6} height={2.4} fill={fill} rx={0.2} />
                <Ellipse cx={px} cy={py - 0.8} rx={0.8} ry={0.3} fill="#CBD5E1" />
              </G>
            );
          }
        }
      }

      return (
        <G key={`grocery-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="rgba(15, 23, 42, 0.12)" />
          <Line x1={b3.x} y1={b3.y} x2={t3.x} y2={t3.y} stroke="#475569" strokeWidth={0.8} />
          <Line x1={b2.x} y1={b2.y} x2={t2.x} y2={t2.y} stroke="#475569" strokeWidth={0.8} />
          <Line x1={b1.x} y1={b1.y} x2={t1.x} y2={t1.y} stroke="#334155" strokeWidth={0.8} />
          <Polygon points={`${t3.x},${t3.y} ${t2.x},${t2.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="#F1F5F9" stroke="#CBD5E1" strokeWidth={0.4} />
          
          {racksJSX}

          <Polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#CBD5E1" stroke="#94A3B8" strokeWidth={0.5} />
          <G>
            <Rect x={(t0.x + t2.x)/2 - 12} y={(t0.y + t2.y)/2 - 8} width={24} height={5} rx={0.8} fill={theme.signColor} stroke="#FFFFFF" strokeWidth={0.4} />
            <SvgText x={(t0.x + t2.x)/2} y={(t0.y + t2.y)/2 - 4.2} fill={theme.signText} fontSize="3" fontWeight="bold" textAnchor="middle">{theme.name}</SvgText>
          </G>
        </G>
      );
    };

    const renderCashierAsset = (shelf: SemanticObject) => {
      const zHeight = isLarge ? 10 : 7;
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const t0 = project(shelf.xMin, shelf.yMin, zHeight);
      const t1 = project(shelf.xMax, shelf.yMin, zHeight);
      const t2 = project(shelf.xMax, shelf.yMax, zHeight);
      const t3 = project(shelf.xMin, shelf.yMax, zHeight);

      const midX = (t0.x + t2.x) / 2;
      const midY = (t0.y + t2.y) / 2;

      return (
        <G key={`cashier-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="rgba(15, 23, 42, 0.12)" />
          <Polygon points={`${b3.x},${b3.y} ${b2.x},${b2.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#0D9488" stroke="#0F766E" strokeWidth={0.5} />
          <Polygon points={`${b2.x},${b2.y} ${b1.x},${b1.y} ${t1.x},${t1.y} ${t2.x},${t2.y}`} fill="#0F766E" stroke="#115E59" strokeWidth={0.5} />
          <Polygon points={`${t0.x},${t0.y} ${t1.x},${t1.y} ${t2.x},${t2.y} ${t3.x},${t3.y}`} fill="#CCFBF1" stroke="#0F766E" strokeWidth={0.4} />
          <Rect x={t3.x + 2} y={t3.y + 1} width={(t2.x - t3.x) - 4} height={4} fill="#334155" rx={0.5} />
          
          <G>
            <Line x1={midX} y1={midY} x2={midX} y2={midY - 4} stroke="#1E293B" strokeWidth={1} />
            <Rect x={midX - 3.5} y={midY - 7} width={7} height={5} rx={0.5} fill="#1E293B" stroke="#475569" strokeWidth={0.3} />
            <Rect x={midX - 2.8} y={midY - 6.3} width={5.6} height={3.6} fill="#065F46" />
            <Line x1={midX - 4} y1={midY + 2} x2={midX + 4} y2={midY + 3} stroke="#EF4444" strokeWidth={0.5} />
          </G>

          <G>
            <Rect x={midX - 15} y={midY - 12.5} width={30} height={5} rx={0.8} fill="#0F766E" stroke="white" strokeWidth={0.4} />
            <SvgText x={midX} y={midY - 8.8} fill="white" fontSize="2.8" fontWeight="bold" textAnchor="middle">💳 THÀNH TOÁN</SvgText>
          </G>
        </G>
      );
    };

    const renderDockAsset = (shelf: SemanticObject) => {
      const b0 = project(shelf.xMin, shelf.yMin, 0);
      const b1 = project(shelf.xMax, shelf.yMin, 0);
      const b2 = project(shelf.xMax, shelf.yMax, 0);
      const b3 = project(shelf.xMin, shelf.yMax, 0);

      const midX = (b0.x + b2.x) / 2;
      const midY = (b0.y + b2.y) / 2;

      return (
        <G key={`dock-${shelf.objectId}`}>
          <Polygon points={`${b0.x},${b0.y} ${b1.x},${b1.y} ${b2.x},${b2.y} ${b3.x},${b3.y}`} fill="#1E293B" stroke="#D97706" strokeWidth={0.8} />
          <Polygon points={`${b0.x + 2},${b0.y + 2} ${b1.x - 2},${b1.y + 2} ${b2.x - 2},${b2.y - 2} ${b3.x + 2},${b3.y - 2}`} fill="#334155" stroke="url(#chargingGlow)" strokeWidth={0.8} />
          <Path d={`M ${midX - 1} ${midY - 4} L ${midX + 2} ${midY - 1} L ${midX - 1} ${midY} L ${midX + 1} ${midY + 4} L ${midX - 2} ${midY + 1} L ${midX + 1} ${midY} Z`} fill="#D97706" />
        </G>
      );
    };

    return (
      <View style={{ width: widthCanvas, height: mapH, backgroundColor: '#F8FAFC', borderRadius: 20, overflow: 'hidden' }}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <SvgLinearGradient id="woodLight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#92400E" stopOpacity="1" />
              <Stop offset="100%" stopColor="#78350F" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="woodDark" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#78350F" stopOpacity="1" />
              <Stop offset="100%" stopColor="#451A03" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="metalLight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E2E8F0" stopOpacity="1" />
              <Stop offset="50%" stopColor="#CBD5E1" stopOpacity="1" />
              <Stop offset="100%" stopColor="#94A3B8" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="metalDark" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#94A3B8" stopOpacity="1" />
              <Stop offset="100%" stopColor="#64748B" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="blueCabinetLight" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="blueCabinetDark" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#1D4ED8" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1E3A8A" stopOpacity="1" />
            </SvgLinearGradient>
            <SvgLinearGradient id="chargingGlow" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
              <Stop offset="100%" stopColor="#D97706" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>

          {/* Floor Area */}
          <Polygon
            points={`${floorA.x},${floorA.y} ${floorB.x},${floorB.y} ${floorC.x},${floorC.y} ${floorD.x},${floorD.y}`}
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth={1}
          />

          {/* Top Wall 3D Panel */}
          <Polygon
            points={`${floorA.x},${floorA.y} ${floorB.x},${floorB.y} ${wallTopB.x},${wallTopB.y} ${wallTopA.x},${wallTopA.y}`}
            fill="#CBD5E1"
            stroke="#94A3B8"
            strokeWidth={0.5}
          />
          {/* Left Wall 3D Panel */}
          <Polygon
            points={`${floorA.x},${floorA.y} ${floorD.x},${floorD.y} ${wallLeftB.x},${wallLeftB.y} ${wallLeftA.x},${wallLeftA.y}`}
            fill="#94A3B8"
            stroke="#64748B"
            strokeWidth={0.5}
          />
          {/* Top wall cap lines */}
          <Polyline
            points={`${wallLeftB.x},${wallLeftB.y} ${wallLeftA.x},${wallLeftA.y} ${wallTopB.x},${wallTopB.y}`}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={1.5}
          />

          {/* 3D Shelves */}
          {displayShelves.map((shelf) => {
            const label = shelf.label.toLowerCase();
            if (label.includes('rau') || label.includes('củ') || label.includes('quả') || label.includes('trái cây') || label.includes('vegetable') || label.includes('fruit')) {
              return renderVeggieAsset(shelf);
            } else if (label.includes('thịt') || label.includes('cá') || label.includes('hải sản') || label.includes('meat') || label.includes('fish') || label.includes('seafood')) {
              return renderMeatAsset(shelf);
            } else if (label.includes('sữa') || label.includes('bơ') || label.includes('dairy') || label.includes('milk')) {
              return renderDairyAsset(shelf);
            } else if (label.includes('thu ngân') || label.includes('cashier') || label.includes('thanh toán') || label.includes('checkout')) {
              return renderCashierAsset(shelf);
            } else if (label.includes('dock') || label.includes('sạc')) {
              return renderDockAsset(shelf);
            } else {
              return renderGroceryAsset(shelf);
            }
          })}

          {/* Active Navigation line (ONLY if routing is active) */}
          {isRoutingActive && routePoints.length > 1 && (
            <G>
              <Polyline
                points={routePoints.map(pt => {
                  const p = project(pt.x, pt.y, 1.5);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(16, 185, 129, 0.2)"
                strokeWidth={isLarge ? 9 : 7}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={routePoints.map(pt => {
                  const p = project(pt.x, pt.y, 1.5);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="#10B981"
                strokeWidth={isLarge ? 2.5 : 1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Polyline
                points={routePoints.map(pt => {
                  const p = project(pt.x, pt.y, 1.5);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="#A7F3D0"
                strokeWidth={isLarge ? 1 : 0.8}
                strokeDasharray="5, 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Nodes for route */}
              {routePoints.map((pt, index) => {
                const p = project(pt.x, pt.y, 1.5);
                const isStart = index === 0;
                const isEnd = index === routePoints.length - 1;
                const r = isLarge ? 6 : 5;
                const fontSize = isLarge ? "5" : "4";
                let bgColor = "#2563eb";
                if (isStart) bgColor = "#16a34a"; // completed/start
                if (isEnd) bgColor = "#f97316"; // end destination
                
                return (
                  <G key={`node-${index}`}>
                    <Circle cx={p.x} cy={p.y} r={r} fill={bgColor} stroke="#ffffff" strokeWidth={1} />
                    <SvgText x={p.x} y={p.y + (isLarge ? 1.8 : 1.4)} fill="#ffffff" fontSize={fontSize} fontWeight="900" textAnchor="middle">
                      {index + 1}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          )}

          {/* Start marker removed as requested */}

          {/* 100% Vector SVG speech bubble pins (Prevents layout shifting and overlapping) */}
          {pins.map((pin) => {
            const matchedShelf = displayShelves.find(s => s.objectId === pin.shelfId);
            if (!matchedShelf) return null;

            const isCashier = matchedShelf.label.toLowerCase().includes('thu ngân') || matchedShelf.label.toLowerCase().includes('cashier');
            const isDock = matchedShelf.label.toLowerCase().includes('dock');
            const zHeight = isDock ? 4 : (isCashier ? (isLarge ? 10 : 7) : (isLarge ? 16 : 11));
            
            const t0 = project(matchedShelf.xMin, matchedShelf.yMin, zHeight);
            const t2 = project(matchedShelf.xMax, matchedShelf.yMax, zHeight);
            const px = (t0.x + t2.x) / 2;
            const py = (t0.y + t2.y) / 2 - (isLarge ? 12 : 8);

            const bubbleW = isLarge ? 32 : 26;
            const bubbleH = isLarge ? 15 : 12;
            const r = isLarge ? 5 : 4;

            return (
              <G key={`vpin-${pin.shelfId}`}>
                <Polygon
                  points={`${px - (isLarge ? 3.5 : 2.5)},${py - (isLarge ? 4 : 3)} ${px + (isLarge ? 3.5 : 2.5)},${py - (isLarge ? 4 : 3)} ${px},${py}`}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                />
                <Rect
                  x={px - bubbleW / 2}
                  y={py - bubbleH - (isLarge ? 3 : 2)}
                  width={bubbleW}
                  height={bubbleH}
                  rx={r}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth={0.8}
                />
                <Circle
                  cx={px - bubbleW / 2 + (isLarge ? 7.5 : 6)}
                  cy={py - bubbleH / 2 - (isLarge ? 3 : 2)}
                  r={isLarge ? 4.5 : 3.5}
                  fill="#FFFFFF"
                />
                <SvgText
                  x={px - bubbleW / 2 + (isLarge ? 7.5 : 6)}
                  y={py - bubbleH / 2 - (isLarge ? 1 : 0.8)}
                  fontSize={isLarge ? "6" : "5"}
                  textAnchor="middle"
                >
                  {pin.mainIcon}
                </SvgText>
                <SvgText
                  x={px + (isLarge ? 5 : 4)}
                  y={py - bubbleH / 2 - (isLarge ? 0.2 : 0.2)}
                  fill="#FFFFFF"
                  fontSize={isLarge ? "7.5" : "6"}
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {pin.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {/* Absolute-positioned 3D Lidar Robot on top (ONLY if routing is active) */}
        {isRoutingActive && (
          <Animated.View
            style={[
              styles.robotMarker,
              {
                left: Animated.add(ox - (isLarge ? 16 : 12), Animated.multiply(robotPos.x, scale)),
                top: Animated.add(oy - (isLarge ? 16 : 12) - 3, Animated.multiply(robotPos.y, scale)),
                width: isLarge ? 32 : 24,
                height: isLarge ? 32 : 24,
              }
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 32 32">
              <Ellipse cx="16" cy="26" rx="10" ry="4" fill="rgba(15, 23, 42, 0.25)" />
              <Path d="M 6 20 C 6 24, 26 24, 26 20 L 26 16 C 26 20, 6 20, 6 16 Z" fill="#1D4ED8" />
              <Path d="M 6 16 Q 16 2, 26 16 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
              <Path d="M 9 13 Q 16 8, 23 13 Q 16 16, 9 13 Z" fill="#1E293B" />
              <Path d="M 11 12.5 Q 16 10, 21 12.5" fill="none" stroke="#06B6D4" strokeWidth="1" />
              <Rect x="13" y="2" width="6" height="3" rx="1" fill="#475569" />
              <Circle cx="16" cy="3.5" r="1.2" fill="#EF4444" />
            </Svg>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#059669" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>TRỢ LÝ TÌM ĐƯỜNG</Text>
          <Text style={styles.headerTitle}>Lộ Trình & Bản Đồ</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Visualization Preview Card */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View style={styles.mapHeaderIcon}>
               <Compass color="#10B981" size={18} />
            </View>
            <Text style={styles.mapHeaderText}>{mapData.mapName || 'Sơ đồ Siêu Thị Thông Minh 3D'}</Text>
          </View>
          
          {/* Tap to expand preview card */}
          <TouchableOpacity activeOpacity={0.9} style={styles.mapPreviewClickable} onPress={() => setIsModalVisible(true)}>
             <View style={{ width: '100%', height: 280, borderRadius: 16, overflow: 'hidden' }}>
               {renderMapContent(CANVAS_SIZE, false)}
             </View>
             
             {/* Glassmorphic expand indicator banner */}
             <View style={styles.expandOverlay}>
               <Maximize2 color="white" size={15} style={{ marginRight: 6 }} />
               <Text style={styles.expandText}>Chạm để xem toàn bộ bản đồ 3D tương tác</Text>
             </View>
          </TouchableOpacity>

          {/* Chú giải */}
          <View style={styles.statusLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6', shadowColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Vị trí của bạn</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981', shadowColor: '#10B981' }]} />
              <Text style={styles.legendText}>Robot dẫn đường</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Điểm đến</Text>
            </View>
          </View>
        </View>

        {/* Fullscreen Interactive Map Modal (Rendered ONLY when visible to prevent ANR) */}
        {isModalVisible && (
          <Modal
            animationType="slide"
            transparent={false}
            visible={isModalVisible}
            onRequestClose={() => setIsModalVisible(false)}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0F17' }}>
              <View style={{
                height: 56,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.1)',
                backgroundColor: '#0B0F17'
              }}>
                <View>
                  <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '800', letterSpacing: 1 }}>SƠ ĐỒ TRỰC QUAN 3D</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#F8FAFC' }}>{mapData.mapName || 'Siêu Thị Toàn Cảnh 3D'}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                  <X color="#F8FAFC" size={24} />
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                {renderMapContent(CANVAS_SIZE, false)}
              </View>
            </SafeAreaView>
          </Modal>
        )}

        {/* Thông tin đơn hàng (Nâng cấp giao diện) */}
        {isRoutingActive && (
          <View style={styles.infoCard}>
            <View style={styles.pointsEarnedContainer}>
              <View style={styles.pointsIconContainer}>
                <Star color="#F59E0B" size={24} fill="#F59E0B" />
              </View>
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsLabel}>Điểm thưởng tích lũy</Text>
                <Text style={styles.pointsValue}>+{earnedPoints} Điểm</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <LinearGradient colors={['#ECFDF5', '#D1FAE5']} style={styles.successBanner}>
              <View style={styles.successIconWrapper}>
                  <CheckCircle2 color="#059669" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.successTitle}>Đã thiết lập lộ trình!</Text>
                <Text style={styles.successDesc}>
                  Robot đang di chuyển đến vị trí của bạn để dẫn đường tới kệ hàng.
                </Text>
              </View>
            </LinearGradient>

            {invoiceData?.totalPrice && (
              <View style={styles.invoiceSummary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Mã hóa đơn tham chiếu:</Text>
                  <Text style={styles.summaryValueText}>#{invoiceData.invoiceId || 'SM-8293'}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng thanh toán:</Text>
                  <Text style={styles.summaryPriceText}>{formatPrice(invoiceData.totalPrice)}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.btnHome} onPress={() => router.replace('/home')}>
          <Home color="white" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnHomeText}>Hoàn thành & Về trang chủ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Robot Moving Status Banner */}
      {isRobotMoving && (
        <View style={styles.robotMovingBanner}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.robotMovingText}>
            Robot đang di chuyển đến {currentTargetNodeName}...
          </Text>
        </View>
      )}

      {/* Toast Overlay */}
      {toasts.length > 0 && (
        <View style={styles.toastContainer} pointerEvents="none">
          {toasts.map(t => (
            <View
              key={t.id}
              style={[
                styles.toastItem,
                t.type === 'success' && { backgroundColor: '#064E3B', borderColor: '#10B981' },
                t.type === 'error'   && { backgroundColor: '#450A0A', borderColor: '#EF4444' },
                t.type === 'info'    && { backgroundColor: '#0C1A3D', borderColor: '#3B82F6' },
                t.type === 'warning' && { backgroundColor: '#451A03', borderColor: '#F59E0B' },
              ]}
            >
              <Text style={styles.toastText}>{t.message}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Robot Dispatch Confirm Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dispatchModalVisible}
        onRequestClose={() => { if (!isDispatching) { setDispatchModalVisible(false); setDispatchTarget(null); } }}
      >
        <View style={styles.dispatchOverlay}>
          <View style={styles.dispatchModal}>
            <View style={styles.dispatchIconRow}>
              <View style={styles.dispatchIconBg}>
                <Navigation color="#10B981" size={28} />
              </View>
            </View>
            <Text style={styles.dispatchTitle}>Điều phối Robot</Text>
            <Text style={styles.dispatchSubtitle}>
              Bạn muốn điều hướng Robot đến vị trí
            </Text>
            <Text style={styles.dispatchNodeName}>
              {dispatchTarget?.nodeName ?? ''}
            </Text>

            {isRobotMoving && robotNavState !== 'DISPATCHING' ? (
              <View style={styles.dispatchBusyNote}>
                <Text style={styles.dispatchBusyText}>Robot đang bận. Vui lòng đợi.</Text>
              </View>
            ) : (
              <View style={styles.dispatchActions}>
                <TouchableOpacity
                  style={styles.dispatchCancelBtn}
                  onPress={() => { setDispatchModalVisible(false); setDispatchTarget(null); }}
                  disabled={isDispatching}
                >
                  <Text style={styles.dispatchCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dispatchConfirmBtn, isDispatching && { opacity: 0.6 }]}
                  onPress={handleConfirmDispatch}
                  disabled={isDispatching}
                >
                  {isDispatching
                    ? <ActivityIndicator size="small" color="white" />
                    : <Text style={styles.dispatchConfirmText}>Xác nhận</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16,
    paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerSubtitle: { fontSize: 10, color: '#6B7280', fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#059669' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  mapCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5, marginBottom: 20
  },
  mapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  mapHeaderIcon: { padding: 6, backgroundColor: '#ECFDF5', borderRadius: 8, marginRight: 8 },
  mapHeaderText: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  
  mapPreviewClickable: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  expandOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  
  robotMarker: { position: 'absolute', zIndex: 20, alignItems: 'center', justifyContent: 'center' },
  robotMarkerCore: {
    backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'white', shadowColor: '#10B981', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 5, elevation: 4
  },
  
  statusLegend: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingHorizontal: 4
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 3, elevation: 2 },
  legendText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: height * 0.88,
    alignItems: 'center',
  },
  modalHeaderBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 50,
  },
  modalScrollMapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMapInside: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalInstruction: {
    marginTop: 12,
    marginBottom: 20,
  },
  modalInstructionText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },

  infoCard: {
    backgroundColor: 'white', borderRadius: 24, padding: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 3, marginBottom: 24,
    marginTop: 20
  },
  pointsEarnedContainer: { flexDirection: 'row', alignItems: 'center' },
  pointsIconContainer: {
    width: 52, height: 52, borderRadius: 18, backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  pointsInfo: { flex: 1 },
  pointsLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  pointsValue: { fontSize: 18, fontWeight: '900', color: '#D97706', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
  
  successBanner: {
    flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#6EE7B7', marginBottom: 20, alignItems: 'center'
  },
  successIconWrapper: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1
  },
  successTitle: { fontSize: 15, fontWeight: '800', color: '#065F46' },
  successDesc: { fontSize: 12, color: '#047857', marginTop: 4, lineHeight: 18, fontWeight: '500' },
  
  invoiceSummary: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  summaryValueText: { fontSize: 12, color: '#334155', fontWeight: '800' },
  summaryPriceText: { fontSize: 16, color: '#059669', fontWeight: '900' },
  
  btnHome: {
    backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: 100, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6
  },
  btnHomeText: { color: 'white', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  // ── Robot Navigation UI ──────────────────────────────────────────────
  robotMovingBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#064E3B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#10B981',
    gap: 10,
  },
  robotMovingText: {
    color: '#A7F3D0',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  toastContainer: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    gap: 8,
    zIndex: 999,
  },
  toastItem: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },

  // Dispatch confirm modal
  dispatchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  dispatchModal: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  dispatchIconRow: {
    marginBottom: 16,
  },
  dispatchIconBg: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dispatchTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  dispatchSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
  dispatchNodeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  dispatchActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  dispatchCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dispatchCancelText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '700',
  },
  dispatchConfirmBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  dispatchConfirmText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },
  dispatchBusyNote: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  dispatchBusyText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
});

