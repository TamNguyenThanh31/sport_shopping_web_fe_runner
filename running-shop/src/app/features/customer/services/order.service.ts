import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Order} from "../../../shared/models/order.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}?userId=${userId}`);
  }

  getOrderById(orderId: number, userId: number): Observable<Order> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, { params });
  }

  placeOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  initiateVNPayPayment(orderId: number, userId: number, returnUrl: string): Observable<{ paymentUrl: string }> {
    return this.http.post<{ paymentUrl: string }>(`${this.apiUrl}/${orderId}/vnpay`, null, {
      params: { userId: userId.toString(), returnUrl }
    });
  }
}
