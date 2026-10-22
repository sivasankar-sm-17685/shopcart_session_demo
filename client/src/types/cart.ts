export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  isUpdatingCart: boolean;
  error: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export interface GetCartResponse {
  items: CartItem[];
  total: number;
}
