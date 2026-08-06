/**
 * RobotNavigationContext.tsx
 *
 * Global state cho ch?c nang Ði?u Hu?ng Robot (Asynchronous Dispatch).
 *
 * Lu?ng:
 *   1. User ch?n node trên b?n d? -> g?i dispatchNavigate()
 *   2. dispatchNavigate() g?i POST /api/Robots/navigate -> tr? v? 202 Accepted
 *   3. L?ng nghe SignalR /hubs/robot event "navigationStatus" d? nh?n k?t qu?
 *
 * Events t? RobotHub (/hubs/robot):
 *   - "navigationStatus"  { robotCode, navStatus, currentWaypoint, timestamp }
 *   - "status"            { robotCode, battery, location, status, mode, isOnline, timestampUtc }
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import * as signalR from '@microsoft/signalr';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../services/AuthService';
import {
  RobotService,
  RobotNavigationStatusDto,
  RobotStatusSignalRDto,
} from '../services/RobotService';
import { useAuth } from './AuthContext';

// --- Types -------------------------------------------------------------------

export type RobotNavState =
  | 'IDLE'
  | 'DISPATCHING'   // Ðang g?i API
  | 'MOVING'        // Robot dang trên du?ng
  | 'REACHED'       // Ðã d?n noi
  | 'ABORTED'       // L?i / h?y
  | 'ERROR';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface RobotNavigationContextProps {
  // State
  robotNavState: RobotNavState;
  currentTargetNodeId: number | null;
  currentTargetNodeName: string;
  isRobotMoving: boolean;
  robotHubConnection: signalR.HubConnection | null;
  toasts: ToastMessage[];

  // Actions
  dispatchNavigate: (
    nodeId: number,
    nodeName: string,
  ) => Promise<{ success: boolean; message: string }>;
  joinRobotGroup: (robotCode: string) => Promise<void>;
  dismissToast: (id: string) => void;
  resetNavState: () => void;

  // Callback dang ký d? nh?n l?nh jumpRobotToNode khi dã d?n dích
  onRobotReached: ((nodeId: number, nodeName: string) => void) | null;
  setOnRobotReached: (cb: ((nodeId: number, nodeName: string) => void) | null) => void;
}

// --- Context -----------------------------------------------------------------

const RobotNavigationContext = createContext<RobotNavigationContextProps>({
  robotNavState: 'IDLE',
  currentTargetNodeId: null,
  currentTargetNodeName: '',
  isRobotMoving: false,
  robotHubConnection: null,
  toasts: [],
  dispatchNavigate: async () => ({ success: false, message: '' }),
  joinRobotGroup: async () => {},
  dismissToast: () => {},
  resetNavState: () => {},
  onRobotReached: null,
  setOnRobotReached: () => {},
});

export const useRobotNavigation = () => useContext(RobotNavigationContext);

// --- Provider ----------------------------------------------------------------

export const RobotNavigationProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();

  const [robotNavState, setRobotNavState] = useState<RobotNavState>('IDLE');
  const [currentTargetNodeId, setCurrentTargetNodeId] = useState<number | null>(null);
  const [currentTargetNodeName, setCurrentTargetNodeName] = useState('');
  const [robotHubConnection, setRobotHubConnection] = useState<signalR.HubConnection | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [onRobotReached, _setOnRobotReached] = useState<((nodeId: number, nodeName: string) => void) | null>(null);

  const targetNodeIdRef = useRef<number | null>(null);
  const targetNodeNameRef = useRef<string>('');
  const robotNavStateRef = useRef<RobotNavState>('IDLE');

  // Keep ref in sync with state
  useEffect(() => {
    robotNavStateRef.current = robotNavState;
  }, [robotNavState]);

  const setOnRobotReached = useCallback(
    (cb: ((nodeId: number, nodeName: string) => void) | null) => {
      _setOnRobotReached(() => cb);
    },
    [],
  );

  // --- Toast helpers ----------------------------------------------------------

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- Reset -----------------------------------------------------------------

  const resetNavState = useCallback(() => {
    setRobotNavState('IDLE');
    setCurrentTargetNodeId(null);
    setCurrentTargetNodeName('');
    targetNodeIdRef.current = null;
    targetNodeNameRef.current = '';
  }, []);

  // --- SignalR: connect to /hubs/robot ----------------------------------------

  useEffect(() => {
    if (!token) {
      setRobotHubConnection(null);
      return;
    }

    let connection: signalR.HubConnection;
    let isMounted = true;

    const startConnection = async () => {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/robot`, {
          accessTokenFactory: () => Promise.resolve(token),
        })
        .configureLogging(signalR.LogLevel.Warning)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      // Event: "navigationStatus" — k?t qu? di?u hu?ng
      connection.on('navigationStatus', (payload: RobotNavigationStatusDto) => {
        console.log('[RobotHub] navigationStatus:', payload);
        const navStatus = (payload.status || payload.navStatus || '').toUpperCase();
        const targetName = targetNodeNameRef.current || payload.waypoint || payload.currentWaypoint || 'dich';

        if (navStatus === 'REACHED' || navStatus === 'ARRIVED') {
          setRobotNavState('REACHED');
          addToast(`Robot da den ${targetName}!`, 'success');
          if (onRobotReached && targetNodeIdRef.current !== null) {
            onRobotReached(targetNodeIdRef.current, targetNodeNameRef.current);
          }
          setTimeout(() => setRobotNavState('IDLE'), 2000);
        } else if (navStatus === 'ABORTED' || navStatus === 'FAILED' || navStatus === 'CANCELLED' || navStatus === 'ERROR') {
          setRobotNavState('ABORTED');
          addToast(`Robot khong the den dich (${navStatus.toLowerCase()})`, 'error');
          setTimeout(() => setRobotNavState('IDLE'), 3000);
        } else if (navStatus === 'MOVING' || navStatus === 'NAVIGATING' || navStatus === 'EXECUTING') {
          setRobotNavState('MOVING');
        }
      });

      // Event: "status" — tr?ng thái chung c?a robot
      connection.on('status', (payload: RobotStatusSignalRDto) => {
        console.log('[RobotHub] status:', payload);
      });

      try {
        await connection.start();
        console.log('[SignalR] Connected to RobotHub (/hubs/robot)');

        // Join robot group to receive group-targeted broadcasts
        // RobotHub.GroupName(robotCode) => "robot:{robotCode}"
        const savedRobotCode = await SecureStore.getItemAsync('selectedRobotCode');
        if (savedRobotCode) {
          try {
            await connection.invoke('JoinRobotGroup', savedRobotCode);
            console.log(`[SignalR] Joined RobotHub group: robot:${savedRobotCode}`);
          } catch (groupErr) {
            console.warn('[SignalR] JoinRobotGroup failed (will still receive All broadcasts):', groupErr);
          }
        }

        if (isMounted) {
          setRobotHubConnection(connection);
        }
      } catch (e) {
        console.warn('[SignalR] RobotHub connection failed:', e);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      connection?.stop().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // --- joinRobotGroup ----------------------------------------------------------

  const joinRobotGroup = useCallback(async (robotCode: string) => {
    const conn = robotHubConnection;
    if (!conn || conn.state !== 'Connected') return;
    try {
      await conn.invoke('JoinRobotGroup', robotCode);
      console.log(`[SignalR] Joined RobotHub group: robot:${robotCode}`);
    } catch (e) {
      console.warn('[SignalR] joinRobotGroup failed:', e);
    }
  }, [robotHubConnection]);

  // --- dispatchNavigate -------------------------------------------------------

  const dispatchNavigate = useCallback(
    async (nodeId: number, nodeName: string): Promise<{ success: boolean; message: string }> => {
      const currentState = robotNavStateRef.current;
      if (currentState === 'DISPATCHING' || currentState === 'MOVING') {
        return { success: false, message: 'Robot dang trong hanh trinh, vui long doi.' };
      }

      const robotCode = await SecureStore.getItemAsync('selectedRobotCode');
      if (!robotCode) {
        return {
          success: false,
          message: 'Vui long chon Robot truoc (vao trang Robots -> ket noi).',
        };
      }

      setRobotNavState('DISPATCHING');
      setCurrentTargetNodeId(nodeId);
      setCurrentTargetNodeName(nodeName);
      targetNodeIdRef.current = nodeId;
      targetNodeNameRef.current = nodeName;

      try {
        await RobotService.navigateRobot({
          robotCode,
          destinationNodeId: nodeId.toString(),
        });
        setRobotNavState('MOVING');
        addToast(`Robot dang di chuyen den ${nodeName}...`, 'info');
        return { success: true, message: `Da gui lenh di chuyen toi ${nodeName}.` };
      } catch (err: any) {
        setRobotNavState('ERROR');
        const msg = err?.message || 'Gui lenh that bai.';
        addToast(msg, 'error');
        setTimeout(() => setRobotNavState('IDLE'), 2000);
        return { success: false, message: msg };
      }
    },
    [addToast],
  );

  const isRobotMoving = robotNavState === 'DISPATCHING' || robotNavState === 'MOVING';

  return (
    <RobotNavigationContext.Provider
      value={{
        robotNavState,
        currentTargetNodeId,
        currentTargetNodeName,
        isRobotMoving,
        robotHubConnection,
        toasts,
        dispatchNavigate,
        joinRobotGroup,
        dismissToast,
        resetNavState,
        onRobotReached,
        setOnRobotReached,
      }}
    >
      {children}
    </RobotNavigationContext.Provider>
  );
};

