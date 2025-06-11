import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { Page, Promotion } from '../../../shared/models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly apiUrl = 'http://localhost:8080/api/promotions';

  constructor(private http: HttpClient) {}

  createPromotion(staffId: number, promotion: Promotion): Observable<Promotion> {
    const params = new HttpParams().set('staffId', staffId.toString());
    return this.http.post<Promotion>(this.apiUrl, promotion, { params });
  }

  updatePromotion(staffId: number, promotionId: number, promotion: Promotion): Observable<Promotion> {
    const params = new HttpParams().set('staffId', staffId.toString());
    return this.http.put<Promotion>(`${this.apiUrl}/${promotionId}`, promotion, { params });
  }

  deletePromotion(staffId: number, promotionId: number): Observable<void> {
    const params = new HttpParams().set('staffId', staffId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${promotionId}`, { params });
  }

  getPromotionById(promotionId: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${promotionId}`);
  }

  getAllPromotionsForCustomer(customerId: number): Observable<Promotion[]> {
    const url = `${this.apiUrl}/customer/${customerId}`;
    return this.http.get<Promotion[]>(url);
  }

  searchPromotions(searchParams: {
    code?: string;
    isActive?: boolean;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    size?: number;
  }): Observable<Page<Promotion>> {
    let params = new HttpParams()
      .set('page', (searchParams.page || 0).toString())
      .set('size', (searchParams.size || 10).toString());

    if (searchParams.code) params = params.set('code', searchParams.code);
    if (searchParams.isActive !== undefined) params = params.set('isActive', searchParams.isActive.toString());
    if (searchParams.dateFrom) {
      const dateFrom = new Date(searchParams.dateFrom).toISOString().replace('.000Z', '');
      params = params.set('dateFrom', dateFrom);
    }
    if (searchParams.dateTo) {
      const dateTo = new Date(searchParams.dateTo).toISOString().replace('.000Z', '');
      params = params.set('dateTo', dateTo);
    }

    console.log('Search params sent:', params.toString());
    return this.http.get<Page<Promotion>>(`${this.apiUrl}/search`, { params });
  }
}
