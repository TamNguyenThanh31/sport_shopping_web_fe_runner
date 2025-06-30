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

  /** Sync / load status và show cảnh báo nếu cần */
  sync(): void {
    this.loading = true;
    this.stravaService.getStatus(this.selectedDays).subscribe({
      next: data => {
        this.status = data;

        // nếu backend báo nearLimit thì show toast cảnh báo
        if (data.nearLimit) {
          this.message.add({
            severity: 'warn',
            summary: 'Sắp hết hạn mức tháng',
            detail: data.warningMessage
          });
        }

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

  connect(): void {
    this.stravaService.connectStrava();
  }

  redeemCustom(): void {
    const needed = this.redeemUnit === 'km'
      ? this.redeemAmount * 1000
      : this.redeemAmount;

    if (needed < 100 || needed % 100 !== 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Cảnh báo',
        detail: 'Vui lòng nhập bội số của 100 và từ 100m trở lên!'
      });
      return;
    }

    this.stravaService
      .redeemCouponCustom({ amount: this.redeemAmount, unit: this.redeemUnit })
      .subscribe({
        next: promo => {
          this.message.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Đã tạo coupon: ${promo.code}`
          });
          this.sync();
          this.loadCoupons();
        },
        error: err => {
          this.message.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: err.error?.message || 'Không tạo được coupon'
          });
        }
      });
  }

  get canRedeemCustom(): boolean {
    return this.status != null && this.redeemAmount > 0;
  }

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

  loadCoupons(): void {
    this.stravaService.getMyCoupons().subscribe({
      next: list => (this.coupons = list),
      error: () => (this.coupons = [])
    });
  }

  get canRedeem(): boolean {
    return (this.status?.availableKm ?? 0) >= 100;
  }
}
