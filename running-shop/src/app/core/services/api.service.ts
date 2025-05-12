import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../shared/models/category.model';
import { Product } from '../../shared/models/product.model';
import { AuthService } from './auth.service';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`, { headers: this.getAuthHeaders() });
  }

  getProducts(page: number = 0, size: number = 6, sort?: string, categoryId?: number): Observable<PageResponse<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId.toString());
    }
    return this.http.get<PageResponse<Product>>(`${this.baseUrl}/products`, { headers: this.getAuthHeaders(), params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  createProduct(product: Product, images: File[], isPrimaryFlags: boolean[]): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(product)); // Không cần ánh xạ
    images.forEach((image, index) => {
      formData.append('images', image, image.name);
    });
    formData.append('isPrimaryFlags', JSON.stringify(isPrimaryFlags));
    return this.http.post<Product>(`${this.baseUrl}/products/create`, formData, { headers: this.getAuthHeaders() });
  }

  updateProduct(product: Product, images: File[], isPrimaryFlags: boolean[]): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(product)); // Không cần ánh xạ
    images.forEach((image, index) => {
      formData.append('images', image, image.name);
    });
    formData.append('isPrimaryFlags', JSON.stringify(isPrimaryFlags));
    return this.http.put<Product>(`${this.baseUrl}/products/${product.id}`, formData, { headers: this.getAuthHeaders() });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  searchProducts(keyword: string, page: number = 0, size: number = 6, sort?: string): Observable<PageResponse<Product>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) {
      params = params.set('sort', sort);
    }
    return this.http.get<PageResponse<Product>>(`${this.baseUrl}/products/search`, { headers: this.getAuthHeaders(), params });
  }
}
