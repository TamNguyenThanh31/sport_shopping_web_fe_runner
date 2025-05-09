import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterLink } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, ProductImage, ProductVariant } from '../../../shared/models/product.model';
import { Category } from '../../../shared/models/category.model';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Paginator } from 'primeng/paginator';
import { Tooltip } from 'primeng/tooltip';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    ButtonModule,
    RippleModule,
    RouterLink,
    DropdownModule,
    FormsModule,
    ListboxModule,
    BadgeModule,
    ProgressSpinnerModule,
    InputTextModule,
    CardModule,
    ConfirmDialogModule,
    Paginator,
    Tooltip,
  ],
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class ProductManagementComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category = { id: 0, name: 'Tất cả danh mục' };
  searchQuery: string = '';
  sortOption: string = 'default';
  isLoading: boolean = true;
  categoryProductCounts: { [key: number]: number } = {};
  page: number = 0;
  size: number = 6;
  totalElements: number = 0;
  totalPages: number = 0;
  showFilters = false;
  selectedVariants: { [productId: number]: ProductVariant } = {};
  variantDisplayTexts: { [variantId: number]: string } = {};

  sortOptions = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Giá: Thấp đến cao', value: 'priceAsc' },
    { label: 'Giá: Cao đến thấp', value: 'priceDesc' }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  loadData(): void {
    this.isLoading = true;
    forkJoin({
      categories: this.apiService.getCategories(),
      products: this.apiService.getProducts(this.page, this.size, this.sortOption !== 'default' ? this.sortOption : undefined)
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...categories];
        this.products = this.processProducts(products.content);
        this.totalElements = products.totalElements;
        this.totalPages = products.totalPages;
        this.updateCategoryProductCounts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu sản phẩm' });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  processProducts(products: any[]): Product[] {
    return products.map(product => {
      const mappedProduct: Product = {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        brand: product.brand,
        addedById: product.addedById,
        isActive: product.isActive,
        variants: product.variants || product.productVariants || [],
        images: product.images || product.productImages || []
      };
      if (mappedProduct.id && mappedProduct.variants.length > 0) {
        this.selectedVariants[mappedProduct.id] = mappedProduct.variants[0];
      }
      mappedProduct.variants.forEach(v => {
        if (v.id) {
          this.variantDisplayTexts[v.id] = this.getVariantDisplayText(v);
        }
      });
      return mappedProduct;
    });
  }

  getVariantDisplayText(variant: ProductVariant): string {
    const parts = [];
    if (variant.color) parts.push(`Màu: ${variant.color}`);
    if (variant.size) parts.push(`Size: ${variant.size}`);
    return parts.join(' | ') || `SKU: ${variant.sku}`;
  }

  getPrimaryImage(images: ProductImage[]): string {
    const primaryImage = images.find((img) => img.isPrimary);
    if (primaryImage?.imageUrl) {
      return `http://localhost:8080${primaryImage.imageUrl}`;
    }
    if (images[0]?.imageUrl) {
      return `http://localhost:8080${images[0].imageUrl}`;
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

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Không xác định';
  }

  filterByCategory(): void {
    this.page = 0;
    this.loadProducts();
  }

  filterBySearch(): void {
    this.page = 0;
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    const request = this.searchQuery.trim()
      ? this.apiService.searchProducts(this.searchQuery, this.page, this.size, this.sortOption !== 'default' ? this.sortOption : undefined)
      : this.apiService.getProducts(this.page, this.size, this.sortOption !== 'default' ? this.sortOption : undefined, this.selectedCategory.id !== 0 ? this.selectedCategory.id : undefined);

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
        console.error('Lỗi khi tải sản phẩm', error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải sản phẩm' });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.size = event.rows;
    this.loadProducts();
  }

  onSortChange(): void {
    this.page = 0;
    this.loadProducts();
  }

  resetFilters(): void {
    this.selectedCategory = { id: 0, name: 'Tất cả danh mục' };
    this.searchQuery = '';
    this.sortOption = 'default';
    this.page = 0;
    this.loadProducts();
  }

  deleteProduct(productId: number | undefined): void {
    if (productId) {
      this.confirmationService.confirm({
        message: 'Bạn có chắc muốn xóa sản phẩm này không?',
        header: 'Xác nhận xóa',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Có',
        rejectLabel: 'Không',
        accept: () => {
          this.apiService.deleteProduct(productId).subscribe({
            next: () => {
              this.products = this.products.filter(p => p.id !== productId);
              this.totalElements--;
              this.updateCategoryProductCounts();
              this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa sản phẩm thành công' });
              this.loadProducts();
              this.cdr.markForCheck();
            },
            error: (error) => {
              console.error('Lỗi khi xóa sản phẩm', error);
              const message = error.status === 403 ? 'Bạn không có quyền xóa sản phẩm' : 'Xóa sản phẩm thất bại';
              this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: message });
            }
          });
        },
        reject: () => {
          this.messageService.add({ severity: 'info', summary: 'Hủy', detail: 'Hủy xóa sản phẩm' });
        }
      });
    }
  }

  updateCategoryProductCounts(): void {
    this.categoryProductCounts = {};
    this.categories.forEach(category => {
      const id = category.id ?? -1;
      if (id === 0) {
        this.categoryProductCounts[0] = this.totalElements;
      } else {
        this.categoryProductCounts[id] = this.products.filter(p => p.categoryId === id).length;
      }
    });
    this.cdr.markForCheck();
  }

  canManageProducts(): boolean {
    return this.authService.isAdminOrStaff();
  }
}
