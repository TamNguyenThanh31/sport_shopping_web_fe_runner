import {Address} from "./address.model";
import {OrderDetail} from "./order-detail.model";

export interface Order {
  id?: number;
  userId: number;
  totalPrice?: number;
  totalCost?: number;
  totalProfit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  handledBy?: number;
  addressId: number;
  addressDetails?: Address;
  promotionId?: number;
  promotionCode?: string;
  paymentMethod: PaymentMethod;
  createdAt?: string;   // ISO string
  canceledAt?: string;
  orderDetails?: OrderDetail[];  // Đã được enrich bởi backend
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  VNPAY = 'VNPAY',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}
