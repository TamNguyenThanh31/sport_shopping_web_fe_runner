import {ReportOrderItem} from "./report-order-item.model";

export interface ReportOrder {
  orderId: number;
  createdAt: string;
  customerName: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  items: ReportOrderItem[];
  expanded?: boolean;
}
