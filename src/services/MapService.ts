import { BASE_URL } from './AuthService';

export interface SemanticObject {
  objectId: number;
  objectType: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  label: string;
}

export interface MapNode {
  nodeId: number;
  nodeName: string;
  xcoord: number;
  ycoord: number;
  x: number;
  y: number;
  nodeType: string;
  isBlocked: boolean;
}

export interface MapEdge {
  edgeId: number;
  fromNodeId: number;
  toNodeId: number;
  distance: number;
}

export interface MapData {
  mapId: number;
  floorId: number;
  mapName: string;
  floorplanImageUrl: string | null;
  widthMeters: number;
  heightMeters: number;
  semanticObjects: SemanticObject[];
  nodes?: MapNode[];
  edges?: MapEdge[];
}

export interface RoutePoint {
  x: number;
  y: number;
  nodeId: number | null;
  description: string;
}

export interface RouteResponse {
  totalDistance: number;
  estimatedTimeSeconds: number;
  path: RoutePoint[];
}

export class MapService {
  static async getLatestMap(floorId: number = 1): Promise<MapData> {
    console.log(`[MapService.getLatestMap] GET ${BASE_URL}/api/v1/maps/latest?floorId=${floorId}`);
    const response = await fetch(`${BASE_URL}/api/v1/maps/latest?floorId=${floorId}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Lỗi tải bản đồ (${response.status})`);
    }
    return response.json();
  }

  static async getRoute(startX: number, startY: number, endObjectId?: number, endNodeId?: number): Promise<RouteResponse> {
    let url = `${BASE_URL}/api/v1/navigation/route?startX=${startX}&startY=${startY}`;
    if (endObjectId !== undefined) {
      url += `&endObjectId=${endObjectId}`;
    }
    if (endNodeId !== undefined) {
      url += `&endNodeId=${endNodeId}`;
    }
    
    console.log(`[MapService.getRoute] GET ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`Lỗi tìm đường (${response.status})`);
    }
    return response.json();
  }
}
