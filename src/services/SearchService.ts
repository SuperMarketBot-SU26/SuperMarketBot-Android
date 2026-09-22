import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface SearchResultItemDto {
  productId: number;
  productName: string;
  description: string | null;
  unitPrice: number;
  promotionPrice: number | null;
  imageUrl: string | null;
  status: string;
  categoryName: string | null;
  subcategoryName: string | null;
  productTypeName: string | null;
  relevanceScore: number;
  healthTags: string[];
  isRestricted?: boolean;
  restrictionLabel?: string;
  altName?: string | null;
  isOverBudget?: boolean;
}

export interface SearchResponseDto {
  query: string;
  totalMatches: number;
  results: SearchResultItemDto[];
  aiRanked: boolean;
  aiExplanation: string | null;
}

export interface IngredientRecommendationDto {
  productId: number;
  productName: string;
  reason: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  quantityText: string;
}

export interface RecommendIngredientsResponseDto {
  ingredients: IngredientRecommendationDto[];
}

export class SearchService {
  static classifyIntent(query: string): 'recipe' | 'product' {
    if (!query) return 'product';
    const lowerQuery = query.toLowerCase();
    const recipeKeywords = [
      'nấu', 'món', 'cách làm', 'công thức', 'hướng dẫn',
      'canh', 'kho', 'chiên', 'xào', 'luộc', 'gỏi', 'lẩu', 'chuẩn bị', 'nguyên liệu'
    ];
    if (recipeKeywords.some(kw => lowerQuery.includes(kw))) {
      return 'recipe';
    }
    return 'product';
  }

  static async searchAll(params: {
    q: string;
    limit?: number;
    sortBy?: string;
    useAi?: boolean;
  }): Promise<SearchResponseDto> {
    const token = await SecureStore.getItemAsync('userToken');
    const { q, limit = 20, sortBy = 'relevance', useAi = false } = params;

    let url = `${BASE_URL}/api/search/all?q=${encodeURIComponent(q)}&limit=${limit}&sortBy=${sortBy}&useAi=${useAi}`;

    console.log(`[SearchService.searchAll] GET ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`[SearchService.searchAll] HTTP Status: ${response.status}`);
    const rawText = await response.text();

    if (!response.ok) {
      console.error(`[SearchService.searchAll] Error body (${response.status}):`, rawText);
      throw new Error(`Tìm kiếm tất cả thất bại (${response.status})`);
    }

    try {
      return JSON.parse(rawText) as SearchResponseDto;
    } catch (e) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  }

  static async searchPersonalized(params: {
    q: string;
    limit?: number;
    sortBy?: string;
    useAi?: boolean;
  }): Promise<SearchResponseDto> {
    const token = await SecureStore.getItemAsync('userToken');
    const { q, limit = 20, sortBy = 'relevance', useAi = false } = params;

    if (!token) {
      console.warn('[SearchService.searchPersonalized] No token found, falling back to searchAll');
      return this.searchAll(params);
    }

    let url = `${BASE_URL}/api/search/personalized?q=${encodeURIComponent(q)}&limit=${limit}&sortBy=${sortBy}&useAi=${useAi}`;

    console.log(`[SearchService.searchPersonalized] GET ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      console.warn('[SearchService.searchPersonalized] Unauthorized (401) - Token expired, falling back to searchAll');
      return this.searchAll(params);
    }

    console.log(`[SearchService.searchPersonalized] HTTP Status: ${response.status}`);
    const rawText = await response.text();

    if (!response.ok) {
      console.error(`[SearchService.searchPersonalized] Error body (${response.status}):`, rawText);
      throw new Error(`Tìm kiếm cá nhân hóa thất bại (${response.status})`);
    }

    try {
      return JSON.parse(rawText) as SearchResponseDto;
    } catch (e) {
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  }

  static async recommendIngredients(dishName: string): Promise<RecommendIngredientsResponseDto> {
    try {
      const url = `${BASE_URL}/api/search/recommend-ingredients`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ dishName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[SearchService] Error recommending ingredients:', error);
      return { ingredients: [] };
    }
  }

  static async transcribeSpeech(audioUri: string): Promise<string> {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        name: 'voice_recording.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await fetch(`${BASE_URL}/api/search/speech-to-text`, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech-to-text error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (err) {
      console.error('[SearchService.transcribeSpeech] Error:', err);
      return '';
    }
  }

  static async transcribeAudioBase64(base64Audio: string): Promise<string> {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await fetch(`${BASE_URL}/api/search/speech-to-text-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ audioBase64: base64Audio }),
      });

      if (!response.ok) {
        throw new Error(`Speech-to-text base64 error: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (err) {
      console.error('[SearchService.transcribeAudioBase64] Error:', err);
      return '';
    }
  }
}
