import { RefreshCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import { LayoutChangeEvent, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export interface GuideDestination {
  nodeId: number;
  xCoord: number;
  yCoord: number;
  [key: string]: any;
}

export interface GuideRobotPose {
  x: number;
  y: number;
}
const STORE_SIZE = 10;
const MAP_PAD = 32;

// Khung tọa độ của 4 waypoint đã đo trên active SLAM map.
const SLAM_MIN_X = Number(process.env.EXPO_PUBLIC_GUIDE_MAP_MIN_X ?? 0.3760);
const SLAM_MAX_X = Number(process.env.EXPO_PUBLIC_GUIDE_MAP_MAX_X ?? 1.9081);
const SLAM_MIN_Y = Number(process.env.EXPO_PUBLIC_GUIDE_MAP_MIN_Y ?? -0.3111);
const SLAM_MAX_Y = Number(process.env.EXPO_PUBLIC_GUIDE_MAP_MAX_Y ?? 1.4755);

const SHELVES = [
  // Hàng trên (Kệ 7 Thu ngân & Kệ 1 Ăn vặt)
  { id: 'kv7', keyLabel: 'KV7', label: 'Kệ 7\nThu ngân', x: 0.8, y: 0.6, w: 2.4, h: 1.8, fill: '#E0E7FF', stroke: '#4F46E5', text: '#312E81', icon: '🛒' },
  { id: 'kv1', keyLabel: 'KV1', label: 'Kệ 1\nĂn vặt', x: 4.4, y: 0.6, w: 2.4, h: 1.8, fill: '#FEF3C7', stroke: '#F59E0B', text: '#92400E', icon: '🍿' },

  // Giữa trái (Kệ 6 Gia vị & Trà)
  { id: 'kv6', keyLabel: 'KV6', label: 'Kệ 6\nGia vị & Trà', x: 0.8, y: 3.6, w: 2.4, h: 2.2, fill: '#FCE7F3', stroke: '#DB2777', text: '#831843', icon: '🧂' },

  // Hàng dưới (Kệ 5 Đồ gia dụng & Kệ 4 Mỳ ăn liền)
  { id: 'kv5', keyLabel: 'KV5', label: 'Kệ 5\nĐồ gia dụng', x: 0.8, y: 7.6, w: 2.4, h: 1.8, fill: '#EDE9FE', stroke: '#8B5CF6', text: '#4C1D95', icon: '💡' },
  { id: 'kv4', keyLabel: 'KV4', label: 'Kệ 4\nMỳ ăn liền', x: 4.4, y: 7.6, w: 2.4, h: 1.8, fill: '#FFE4E6', stroke: '#F43F5E', text: '#9F1239', icon: '🍜' },

  // Hàng phải (Kệ 2 Giải khát & Kệ 3 Tươi sống)
  { id: 'kv2', keyLabel: 'KV2', label: 'Kệ 2\nGiải khát', x: 7.6, y: 2.2, w: 2.0, h: 2.2, fill: '#DBEAFE', stroke: '#3B82F6', text: '#1E3A8A', icon: '🥤' },
  { id: 'kv3', keyLabel: 'KV3', label: 'Kệ 3\nTươi sống', x: 7.6, y: 5.2, w: 2.0, h: 2.2, fill: '#D1FAE5', stroke: '#10B981', text: '#065F46', icon: '🥩' },
];

function getShelfNumber(shelfId: string): string {
  const match = shelfId.match(/\d+/);
  return match ? match[0] : '';
}

function checkShelfHighlight(
  shelf: typeof SHELVES[0],
  highlightedShelves: string[] | undefined,
  destinations: GuideDestination[]
): boolean {
  const num = getShelfNumber(shelf.id);
  const keyLabel = shelf.keyLabel.toUpperCase();

  if (highlightedShelves && Array.isArray(highlightedShelves)) {
    return highlightedShelves.some(item => {
      if (!item) return false;
      const upper = item.toUpperCase();
      return (
        upper.includes(keyLabel) ||
        upper === `KV${num}` ||
        upper.includes(`KỆ ${num}`) ||
        upper.includes(`KE ${num}`) ||
        upper.includes(`KỆ${num}`) ||
        upper.includes(`KE${num}`) ||
        upper.includes(`K${num}_`)
      );
    });
  }

  if (destinations && destinations.length > 0) {
    return destinations.some(d => {
      const nodeName = (d.nodeName || '').toUpperCase();
      const desc = (d.description || '').toUpperCase();
      const pName = (d.productName || (d.productNames && d.productNames[0]) || '').toUpperCase();
      const slotCode = (d.slotCode || '').toUpperCase();
      const shelfLoc = (d.shelfLocation || '').toUpperCase();
      const dNodeId = String(d.nodeId ?? '');

      // Check coordinate proximity if coordinates exist
      if (d.xCoord !== undefined && d.yCoord !== undefined) {
        const dx = Math.abs(d.xCoord - (shelf.x + shelf.w / 2));
        const dy = Math.abs(d.yCoord - (shelf.y + shelf.h / 2));
        if (dx <= shelf.w / 2 + 1.2 && dy <= shelf.h / 2 + 1.2) {
          return true;
        }
      }

      return (
        dNodeId === num ||
        slotCode.includes(`K${num}_`) ||
        slotCode.startsWith(`K${num}`) ||
        shelfLoc.includes(`KỆ ${num}`) ||
        shelfLoc.includes(`SLOT K${num}`) ||
        nodeName.includes(`KỆ ${num}`) ||
        nodeName.includes(`KE ${num}`) ||
        nodeName.includes(`KỆ${num}`) ||
        nodeName.includes(`KE${num}`) ||
        nodeName.includes(`KV${num}`) ||
        desc.includes(`KỆ ${num}`) ||
        desc.includes(`KE ${num}`) ||
        desc.includes(`KV${num}`) ||
        pName.includes(`KỆ ${num}`) ||
        pName.includes(`KE ${num}`)
      );
    });
  }

  return false;
}


function getShelfProducts(
  shelf: typeof SHELVES[0],
  destinations: GuideDestination[]
): string[] {
  const num = getShelfNumber(shelf.id);
  const products: string[] = [];

  destinations.forEach(d => {
    const nodeName = (d.nodeName || '').toUpperCase();
    const desc = (d.description || '').toUpperCase();
    const pName = d.productName || (d.productNames && d.productNames[0]) || d.locationName || '';
    const slotCode = (d.slotCode || '').toUpperCase();
    const dNodeId = String(d.nodeId ?? '');

    const isMatch =
      dNodeId === num ||
      slotCode.includes(`K${num}_`) ||
      nodeName.includes(`KỆ ${num}`) ||
      nodeName.includes(`KE ${num}`) ||
      nodeName.includes(`KỆ${num}`) ||
      nodeName.includes(`KE${num}`) ||
      nodeName.includes(`KV${num}`) ||
      desc.includes(`KỆ ${num}`) ||
      desc.includes(`KE ${num}`) ||
      desc.includes(`KV${num}`);

    if (isMatch) {
      const validName = pName && !pName.startsWith('Trạm') && !pName.includes(',') && pName !== 'Lối đi' ? pName : '';
      if (validName && !products.includes(validName)) {
        products.push(validName);
      } else if (d.description && !d.description.includes(',') && !d.description.startsWith('Hành lang') && !products.includes(d.description)) {
        products.push(d.description);
      } else if (pName && !products.includes(pName)) {
        products.push(pName);
      }
    }
  });

  return products;
}

interface Point { x: number; y: number }

interface CartGuideMapProps {
  destinations: GuideDestination[];
  currentWaypointIndex: number;
  robotPose: GuideRobotPose | null;
  highlightedShelves?: string[];
  fullScreen?: boolean;
}

function buildOrthogonalSegments(points: Point[]): { from: Point; to: Point; isCorner?: boolean }[] {
  const segments: { from: Point; to: Point; isCorner?: boolean }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);

    if (dx <= 2 || dy <= 2) {
      segments.push({ from: p1, to: p2 });
    } else {
      // Rẽ góc 90 độ (Đoạn ngang rồi đoạn dọc)
      const corner = { x: p2.x, y: p1.y };
      segments.push({ from: p1, to: corner });
      segments.push({ from: corner, to: p2, isCorner: true });
    }
  }
  return segments;
}

