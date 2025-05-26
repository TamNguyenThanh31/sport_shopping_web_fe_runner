import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [
    Button,
    NgIf,
    ToastModule
  ],
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.scss'
})
export class PaymentResultComponent implements OnInit{
  status = '';
  orderId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || 'failed';
      this.orderId = params['orderId'] ? +params['orderId'] : null;

      this.messageService.add({
        severity: this.status === 'success' ? 'success' : 'error',
        summary: this.status === 'success' ? 'Thành công' : 'Thất bại',
        detail: this.status === 'success' ? `Đơn hàng #${this.orderId} đã được tạo` : params['message'] || 'Thanh toán thất bại'
      });
    });
  }

  retryPayment(): void {
    this.router.navigate(['/checkout']);
  }

  viewOrders(): void {
    this.router.navigate(['/orders']);
  }
}
