import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface AlternativeProductDto {
  productId: number;
  productName: string;
  unitPrice: number;
  imageUrl: string | null;
  reason: string | null;
}

export interface CartItemDto {
  cartItemId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl: string | null;
  alertType: 'Allergy' | 'Avoid' | null;
  alertMessage: string | null;
  alternativeProducts: AlternativeProductDto[];
}

export interface CartDto {
  totalPrice: number;
  items: CartItemDto[];
  alertType: string | null;
  alertMessage: string | null;
  remainingBudget: number | null;
}

const parseErrorBody = async (response: Response) => {
  const rawText = await response.text().catch(() => '');
  let data: any = {};
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    // ignore
  }
  return { rawText, data };
};

export class CartService {
  static async getCart(): Promise<CartDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.getCart] GET ${BASE_URL}/api/cart`);
    const response = await fetch(`${BASE_URL}/api/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.getCart] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Lấy giỏ hàng thất bại (${response.status})`);
    }

    return response.json();
  }

  static async addItem(productId: number, quantity: number): Promise<CartDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.addItem] POST ${BASE_URL}/api/cart/items`);
    const response = await fetch(`${BASE_URL}/api/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity }),
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.addItem] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Thêm sản phẩm thất bại (${response.status})`);
    }

    return response.json();
  }

  static async updateItemQuantity(productId: number, quantity: number): Promise<CartDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.updateItemQuantity] PUT ${BASE_URL}/api/cart/items/${productId}`);
    const response = await fetch(`${BASE_URL}/api/cart/items/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.updateItemQuantity] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Cập nhật số lượng thất bại (${response.status})`);
    }

    return response.json();
  }

  static async removeItem(productId: number): Promise<CartDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.removeItem] DELETE ${BASE_URL}/api/cart/items/${productId}`);
    const response = await fetch(`${BASE_URL}/api/cart/items/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.removeItem] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Xóa sản phẩm thất bại (${response.status})`);
    }

    return response.json();
  }

  static async clearCart(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.clearCart] DELETE ${BASE_URL}/api/cart`);
    const response = await fetch(`${BASE_URL}/api/cart`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.clearCart] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Xóa giỏ hàng thất bại (${response.status})`);
    }

    return true;
  }

  static async checkout(): Promise<any> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[CartService.checkout] POST ${BASE_URL}/api/cart/checkout`);
    const response = await fetch(`${BASE_URL}/api/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[CartService.checkout] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Thanh toán giỏ hàng thất bại (${response.status})`);
    }

    return response.json();
  }
}