function RouteSegment({ from, to, color = '#0ea5e9' }: { from: Point; to: Point; color?: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDy <= 2) {
    // Đường thẳng nằm ngang (Horizontal)
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: Math.min(from.x, to.x),
          top: from.y - 2,
          width: Math.max(absDx, 4),
          height: 4,
          backgroundColor: color,
          borderRadius: 2,
          zIndex: 3,
          shadowColor: color,
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
        }}
      />
    );
  }

  if (absDx <= 2) {
    // Đường thẳng nằm dọc (Vertical)
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: from.x - 2,
          top: Math.min(from.y, to.y),
          width: 4,
          height: Math.max(absDy, 4),
          backgroundColor: color,
          borderRadius: 2,
          zIndex: 3,
          shadowColor: color,
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
        }}
      />
    );
  }

  // Fallback nếu có góc chéo lẻ
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.routeSegment,
        {
          left: from.x,
          top: from.y - 2,
          width: length,
          backgroundColor: color,
          transform: [{ rotateZ: `${angle}deg` }],
        },
      ]}
    />
  );
}

const AISLE_WAYPOINTS: Record<string, Point> = {
  '1': { x: 5.6, y: 3.0 },  // Kệ 1 -> Dưới Kệ 1 (trong Vùng Đỏ)
  '2': { x: 6.8, y: 3.0 },  // Kệ 2 -> Trước Kệ 2 (trong Vùng Đỏ)
  '3': { x: 6.8, y: 6.4 },  // Kệ 3 -> Trước Kệ 3 (trong Vùng Đỏ)
  '4': { x: 5.6, y: 6.8 },  // Kệ 4 -> Trên Kệ 4 (trong Vùng Đỏ)
  '5': { x: 2.0, y: 6.8 },  // Kệ 5 -> Trên Kệ 5 (khe giữa Kệ 6 & 5, trong Vùng Đỏ)
  '6': { x: 3.8, y: 4.7 },  // Kệ 6 -> Phải Kệ 6 (trong Vùng Đỏ)
  '7': { x: 2.0, y: 3.0 },  // Kệ 7 -> Dưới Kệ 7 (trong Vùng Đỏ)
  '8': { x: 0.5, y: 3.0 },  // Cổng vào / Trạm sạc -> Ngay Cổng Vào (trong Vùng Đỏ)
};

