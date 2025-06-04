import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Order, OrderStatus} from "../../../shared/models/order.model";
import {Observable} from "rxjs";
import {Page} from "../../../shared/models/promotion.model";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) { }

  getAllOrders(
    staffId: number,
    status?: OrderStatus,
    userId?: number,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ): Observable<Page<Order>> {
    let params = new HttpParams()
      .set('staffId', staffId.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    if (status) {
      params = params.set('status', status);
    }
    if (userId != null) {
      params = params.set('userId', userId.toString());
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<Page<Order>>(
      `${this.baseUrl}/all-order`,
      { params }
    );
  }

  updateOrderStatus(
    orderId: number,
    status: OrderStatus,
    staffId: number
  ): Observable<Order> {
    const params = new HttpParams()
      .set('status', status)
      .set('staffId', staffId.toString());
    return this.http.put<Order>(
      `${this.baseUrl}/${orderId}/status-order`,
      null,
      { params }
    );
  }
}
