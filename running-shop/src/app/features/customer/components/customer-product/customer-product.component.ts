import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Product, ProductImage, ProductVariant } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { ApiService } from '../../../../core/services/api.service';
import {Toast, ToastModule} from 'primeng/toast';
import {Paginator, PaginatorModule} from 'primeng/paginator';
import {NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase} from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Router, RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import {Listbox, ListboxModule} from 'primeng/listbox';
import {ProgressSpinner, ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputText, InputTextModule} from 'primeng/inputtext';
import {Card, CardModule} from 'primeng/card';
import {Tooltip, TooltipModule} from 'primeng/tooltip';
import {Carousel, CarouselModule} from 'primeng/carousel';
import {Slider, SliderModule} from 'primeng/slider';
import {QuickViewComponent} from "../quick-view/quick-view.component";
import {FooterComponent} from "../../../../shared/footer/footer.component";
import {SharedModule} from "../../../../shared/shared.module";
import { CartService } from '../../services/cart.servcie';
import { CartItem } from '../../../../shared/models/CartItem.model';
import { CartEventService } from 'src/app/core/services/cart-event.service';
import { CountdownTimerComponent } from 'src/app/shared/countdown-timer/countdown-timer.component';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-customer-product',
  templateUrl: './customer-product.component.html',
  styleUrls: ['./customer-product.component.scss'],
  imports: [
    ToastModule,
    PaginatorModule,
    ButtonDirective,
    Ripple,
    RouterLink,
    DropdownModule,
    FormsModule,
    NgClass,
    ListboxModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    ProgressSpinnerModule,
    CarouselModule,
    SliderModule,
    NgSwitch,
    NgIf,
    NgSwitchCase,
    NgForOf,
    QuickViewComponent,
    FooterComponent,
    SharedModule,
    CountdownTimerComponent
  ],
  providers: [MessageService],
  standalone: true
})

export class CustomerProductComponent implements OnInit {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category = { id: 0, name: 'Tất cả danh mục' };
  searchQuery: string = '';
  sortOption: string = 'default';
  priceRange: number[] = [0, 10000000];
  isLoading: boolean = true;
  categoryProductCounts: { [key: number]: number } = {};
  page: number = 0;
  size: number = 12;
  totalElements: number = 0;
  totalPages: number = 0;
  quickViewVisible: boolean = false;
  quickViewProductId: number | null = null;
  currentUserId: number = 1; // Thay bằng ID người dùng thực tế

  selectedVariants: { [productId: number]: ProductVariant } = {};

  // Thêm thuộc tính cho view mode
  viewMode: 'grid' | 'list' = 'grid';

  // Sản phẩm bán chạy (tồn kho nhiều nhất)
  hotProducts: Product[] = [];

  hotCarouselResponsive = [
    { breakpoint: '1024px', numVisible: 2, numScroll: 2 },
    { breakpoint: '600px', numVisible: 1, numScroll: 1 }
  ];

  // Thời gian count down
  flashSaleEndTime = '2025-09-22T23:59:59';

