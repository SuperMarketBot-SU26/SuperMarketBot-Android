import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, ChevronLeft, Edit2, Home, Mail, Map, MapPin, Phone, ShoppingBag, User, User as UserIcon, Lock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/AuthService';
import { ProfileService, ProfileDto } from '../../services/ProfileService';
import * as ImagePicker from 'expo-image-picker';

export default function PersonalInfoScreenMain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [isChangePassModalVisible, setChangePassModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangePassLoading, setIsChangePassLoading] = useState(false);

  // Profile States
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Avatar mặc định (Facebook avatar placeholder)
  const defaultAvatar = 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png';

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await ProfileService.getProfile();
        setFullName(profile.fullName || user?.fullName || '');
        setPhoneNumber(profile.phone || '');
        setImageUrl(profile.facePath || null);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageUrl(asset.uri);
      if (asset.base64) {
        setImageBase64(asset.base64);
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const data: ProfileDto = {
        fullName,
        phone: phoneNumber,
      };
      if (imageBase64) {
        data.imageBase64 = imageBase64;
      }
      await ProfileService.updateProfile(data);
      Alert.alert('Thành công', 'Cập nhật thông tin cá nhân thành công!');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Cập nhật thất bại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordRequest = async () => {
    if (!user?.email) {
      Alert.alert('Lỗi', 'Không tìm thấy email của bạn.');
      return;
    }
    setIsChangePassLoading(true);
    try {
      await AuthService.forgotPassword(user.email);
      setChangePassModalVisible(true);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu đổi mật khẩu.');
    } finally {
      setIsChangePassLoading(false);
    }
  };

  const handleSubmitNewPassword = async () => {
    if (!otpCode || !newPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.');
      return;
    }
    if (!user?.email) return;

    setIsChangePassLoading(true);
    try {
      await AuthService.resetPassword(user.email, otpCode, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setChangePassModalVisible(false);
      setOtpCode('');
      setNewPassword('');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Lỗi đặt lại mật khẩu.');
    } finally {
      setIsChangePassLoading(false);
    }
  };

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
                  source={{ uri: imageUrl || defaultAvatar }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage}>
                  <Camera color="white" size={14} />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{fullName || 'Người dùng'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Thành viên tiêu chuẩn</Text>
              </View>
            </Animated.View>

            {/* Form Fields */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.formContainer}>
              {isLoadingProfile ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator color="#059669" size="large" />
                </View>
              ) : (
                <>
                  {/* Name Field */}
                  <View style={styles.inputContainer}>
                    <View style={styles.iconBox}>
                      <UserIcon color="#059669" size={20} />
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={styles.inputLabel}>Họ tên</Text>
                      <TextInput
                        style={[styles.inputValue, { padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 }]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Nhập họ tên"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  </View>

                  {/* Email Field */}
                  <View style={styles.inputContainer}>
                    <View style={styles.iconBox}>
                      <Mail color="#059669" size={20} />
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <Text style={[styles.inputValue, { color: '#6B7280' }]}>{user?.email || 'Chưa cập nhật'}</Text>
                    </View>
                  </View>

                  {/* Phone Field */}
                  <View style={styles.inputContainer}>
                    <View style={styles.iconBox}>
                      <Phone color="#059669" size={20} />
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={styles.inputLabel}>Số điện thoại</Text>
                      <TextInput
                        style={[styles.inputValue, { padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 }]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Nhập số điện thoại"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Change Password Button */}
              <TouchableOpacity style={styles.inputContainer} onPress={handleChangePasswordRequest}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Lock color="#DC2626" size={20} />
                </View>
                <View style={styles.inputContent}>
                  <Text style={[styles.inputValue, { color: '#DC2626' }]}>Thay đổi mật khẩu</Text>
                </View>
                <View style={styles.editBtn}>
                  {isChangePassLoading && !isChangePassModalVisible ? <ActivityIndicator size="small" color="#DC2626" /> : <ChevronLeft color="#DC2626" size={18} style={{ transform: [{ rotate: '180deg' }] }} />}
                </View>
              </TouchableOpacity>

            </Animated.View>

            {/* Save Button */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.actionSection}>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveProfile} disabled={isSaving || isLoadingProfile}>
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.btnSaveText}>Lưu thay đổi</Text>
                    <ArrowRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.updateStatusText}>Cập nhật lần cuối: 15/10/2023</Text>
            </Animated.View>

          </ScrollView>

          {/* Change Password Modal */}
          <Modal visible={isChangePassModalVisible} transparent animationType="fade" onRequestClose={() => setChangePassModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Xác nhận OTP</Text>
                <Text style={styles.modalSubtitle}>Chúng tôi đã gửi mã OTP tới email {user?.email}.</Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mã OTP"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mật khẩu mới"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                
                <TouchableOpacity style={styles.modalBtnPrimary} onPress={handleSubmitNewPassword} disabled={isChangePassLoading}>
                  {isChangePassLoading ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnPrimaryText}>Xác nhận</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setChangePassModalVisible(false)} disabled={isChangePassLoading}>
                  <Text style={styles.modalBtnCancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  modalBtnPrimary: {
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnPrimaryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalBtnCancel: {
    padding: 16,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 15,
  }
});
