import {ProductVariantInfo} from "./product-variant-info.model";

export interface StockRow {
  name: string;           // Tên sản phẩm
  quantity: number;       // Tổng stock trên tất cả variant
  status: string;         // Trạng thái tổng (vd. “Đủ hàng”)
  variants: ProductVariantInfo[]; // Mảng biến thể, mỗi biến thể có { variantName, stock, status }
}
