import { Component, OnInit } from '@angular/core';
import {Product} from "../../../../shared/models/product.model";
import {Category} from "../../../../shared/models/category.model";
import {ApiService} from "../../../../core/services/api.service";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit {

  product: Product = {
    name: '',
    description: '',
    categoryId: 0,
    brand: '',
    isActive: true,
    variants: [{ stock: 0, price: 0, sku: '' }],
    images: [{ imageUrl: '', isPrimary: true }]
  };
  categories: Category[] = [];
  isActiveOptions = [
    { label: 'Kích hoạt', value: true },
    { label: 'Không kích hoạt', value: false }
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe(
      (data) => {
        this.categories = data;
        if (data.length > 0) {
          this.product.categoryId = data[0].id!;
        }
      },
      (error) => {
        console.error('Error fetching categories', error);
      }
    );
  }

  addVariant(): void {
    this.product.variants.push({ stock: 0, price: 0, sku: '' });
  }

  removeVariant(index: number): void {
    if (this.product.variants.length > 1) {
      this.product.variants.splice(index, 1);
    }
  }

  addImage(): void {
    this.product.images.push({ imageUrl: '', isPrimary: false });
  }

  removeImage(index: number): void {
    if (this.product.images.length > 1) {
      this.product.images.splice(index, 1);
    }
  }

  createProduct(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      this.product.addedById = user.id;
    }
    this.apiService.createProduct(this.product).subscribe(
      (response) => {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm sản phẩm thành công!' });
        this.product = {
          name: '',
          description: '',
          categoryId: this.categories[0]?.id || 0,
          brand: '',
          isActive: true,
          variants: [{ stock: 0, price: 0, sku: '' }],
          images: [{ imageUrl: '', isPrimary: true }]
        };
      },
      (error) => {
        console.error('Error creating product', error);
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Thêm sản phẩm thất bại.' });
      }
    );
  }

}
