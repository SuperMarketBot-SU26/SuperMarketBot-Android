/**
 * Hàm hỗ trợ tự động phát hiện và chuyển đổi chuỗi bị lỗi font UTF-8 (Mojibake)
 * Ví dụ: "CÆ¡m tráº¯ng gáº¡o N..." -> "Cơm trắng gạo N..."
 */
export function fixMojibake(text: string | null | undefined): string {
  if (!text) return '';
  try {
    // Phát hiện chuỗi có chứa các ký tự giải mã sai ISO-8859-1 / Windows-1252 từ UTF-8
    if (/[\u00C0-\u00FF]/.test(text) && (
      text.includes('Æ') || 
      text.includes('º') || 
      text.includes('áº') || 
      text.includes('áº¡') || 
      text.includes('áº¯') || 
      text.includes('Ã') ||
      text.includes('áº¥') ||
      text.includes('á»')
    )) {
      const bytes = new Uint8Array(Array.from(text).map(c => c.charCodeAt(0) & 0xFF));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (decoded && !decoded.includes('')) {
        return decoded;
      }
    }
  } catch (e) {
    // Fallback nếu có lỗi
  }
  return text;
}
