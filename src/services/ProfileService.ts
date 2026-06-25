import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface ProfileDto {
  memberId?: number;
  fullName: string;
  phone: string;
  facePath?: string;
  imageBase64?: string;
  totalPoints?: number;
  spendingLimit?: number | null;
  membershipTier?: string;
  accountStatus?: string;
  email?: string;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class ProfileService {
  static async getProfile(): Promise<ProfileDto> {
    const headers = await getAuthHeaders();
    console.log(`[ProfileService.getProfile] GET ${BASE_URL}/api/members/me`);
    const response = await fetch(`${BASE_URL}/api/members/me`, { headers });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProfileService.getProfile] Error (${response.status}):`, errorText);
      throw new Error(`Không thể lấy thông tin cá nhân (${response.status})`);
    }
    
    const raw = await response.json();
    console.log('[ProfileService.getProfile] Raw response:', JSON.stringify(raw));

    // Normalize: backend có thể trả về field `tier` thay vì `membershipTier`
    const normalized: ProfileDto = {
      ...raw,
      membershipTier: raw.membershipTier || raw.tier || raw.MembershipTier || raw.Tier || undefined,
    };
    console.log('[ProfileService.getProfile] Normalized membershipTier:', normalized.membershipTier);
    return normalized;
  }

  static async updateProfile(data: ProfileDto): Promise<boolean> {
    const headers = await getAuthHeaders();
    console.log(`[ProfileService.updateProfile] PUT ${BASE_URL}/api/members/me`);
    const response = await fetch(`${BASE_URL}/api/members/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ProfileService.updateProfile] Error:`, errorText);
      throw new Error(`Cập nhật thông tin thất bại (${response.status})`);
    }
    
    return true;
  }

  static async getPersonalizedMeals(): Promise<any[]> {
    const headers = await getAuthHeaders();
    console.log(`[ProfileService.getPersonalizedMeals] GET ${BASE_URL}/api/members/me/personalized-meals`);
    const response = await fetch(`${BASE_URL}/api/members/me/personalized-meals`, { headers });
    if (!response.ok) {
      console.warn(`[ProfileService.getPersonalizedMeals] Failed with status: ${response.status}`);
      return [];
    }
    return response.json();
  }

  static async getPersonalizedProducts(): Promise<any[]> {
    const headers = await getAuthHeaders();
    console.log(`[ProfileService.getPersonalizedProducts] GET ${BASE_URL}/api/members/me/personalized-products`);
    const response = await fetch(`${BASE_URL}/api/members/me/personalized-products`, { headers });
    if (!response.ok) {
      console.warn(`[ProfileService.getPersonalizedProducts] Failed with status: ${response.status}`);
      return [];
    }
    return response.json();
  }
}
