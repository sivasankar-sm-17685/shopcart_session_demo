export interface ProductItem {
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

export interface ProductsResponse {
  products: ProductItem[];
  total: number;
  limit: number;
  skip: number;
}
