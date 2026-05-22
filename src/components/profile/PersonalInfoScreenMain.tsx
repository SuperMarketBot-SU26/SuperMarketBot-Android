import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, ChevronLeft, Edit2, Home, Mail, Map, MapPin, Phone, ShoppingBag, User, User as UserIcon } from 'lucide-react-native';
import React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PersonalInfoScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#E0F2FE', '#F0FDF4', '#F8FAFC']}
        locations={[0, 0.3, 0.8]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <ChevronLeft color="#4B5563" size={24} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>SmartMarketBot</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

            {/* Avatar Section */}
            <Animated.View entering={FadeInDown.delay(100)} style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/db3ed4buc/image/upload/v1779363905/DepTrai_lriqvy.png' }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.cameraBtn}>
                  <Camera color="white" size={14} />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>Duy Nguyễn</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Thành viên Platinum</Text>
              </View>
            </Animated.View>

            {/* Form Fields */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.formContainer}>

              {/* Name Field */}
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <UserIcon color="#059669" size={20} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Họ tên</Text>
                  <Text style={styles.inputValue}>Duy Nguyễn</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Edit2 color="#059669" size={18} />
                </TouchableOpacity>
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Mail color="#059669" size={20} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <Text style={styles.inputValue}>duy.nguyen@example.com</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Edit2 color="#059669" size={18} />
                </TouchableOpacity>
              </View>

              {/* Phone Field */}
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Phone color="#059669" size={20} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Số điện thoại</Text>
                  <Text style={styles.inputValue}>090 123 4567</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Edit2 color="#059669" size={18} />
                </TouchableOpacity>
              </View>

              {/* Address Field */}
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <MapPin color="#059669" size={20} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={styles.inputLabel}>Địa chỉ</Text>
                  <Text style={styles.inputValue}>123 Đường Lê Lợi,{'\n'}Quận 1, TP.HCM</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Edit2 color="#059669" size={18} />
                </TouchableOpacity>
              </View>

            </Animated.View>

            {/* Save Button */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.actionSection}>
              <TouchableOpacity style={styles.btnSave}>
                <Text style={styles.btnSaveText}>Lưu thay đổi</Text>
                <ArrowRight color="white" size={20} />
              </TouchableOpacity>

              <Text style={styles.updateStatusText}>Cập nhật lần cuối: 15/10/2023</Text>
            </Animated.View>

          </ScrollView>

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

            <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/cart')}>
              <View style={styles.navTabBox}>
                <ShoppingBag color="#9CA3AF" size={24} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/profile')}>
              <View style={[styles.navTabBox, styles.navTabBoxActive]}>
                <User color="white" size={24} />
              </View>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    padding: 8,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#65A30D', // Olive Green similar to FreshAssist
    zIndex: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnRight: {
    padding: 8,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
    padding: 4,
    backgroundColor: 'white',
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E7EB',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#059669',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  editBtn: {
    padding: 8,
  },
  actionSection: {
    alignItems: 'center',
  },
  btnSave: {
    flexDirection: 'row',
    backgroundColor: '#00702A',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00702A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  btnSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  updateStatusText: {
    fontSize: 12,
    color: '#9CA3AF',
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
