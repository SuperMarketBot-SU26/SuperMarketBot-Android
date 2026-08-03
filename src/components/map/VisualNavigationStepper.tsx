import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { ArrowUp, CornerUpLeft, CornerUpRight, MapPin, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;

export interface NavigationStep {
  id: string;
  instruction: string;
  direction: 'straight' | 'left' | 'right' | 'arrive';
  imageUrl: string;
  nodeName?: string;
  distance?: string;
}

interface VisualNavigationStepperProps {
  steps: NavigationStep[];
  onClose: () => void;
  onFinish: () => void;
}

export default function VisualNavigationStepper({
  steps,
  onClose,
  onFinish,
}: VisualNavigationStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'straight':
        return <ArrowUp size={32} color="#fff" />;
      case 'left':
        return <CornerUpLeft size={32} color="#fff" />;
      case 'right':
        return <CornerUpRight size={32} color="#fff" />;
      case 'arrive':
        return <MapPin size={32} color="#fff" />;
      default:
        return <ArrowUp size={32} color="#fff" />;
    }
  };

  const renderItem = ({ item, index }: { item: NavigationStep; index: number }) => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          
          <View style={styles.overlayContent}>
            <View style={styles.header}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Bước {index + 1}/{steps.length}
                </Text>
              </View>
              {item.nodeName && (
                <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.badgeText}>{item.nodeName}</Text>
                </View>
              )}
            </View>

            <View style={styles.instructionContainer}>
              <View style={styles.iconContainer}>
                {getDirectionIcon(item.direction)}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.instructionText}>{item.instruction}</Text>
                {item.distance && (
                  <Text style={styles.distanceText}>{item.distance}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color="#333" />
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={steps}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(ev) => {
          const index = Math.round(ev.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={renderItem}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={[styles.navButtonText, currentIndex === 0 && styles.disabledText]}>
            Quay lại
          </Text>
        </TouchableOpacity>

        <View style={styles.pagination}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {currentIndex === steps.length - 1 ? 'Hoàn tất' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 400,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    padding: 16,
    paddingTop: 48,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(14, 165, 233, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  textContainer: {
    flex: 1,
  },
  instructionText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  distanceText: {
    color: '#bae6fd',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#fff',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#cbd5e1',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pagination: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0ea5e9',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#cbd5e1',
  },
});
