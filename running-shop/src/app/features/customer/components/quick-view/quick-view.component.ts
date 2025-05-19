import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'src/app/core/services/api.service';
import { CategoryService } from 'src/app/common/service/category.service';
import { Product, ProductImage, ProductVariant } from 'src/app/shared/models/product.model';
import { Category } from 'src/app/shared/models/category.model';
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {RouterLink} from "@angular/router";
import {CurrencyPipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ButtonDirective} from "primeng/button";
import {Ripple} from "primeng/ripple";
import {TooltipModule} from "primeng/tooltip";

@Component({
  selector: 'app-quick-view',
  templateUrl: './quick-view.component.html',
  imports: [
    DialogModule,
    DropdownModule,
    RouterLink,
    NgIf,
    FormsModule,
    NgClass,
    ButtonDirective,
    Ripple,
    TooltipModule,
    CurrencyPipe,
    NgForOf
  ],
  standalone: true,
  styleUrls: ['./quick-view.component.scss']
})
export class QuickViewComponent implements OnInit, OnChanges {
  @Input() productId: number | null = null;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  product: Product | undefined;
  selectedVariant: ProductVariant | undefined;
  galleryImages: ProductImage[] = [];
  activeIndex: number = 0;
  category: Category | undefined;

  constructor(
    private apiService: ApiService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    if (this.productId != null) {
      this.loadProduct(this.productId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId != null) {
      this.loadProduct(this.productId);
    }
    if (changes['visible'] && !this.visible) {
      this.product = undefined;
      this.selectedVariant = undefined;
      this.galleryImages = [];
      this.activeIndex = 0;
      this.category = undefined;
    }
  }

  loadProduct(id: number) {
    this.apiService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.selectedVariant = product.variants[0];
        this.galleryImages = product.images || [];
        if (product.categoryId) {
          this.categoryService.getById(product.categoryId).subscribe({
            next: (category) => { this.category = category; }
          });
        }
      }
    });
  }

  onVariantChange(variant: ProductVariant) {
    this.selectedVariant = variant;
  }
}
