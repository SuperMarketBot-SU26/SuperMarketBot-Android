import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface RouteNodeDto {
  nodeId: number;
  xCoord: number;
  yCoord: number;
  nodeType: string;
}

export interface RouteResponseDto {
  routeNodes: RouteNodeDto[];
  totalDistance: number;
}

export interface DispatchAutonomousRequestDto {
  robotCode: string;
  flowType: string;
  zoneId?: number;
  productId?: number;
  nodeIds?: number[];
}

export interface WaypointDto {
  nodeId: number;
  nodeName: string;
  xCoord: number;
  yCoord: number;
  headingYawDeg: number;
  nodeRole: string;
}

export interface DispatchAutonomousResponseDto {
  robotCode: string;
  flowType: string;
  waypointCount: number;
  waypoints: WaypointDto[];
  messageVi: string;
}

export class NavigationService {
  /**
   * Helper to get token
   */
  private static async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('userToken');
  }

  /**
   * Get the route (polyline) from current coordinates to an object or node
   */
  static async getRoute(
    startX: number,
    startY: number,
    endObjectId?: number,
    endNodeId?: number
  ): Promise<RouteResponseDto> {
    const token = await this.getToken();
    
    // Build query params
    const params = new URLSearchParams();
    params.append('startX', startX.toString());
    params.append('startY', startY.toString());
    if (endObjectId !== undefined) {
      params.append('endObjectId', endObjectId.toString());
    }
    if (endNodeId !== undefined) {
      params.append('endNodeId', endNodeId.toString());
    }

    const url = `${BASE_URL}/api/v1/navigation/route?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let errorMsg = `Failed to get route (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = await response.text();
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  /**
   * Dispatch robot for autonomous run (e.g., guide)
   */
  static async dispatchAutonomous(
    request: DispatchAutonomousRequestDto
  ): Promise<DispatchAutonomousResponseDto> {
    const token = await this.getToken();
    const url = `${BASE_URL}/api/v1/navigation/dispatch-autonomous`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMsg = `Failed to dispatch robot (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = await response.text();
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  /**
   * Cancel an active robot navigation
   */
  static async cancelRobot(robotCode: string): Promise<void> {
    const token = await this.getToken();
    const url = `${BASE_URL}/api/v1/navigation/robots/${robotCode}/cancel`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      let errorMsg = `Failed to cancel robot (${response.status})`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        errorMsg = await response.text();
      }
      throw new Error(errorMsg);
    }
  }
}