  heroImages = [
    {
      src: 'assets/images/hero-ui/hero-ui-50percent.jpg',
      alt: 'Flash Sale 50%'
    },
    {
      src: 'assets/images/hero-ui/strava-discount.jpg',
      alt: 'Flash Sale 2'
    },
    {
      src: 'assets/images/hero-ui/37percent_2_9.jpg',
      alt: 'Flash Sale 3'
    },
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService,
    private cartEventService: CartEventService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      categories: this.apiService.getCategories(),
      products: (this.selectedCategory?.id ?? 0) === 0
        ? this.apiService.getProducts(this.page, this.size, this.sortOption !== 'default' ? this.sortOption : undefined)
        : this.apiService.getProductsByCategory(this.selectedCategory?.id ?? 0, this.page, this.size)
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...categories];
        this.products = this.processProducts(products.content);
        this.featuredProducts = this.processProducts(products.content.slice(0, 4));
        this.totalElements = products.totalElements;
        this.totalPages = products.totalPages;
        this.updateCategoryProductCounts();
        this.hotProducts = [...products.content]
          .sort((a, b) => this.getTotalStock(b) - this.getTotalStock(a))
          .slice(0, 8);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Lỗi tải dữ liệu:', error);
        this.showError('Không thể tải dữ liệu sản phẩm');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    let request;
    if (this.searchQuery.trim()) {
      request = this.apiService.searchProducts(
        this.searchQuery,
        this.page,
        this.size,
        this.sortOption !== 'default' ? this.sortOption : undefined
      );
    } else if ((this.selectedCategory?.id ?? 0) !== 0) {
      request = this.apiService.getProductsByCategory(this.selectedCategory?.id ?? 0, this.page, this.size);
    } else {
      request = this.apiService.getProducts(
        this.page,
        this.size,
        this.sortOption !== 'default' ? this.sortOption : undefined
      );
    }
    request.subscribe({
      next: (products: PageResponse<Product>) => {
        this.products = this.processProducts(products.content);
        this.totalElements = products.totalElements;
        this.totalPages = products.totalPages;
        this.updateCategoryProductCounts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Lỗi tải sản phẩm:', error);
        this.showError('Không thể tải sản phẩm');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  processProducts(products: Product[]): Product[] {
    // Chỉ lọc theo giá, không lọc danh mục vì đã xử lý ở API
    let filteredProducts = products.filter(p => {
      const price = this.getCurrentPrice(p);
      return price >= this.priceRange[0] && price <= this.priceRange[1];
    });

    return filteredProducts.map(product => {
      if (product.id && product.variants.length > 0) {
        this.selectedVariants[product.id] = product.variants[0];
        product.variants = product.variants.map(v => ({
          ...v,
          displayText: this.getVariantDisplayText(v)
        }));
      }
      return product;
    });
  }

  updateCategoryProductCounts(): void {
    this.categoryProductCounts = {};
    this.categories.forEach(category => {
      const id = category.id ?? -1;
      if (id === 0) {
        this.categoryProductCounts[0] = this.totalElements;
      } else {
        // Gọi API để lấy số lượng sản phẩm theo danh mục
        this.apiService.getProductsByCategory(id, 0, 1).subscribe({
          next: (response) => {
            this.categoryProductCounts[id] = response.totalElements;
            this.cdr.markForCheck();
          },
          error: () => {
            this.categoryProductCounts[id] = 0;
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  getVariantDisplayText(variant: ProductVariant): string {
    const parts = [];
    if (variant.color) parts.push(`Màu: ${variant.color}`);
    if (variant.size) parts.push(`Size: ${variant.size}`);
    return parts.join(' | ') || `SKU: ${variant.sku}`;
  }

  getPrimaryImage(images: ProductImage[]): string {
    const baseUrl = 'http://localhost:8080';
    const primaryImage = images.find((img) => img.primary);
    if (primaryImage?.imageUrl) {
      return `${baseUrl}${primaryImage.imageUrl}`;
    }
    if (images[0]?.imageUrl) {
      return `${baseUrl}${images[0].imageUrl}`;
    }
    return 'assets/images/placeholder-product.png';
  }

  getCurrentPrice(product: Product): number {
    const variant = product.id !== undefined ? this.selectedVariants[product.id] : undefined;
    return variant?.price || 0;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price).replace('₫', 'đ');
  }

  hasStock(product: Product): boolean {
    const variant = product.id !== undefined ? this.selectedVariants[product.id] : undefined;
    return variant ? variant.stock > 0 : false;
  }

  filterByCategory(): void {
    this.page = 0;
    this.loadProducts();
  }

  filterBySearch(): void {
    this.page = 0;
    this.loadProducts();
  }

  filterByPrice(): void {
    this.page = 0;
    this.loadProducts();
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.size = event.rows;
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategory = { id: 0, name: 'Tất cả danh mục' };
    this.searchQuery = '';
    this.sortOption = 'default';
    this.priceRange = [0, 10000000];
    this.page = 0;
    this.loadProducts();
  }

  addToCart(product: Product): void {
    if (!this.hasStock(product)) {
      this.showError('Sản phẩm đã hết hàng');
      return;
    }

    const variant = this.getSelectedVariant(product);
    if (!variant) {
      this.showError('Vui lòng chọn phân loại sản phẩm');
      return;
    }

    const cartItem: any = {
      userId: this.currentUserId,
      variantId: variant.id!,
      quantity: 1,
      stock: variant.stock || 0,
      priceAtTime: variant.price || 0,
      productName: product.name,
      imageUrl: this.getPrimaryImage(product.images),
      size: variant.size || '',
      color: variant.color || '',
      totalPrice: (variant.price || 0) * 1
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        this.showSuccess(`Đã thêm ${product.name} vào giỏ hàng`);
        this.cartEventService.notifyCartChanged();
        // Thêm hiệu ứng animation
        const button = document.querySelector(`[data-product-id="${product.id}"]`) as HTMLElement;
        if (button) {
          button.classList.add('added-to-cart');
          setTimeout(() => button.classList.remove('added-to-cart'), 1000);
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.showError('Không thể thêm vào giỏ hàng');
      }
    });
  }

  hasDiscount(product: Product): boolean {
    return false;
  }

  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: message,
      key: 'mainToast',
      life: 3000
    });
  }

  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: message,
      key: 'mainToast',
      life: 5000
    });
  }

  getSelectedVariant(product: Product): ProductVariant | undefined {
    return product.id !== undefined ? this.selectedVariants[product.id] : undefined;
  }

  onVariantChange(product: Product, variant: ProductVariant): void {
    if (product.id !== undefined) {
      this.selectedVariants[product.id] = variant;
      this.cdr.markForCheck();
    }
  }

  // Thêm hàm chuyển đổi view
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // TrackBy cho *ngFor
  trackByProductId(index: number, product: Product) {
    return product.id;
  }

  // Lấy tổng tồn kho của sản phẩm
  getTotalStock(product: Product): number {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }

  navigateToDetail(id: number) {
    this.router.navigate(['/products/detail-product', id]);
  }

  openQuickView(productId: number) {
    this.quickViewProductId = productId;
    this.quickViewVisible = true;
  }
  closeQuickView() {
    this.quickViewVisible = false;
    this.quickViewProductId = null;
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.filterByCategory();
  }

  scrollToProducts() {
    const el = document.querySelector('.hot-products-ui');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
