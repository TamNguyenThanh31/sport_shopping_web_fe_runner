import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {CartItem} from "../../../shared/models/CartItem.model";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';

  constructor(private http: HttpClient) {}

  // Lấy giỏ hàng theo userId
  getCart(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}?userId=${userId}`);
  }

  // Lấy số lượng sản phẩm trong giỏ hàng
  getCartItemCount(userId: number): Observable<number> {
    return this.getCart(userId).pipe(
      map(items => items.reduce((total, item) => total + item.quantity, 0))
    );
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(cartItem: CartItem): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, cartItem);
  }

  // Cập nhật số lượng sản phẩm
  updateCart(cartId: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/${cartId}?quantity=${quantity}`, {});
  }

  // Xóa sản phẩm khỏi giỏ hàng
  deleteFromCart(cartId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${cartId}`);
  }
}
