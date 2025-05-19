export interface CartItem {
  id: number;
  userId: number;
  variantId: number;
  quantity: number;
  stock: number;
  priceAtTime: number;
  productName: string;
  imageUrl: string;
  size: string;
  color: string;
  totalPrice: number;
}
