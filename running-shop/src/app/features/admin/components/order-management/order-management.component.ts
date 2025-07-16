import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Order, OrderStatus } from '../../../../shared/models/order.model';
import { OrderService } from '../../service/order.service';
import { Page } from '../../../../shared/models/pagination.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../shared/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';

// PrimeNG + Angular Common imports
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

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
  filterUserName: string = '';
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;

  statusOptions: { label: string; value: OrderStatus }[] = [];

  // currentadminId sẽ được gán từ AuthService
  currentadminId: number | null = null;

  // Dialog cập nhật status
  displayStatusDialog = false;
  selectedOrder: Order | null = null;
  newStatus: OrderStatus | null = null;

  loading = false;

  OrderStatus = OrderStatus; // Export enum ra template

  // Thêm map userId -> userName
  userIdNameMap: { [key: number]: string } = {};

  constructor(
    private orderService: OrderService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient // Thêm nếu chưa có
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

    // Gán currentadminId từ AuthService
    const adminId = this.authService.getUserId();
    if (adminId == null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi xác thực',
        detail: 'Không lấy được ID user.'
      });
      return;
    }
    this.currentadminId = adminId;

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

  // Hàm lấy user theo tên (gọi API AuthService)
  fetchUsersByName(name: string): Promise<User[]> {
    if (!name || !name.trim()) return Promise.resolve([]);
    return this.http.get<User[]>(`http://localhost:8080/api/users?name=${encodeURIComponent(name)}`).toPromise().then(res => res || []);
  }

  async loadOrders(event: any) {
    if (this.currentadminId == null) {
      return;
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
    let userIds: number[] | undefined = undefined;
    if (this.filterUserName && this.filterUserName.trim()) {
      const users = await this.fetchUsersByName(this.filterUserName.trim());
      userIds = users.map(u => u.id);
      // Map userId -> name để hiển thị
      this.userIdNameMap = {};
      users.forEach(u => this.userIdNameMap[u.id] = u.username || u.email);
    }
    this.orderService
      .getAllOrders(
        this.currentadminId,
        this.filterStatus ?? undefined,
        userIds && userIds.length > 0 ? userIds[0] : undefined, // chỉ lấy userId đầu tiên nếu có
        startDateStr,
        endDateStr,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: async (pageData: Page<Order>) => {
          this.orders = pageData.content;
          this.totalRecords = pageData.totalElements;
          // Lấy tất cả userId trong orders
          const ids = Array.from(new Set(this.orders.map(o => o.userId)));
          // Lấy userId chưa có trong userIdNameMap
          const missingIds = ids.filter(id => !this.userIdNameMap[id]);
          // Gọi API lấy thông tin user cho các userId còn thiếu
          if (missingIds.length > 0) {
            const userRequests = missingIds.map(id => this.http.get<User>(`http://localhost:8080/api/users/${id}`).toPromise());
            const users = await Promise.all(userRequests);
            users.forEach(u => {
              if (u && u.id) this.userIdNameMap[u.id] = u.username || u.email;
            });
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Lỗi loadOrders:', err);
          const msgDetail = err.error?.message || 'Không thể tải danh sách đơn hàng.';
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

  get stepStatusOptions() {
    return this.statusOptions.filter(s => s.value !== OrderStatus.CANCELLED);
  }

  openStatusDialog(order: Order) {
    this.selectedOrder = order;
    this.newStatus = order.status ?? OrderStatus.PENDING;
    this.displayStatusDialog = true;
  }

  updateStatus() {
    if (!this.selectedOrder || !this.newStatus || this.currentadminId == null) {
      return;
    }
    const orderId = this.selectedOrder.id!;
    this.orderService
      .updateOrderStatus(orderId, this.newStatus, this.currentadminId)
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

  getStatusDescription(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đơn hàng đang chờ xử lý';
      case 'confirmed':
        return 'Đơn hàng đã được xác nhận';
      case 'shipped':
        return 'Đơn hàng đang được giao';
      case 'delivered':
        return 'Đơn hàng đã giao tới khách hàng';
      case 'cancelled':
        return 'Đơn hàng đã bị hủy';
      default:
        return '';
    }
  }

  isCompleted(status: OrderStatus): boolean {
    const idx = this.stepStatusOptions.findIndex(s => s.value === status);
    const currentIdx = this.stepStatusOptions.findIndex(s => s.value === this.newStatus);
    return idx < currentIdx;
  }

  getUserName(userId: number): string {
    return this.userIdNameMap[userId] || 'Không rõ';
  }

  resetFilters() {
    this.filterStatus = null;
    this.filterUserName = '';
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.loadOrders({ first: 0, rows: this.pageSize });
  }

  // Map trạng thái sang tiếng Việt
  getOrderStatusVN(status: OrderStatus | null | undefined): string {
    switch (status) {
      case OrderStatus.PENDING: return 'Chờ xử lý';
      case OrderStatus.CONFIRMED: return 'Đã xác nhận';
      case OrderStatus.SHIPPED: return 'Đang giao';
      case OrderStatus.DELIVERED: return 'Đã giao';
      case OrderStatus.CANCELLED: return 'Đã hủy';
      default: return 'Không rõ';
    }
  }

  getPaymentStatusVN(status: string | null | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'Chờ thanh toán';
      case 'COMPLETED': return 'Đã thanh toán';
      case 'FAILED': return 'Thất bại';
      case 'CANCELLED': return 'Đã hủy';
      case 'REFUNDED': return 'Đã hoàn tiền';
      default: return 'Không rõ';
    }
  }

  getPaymentMethodVN(method: string | null | undefined): string {
    switch ((method || '').toUpperCase()) {
      case 'VNPAY': return 'VNPay';
      case 'CASH_ON_DELIVERY': return 'Thanh toán khi nhận hàng';
      default: return 'Không rõ';
    }
  }
}
