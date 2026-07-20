import { BASE_URL } from './AuthService';

export interface ProductDto {
  productId: number;
  productName: string;
  unitPrice: number;
  status: string;
  imageUrl: string | null;
  productTypeId: number;
}

const parseErrorBody = async (response: Response) => {
  const rawText = await response.text();
  let data: any = {};
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    //
  }
  return { rawText, data };
};

export class ProductService {
  static async getProducts(): Promise<ProductDto[]> {
    console.log(`[ProductService.getProducts] GET ${BASE_URL}/api/Products`);
    const response = await fetch(`${BASE_URL}/api/Products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    console.log(`[ProductService.getProducts] HTTP Status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[ProductService.getProducts] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Lấy danh sách sản phẩm thất bại (${response.status})`);
    }

    const json = await response.json();
    return json as ProductDto[];
  }

  static async getProductDetail(id: number | string): Promise<ProductDto> {
    console.log(`[ProductService.getProductDetail] GET ${BASE_URL}/api/Products/${id}`);
    const response = await fetch(`${BASE_URL}/api/Products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    console.log(`[ProductService.getProductDetail] HTTP Status: ${response.status}`);
    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[ProductService.getProductDetail] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Lấy chi tiết sản phẩm thất bại (${response.status})`);
    }

    const json = await response.json();
    console.log(`[ProductService.getProductDetail] imageUrl:`, json.imageUrl);
    return json as ProductDto;
  }

  static async getDeals(memberId?: number, minDiscountPercent?: number): Promise<any[]> {
    console.log(`[ProductService.getDeals] GET ${BASE_URL}/api/v1/products/deals`);
    const url = new URL(`${BASE_URL}/api/v1/products/deals`);
    if (memberId) url.searchParams.append('memberId', memberId.toString());
    if (minDiscountPercent) url.searchParams.append('minDiscountPercent', minDiscountPercent.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      const { rawText, data } = await parseErrorBody(response);
      console.error(`[ProductService.getDeals] Error body (${response.status}):`, rawText);
      throw new Error(data.message || data.detail || `Lấy danh sách khuyến mãi thất bại (${response.status})`);
    }

    const json = await response.json();
    const items = json.items || json || [];
    return items.map((item: any) => ({
      ...item,
      unitPrice: item.unitPrice || item.originalPrice || 0,
      promotionPrice: item.promotionPrice || item.dealPrice,
    }));
  }
}
