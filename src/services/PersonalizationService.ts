import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface HealthTagDto {
  healthTagId: number;
  tagName: string;
  tagType: string;
}

export interface HealthPreferenceItemDto {
  healthTagId: number;
  status: 'Preferred' | 'Avoid' | 'Allergy';
}

export interface UpdateHealthPreferencesRequestDto {
  preferences: HealthPreferenceItemDto[];
}

export interface UpdateBudgetRequestDto {
  spendingLimit: number | null;
}

export interface RecipeDto {
  recipeId: number;
  recipeName: string;
  description?: string;
  yieldPortions: number;
  imageUrl?: string;
  calories?: number;
  healthyScore?: number;
  alternativeSuggestion?: string;
  matchScore?: number;
  matchReasons?: string[];
  ingredients?: any[];
  estimatedTotalCost?: number;
}

export interface ProductDto {
  productId: number;
  productName: string;
  salePrice: number;
  basePrice?: number;
  imagePath: string;
  unit: string;
  matchScore?: number;
  matchReasons?: string[];
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class PersonalizationService {
  /**
   * Lấy danh sách các tag sức khoẻ / chế độ ăn từ hệ thống
   */
  static async getHealthTags(): Promise<HealthTagDto[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/health-tags`, { headers });
    if (!response.ok) {
      throw new Error(`Lỗi lấy danh sách health tags (${response.status})`);
    }
    return response.json();
  }

  /**
   * Lấy thông tin sức khoẻ / chế độ ăn hiện tại của user
   */
  static async getHealthPreferences(): Promise<any> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/health-preferences?t=${Date.now()}`, { 
      headers: {
        ...headers,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    if (!response.ok) {
      throw new Error(`Lỗi lấy thông tin cá nhân hoá (${response.status})`);
    }
    return response.json();
  }

  /**
   * Cập nhật sở thích sức khoẻ và chế độ ăn
   */
  static async updateHealthPreferences(preferences: HealthPreferenceItemDto[]): Promise<boolean> {
    const headers = await getAuthHeaders();
    const payload: UpdateHealthPreferencesRequestDto = { preferences };
    const response = await fetch(`${BASE_URL}/api/members/me/health-preferences`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PersonalizationService.updateHealthPreferences] Error:', errorText);
      
      let errorMessage = `Cập nhật sở thích sức khoẻ thất bại (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message) {
          errorMessage = errorJson.message;
        } else if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.title) {
          errorMessage = errorJson.title;
        } else if (typeof errorJson === 'string') {
          errorMessage = errorJson;
        }
      } catch (e) {
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    return true;
  }

  /**
   * Cập nhật ngân sách mua sắm
   */
  static async updateBudget(spendingLimit: number | null): Promise<boolean> {
    const headers = await getAuthHeaders();
    const payload: UpdateBudgetRequestDto = { spendingLimit };
    const response = await fetch(`${BASE_URL}/api/members/me/budget`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PersonalizationService.updateBudget] Error:', errorText);
      throw new Error(`Cập nhật ngân sách thất bại (${response.status})`);
    }
    return true;
  }

  /**
   * Lấy danh sách món ăn được gợi ý cá nhân hoá
   */
  static async getPersonalizedMeals(): Promise<RecipeDto[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/personalized-meals?t=${Date.now()}`, { headers });
    if (!response.ok) {
      throw new Error(`Lỗi gợi ý món ăn (${response.status})`);
    }
    return response.json();
  }

  /**
   * Lấy danh sách sản phẩm được gợi ý cá nhân hoá
   */
  static async getPersonalizedProducts(): Promise<ProductDto[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/personalized-products?t=${Date.now()}`, { headers });
    if (!response.ok) {
      throw new Error(`Lỗi gợi ý sản phẩm (${response.status})`);
    }
    return response.json();
  }
}
