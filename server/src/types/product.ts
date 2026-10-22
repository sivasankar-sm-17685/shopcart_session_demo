export interface ProductItemResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  returnPolicy: string;
  thumbnail: string;
  images: string[];
}

export interface ProductsRequest {
  limit?: number;
  skip?: number;
}

export interface ProductsResponse {
  products: ProductItemResponse[];
  total: number;
  limit: number;
  skip: number;
}
