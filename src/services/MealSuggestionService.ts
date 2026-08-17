import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface RecipeIngredientDto {
  productId: number;
  productName: string;
  unitPrice: number;
  imageUrl?: string;
  quantityRequired: number;
  unitOfMeasure: string;
  inStock: boolean;
  currentStock: number;
  locationNodeId?: number;
  shelfLocation?: string;
  isRestricted?: boolean;
  altName?: string;
}

export interface MenuAssistantResponseDto {
  recipeId: number;
  recipeName: string;
  portions: number;
  calories?: number;
  healthyScore?: number;
  alternativeSuggestion?: string;
  estimatedTotalCost: number;
  ingredients: RecipeIngredientDto[];
  optimizedShoppingRoute: number[];
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class MealSuggestionService {
  static async getMenuAssistant(recipeId: number, portions: number = 1): Promise<MenuAssistantResponseDto> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/MealSuggestions/menu-assistant?recipeId=${recipeId}&portions=${portions}`, {
      headers
    });
    if (!response.ok) {
      throw new Error(`Lỗi lấy trợ lý thực đơn (${response.status})`);
    }
    return response.json();
  }
}
