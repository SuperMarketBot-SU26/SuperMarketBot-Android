import { BASE_URL } from './AuthService';
import * as SecureStore from 'expo-secure-store';

export interface RobotDto {
  robotId: number;
  robotName: string;
  robotCode: string;
  batteryPct: number;
  mode: string;
  status: string;
  lastSeenAt: string;
}

export interface RobotPoseDto {
  robotCode: string;
  x: number;
  y: number;
  headingRad: number;
  headingDeg: number;
  timestampUtc: string;
}

export interface UpdateRobotStatusRequestDto {
  status: string;
  batteryPct?: number | null;
  mode?: string | null;
}

export interface PublishRobotCommandRequestDto {
  robotCode: string;
  command: string;
  payload?: string | null;
}

export interface NavigateRobotRequestDto {
  robotCode: string;
  destinationNodeId: string; // string — matches BE DestinationNodeId
  waypointNodeIds?: string[] | null;
}

// SignalR payload from /hubs/robot → event "navigationStatus"
export interface RobotNavigationStatusDto {
  robotCode: string;
  navStatus: string;       // e.g. "REACHED", "ABORTED", "MOVING", "IDLE"
  currentWaypoint?: string | null;
  timestamp: string;
}

// SignalR payload from /hubs/robot → event "status"
export interface RobotStatusSignalRDto {
  robotCode: string;
  battery?: number | null;
  location?: string | null;
  status?: string | null;
  mode?: string | null;
  isOnline?: boolean | null;
  timestampUtc: string;
}

const parseErrorBody = async (response: Response) => {
  const rawText = await response.text();
  let data: any = {};
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    // ignore
  }
  return { rawText, data };
};

export class RobotService {
  static async getRobots(): Promise<RobotDto[]> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.getRobots] GET ${BASE_URL}/api/Robots`);
    const response = await fetch(`${BASE_URL}/api/Robots`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    });

    console.log(`[RobotService.getRobots] HTTP Status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[RobotService.getRobots] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Lấy danh sách Robot thất bại (${response.status})`);
    }

    const json = await response.json();
    return json as RobotDto[];
  }

  static async getRobotStatusValues(): Promise<string[]> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.getRobotStatusValues] GET ${BASE_URL}/api/Robots/status-values`);
    const response = await fetch(`${BASE_URL}/api/Robots/status-values`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Lấy danh sách trạng thái thất bại (${response.status})`);
    }

    return response.json();
  }

  static async getRobotPose(robotCode: string): Promise<RobotPoseDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.getRobotPose] GET ${BASE_URL}/api/Robots/${robotCode}/pose`);
    const response = await fetch(`${BASE_URL}/api/Robots/${robotCode}/pose`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`Lấy tọa độ Robot thất bại (${response.status})`);
    }

    return response.json();
  }

  static async updateRobotStatus(robotCode: string, request: UpdateRobotStatusRequestDto): Promise<RobotDto> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.updateRobotStatus] POST ${BASE_URL}/api/Robots/${robotCode}/status`);
    const response = await fetch(`${BASE_URL}/api/Robots/${robotCode}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const { data } = await parseErrorBody(response);
      throw new Error(data.message || `Cập nhật trạng thái Robot thất bại (${response.status})`);
    }

    return response.json();
  }

  static async navigateRobot(request: NavigateRobotRequestDto): Promise<boolean> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.navigateRobot] POST ${BASE_URL}/api/Robots/navigate`);
    const response = await fetch(`${BASE_URL}/api/Robots/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const { data } = await parseErrorBody(response);
      throw new Error(data.message || `Điều hướng Robot thất bại (${response.status})`);
    }

    return true;
  }

  static async publishRobotCommand(request: PublishRobotCommandRequestDto): Promise<boolean> {
    const token = await SecureStore.getItemAsync('userToken');
    console.log(`[RobotService.publishRobotCommand] POST ${BASE_URL}/api/Robots/command`);
    const response = await fetch(`${BASE_URL}/api/Robots/command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const { data } = await parseErrorBody(response);
      throw new Error(data.message || `Gửi lệnh Robot thất bại (${response.status})`);
    }

    return true;
  }
}
