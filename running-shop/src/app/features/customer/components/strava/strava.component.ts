import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { StravaService } from '../../services/strava.service';
import { StravaStatus } from '../../../../shared/models/strava-status.model';
import { Promotion } from '../../../../shared/models/promotion.model';

import { CardModule } from 'primeng/card';
import {CurrencyPipe, NgForOf, NgIf} from '@angular/common';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-strava',
  standalone: true,
  imports: [
    CardModule,
    NgIf,
    Button,
    DropdownModule,
    FormsModule,
    ProgressSpinnerModule,
    PanelModule,
    ToastModule,
    TableModule,
    DecimalPipe,
    CurrencyPipe,
    NgForOf
  ],
  templateUrl: './strava.component.html',
  styleUrls: ['./strava.component.scss'],
  providers: [MessageService]
})
export class StravaComponent implements OnInit {
  status?: StravaStatus;
  coupons: Promotion[] = [];
  loading = false;

  daysOptions = [
    { label: '1 ngày', value: 1 },
    { label: '7 ngày', value: 7 },
    { label: '30 ngày', value: 30 }
  ];
  selectedDays = 7;

  // Đổi sang custom redeem
  redeemAmount = 0;
  redeemUnit: 'm' | 'km' = 'm';

  constructor(
    private stravaService: StravaService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.sync();
    this.loadCoupons();
  }

  /** Sync / load status */
  sync(): void {
    this.loading = true;
    this.stravaService.getStatus(this.selectedDays).subscribe({
      next: data => {
        this.status = data;
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        if (err.status === 400) {
          this.status = undefined;
        }
        this.message.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.error?.message || 'Không lấy được dữ liệu Strava'
        });
      }
    });
  }

  /** Redirect để connect Strava */
  connect(): void {
    this.stravaService.connectStrava();
  }

  /** Redeem custom (input amount) */
  redeemCustom(): void {
    this.stravaService
      .redeemCouponCustom({ amount: this.redeemAmount, unit: this.redeemUnit })
      .subscribe({
        next: () => {
          this.message.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã tạo coupon thành công'
          });
          this.sync();
          this.loadCoupons();
        },
        error: err => {
          this.message.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: err.error?.message || 'Không thể tạo coupon'
          });
        }
      });
  }

  /** Cho phép redeem custom nếu ≥ 100 m */
  get canRedeemCustom(): boolean {
    const needed = this.redeemUnit === 'km'
      ? this.redeemAmount * 1000
      : this.redeemAmount;
    return this.status != null && needed >= 100;
  }

  /** Redeem nhanh 100 m → cố định */
  redeem(): void {
    this.stravaService.redeemCoupon().subscribe({
      next: promo => {
        this.message.add({
          severity: 'success',
          summary: 'Coupon tạo thành công',
          detail: `Mã: ${promo.code}`
        });
        this.sync();
        this.loadCoupons();
      },
      error: err => {
        this.message.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: err.error?.message || 'Không thể tạo coupon'
        });
      }
    });
  }

  /** Load danh sách coupon của user */
  loadCoupons(): void {
    this.stravaService.getMyCoupons().subscribe({
      next: list => (this.coupons = list),
      error: () => (this.coupons = [])
    });
  }

  /** Cho phép redeem nhanh nếu ≥ 100 m */
  get canRedeem(): boolean {
    return (this.status?.availableKm ?? 0) >= 100;
  }
}
