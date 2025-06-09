import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StravaStatus } from '../../../shared/models/strava-status.model';
import { Promotion } from '../../../shared/models/promotion.model';

@Injectable({ providedIn: 'root' })
export class StravaService {
  private apiUrl = 'http://localhost:8080/api/strava';

  constructor(private http: HttpClient) {}

  /** Redirect ra Strava OAuth */
  connectStrava(): void {
    const clientId = '163324';
    const redirectUri = encodeURIComponent(
      'http://localhost:8080/api/strava/callback'
    );
    const url =
      `https://www.strava.com/oauth/authorize?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=read,activity:read_all` +
      `&approval_prompt=force`;
    window.location.href = url;
  }

  /** Lấy status (sync) cho days ngày (mặc định 7) */
  getStatus(days: number = 7): Observable<StravaStatus> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<StravaStatus>(`${this.apiUrl}/status`, { params });
  }

  /** Lấy coupon mới */
  redeemCoupon(): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.apiUrl}/redeem-coupon`, null);
  }

  /** Lấy danh sách coupon của chính user */
  getMyCoupons(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/coupons`);
  }

  redeemCouponCustom(req: {amount: number, unit: string}): Observable<Promotion> {
    return this.http.post<Promotion>(
      `${this.apiUrl}/redeem-coupon`, req
    );
  }
}
