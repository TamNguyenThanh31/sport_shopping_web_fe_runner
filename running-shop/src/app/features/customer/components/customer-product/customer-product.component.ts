import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Product } from '../../../../shared/models/product.model';
import { Category } from '../../../../shared/models/category.model';
import { ApiService } from '../../../../core/services/api.service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-customer-product',
  templateUrl: './customer-product.component.html',
  styleUrls: ['./customer-product.component.scss'],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  categoryProductCounts: { [key: number]: string } = {};
  paginatorRows: number = 6;
  paginatorFirst: number = 0;

  sortOptions = [
    { label: 'Mặc định', value: 'default' },
    { label: 'Giá tăng dần', value: 'priceAsc' },
    { label: 'Giá giảm dần', value: 'priceDesc' }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Bắt đầu ngOnInit');
    forkJoin({
      categories: this.apiService.getCategories(),
      products: this.apiService.getProducts()
    }).subscribe({
      next: ({ categories, products }) => {
        console.log('Danh mục:', categories);
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...categories];
        console.log('Sản phẩm:', products);
        this.products = products.map((product: Product) => ({
          ...product,
          images: product.images ?? [],
          variants: product.variants ?? [],
          isActive: product.isActive ?? true,
          brand: product.brand ?? 'N/A'
        }));
        this.filteredProducts = [...this.products];
        this.updateDisplayProducts();
        this.updateCategoryProductCounts();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải dữ liệu sản phẩm.',
          key: 'mainToast'
        });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  updateCategoryProductCounts(): void {
    this.categoryProductCounts = {};
    this.categories.forEach((category) => {
      if (category.id === 0) {
        this.categoryProductCounts[0] = this.products.length.toString();
      } else {
        const count = this.products.filter((p) => p?.categoryId === category.id).length;
        this.categoryProductCounts[category.id!] = count.toString();
      }
    });
    this.cdr.markForCheck();
  }

  filterByCategory(): void {
    console.log('Lọc danh mục:', this.selectedCategory);
    if (!this.selectedCategory || !Number.isFinite(this.selectedCategory.id)) {
      this.filteredProducts = [...this.products];
    } else if (this.selectedCategory.id === 0) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        (product) => product?.categoryId === this.selectedCategory.id
      );
    }
    this.paginatorFirst = 0;
    this.filterBySearch();
  }

  filterBySearch(): void {
    console.log('Tìm kiếm:', this.searchQuery);
    let tempProducts = [...this.filteredProducts];
    if (this.searchQuery.trim()) {
      tempProducts = tempProducts.filter(
        (product) =>
          product?.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          product?.brand?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.filteredProducts = this.sortProducts(tempProducts);
    this.paginatorFirst = 0;
    this.updateDisplayProducts();
  }

  sortProducts(products: Product[]): Product[] {
    console.log('Sắp xếp:', this.sortOption);
    if (this.sortOption === 'priceAsc') {
      return products.sort((a, b) => {
        const priceA = a.variants && a.variants.length > 0 ? a.variants[0].price : 0;
        const priceB = b.variants && b.variants.length > 0 ? b.variants[0].price : 0;
        return priceA - priceB;
      });
    } else if (this.sortOption === 'priceDesc') {
      return products.sort((a, b) => {
        const priceA = a.variants && a.variants.length > 0 ? a.variants[0].price : 0;
        const priceB = b.variants && b.variants.length > 0 ? b.variants[0].price : 0;
        return priceB - priceA;
      });
    }
    return products;
  }

  updateDisplayProducts(): void {
    const start = this.paginatorFirst;
    const end = start + this.paginatorRows;
    this.displayProducts = this.filteredProducts.slice(start, end);
    console.log('Sản phẩm hiển thị:', this.displayProducts);
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

  addToCart(product: Product): void {
    console.log('Thêm vào giỏ:', product);
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Đã thêm ${product.name || 'sản phẩm'} vào giỏ hàng!`,
      key: 'mainToast'
    });
  }

  getProductPrice(product: Product): string {
    return product.variants && product.variants.length > 0
      ? `${product.variants[0].price} USD`
      : 'N/A USD';
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0
      ? product.images[0].imageUrl
      : 'assets/images/placeholder.jpg';
  }

  getProductStock(product: Product): string {
    return product.variants && product.variants.length > 0
      ? product.variants[0].stock?.toString() || 'N/A'
      : 'N/A';
  }
}