function projectDestinationToAisle(item: GuideDestination): Point {
  // 1. Ưu tiên kiểm tra NodeID (1..8) trước tiên để cố định waypoint theo mốc chuẩn
  if (item.nodeId && Number(item.nodeId) >= 1 && Number(item.nodeId) <= 8) {
    const nStr = String(item.nodeId);
    if (AISLE_WAYPOINTS[nStr]) {
      return AISLE_WAYPOINTS[nStr];
    }
  }

  // 2. Tìm theo mã Slot hoặc Tên kệ / Quầy
  const slotCode = (item.slotCode || '').toUpperCase();
  const slotMatch = slotCode.match(/K(\d+)_/i);
  let shelfNum = slotMatch ? slotMatch[1] : '';

  if (!shelfNum) {
    const loc = (item.shelfLocation || item.nodeName || item.description || item.locationName || '').toUpperCase();
    if (loc.includes('THU NGÂN') || loc.includes('CỬA') || loc.includes('CHECKOUT') || loc.includes('CỔNG VÀO')) {
      shelfNum = '7';
    } else if (loc.includes('TRẠM SẠC') || loc.includes('CHARG')) {
      shelfNum = '8';
    } else {
      const match = loc.match(/KỆ\s*(\d+)/i) || loc.match(/KE\s*(\d+)/i) || loc.match(/KV\s*(\d+)/i) || loc.match(/SLOT\s*K(\d+)/i);
      shelfNum = match ? match[1] : '';
    }
  }

  if (shelfNum && AISLE_WAYPOINTS[shelfNum]) {
    return AISLE_WAYPOINTS[shelfNum];
  }

  // Physical SLAM meter to 10x10 store grid proportional mapping
  const x = Number(item.xCoord ?? 0);
  const y = Number(item.yCoord ?? 0);

  const spanX = Math.max(SLAM_MAX_X - SLAM_MIN_X, 0.1);
  const spanY = Math.max(SLAM_MAX_Y - SLAM_MIN_Y, 0.1);

  const normX = Math.max(0, Math.min(1, (x - SLAM_MIN_X) / spanX));
  const normY = Math.max(0, Math.min(1, (y - SLAM_MIN_Y) / spanY));

  const projX = normX > 0.5 ? 6.8 : 3.8;
  const projY = normY > 0.5 ? 6.8 : 3.0;

  return { x: projX, y: projY };
}

