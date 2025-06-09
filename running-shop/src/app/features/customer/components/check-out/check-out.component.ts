import {Component, OnInit} from '@angular/core';
import {CartItem} from "../../../../shared/models/CartItem.model";
import {Address} from "../../../../shared/models/address.model";
import {Promotion} from "../../../../shared/models/promotion.model";
import {Order as OrderModel, PaymentMethod} from "../../../../shared/models/order.model";
import {CartService} from "../../services/cart.servcie";
import {OrderService} from "../../services/order.service";
import {AddressService} from "../../services/address.service";
import {PromotionService} from "../../../staff/services/promotion.service";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";
import {TableModule} from "primeng/table";
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {Button} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {RadioButtonModule} from "primeng/radiobutton";
import {FormsModule} from "@angular/forms";
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [
    TableModule,
    CurrencyPipe,
    Button,
    DialogModule,
    DatePipe,
    RadioButtonModule,
    FormsModule,
    ToastModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.scss'
})
export class CheckOutComponent implements OnInit {
  cartItems: CartItem[] = [];
  addresses: Address[] = [];
  promotions: Promotion[] = [];
  selectedAddress: Address | null = null;
  selectedPromotion: Promotion | null = null;
  paymentMethod: PaymentMethod = PaymentMethod.CASH_ON_DELIVERY;
  showAddressDialog = false;
  showPromotionDialog = false;
  userId: number | null = null;
  subtotal = 0;
  discount = 0;
  total = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private addressService: AddressService,
    private promotionService: PromotionService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (!this.userId) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng đăng nhập' });
      this.router.navigate(['']);
      return;
    }
    this.loadCart();
    this.loadAddresses();
    this.loadPromotions();
  }

  loadCart(): void {
    this.cartService.getCart(this.userId!).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải giỏ hàng' })
    });
  }

  loadAddresses(): void {
    this.addressService.getAddresses(this.userId!).subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        this.selectedAddress = addresses.find(a => a.isDefault) || null;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải địa chỉ' })
    });
  }

  loadPromotions(): void {
    this.promotionService.searchPromotions({ isActive: true }).subscribe({
      next: (page) => {
        this.promotions = page.content.filter(p =>
          (!p.startDate || new Date(p.startDate) <= new Date()) &&
          (!p.endDate || new Date(p.endDate) > new Date()) &&
          (!p.maxUsage || p.maxUsage > 0)
        );
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải mã giảm giá' })
    });
  }

  calculateTotal(): void {
    this.subtotal = this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    this.discount = 0;

    if (this.selectedPromotion) {
      // Kiểm tra điều kiện minimumOrderValue
      if (
        this.selectedPromotion.minimumOrderValue != null &&
        this.subtotal < this.selectedPromotion.minimumOrderValue
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cảnh báo',
          detail: `Đơn hàng chưa đạt ${this.selectedPromotion.minimumOrderValue} đ`
        });
        this.selectedPromotion = null;
      } else {
        // Ưu tiên discountAmount
        if (
          this.selectedPromotion.discountAmount != null &&
          this.selectedPromotion.discountAmount > 0
        ) {
          this.discount = this.selectedPromotion.discountAmount;
        }
        // Nếu không có discountAmount thì dùng phần trăm
        else if (
          this.selectedPromotion.discountPercentage != null &&
          this.selectedPromotion.discountPercentage > 0
        ) {
          this.discount =
            this.subtotal *
            (this.selectedPromotion.discountPercentage / 100);
        }
        // Không để discount vượt quá subtotal
        if (this.discount > this.subtotal) {
          this.discount = this.subtotal;
        }
      }
    }

    this.total = this.subtotal - this.discount;
  }


  selectAddress(address: Address): void {
    this.selectedAddress = address;
    this.showAddressDialog = false;
  }

  applyPromotion(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showPromotionDialog = false;
    this.calculateTotal();
  }

  removePromotion(): void {
    this.selectedPromotion = null;
    this.calculateTotal();
  }

  placeOrder(): void {
    if (!this.selectedAddress) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn địa chỉ' });
      return;
    }

    if (!this.total || this.total <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tổng tiền không hợp lệ' });
      return;
    }

    const order: OrderModel = {
      userId: this.userId!,
      addressId: this.selectedAddress.id!,
      promotionId: this.selectedPromotion?.id,
      promotionCode: this.selectedPromotion?.code,
      paymentMethod: this.paymentMethod,
      totalPrice: Number(this.total.toFixed(2)) // Đảm bảo giá trị là số và có 2 chữ số thập phân
    };

    this.orderService.placeOrder(order).subscribe({
      next: (createdOrder) => {
        if (!createdOrder.id) {
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không nhận được ID đơn hàng' });
          return;
        }
        if (this.paymentMethod === 'VNPAY') {
          const returnUrl = 'http://localhost:8080/api/vnpay/return';
          this.orderService.initiateVNPayPayment(createdOrder.id!, this.userId!, returnUrl).subscribe({
            next: (response) => window.location.href = response.paymentUrl,
            error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể khởi tạo VNPay' })
          });
        } else {
          this.router.navigate(['/payment-result'], { queryParams: { status: 'success', orderId: createdOrder.id } });
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo đơn hàng' })
    });
  }

  getImageUrl(imageUrl: string): string {
    if (imageUrl) {
      return `http://localhost:8080${imageUrl}`;
    }
    return 'assets/images/placeholder-product.png';
  }

  protected readonly PaymentMethod = PaymentMethod;
}
