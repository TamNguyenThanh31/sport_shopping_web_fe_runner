import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Order, OrderStatus } from '../../../../shared/models/order.model';
import { OrderService } from '../../service/order.service';
import { Page } from '../../../../shared/models/pagination.model';
import { Router } from '@angular/router';

// PrimeNG + Angular Common imports
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import {AuthService} from "../../../../core/services/auth.service";

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    DropdownModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    TableModule,
    NgClass,
    CurrencyPipe,
    DatePipe,
    NgForOf,
    NgIf,
    DialogModule,
    ToastModule
  ],
  templateUrl: './order-management.component.html',
  styleUrl: './order-management.component.scss',
  providers: [MessageService]
})
export class OrderManagementComponent implements OnInit {
  orders: Order[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  filterStatus: OrderStatus | null = null;
  filterUserId: number | null = null;
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;

  statusOptions: { label: string; value: OrderStatus }[] = [];

  // currentStaffId sẽ được gán từ AuthService
  currentStaffId: number | null = null;

  // Dialog cập nhật status
  displayStatusDialog = false;
  selectedOrder: Order | null = null;
  newStatus: OrderStatus | null = null;

  loading = false;

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kiểm tra user đã đăng nhập chưa
    if (!this.authService.isLoggedIn()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cần đăng nhập',
        detail: 'Vui lòng đăng nhập để truy cập trang quản lý đơn hàng.'
      });
      // Điều hướng về login (nếu bạn có route /login)
      this.router.navigate(['/login']);
      return;
    }

    // Kiểm tra quyền ADMIN/STAFF
    if (!this.authService.isAdminOrStaff()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Không đủ quyền',
        detail: 'Bạn không có quyền truy cập trang này.'
      });
      // Bạn có thể điều hướng về trang khác, ví dụ home
      this.router.navigate(['/']);
      return;
    }

    // Gán currentStaffId từ AuthService
    const staffId = this.authService.getUserId();
    if (staffId == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi xác thực',
        detail: 'Không lấy được ID user.'
      });
      return;
    }
    this.currentStaffId = staffId;

    // Khởi tạo các tùy chọn cho dropdown Status
    this.statusOptions = [
      { label: 'PENDING', value: OrderStatus.PENDING },
      { label: 'CONFIRMED', value: OrderStatus.CONFIRMED },
      { label: 'SHIPPED', value: OrderStatus.SHIPPED },
      { label: 'DELIVERED', value: OrderStatus.DELIVERED },
      { label: 'CANCELLED', value: OrderStatus.CANCELLED }
    ];

    // Lần đầu load (first = 0, rows = pageSize)
    this.loadOrders({ first: 0, rows: this.pageSize });
  }

  loadOrders(event: any) {
    if (this.currentStaffId == null) {
      return; // nếu chưa gán staffId thì không gọi API
    }

    this.loading = true;
    const page = event.first != null ? event.first / event.rows : 0;
    this.currentPage = page;
    this.pageSize = event.rows;

    let startDateStr: string | undefined;
    let endDateStr: string | undefined;

    if (this.filterStartDate) {
      const iso = this.filterStartDate.toISOString();
      startDateStr = iso.substring(0, iso.indexOf('Z'));
    }
    if (this.filterEndDate) {
      const iso = this.filterEndDate.toISOString();
      endDateStr = iso.substring(0, iso.indexOf('Z'));
    }

    this.orderService
      .getAllOrders(
        this.currentStaffId,
        this.filterStatus ?? undefined,
        this.filterUserId ?? undefined,
        startDateStr,
        endDateStr,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (pageData: Page<Order>) => {
          this.orders = pageData.content;
          this.totalRecords = pageData.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi loadOrders:', err);
          // Hiển thị chi tiết lỗi nếu server trả ra message
          const msgDetail =
            err.error?.message || 'Không thể tải danh sách đơn hàng.';
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: msgDetail
          });
          this.loading = false;
        }
      });
  }

  onFilterChange() {
    this.loadOrders({ first: 0, rows: this.pageSize });
  }

  openStatusDialog(order: Order) {
    this.selectedOrder = order;
    this.newStatus = order.status ?? OrderStatus.PENDING;
    this.displayStatusDialog = true;
  }

  updateStatus() {
    if (!this.selectedOrder || !this.newStatus || this.currentStaffId == null) {
      return;
    }
    const orderId = this.selectedOrder.id!;
    this.orderService
      .updateOrderStatus(orderId, this.newStatus, this.currentStaffId)
      .subscribe({
        next: (updated: Order) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: `Order #${orderId} đã chuyển sang ${this.newStatus}`
          });
          this.displayStatusDialog = false;
          this.loadOrders({
            first: this.currentPage * this.pageSize,
            rows: this.pageSize
          });
        },
        error: (err) => {
          console.error('Lỗi updateStatus:', err);
          const msgDetail =
            err.error?.message || `Không thể cập nhật Order #${orderId}.`;
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: msgDetail
          });
        }
      });
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pi-clock';
      case 'processing':
        return 'pi-sync';
      case 'confirmed':
        return 'pi-check-circle';
      case 'completed':
        return 'pi-check';
      case 'cancelled':
        return 'pi-times-circle';
      default:
        return 'pi-info-circle';
    }
  }

  getStatusDescription(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đơn hàng đang chờ xử lý';
      case 'processing':
        return 'Đơn hàng đang được xử lý';
      case 'confirmed':
        return 'Đơn hàng đã được xác nhận';
      case 'completed':
        return 'Đơn hàng đã hoàn thành';
      case 'cancelled':
        return 'Đơn hàng đã bị hủy';
      default:
        return '';
    }
  }
}
