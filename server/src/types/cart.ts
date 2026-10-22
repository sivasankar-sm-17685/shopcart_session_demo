export interface CartItem {
  id: number;
  title: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

export interface GetCartResponse {
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  id: number;
  quantity: number;
}

export type AddToCartResponse = CartItem;

export type UpdateQuantityResponse = CartItem;

export interface UpdateQuantityRequest {
  quantity: number;
}
