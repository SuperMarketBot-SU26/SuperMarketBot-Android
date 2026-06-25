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
  static async search(params: {
    q: string;
    memberId?: string | number | null;
    limit?: number;
    sortBy?: string;
    useAi?: boolean;
  }): Promise<SearchResponseDto> {
    const token = await SecureStore.getItemAsync('userToken');
    const { q, memberId, limit = 20, sortBy = 'relevance', useAi = false } = params;

    let url = `${BASE_URL}/api/search?q=${encodeURIComponent(q)}&limit=${limit}&sortBy=${sortBy}&useAi=${useAi}`;
    if (memberId !== undefined && memberId !== null) {
      url += `&memberId=${memberId}`;
    }

    console.log(`[SearchService.search] GET ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`[SearchService.search] HTTP Status: ${response.status}`);
    const rawText = await response.text();
    console.log(`[SearchService.search] Raw response (first 500 chars): ${rawText.substring(0, 500)}`);

    if (!response.ok) {
      console.error(`[SearchService.search] Error body (${response.status}):`, rawText);
      throw new Error(`Tìm kiếm thất bại (${response.status})`);
    }

    try {
      return JSON.parse(rawText) as SearchResponseDto;
    } catch (e) {
      console.error(`[SearchService.search] JSON parse error. Raw:`, rawText.substring(0, 300));
      throw new Error('Phản hồi từ server không hợp lệ');
    }
  }
}
