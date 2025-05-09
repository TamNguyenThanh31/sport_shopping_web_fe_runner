import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { ApiService } from 'src/app/core/services/api.service';
import { Product, ProductImage } from 'src/app/shared/models/product.model';
import { ProductVariant } from 'src/app/shared/models/product.model';
import {GalleriaModule} from "primeng/galleria";
import {DropdownModule} from "primeng/dropdown";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";

@Component({
  selector: 'app-product-detail',
  imports: [
    GalleriaModule,
    DropdownModule,
    FormsModule,
    ButtonDirective,
    Ripple,
    RouterLink
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined; // Giữ kiểu dữ liệu này
  selectedVariant: ProductVariant | undefined;
  activeIndex: number = 0;
  galleryImages: ProductImage[] = [];

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedVariant = product.variants[0];
        this.galleryImages = product.images || [];
      },
      error: (err) => {
        console.error('Lỗi khi lấy sản phẩm:', err);
        // Xử lý lỗi nếu cần, ví dụ hiển thị thông báo
      }
    });
  }

  onVariantChange(variant: ProductVariant) {
    this.selectedVariant = variant;
  }
}