export default function CartGuideMap({ destinations, currentWaypointIndex, robotPose, highlightedShelves = [], fullScreen = false }: CartGuideMapProps) {
  const [size, setSize] = useState(0);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [selectedShelfModal, setSelectedShelfModal] = useState<{
    shelf: typeof SHELVES[0];
    products: string[];
    isHighlighted: boolean;
  } | null>(null);

  const handleShelfPress = (shelf: typeof SHELVES[0]) => {
    const isH = checkShelfHighlight(shelf, highlightedShelves, destinations);
    const prods = getShelfProducts(shelf, destinations);
    setSelectedShelfModal({
      shelf,
      products: prods,
      isHighlighted: isH,
    });
  };

  const floorSize = Math.max(size - MAP_PAD * 2, 1);
  const ppm = floorSize / STORE_SIZE;

  const points = destinations.map(item => ({ x: item.xCoord, y: item.yCoord }));
  const xs = points.map(point => point.x);
  const ys = points.map(point => point.y);
  const minX = points.length ? Math.min(SLAM_MIN_X, ...xs) : SLAM_MIN_X;
  const maxX = points.length ? Math.max(SLAM_MAX_X, ...xs) : SLAM_MAX_X;
  const minY = points.length ? Math.min(SLAM_MIN_Y, ...ys) : SLAM_MIN_Y;
  const maxY = points.length ? Math.max(SLAM_MAX_Y, ...ys) : SLAM_MAX_Y;
  const spanX = Math.max(maxX - minX, 0.1);
  const spanY = Math.max(maxY - minY, 0.1);

  const projection = (point: Point) => {
    if (!points.length) return { x: 7.25, y: 8.6 };
    return {
      x: 0.9 + ((point.x - minX) / spanX) * 7.2,
      y: 8.1 - ((point.y - minY) / spanY) * 7.2,
    };
  };

  // Filter key stops to build a clean, minimal guide route
  const cleanKeyStops = destinations.filter((item, index) => {
    if (index === 0 || index === destinations.length - 1) return true;
    if (item.productId || item.slotCode) return true;
    const name = (item.nodeName || item.description || '').toUpperCase();
    return name.includes('KỆ') || name.includes('KE') || name.includes('CHECKOUT') || name.includes('THU NGÂN');
  });

  const sourceItems = cleanKeyStops.length >= 2 ? cleanKeyStops : destinations;
  const targetAislePts = sourceItems.map(item => projectDestinationToAisle(item));

  // Build clean inner route strictly bound within the Red Zone (Y=3.0 top, Y=6.8 bottom, X=6.8 right)
  const routePoints: Point[] = [];
  targetAislePts.forEach((pt, idx) => {
    if (routePoints.length === 0) {
      routePoints.push(pt);
    } else {
      const prev = routePoints[routePoints.length - 1];
      if (Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.3) {
        // Route strictly via Red Zone horizontal corridors (Y=3.0 or Y=6.8) & vertical connectors (X=3.8 or X=6.8)
        if (Math.abs(pt.x - prev.x) > 0.5 && Math.abs(pt.y - prev.y) > 0.5) {
          const cornerY = (prev.y > 5.0 || pt.y > 5.0) ? 6.8 : 3.0;
          if (Math.abs(prev.y - cornerY) > 0.2) routePoints.push({ x: prev.x, y: cornerY });
          routePoints.push({ x: pt.x, y: cornerY });
        }
        routePoints.push(pt);
      }
    }
  });
  const projectedRobot = robotPose ? projection(robotPose) : null;
  const clamp = (value: number) => Math.max(0, Math.min(10, value));

  const toPixel = (point: Point): Point => ({
    x: MAP_PAD + clamp(point.x) * ppm,
    y: MAP_PAD + clamp(point.y) * ppm,
  });
  const pixelRoute = routePoints.map(toPixel);
  const pixelRobot = projectedRobot ? toPixel(projectedRobot) : null;

  const onLayout = (event: LayoutChangeEvent) => {
    const next = Math.min(event.nativeEvent.layout.width, event.nativeEvent.layout.height);
    if (next > 0 && Math.abs(next - size) > 1) setSize(next);
  };

  const handleRotate = () => {
    setRotationDegrees(prev => (prev + 90) % 360);
  };

  const mapAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: withSpring(`${rotationDegrees}deg`, { damping: 15, stiffness: 100 }) }]
    };
  });

  const counterRotateStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: withSpring(`${-rotationDegrees}deg`, { damping: 15, stiffness: 100 }) }]
    };
  });

  return (
    <View style={[styles.container, fullScreen && { flex: 1 }]}>
      <View style={[styles.frame, fullScreen && { flex: 1, aspectRatio: undefined, borderRadius: 0 }]} onLayout={onLayout}>
        {size > 0 && (
          <Animated.View style={[styles.mapInnerWrapper, { width: size, height: size }, mapAnimatedStyle]}>
            <View style={[styles.floor, { left: MAP_PAD, top: MAP_PAD, width: floorSize, height: floorSize }]} />

            {/* Grid line */}
            {Array.from({ length: 11 }).map((_, index) => (
              <React.Fragment key={`grid-${index}`}>
                <View style={[styles.gridLineV, { left: MAP_PAD + index * ppm, top: MAP_PAD, height: floorSize }]} />
                <View style={[styles.gridLineH, { left: MAP_PAD, top: MAP_PAD + index * ppm, width: floorSize }]} />
              </React.Fragment>
            ))}

            {SHELVES.map(shelf => {
              const isHighlighted = checkShelfHighlight(shelf, highlightedShelves, destinations);
              return (
                <TouchableOpacity
                  key={shelf.id}
                  activeOpacity={0.7}
                  onPress={() => handleShelfPress(shelf)}
                  style={[
                    styles.shelf,
                    {
                      left: MAP_PAD + shelf.x * ppm,
                      top: MAP_PAD + shelf.y * ppm,
                      width: shelf.w * ppm,
                      height: shelf.h * ppm,
                      backgroundColor: isHighlighted ? shelf.fill : '#F1F5F9',
                      borderColor: isHighlighted ? shelf.stroke : '#CBD5E1',
                      borderWidth: isHighlighted ? 2.5 : 1,
                      opacity: isHighlighted ? 1 : 0.45,
                      shadowColor: isHighlighted ? shelf.stroke : 'transparent',
                      shadowOffset: { width: 0, height: isHighlighted ? 6 : 0 },
                      shadowOpacity: isHighlighted ? 0.6 : 0,
                      shadowRadius: isHighlighted ? 10 : 0,
                      elevation: isHighlighted ? 8 : 1,
                    },
                  ]}
                >
                  <Animated.View style={[styles.shelfContent, counterRotateStyle]}>
                    <Text style={styles.shelfIcon}>{shelf.icon}</Text>
                    <Text
                      style={[styles.shelfText, { color: isHighlighted ? shelf.text : '#94A3B8' }]}
                      adjustsFontSizeToFit
                      numberOfLines={2}
                    >
                      {shelf.label}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}

            {buildOrthogonalSegments(pixelRoute).map((segment, index) => (
              <React.Fragment key={`segment-${index}`}>
                <RouteSegment from={segment.from} to={segment.to} />
                {segment.isCorner && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: segment.from.x - 3,
                      top: segment.from.y - 3,
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#0ea5e9',
                      zIndex: 4,
                    }}
                  />
                )}
              </React.Fragment>
            ))}
            {pixelRobot && pixelRoute[currentWaypointIndex] && (
              buildOrthogonalSegments([pixelRobot, pixelRoute[currentWaypointIndex]]).map((seg, index) => (
                <RouteSegment key={`robot-segment-${index}`} from={seg.from} to={seg.to} color="#f97316" />
              ))
            )}

            {pixelRoute.map((point, index) => {
              const active = index === currentWaypointIndex;
              const completed = index < currentWaypointIndex;
              const isStart = index === 0;
              const isEnd = index === pixelRoute.length - 1;
              const item = destinations[index];
              const nodeName = (item?.nodeName || item?.description || '').toUpperCase();
              const isKeyStop = isStart || isEnd || nodeName.includes('KỆ') || nodeName.includes('KE') || nodeName.includes('THU NGÂN');

              if (!isKeyStop) {
                return (
                  <View
                    key={`waypoint-dot-${index}`}
                    style={{
                      position: 'absolute',
                      left: point.x - 4,
                      top: point.y - 4,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#0284C7',
                      borderWidth: 1.5,
                      borderColor: '#FFFFFF',
                      zIndex: 5,
                    }}
                  />
                );
              }

              // Distance check if start and end nodes are at the same physical position
              const firstPt = pixelRoute[0];
              const lastPt = pixelRoute[pixelRoute.length - 1];
              const isSameStartEnd = (firstPt && lastPt) ? Math.hypot(firstPt.x - lastPt.x, firstPt.y - lastPt.y) < 15 : false;


              let badgeIcon = `${index + 1}`;
              let pillText: string | null = null;
              let badgeColor = '#2563EB';
              let pillBg = '#2563EB';

              if (isStart && isEnd) {
                badgeIcon = '🏁';
                pillText = 'Bắt đầu & Kết thúc';
                badgeColor = '#059669';
                pillBg = '#059669';
              } else if (isStart) {
                badgeIcon = '🚀';
                pillText = isSameStartEnd ? 'Bắt đầu & Kết thúc' : 'Vị trí Bắt đầu';
                badgeColor = '#10B981';
                pillBg = '#10B981';
              } else if (isEnd) {
                if (isSameStartEnd) {
                  return null;
                }
                badgeIcon = '🏁';
                pillText = 'Kết thúc';
                badgeColor = '#EF4444';
                pillBg = '#EF4444';
              } else {
                badgeIcon = `${index + 1}`;
                pillText = `Trạm ${index}`;
                badgeColor = '#3B82F6';
                pillBg = '#3B82F6';
              }

              return (
                <Animated.View
                  key={`stop-${index}-${destinations[index]?.nodeId ?? 'none'}`}
                  style={[
                    styles.stopContainer,
                    { left: point.x - 16, top: point.y - 16 },
                    counterRotateStyle
                  ]}
                >
                  {pillText && (
                    <View style={[styles.pillTag, { backgroundColor: pillBg }]}>
                      <Text style={styles.pillTagText}>{pillText}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.stopBadge,
                      { backgroundColor: badgeColor },
                      completed && styles.stopCompleted,
                      active && styles.stopActive,
                    ]}
                  >
                    <Text style={styles.stopText}>{badgeIcon}</Text>
                  </View>
                </Animated.View>
              );
            })}

            {pixelRobot && (
              <Animated.View style={[styles.robot, { left: pixelRobot.x - 19, top: pixelRobot.y - 19 }, counterRotateStyle]}>
                <Text style={styles.robotEmoji}>🤖</Text>
              </Animated.View>
            )}

            <View style={[styles.wallTop, { left: MAP_PAD, top: MAP_PAD, width: floorSize }]} />
            <View style={[styles.wallLeft, { left: MAP_PAD, top: MAP_PAD, height: floorSize * 0.25 }]} />
            <View style={[styles.wallLeft, { left: MAP_PAD, top: MAP_PAD + floorSize * 0.4, height: floorSize * 0.6 }]} />
            <View style={[styles.wallRight, { left: MAP_PAD + floorSize - 6, top: MAP_PAD, height: floorSize }]} />
            <View style={[styles.wallBottom, { left: MAP_PAD, top: MAP_PAD + floorSize - 6, width: floorSize }]} />

            {/* Lối vào: Mũi tên xoay theo bản đồ */}
            <View style={{ position: 'absolute', left: 2, top: MAP_PAD + floorSize * 0.25, height: floorSize * 0.15, width: 60, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, lineHeight: 24, transform: [{ translateY: -2 }] }}>➡️</Text>
              {fullScreen && (
                <Animated.View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }, counterRotateStyle]}>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#065F46', marginTop: 32, textAlign: 'center' }}>Cổng vào</Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      <TouchableOpacity style={[styles.fabRotate, fullScreen && { bottom: 40, right: 30 }]} onPress={handleRotate} activeOpacity={0.8}>
        <RefreshCcw size={22} color="#047857" />
      </TouchableOpacity>

      {/* Modal chi tiết sản phẩm khi bấm vào Kệ */}
      <Modal
        visible={selectedShelfModal !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedShelfModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedShelfModal(null)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {selectedShelfModal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTitleRow}>
                    <Text style={{ fontSize: 28, marginRight: 10 }}>{selectedShelfModal.shelf.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalShelfName}>{selectedShelfModal.shelf.label.replace('\n', ' - ')}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View
                          style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 12,
                            backgroundColor: selectedShelfModal.isHighlighted ? '#DCFCE7' : '#F1F5F9',
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '700',
                              color: selectedShelfModal.isHighlighted ? '#15803D' : '#64748B',
                            }}
                          >
                            {selectedShelfModal.isHighlighted ? '🟢 Có sản phẩm cần lấy' : '⚪ Không có sản phẩm cần lấy'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedShelfModal(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#64748B' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalSectionTitle}>Danh sách sản phẩm:</Text>
                  {selectedShelfModal.products.length > 0 ? (
                    selectedShelfModal.products.map((prod, idx) => (
                      <View key={idx} style={styles.productItemCard}>
                        <Text style={{ fontSize: 18, marginRight: 10 }}>🛍️</Text>
                        <Text style={styles.productItemText}>{prod}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyProductBox}>
                      <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                        {selectedShelfModal.isHighlighted
                          ? 'Kệ này thuộc lộ trình ghé thăm của bạn.'
                          : 'Hiện không có sản phẩm nào trong giỏ hàng tại kệ này.'}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => setSelectedShelfModal(null)}
                >
                  <Text style={styles.modalConfirmBtnText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalShelfName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingVertical: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  productItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  productItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  emptyProductBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
  frame: {
    width: '100%',
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  mapInnerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floor: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 8 },
  gridLineV: { position: 'absolute', width: 1, backgroundColor: '#F1F5F9' },
  gridLineH: { position: 'absolute', height: 1, backgroundColor: '#F1F5F9' },
  shelf: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  shelfContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: 2,
  },
  shelfIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  shelfText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  entranceGate: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
    padding: 2,
  },
  entranceText: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 12,
  },
  routeSegment: { position: 'absolute', height: 4, borderRadius: 2, transformOrigin: 'left center', zIndex: 3, shadowColor: '#0EA5E9', shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  stopContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stopBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pillTag: {
    position: 'absolute',
    top: -22,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    minWidth: 85,
    alignItems: 'center',
    zIndex: 12,
  },
  pillTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  stop: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: '#2563EB', borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 6, elevation: 5 },
  stopActive: { backgroundColor: '#F97316', transform: [{ scale: 1.15 }] },
  stopCompleted: { backgroundColor: '#10B981' },
  stopText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  robot: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: '#6366F1', borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', zIndex: 7, elevation: 8, shadowColor: '#6366F1', shadowRadius: 8, shadowOpacity: 0.6, shadowOffset: { width: 0, height: 4 } },
  robotEmoji: { fontSize: 24 },
  wallTop: { position: 'absolute', height: 6, backgroundColor: '#475569', zIndex: 5, borderRadius: 3 },
  wallLeft: { position: 'absolute', width: 6, backgroundColor: '#475569', zIndex: 5, borderRadius: 3 },
  wallRight: { position: 'absolute', width: 6, backgroundColor: '#475569', zIndex: 5, borderRadius: 3 },
  wallBottom: { position: 'absolute', height: 6, backgroundColor: '#475569', zIndex: 5, borderRadius: 3 },
  door: { position: 'absolute', height: 10, backgroundColor: '#D1FAE5', borderLeftWidth: 3, borderRightWidth: 3, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', zIndex: 6, borderRadius: 4 },
  doorText: { color: '#059669', fontSize: 10, fontWeight: '900' },
  fabRotate: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    zIndex: 100,
  }
});
