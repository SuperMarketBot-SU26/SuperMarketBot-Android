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
}

export interface SearchResponseDto {
  query: string;
  totalMatches: number;
  results: SearchResultItemDto[];
  aiRanked: boolean;
  aiExplanation: string | null;
}

export class SearchService {
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

    let url = `${BASE_URL}/api/search/personalized?q=${encodeURIComponent(q)}&limit=${limit}&sortBy=${sortBy}&useAi=${useAi}`;

    console.log(`[SearchService.searchPersonalized] GET ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

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
}
