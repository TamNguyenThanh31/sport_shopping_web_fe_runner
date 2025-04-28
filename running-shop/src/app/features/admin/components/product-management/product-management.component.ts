import {Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api'; // Thêm ConfirmationService
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
import { Product, ProductImage, ProductVariant } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { ApiService } from '../../../../core/services/api.service';
import { AuthService } from '../../../../core/services/auth.service';
import {Paginator} from "primeng/paginator";
import {Tooltip} from "primeng/tooltip";

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
  filteredProducts: Product[] = [];
  displayProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category = { id: 0, name: 'Tất cả danh mục' };
  searchQuery: string = '';
  sortOption: string = 'default';
  isLoading: boolean = true;
  categoryProductCounts: { [key: number]: number } = {};
  paginatorRows: number = 6;
  paginatorFirst: number = 0;
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
      products: this.apiService.getProducts()
    }).subscribe({
      next: ({ categories, products }) => {
        console.log('Danh mục:', categories);
        console.log('Sản phẩm:', products);
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...categories];
        this.products = this.processProducts(products);
        console.log('Sản phẩm sau khi xử lý:', this.products);
        this.filteredProducts = [...this.products];
        this.updateDisplayProducts();
        console.log('Sản phẩm hiển thị:', this.displayProducts);
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
    console.log('Images:', images);
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
    console.log('Selected variant for product', product.id, variant);
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
    if (!this.selectedCategory || this.selectedCategory.id === 0) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        product => product.categoryId === this.selectedCategory.id
      );
    }
    this.paginatorFirst = 0;
    this.filterBySearch();
  }

  filterBySearch(): void {
    if (this.searchQuery.trim()) {
      this.apiService.searchProducts(this.searchQuery).subscribe({
        next: (products) => {
          this.filteredProducts = this.sortProducts(products);
          this.paginatorFirst = 0;
          this.updateDisplayProducts();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Lỗi khi tìm kiếm sản phẩm', error);
          this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tìm kiếm sản phẩm thất bại' });
        }
      });
    } else {
      this.filteredProducts = this.sortProducts([...this.products]);
      this.paginatorFirst = 0;
      this.updateDisplayProducts();
      this.cdr.markForCheck();
    }
  }

  sortProducts(products: Product[]): Product[] {
    const sorted = [...products];
    switch (this.sortOption) {
      case 'priceAsc':
        return sorted.sort((a, b) => this.getCurrentPrice(a) - this.getCurrentPrice(b));
      case 'priceDesc':
        return sorted.sort((a, b) => this.getCurrentPrice(b) - this.getCurrentPrice(a));
      default:
        return sorted;
    }
  }

  updateDisplayProducts(): void {
    const start = this.paginatorFirst;
    const end = start + this.paginatorRows;
    this.displayProducts = this.filteredProducts.slice(start, end);
    console.log('Cập nhật displayProducts:', this.displayProducts);
    this.cdr.markForCheck();
  }

  onPageChange(event: any): void {
    this.paginatorFirst = event.first;
    this.updateDisplayProducts();
  }

  onSortChange(): void {
    this.paginatorFirst = 0;
    this.filterBySearch();
  }

  resetFilters(): void {
    this.selectedCategory = { id: 0, name: 'Tất cả danh mục' };
    this.searchQuery = '';
    this.sortOption = 'default';
    this.filterByCategory();
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
              this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
              this.updateDisplayProducts();
              this.updateCategoryProductCounts();
              this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa sản phẩm thành công' });
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
        this.categoryProductCounts[0] = this.products.length;
      } else {
        this.categoryProductCounts[id] = this.products.filter(p => p.categoryId === id).length;
      }
    });
    console.log('categoryProductCounts:', this.categoryProductCounts);
    this.cdr.markForCheck();
  }

  canManageProducts(): boolean {
    return this.authService.isAdminOrStaff();
  }
}
