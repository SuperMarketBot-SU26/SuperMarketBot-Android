import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface NotificationDto {
  id: number;
  memberId: number;
  type: string; // 'Allergy' | 'BudgetExceeded' | 'DuplicatePurchase' | 'PointsEarned' | 'CartUpdate'
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: string; // payload
}

export interface NotificationListResponse {
  items: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync('userToken');
  return {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export class NotificationService {
  static async getNotifications(page: number = 1, pageSize: number = 20): Promise<NotificationListResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/notifications?page=${page}&pageSize=${pageSize}`, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to get notifications: ${response.status}`);
    }
    
    return response.json();
  }

  static async getUnreadCount(): Promise<number> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/notifications/unread-count`, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to get unread count: ${response.status}`);
    }
    
    const data = await response.json();
    return data.unreadCount ?? data; // Assume it returns { unreadCount: number } or just a number
  }

  static async readAll(): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/notifications/read-all`, { 
      method: 'PATCH',
      headers 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark all as read: ${response.status}`);
    }
  }

  static async read(id: number): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/api/members/me/notifications/${id}/read`, { 
      method: 'PATCH',
      headers 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.status}`);
    }
  }
}
