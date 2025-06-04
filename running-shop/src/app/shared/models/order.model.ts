import {Address} from "./address.model";
import {OrderDetail} from "./order-detail.model";

export interface Order {
  id?: number;
  userId: number;
  totalPrice?: number;
  totalCost?: number;
  totalProfit?: number;
  status?: string;
  paymentStatus?: string;
  handledBy?: number;
  addressId: number;
  addressDetails?: Address;
  promotionId?: number;
  promotionCode?: string;
  paymentMethod: string;
  createdAt?: string;
  canceledAt?: string;
  orderDetails?: OrderDetail[];
}
