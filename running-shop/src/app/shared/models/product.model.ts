// product.model.ts
export interface Product {
  id?: number;
  name: string;
  description?: string;
  categoryId: number;
  brand: string;
  addedById?: number;
  active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface ProductVariant {
  id?: number;
  productId?: number;
  size?: string;
  color?: string;
  stock: number;
  price: number;
  sku: string;
}

export interface ProductImage {
  id?: number;
  productId?: number;
  fileName?: string;
  imageUrl: string;
  primary: boolean;
}
