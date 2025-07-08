import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductVariantInfo } from '../../../shared/models/product-variant-info.model';
import { ReportOrder } from "../../../shared/models/report-order.model";
import { Page } from "../../../shared/models/promotion.model";
import { TopSellingProductDTO } from "../../../shared/models/top-selling-product.model";

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  // URL gốc của API backend cho báo cáo
  private apiUrl = 'http://localhost:8080/api/admin/reports';

  constructor(private http: HttpClient) {}

  /**
   * Lấy tổng số đơn hàng trong ngày hôm nay
   * @returns Observable chứa đối tượng { totalOrdersToday: number }
   */
  getTotalOrdersToday(): Observable<{ totalOrdersToday: number }> {
    return this.http.get<{ totalOrdersToday: number }>(
      `${this.apiUrl}/orders/today`
    );
  }

  /**
   * Lấy tổng doanh thu trong ngày hôm nay
   * @returns Observable chứa đối tượng { revenueToday: number }
   */
  getRevenueToday(): Observable<{ revenueToday: number }> {
    return this.http.get<{ revenueToday: number }>(
      `${this.apiUrl}/revenue/today`
    );
  }

  /**
   * Lấy tổng lợi nhuận trong ngày hôm nay
   * @returns Observable chứa đối tượng { profitToday: number }
   */
  getProfitToday(): Observable<{ profitToday: number }> {
    return this.http.get<{ profitToday: number }>(
      `${this.apiUrl}/profit/today`
    );
  }

  /**
   * Lấy doanh thu trong khoảng thời gian tuỳ chọn
   * @param startDate ISO string bắt đầu (bắt buộc, ví dụ: "2025-06-01T00:00:00")
   * @param endDate ISO string kết thúc (tuỳ chọn, ví dụ: "2025-06-30T23:59:59")
   * @returns Observable chứa đối tượng { revenue: number }
   */
  getRevenueBetween(startDate: string, endDate?: string): Observable<{ revenue: number }> {
    let params = new HttpParams().set('startDate', startDate);
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<{ revenue: number }>(
      `${this.apiUrl}/revenue`,
      { params }
    );
  }

  /**
   * Lấy lợi nhuận trong khoảng thời gian tuỳ chọn
   * @param startDate ISO string bắt đầu (bắt buộc)
   * @param endDate ISO string kết thúc (tuỳ chọn)
   * @returns Observable chứa đối tượng { profit: number }
   */
  getProfitBetween(startDate: string, endDate?: string): Observable<{ profit: number }> {
    let params = new HttpParams().set('startDate', startDate);
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    return this.http.get<{ profit: number }>(
      `${this.apiUrl}/profit`,
      { params }
    );
  }

  /**
   * Lấy tồn kho hiện tại nhóm theo tên sản phẩm
   * Backend trả về Map<productName, List<ProductVariantInfoDTO>>
   * @returns Observable chứa Record với key là tên sản phẩm và value là mảng ProductVariantInfo
   */
  getCurrentStockByProduct(): Observable<Record<string, ProductVariantInfo[]>> {
    return this.http.get<Record<string, ProductVariantInfo[]>>(
      `${this.apiUrl}/stock/by-name`
    );
  }

  /**
   * Lấy chi tiết doanh thu trong ngày hôm nay theo nhân viên (staffId) phân trang
   * @param staffId ID nhân viên
   * @param page Trang hiện tại (bắt đầu từ 0)
   * @param size Số bản ghi trên mỗi trang
   * @returns Observable chứa Page<ReportOrder>
   */
  getRevenueDetailToday(
    staffId: number,
    page: number,
    size: number
  ): Observable<Page<ReportOrder>> {
    const params = new HttpParams()
      .set('staffId', staffId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<ReportOrder>>(
      `${this.apiUrl}/revenue/detail/today`,
      { params }
    );
  }

  /**
   * Lấy chi tiết doanh thu theo khoảng thời gian tuỳ chọn và theo nhân viên, phân trang
   * @param staffId ID nhân viên
   * @param startDate ISO string bắt đầu (bắt buộc)
   * @param endDate ISO string kết thúc (tuỳ chọn)
   * @param page Trang hiện tại (bắt đầu từ 0)
   * @param size Số bản ghi trên mỗi trang
   * @returns Observable chứa Page<ReportOrder>
   */
  getRevenueDetailByDateRange(
    staffId: number,
    startDate: string,
    endDate: string | null,
    page: number,
    size: number
  ): Observable<Page<ReportOrder>> {
    let params = new HttpParams()
      .set('staffId', staffId.toString())
      .set('startDate', startDate)
      .set('page', page.toString())
      .set('size', size.toString());

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<Page<ReportOrder>>(
      `${this.apiUrl}/revenue/detail`,
      { params }
    );
  }

  /**
   * Lấy danh sách top sản phẩm bán chạy theo giới hạn và khoảng thời gian tuỳ chọn
   * @param limit Số lượng sản phẩm trả về (mặc định 10)
   * @param startDate ISO string bắt đầu (tuỳ chọn)
   * @param endDate ISO string kết thúc (tuỳ chọn)
   * @returns Observable chứa mảng TopSellingProductDTO
   */
  getTopSellingProducts(
    startDate?: string | null,
    endDate?: string | null,
    limit: number = 10
  ): Observable<TopSellingProductDTO[]> {
    let params = new HttpParams().set('limit', limit.toString());

    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<TopSellingProductDTO[]>(
      `${this.apiUrl}/top-selling`,
      { params }
    );
  }

}
