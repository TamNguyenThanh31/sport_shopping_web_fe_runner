import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CartItem} from '../../../../shared/models/CartItem.model';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CurrencyPipe, NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../../../core/services/auth.service';
import {CartService} from "../../services/cart.servcie";
import {ProductImage} from "../../../../shared/models/product.model";
import { CartEventService } from 'src/app/core/services/cart-event.service';

@Component({
  selector: 'app-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    InputNumberModule,
    CurrencyPipe,
    NgIf,
    NgForOf,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    ProgressSpinnerModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class CartSidebarComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = false;
  @Output() onCartUpdate = new EventEmitter<void>();

  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService,
    private cartEventService: CartEventService
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.cartEventService.cartChanged$.subscribe(() => {
      this.loadCart();
    });
  }

  loadCart(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showError('Vui lòng đăng nhập để xem giỏ hàng');
      this.cartItems = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.cartService.getCart(userId).subscribe({
      next: (items) => {
        this.cartItems = items.map(item => ({
          ...item,
          id: item.id ?? 0,
          quantity: Number(item.quantity),
          stock: Number(item.stock),
          priceAtTime: Number(item.priceAtTime),
          totalPrice: Number(item.totalPrice),
          productName: item.productName ?? '',
          size: item.size ?? '',
          color: item.color ?? '',
          imageUrl: item.imageUrl
            ? `http://localhost:8080${item.imageUrl}`
            : 'assets/images/placeholder-product.png' // Thêm base URL hoặc fallback
        }));
        this.onCartUpdate.emit();
        this.loading = false;
      },
      error: (err) => {
        this.showError('Không thể tải giỏ hàng');
        this.loading = false;
      }
    });
  }

  // // Add getPrimaryImage function
  // getPrimaryImage(images: ProductImage[]): string {
  //   const primaryImage = images.find((img) => img.primary);
  //   if (primaryImage?.imageUrl) {
  //     return `http://localhost:8080${primaryImage.imageUrl}`;
  //   }
  //   if (images[0]?.imageUrl) {
  //     return `http://localhost:8080${images[0].imageUrl}`;
  //   }
  //   return 'assets/images/placeholder-product.png';
  // }

  updateQuantity(cartItem: CartItem, quantity: number | string | null): void {
    const parsedQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;
    if (parsedQuantity === null || isNaN(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > cartItem.stock) {
      this.showError('Số lượng không hợp lệ');
      return;
    }
    if (!cartItem.id) {
      this.showError('ID giỏ hàng không hợp lệ');
      return;
    }
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showError('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }
    this.loading = true;
    this.cartService.updateCart(cartItem.id, parsedQuantity).subscribe({
      next: () => {
        this.loadCart();
        this.showSuccess('Cập nhật số lượng thành công');
      },
      error: (err) => {
        this.showError('Cập nhật số lượng thất bại');
        this.loading = false;
      }
    });
  }

  removeFromCart(cartId: number): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showError('Vui lòng đăng nhập để xóa sản phẩm');
      return;
    }
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      accept: () => {
        this.loading = true;
        this.cartService.deleteFromCart(cartId).subscribe({
          next: () => {
            this.loadCart();
            this.showSuccess('Xóa sản phẩm thành công');
          },
          error: (err) => {
            this.showError('Xóa sản phẩm thất bại');
            this.loading = false;
          }
        });
      },
      reject: () => {
        // Không làm gì khi hủy
      }
    });
  }

  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: message });
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: message });
  }
}
