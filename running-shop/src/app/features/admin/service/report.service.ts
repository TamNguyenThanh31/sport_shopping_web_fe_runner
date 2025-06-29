import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductVariantInfo } from '../../../shared/models/product-variant-info.model';
import {ReportOrder} from "../../../shared/models/report-order.model";
import {Page} from "../../../shared/models/promotion.model";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = 'http://localhost:8080/api/admin/reports';

  constructor(private http: HttpClient) {}

  getTotalOrdersToday(): Observable<{ totalOrdersToday: number }> {
    return this.http.get<{ totalOrdersToday: number }>(
      `${this.apiUrl}/orders/today`
    );
  }

  getRevenueToday(): Observable<{ revenueToday: number }> {
    return this.http.get<{ revenueToday: number }>(
      `${this.apiUrl}/revenue/today`
    );
  }

  getProfitToday(): Observable<{ profitToday: number }> {
    return this.http.get<{ profitToday: number }>(
      `${this.apiUrl}/profit/today`
    );
  }

  /** Doanh thu tuần này */
  getRevenueThisWeek(): Observable<{ revenueThisWeek: number }> {
    return this.http.get<{ revenueThisWeek: number }>(
      `${this.apiUrl}/revenue/week`
    );
  }

  /** Lợi nhuận tuần này */
  getProfitThisWeek(): Observable<{ profitThisWeek: number }> {
    return this.http.get<{ profitThisWeek: number }>(
      `${this.apiUrl}/profit/week`
    );
  }

  /** Doanh thu tháng này */
  getRevenueThisMonth(): Observable<{ revenueThisMonth: number }> {
    return this.http.get<{ revenueThisMonth: number }>(
      `${this.apiUrl}/revenue/month`
    );
  }

  /** Lợi nhuận tháng này */
  getProfitThisMonth(): Observable<{ profitThisMonth: number }> {
    return this.http.get<{ profitThisMonth: number }>(
      `${this.apiUrl}/profit/month`
    );
  }

  /**
   * Tồn kho theo tên sản phẩm
   * Backend endpoint đã đổi thành /stock/by-name
   * Trả về: Record<productName, ProductVariantInfo[]>
   */
  getCurrentStockByProduct(): Observable<Record<string, ProductVariantInfo[]>> {
    return this.http.get<Record<string, ProductVariantInfo[]>>(
      `${this.apiUrl}/stock/by-name`
    );
  }

  getRevenueDetailToday(
    staffId: number,
    page: number,
    size: number
  ): Observable<Page<ReportOrder>> {
    return this.http.get<Page<ReportOrder>>(
      `${this.apiUrl}/revenue/detail/today?staffId=${staffId}&page=${page}&size=${size}`
    );
  }

  getRevenueDetailThisWeek(
    staffId: number,
    page: number,
    size: number
  ): Observable<Page<ReportOrder>> {
    return this.http.get<Page<ReportOrder>>(
      `${this.apiUrl}/revenue/detail/week?staffId=${staffId}&page=${page}&size=${size}`
    );
  }

  getRevenueDetailThisMonth(
    staffId: number,
    page: number,
    size: number
  ): Observable<Page<ReportOrder>> {
    return this.http.get<Page<ReportOrder>>(
      `${this.apiUrl}/revenue/detail/month?staffId=${staffId}&page=${page}&size=${size}`
    );
  }
}
