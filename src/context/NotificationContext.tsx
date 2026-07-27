import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../services/AuthService';
import { NotificationService, NotificationDto } from '../services/NotificationService';
import { useAuth } from './AuthContext';
import { CartDto } from '../services/CartService';

interface NotificationContextProps {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  hubConnection: signalR.HubConnection | null;
}

const NotificationContext = createContext<NotificationContextProps>({
  unreadCount: 0,
  refreshUnreadCount: async () => { },
  hubConnection: null,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);

  const refreshUnreadCount = async () => {
    if (!token) return;
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.warn('Lỗi lấy số lượng thông báo chưa đọc:', err);
    }
  };

  useEffect(() => {
    let connection: signalR.HubConnection | null = null;
    let isMounted = true;

    const startConnection = async () => {
      if (token) {
        await refreshUnreadCount();

        connection = new signalR.HubConnectionBuilder()
          .withUrl(`${BASE_URL}/hubs/member`, {
            accessTokenFactory: () => Promise.resolve(token),
          })
          .configureLogging(signalR.LogLevel.None)
          .withAutomaticReconnect()
          .build();

        // Listen for new notifications
        connection.on('ReceiveNotification', (notification: NotificationDto) => {
          console.log('[SignalR] ReceiveNotification', notification);
          setUnreadCount((prev) => prev + 1);
          // TODO: Có thể thêm Toast/In-app notification banner ở đây
        });

        // Tự động lắng nghe các sự kiện riêng lẻ theo thiết kế Backend (nếu cần thiết)
        connection.on('Allergy', (data: any) => {
          console.log('[SignalR] Allergy Triggered', data);
          refreshUnreadCount();
        });

        connection.on('BudgetExceeded', (data: any) => {
          console.log('[SignalR] BudgetExceeded Triggered', data);
          refreshUnreadCount();
        });

        connection.on('DuplicatePurchase', (data: any) => {
          console.log('[SignalR] DuplicatePurchase Triggered', data);
          refreshUnreadCount();
        });

        try {
          await connection.start();
          console.log('[SignalR] Connected to Member Hub');
          if (isMounted) {
            setHubConnection(connection);
          }
        } catch (e) {
          console.warn('[SignalR] Connection failed:', e);
        }
      }
    };

    if (token) {
      startConnection();
    } else {
      if (hubConnection) {
        hubConnection.stop();
        setHubConnection(null);
      }
      setUnreadCount(0);
    }

    return () => {
      isMounted = false;
      if (connection) {
        connection.stop();
      }
    };
  }, [token]); // re-run only when token changes (login/logout)

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount, hubConnection }}>
      {children}
    </NotificationContext.Provider>
  );
};
