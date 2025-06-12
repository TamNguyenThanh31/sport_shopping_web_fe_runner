import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '../../../../shared/models/order.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ToastModule
  ]
})
export class OrderComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  showDetailsDialog = false;
  userId: number | null = null;
  
  // Thêm các enum để sử dụng trong template
  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;
  PaymentMethod = PaymentMethod;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadOrders();
    }
  }

  loadOrders(): void {
    if (!this.userId) return;
    
    this.orderService.getOrders(this.userId).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
      }
    });
  }

  viewDetails(orderId: number): void {
    if (!this.userId) return;
    
    this.orderService.getOrderById(orderId, this.userId).subscribe({
      next: (order) => {
        this.selectedOrder = order;
        this.showDetailsDialog = true;
      },
      error: (error) => {
        console.error('Error loading order details:', error);
      }
    });
  }

  getStatusText(status: OrderStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.SHIPPED:
        return 'Đang giao hàng';
      case OrderStatus.DELIVERED:
        return 'Đã giao hàng';
      case OrderStatus.PENDING:
        return 'Đang chờ xác nhận';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      default:
        return '';
    }
  }

  getPaymentStatusText(status: PaymentStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'Đã thanh toán';
      case PaymentStatus.PENDING:
        return 'Chờ thanh toán';
      case PaymentStatus.FAILED:
        return 'Thanh toán thất bại';
      case PaymentStatus.CANCELLED:
        return 'Đã hủy thanh toán';
      case PaymentStatus.REFUNDED:
        return 'Đã hoàn tiền';
      default:
        return '';
    }
  }

  getPaymentMethodText(method: PaymentMethod | undefined): string {
    if (!method) return '';
    
    switch (method) {
      case PaymentMethod.VNPAY:
        return 'VnPay';
      case PaymentMethod.CASH_ON_DELIVERY:
        return 'Thanh toán khi nhận hàng';
      default:
        return '';
    }
  }
}
