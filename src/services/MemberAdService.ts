import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface SponsoredRecommendationDto {
  sponsoredId: number;
  adCampaignId: number;
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl: string;
  matchType: string;
  adScore: number;
  priority: number;
  allergyWarning: boolean; // Trả về true nếu thành phần có trong dị ứng của Member
  allergyDetails: string | null;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class MemberAdService {
  /**
   * Gọi API lấy danh sách quảng cáo dành riêng cho Member (có lọc dị ứng)
   * Tại một vị trí (slot) hoặc toàn cục (truyền slotId = undefined)
   */
  static async getSponsoredRecommendations(memberId: number, slotId?: number): Promise<SponsoredRecommendationDto[]> {
    const headers = await getAuthHeaders();
    const query = slotId ? `?slotId=${slotId}` : '';
    
    // Lưu ý: Endpoint này public (AllowAnonymous) trên backend nhưng gửi token vẫn an toàn
    const response = await fetch(`${BASE_URL}/api/members/${memberId}/sponsored-recommendations${query}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.warn(`[MemberAdService.getRecommendations] Failed with status: ${response.status}`);
      return [];
    }
    
    return response.json();
  }
}
