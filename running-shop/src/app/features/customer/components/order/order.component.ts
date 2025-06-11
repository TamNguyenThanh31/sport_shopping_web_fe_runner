import { Component } from '@angular/core';
import {Order} from "../../../../shared/models/order.model";
import {OrderService} from "../../services/order.service";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";
import {TableModule} from "primeng/table";
import {CurrencyPipe, DatePipe, NgClass, NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    TableModule,
    DatePipe,
    CurrencyPipe,
    Button,
    DialogModule,
    NgIf,
    ToastModule,
    NgClass
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  showDetailsDialog = false;
  userId: number | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập' });
      this.router.navigate(['/login']);
      return;
    }
    this.route.queryParams.subscribe(params => {
      if (params['status'] === 'success' && params['orderId']) {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thanh toán hoàn tất' });
        this.viewDetails(+params['orderId']);
      } else if (params['status'] === 'failed') {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Thanh toán thất bại' });
        this.loadOrders();
      } else {
        this.loadOrders();
      }
    });
  }

  loadOrders(): void {
    this.orderService.getOrders(this.userId!).subscribe({
      next: (orders) => this.orders = orders,
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải đơn hàng' })
    });
  }

  viewDetails(orderId: number): void {
    this.orderService.getOrderById(orderId, this.userId!).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.showDetailsDialog = true;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải chi tiết đơn hàng' })
    });
  }
}
