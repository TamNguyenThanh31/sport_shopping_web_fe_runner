import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { Product, ProductImage, ProductVariant } from "../../../../shared/models/product.model";
import { Category } from "../../../../shared/models/category.model";
import { ApiService } from "../../../../core/services/api.service";
import { Toast } from "primeng/toast";
import { Paginator } from "primeng/paginator";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { ButtonDirective } from "primeng/button";
import { Ripple } from "primeng/ripple";
import { RouterLink } from "@angular/router";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { Listbox } from "primeng/listbox";
import { Tag } from "primeng/tag";
import { ProgressSpinner } from "primeng/progressspinner";
import {InputText} from "primeng/inputtext";
import {Card} from "primeng/card";
import {Tooltip} from "primeng/tooltip";

@Component({
  selector: 'app-customer-product',
  templateUrl: './customer-product.component.html',
  styleUrls: ['./customer-product.component.scss'],
  imports: [
    Toast,
    Paginator,
    ButtonDirective,
    Ripple,
    RouterLink,
    DropdownModule,
    FormsModule,
    NgClass,
    Listbox,
    ProgressSpinner,
    InputText,
    Card,
    Tooltip
  ],
  providers: [MessageService]
})
export class CustomerProductComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category = { id: 0, name: 'Tất cả danh mục' };
  searchQuery: string = '';
  sortOption: string = 'default';
  isLoading: boolean = true;
  categoryProductCounts: { [key: number]: number } = {};
  paginatorRows: number = 12;
  paginatorFirst: number = 0;

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.apiService.getProducts().subscribe({
      next: (products) => {
        this.products = products.map(p => {
          if (p.id && p.variants.length > 0) {
            this.selectedVariants[p.id] = p.variants[0];
          }
          p.variants.forEach(v => {
            if (v.id) {
              this.variantDisplayTexts[v.id] = this.getVariantDisplayText(v);
            }
          });
          return p;
        });
        this.filteredProducts = [...this.products];
        this.updateDisplayProducts();
        this.updateCategoryProductCounts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.isLoading = false;
      }
    });
  }

  updateCategoryProductCounts(): void {
    this.categoryProductCounts = {};
    this.categories.forEach(category => {
      const id = category.id ?? -1;
      if (id === 0) {
        this.categoryProductCounts[0] = this.products.length;
      } else {
        this.categoryProductCounts[id] =
          this.products.filter(p => p.categoryId === id).length;
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
    const primaryImage = images.find((img) => img.isPrimary);
    if (primaryImage?.imageUrl) {
      console.log('Primary image URL:', `${baseUrl}${primaryImage.imageUrl}`);
      return `${baseUrl}${primaryImage.imageUrl}`;
    }
    if (images[0]?.imageUrl) {
      console.log('Fallback image URL:', `${baseUrl}${images[0].imageUrl}`);
      return `${baseUrl}${images[0].imageUrl}`;
    }
    console.warn('Falling back to placeholder image');
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
    let tempProducts = [...this.filteredProducts];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      tempProducts = tempProducts.filter(
        product =>
          product.name?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.variants.some(v =>
            v.sku?.toLowerCase().includes(query) ||
            v.color?.toLowerCase().includes(query) ||
            v.size?.toLowerCase().includes(query)
          )
      );
    }

    this.filteredProducts = this.sortProducts(tempProducts);
    this.paginatorFirst = 0;
    this.updateDisplayProducts();
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
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      categories: this.apiService.getCategories(),
      products: this.apiService.getProducts()
    }).subscribe({
      next: ({ categories, products }) => {
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...categories];
        this.products = this.processProducts(products);
        this.filteredProducts = [...this.products];
        this.updateDisplayProducts();
        this.updateCategoryProductCounts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.showError('Không thể tải dữ liệu sản phẩm');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  processProducts(products: Product[]): Product[] {
    return products.map(product => {
      if (product.id && product.variants.length > 0) {
        this.selectedVariants[product.id] = product.variants[0];
      }
      product.variants.forEach(v => {
        if (v.id) {
          this.variantDisplayTexts[v.id] = this.getVariantDisplayText(v);
        }
      });
      return product;
    });
  }

  createDefaultVariant(): ProductVariant {
    return {
      id: 0,
      productId: 0,
      stock: 0,
      price: 0,
      sku: 'N/A'
    };
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

  addToCart(product: Product): void {
    if (!this.hasStock(product)) {
      this.showError('Sản phẩm đã hết hàng');
      return;
    }

    this.showSuccess(`Đã thêm ${product.name} vào giỏ hàng`);
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

  onVariantChange(product: Product, variant: ProductVariant) {
    if (product.id !== undefined) {
      this.selectedVariants[product.id] = variant;
    }
  }
}

