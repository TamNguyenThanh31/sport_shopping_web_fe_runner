import { Component, OnInit } from '@angular/core';
import {Product} from "../../../../shared/models/product.model";
import {Category} from "../../../../shared/models/category.model";
import {ApiService} from "../../../../core/services/api.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-customer-product',
  templateUrl: './customer-product.component.html',
  styleUrls: ['./customer-product.component.scss']
})
export class CustomerProductComponent implements OnInit {

  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  layout: string = 'grid'; // PrimeNG 14.x không hỗ trợ kiểu 'list' | 'grid', dùng string

  // Thêm mảng để lưu số lượng sản phẩm theo danh mục
  categoryProductCounts: { [key: number]: string } = {};

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe(
      (data) => {
        this.categories = [{ id: 0, name: 'Tất cả danh mục' }, ...data];
        this.selectedCategory = this.categories[0];
        this.updateCategoryProductCounts();
        this.filterByCategory();
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );

    this.apiService.getProducts().subscribe(
      (data) => {
        this.products = data;
        this.filteredProducts = data;
        this.updateCategoryProductCounts();
      },
      (error) => {
        console.error('Error fetching products', error);
      }
    );
  }

  // Tính số lượng sản phẩm cho mỗi danh mục
  updateCategoryProductCounts(): void {
    this.categoryProductCounts = {};
    this.categories.forEach(category => {
      if (category.id === 0) {
        this.categoryProductCounts[0] = this.products.length.toString();
      } else {
        const count = this.products.filter(p => p.categoryId === category.id).length;
        this.categoryProductCounts[category.id!] = count.toString();
      }
    });
  }

  filterByCategory(): void {
    if (this.selectedCategory?.id === 0) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product => product.categoryId === this.selectedCategory?.id);
    }
  }

  addToCart(product: Product): void {
    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã thêm ${product.name} vào giỏ hàng!` });
  }
}
