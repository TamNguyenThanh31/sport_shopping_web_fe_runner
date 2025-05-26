export interface OrderDetail {
  id?: number;
  variantId: number;
  quantity: number;
  priceAtTime: number;
  productName?: string;
  size?: string;
  color?: string;
  imageUrl?: string;
}
