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
import { CategoryService } from 'src/app/common/service/category.service';
import { Category } from 'src/app/shared/models/category.model';
import {FooterComponent} from "../../../../shared/footer/footer.component";

@Component({
  selector: 'app-product-detail',
  imports: [
    GalleriaModule,
    DropdownModule,
    FormsModule,
    ButtonDirective,
    Ripple,
    RouterLink,
    FooterComponent
  ],
  templateUrl: './product-detail.component.html',
  standalone: true,
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | undefined;
  selectedVariant: ProductVariant | undefined;
  activeIndex: number = 0;
  galleryImages: ProductImage[] = [];
  category: Category | undefined;

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedVariant = product.variants[0];
        this.galleryImages = product.images || [];

        // Lấy thông tin danh mục
        if (product.categoryId) {
          this.categoryService.getById(product.categoryId).subscribe({
            next: (category) => {
              this.category = category;
            },
            error: (err) => {
              console.error('Lỗi khi lấy thông tin danh mục:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy sản phẩm:', err);
      }
    });
  }

  onVariantChange(variant: ProductVariant) {
    this.selectedVariant = variant;
  }
}
