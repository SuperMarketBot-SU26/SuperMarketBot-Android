const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;
export const BASE_URL = ENV_API_URL || 'https://interiorly-pinnatisect-adalyn.ngrok-free.dev';

console.log('[AuthService] EXPO_PUBLIC_API_URL env =', ENV_API_URL);
console.log('[AuthService] BASE_URL =', BASE_URL);

// ─── Response types (theo OpenAPI spec) ──────────────────────────────────────
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  userId: number;
  email: string;
  fullName: string | null;
  roles: string[];
}

export interface FaceLoginMemberDto {
  memberId: number;
  fullName: string;
  phoneNumber: string;
  tier: string;
  totalPoints: number;
}

export interface FaceLoginResponseDto {
  success: boolean;
  message: string | null;
  greeting: string | null;
  token: AuthResponseDto | null;
  member: FaceLoginMemberDto | null;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
async function parseErrorBody(response: Response): Promise<{ rawText: string; data: any }> {
  const rawText = await response.text().catch(() => '');
  let data: any = {};
  try { data = JSON.parse(rawText); } catch { /* không phải JSON */ }
  return { rawText, data };
}

// ─── AuthService ─────────────────────────────────────────────────────────────
export class AuthService {

  static async login(email: string, password: string): Promise<AuthResponseDto> {
    console.log(`[AuthService.login] POST ${BASE_URL}/api/auth/login`);
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, password }),
    });
    console.log(`[AuthService.login] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[AuthService.login] Error body (${response.status}):`, rawText);
      throw new Error(data.error || data.detail || data.title || data.message || `Đăng nhập thất bại (${response.status})`);
    }
    return response.json();
  }

  static async register(fullName: string, email: string, phone: string | null, password: string): Promise<true> {
    console.log(`[AuthService.register] POST ${BASE_URL}/api/auth/register`);
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ fullName, email, phone, password }),
    });
    console.log(`[AuthService.register] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[AuthService.register] Error body (${response.status}):`, rawText);
      const validationErrors = data.errors
        ? Object.values(data.errors).flat().join(' ')
        : null;
      throw new Error(validationErrors || data.error || data.detail || data.title || data.message || `Đăng ký thất bại (${response.status})`);
    }
    console.log('[AuthService.register] Đăng ký thành công (200 OK)');
    return true;
  }

  // ✅ Endpoint đúng theo OpenAPI: /api/auth/face-login
  static async loginFace(imageBase64: string): Promise<FaceLoginResponseDto> {
    console.log(`[AuthService.loginFace] POST ${BASE_URL}/api/auth/face-login`);
    const response = await fetch(`${BASE_URL}/api/auth/face-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ imageBase64 }),
    });
    console.log(`[AuthService.loginFace] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.warn(`[AuthService.loginFace] Error body (${response.status}):`, rawText);
      throw new Error(data.error || data.detail || data.title || data.message || `Đăng nhập khuôn mặt thất bại (${response.status})`);
    }
    return response.json();
  }

  // ✅ Endpoint đúng: /api/auth/register-face  (dùng FaceLoginRequestDto: { imageBase64 })
  static async registerFace(imageBase64: string, token: string): Promise<true> {
    console.log(`[AuthService.registerFace] POST ${BASE_URL}/api/auth/register-face`);
    const response = await fetch(`${BASE_URL}/api/auth/register-face`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ imageBase64 }),
    });
    console.log(`[AuthService.registerFace] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[AuthService.registerFace] Error body (${response.status}):`, rawText);
      throw new Error(data.error || data.detail || data.title || data.message || `Đăng ký khuôn mặt thất bại (${response.status})`);
    }
    console.log('[AuthService.registerFace] Đăng ký khuôn mặt thành công');
    return true;
  }

  // ── Forgot/Reset Password ──────────────────────────────────────────────
  static async forgotPassword(email: string): Promise<true> {
    console.log(`[AuthService.forgotPassword] POST ${BASE_URL}/api/auth/forgot-password`);
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email }),
    });
    console.log(`[AuthService.forgotPassword] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[AuthService.forgotPassword] Error body (${response.status}):`, rawText);
      throw new Error(data.error || data.detail || data.title || data.message || `Lấy lại mật khẩu thất bại (${response.status})`);
    }
    return true;
  }

  static async resetPassword(email: string, otpCode: string, newPassword: string): Promise<true> {
    console.log(`[AuthService.resetPassword] POST ${BASE_URL}/api/auth/reset-password`);
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
    console.log(`[AuthService.resetPassword] status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[AuthService.resetPassword] Error body (${response.status}):`, rawText);
      throw new Error(data.error || data.detail || data.title || data.message || `Đổi mật khẩu thất bại (${response.status})`);
    }
    return true;
  }
}
