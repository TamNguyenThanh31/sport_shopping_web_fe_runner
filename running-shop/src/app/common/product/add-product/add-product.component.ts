import {Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MessageService, ConfirmationService} from 'primeng/api';
import {Product, ProductImage, ProductVariant} from '../../../shared/models/product.model';
import {Category} from '../../../shared/models/category.model';
import {ApiService} from '../../../core/services/api.service';
import {AuthService} from '../../../core/services/auth.service';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {CheckboxModule} from 'primeng/checkbox';
import {FileUploadModule} from 'primeng/fileupload';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {Observable, of, switchMap} from 'rxjs';
import {tap} from 'rxjs/operators';
import {InputNumber, InputNumberModule} from "primeng/inputnumber";
import {Tooltip, TooltipModule} from "primeng/tooltip";
import {InputTextarea, InputTextareaModule} from 'primeng/inputtextarea';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule,
    CheckboxModule,
    FileUploadModule,
    ConfirmDialogModule,
    InputNumberModule,
    TooltipModule,
    InputTextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  encapsulation: ViewEncapsulation.None
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  uploadedImages: File[] = []; // Chỉ chứa ảnh mới
  existingImages: ProductImage[] = []; // Lưu ảnh hiện có từ backend
  isPrimaryFlags: boolean[] = [];
  isLoading = false;
  mode: 'add' | 'edit' | 'view' = 'add';
  productId?: number;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categoryId: [null, Validators.required],
      brand: ['', Validators.required],
      active: [true],
      variants: this.fb.array([]),
      images: this.fb.array([])
    });
  }

  ngOnInit(): void {
    console.log('AddProductComponent initialized, mode:', this.mode, 'productId:', this.productId);
    if (!this.authService.isAdminOrStaff()) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Bạn không có quyền truy cập'});
      this.router.navigate(['/admin/product-management']);
      return;
    }

    this.route.params.pipe(
      switchMap(params => {
        this.productId = params['id'] ? +params['id'] : undefined;
        this.mode = this.route.snapshot.queryParams['mode'] || 'add';
        console.log('Route params:', params, 'mode:', this.mode);
        return this.loadCategories();
      }),
      switchMap(() => {
        if (this.productId && (this.mode === 'edit' || this.mode === 'view')) {
          return this.apiService.getProductById(this.productId);
        }
        return of(null);
      })
    ).subscribe({
      next: (product) => {
        console.log('Dữ liệu sản phẩm từ API:', product);
        if (product) {
          this.loadProductData(product);
        }
        this.productForm.enable();
        if (this.mode === 'view') {
          this.productForm.disable();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu sản phẩm'});
        this.cdr.detectChanges();
      }
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  get images(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  loadCategories(): Observable<Category[]> {
    return this.apiService.getCategories().pipe(
      tap(categories => {
        console.log('Danh mục:', categories);
        this.categories = categories;
        this.cdr.detectChanges();
      })
    );
  }

  loadProductData(product: any): void {
    this.variants.clear();
    this.images.clear();
    this.isPrimaryFlags = [];
    this.uploadedImages = [];
    this.existingImages = [];

    const formData = {
      name: product.name || '',
      description: product.description || '',
      categoryId: product.categoryId || null,
      brand: product.brand || '',
      active: product.active ?? true
    };
    console.log('Dữ liệu đổ vào form:', formData);
    this.productForm.patchValue(formData);

    (product.variants || []).forEach((variant: any) => {
      const variantForm = this.createVariantFormGroup({
        id: variant.id,
        productId: variant.productId,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        price: variant.price,
        sku: variant.sku
      });
      console.log('Biến thể:', variantForm.value);
      this.variants.push(variantForm);
    });

    (product.images || []).forEach((image: any, index: number) => {
      const imageForm = this.createImageFormGroup({
        id: image.id,
        productId: image.productId,
        fileName: image.fileName,
        imageUrl: image.imageUrl,
        primary: image.primary ?? false
      });
      console.log('Hình ảnh:', imageForm.value);
      this.images.push(imageForm);
      this.existingImages.push({
        id: image.id,
        productId: image.productId,
        fileName: image.fileName,
        imageUrl: image.imageUrl,
        primary: image.primary ?? false
      });
      this.isPrimaryFlags.push(image.primary ?? false);
      if (index === 0 && !this.isPrimaryFlags.includes(true)) {
        this.isPrimaryFlags[0] = true;
        imageForm.patchValue({isPrimary: true});
      }
    });

    console.log('Form value sau load:', this.productForm.value);
    console.log('existingImages sau load:', this.existingImages);
    console.log('isPrimaryFlags sau load:', this.isPrimaryFlags);
    this.cdr.detectChanges();
  }

  createVariantFormGroup(variant?: ProductVariant): FormGroup {
    return this.fb.group({
      id: [variant?.id || null],
      productId: [variant?.productId || null],
      size: [variant?.size || '', Validators.required],
      color: [variant?.color || '', Validators.required],
      stock: [variant?.stock || 0, [Validators.required, Validators.min(0)]],
      price: [variant?.price || 0, [Validators.required, Validators.min(0)]],
      sku: [variant?.sku || '', Validators.required]
    });
  }

  createImageFormGroup(image?: Partial<ProductImage>): FormGroup {
    return this.fb.group({
      id: [image?.id || null],
      productId: [image?.productId || null],
      fileName: [image?.fileName || ''],
      imageUrl: [image?.imageUrl ? `http://localhost:8080${image.imageUrl}` : ''],
      isPrimary: [image?.primary ?? false]
    });
  }

  addVariant(): void {
    this.variants.push(this.createVariantFormGroup());
    this.cdr.detectChanges();
  }

  removeVariant(index: number): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa biến thể này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        this.variants.removeAt(index);
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xóa biến thể thành công'});
        this.cdr.detectChanges();
      },
      reject: () => {
        this.messageService.add({severity: 'info', summary: 'Hủy', detail: 'Hủy xóa biến thể'});
      }
    });
  }

  getImagePreviewUrl(file: File | null, imageUrl: string): string {
    if (file) {
      return URL.createObjectURL(file);
    }
    return imageUrl || 'assets/images/placeholder-product.png';
  }

  onFileSelect(event: any): void {
    const files: File[] = event.files || [];
    if (files.length) {
      const newFiles = Array.from(files).filter(file => !this.uploadedImages.some(existingFile => existingFile.name === file.name));
      if (newFiles.length === 0) {
        console.log('File đã tồn tại, không thêm:', files);
        return;
      }

      this.uploadedImages.push(...newFiles);
      newFiles.forEach((file: File, index: number) => {
        const isPrimary = this.isPrimaryFlags.length === 0 && index === 0;
        const imageData: Partial<ProductImage> = {
          fileName: file.name,
          primary: isPrimary
        };
        this.images.push(this.createImageFormGroup(imageData));
        this.isPrimaryFlags.push(isPrimary);
      });
      console.log('Sau khi chọn file - uploadedImages:', this.uploadedImages.length, 'existingImages:', this.existingImages.length, 'isPrimaryFlags:', this.isPrimaryFlags);
      this.cdr.detectChanges();
    }
  }

  onFileRemove(event: any): void {
    const file: File = event.file;
    const index = this.uploadedImages.findIndex(f => f.name === file.name);
    if (index !== -1) {
      this.uploadedImages.splice(index, 1);
      this.images.removeAt(index + this.existingImages.length); // Điều chỉnh chỉ số vì ảnh hiện có ở trước
      this.isPrimaryFlags.splice(index + this.existingImages.length, 1);
      if (this.isPrimaryFlags.length > 0 && !this.isPrimaryFlags.includes(true)) {
        this.isPrimaryFlags[0] = true;
        this.images.at(0).patchValue({isPrimary: true});
      }
      console.log('Sau khi xóa file qua UI - uploadedImages:', this.uploadedImages.length, 'existingImages:', this.existingImages.length, 'isPrimaryFlags:', this.isPrimaryFlags);
      this.cdr.detectChanges();
    }
  }

  removeImage(index: number): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa ảnh này không?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        if (index < this.existingImages.length) {
          // Xóa ảnh hiện có
          this.existingImages.splice(index, 1);
        } else {
          // Xóa ảnh mới
          const newImageIndex = index - this.existingImages.length;
          this.uploadedImages.splice(newImageIndex, 1);
        }
        this.images.removeAt(index);
        this.isPrimaryFlags.splice(index, 1);
        if (this.isPrimaryFlags.length > 0 && !this.isPrimaryFlags.includes(true)) {
          this.isPrimaryFlags[0] = true;
          this.images.at(0).patchValue({isPrimary: true});
        }
        this.messageService.add({severity: 'success', summary: 'Thành công', detail: 'Xóa ảnh thành công'});
        console.log('Sau khi xóa qua nút Xóa - uploadedImages:', this.uploadedImages.length, 'existingImages:', this.existingImages.length, 'isPrimaryFlags:', this.isPrimaryFlags);
        this.cdr.detectChanges();
      },
      reject: () => {
        this.messageService.add({severity: 'info', summary: 'Hủy', detail: 'Hủy xóa ảnh'});
      }
    });
  }

  setPrimaryImage(index: number): void {
    this.isPrimaryFlags = this.isPrimaryFlags.map((_, i) => i === index);
    this.images.controls.forEach((control, i) => {
      control.patchValue({isPrimary: i === index});
    });
    console.log('isPrimaryFlags sau khi set:', this.isPrimaryFlags);
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.productForm.invalid || !this.variants.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng điền đầy đủ thông tin và thêm ít nhất một biến thể'
      });
      this.productForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    if (this.mode === 'add' && !this.uploadedImages.length && !this.existingImages.length) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Vui lòng chọn ít nhất một ảnh sản phẩm'});
      this.cdr.detectChanges();
      return;
    }

    if (!this.authService.isAdminOrStaff()) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Bạn không có quyền thực hiện'});
      return;
    }

    // Không kiểm tra uploadedImages.length với isPrimaryFlags.length trong mode edit
    if (this.mode === 'edit' && this.uploadedImages.length + this.existingImages.length !== this.isPrimaryFlags.length) {
      this.messageService.add({severity: 'error', summary: 'Lỗi', detail: 'Số lượng ảnh và primary flags không khớp'});
      console.error('Lỗi: uploadedImages:', this.uploadedImages.length, 'existingImages:', this.existingImages.length, 'isPrimaryFlags:', this.isPrimaryFlags.length);
      return;
    }

    const product: Product = {
      ...this.productForm.value,
      id: this.productId,
      addedById: this.authService.getUserId() || undefined,
      variants: this.variants.getRawValue(),
      images: this.images.getRawValue()
    };

    console.log('Dữ liệu gửi lên:', product, 'uploadedImages:', this.uploadedImages.length, 'existingImages:', this.existingImages.length, 'isPrimaryFlags:', this.isPrimaryFlags);
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.mode === 'add') {
      this.apiService.createProduct(product, this.uploadedImages, this.isPrimaryFlags).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Thêm sản phẩm thành công',
            life: 5000,
            styleClass: 'custom-success-toast'
          });
          this.router.navigate(['/admin/product-management']);
        },
        error: (err) => {
          console.error('Lỗi thêm sản phẩm:', err);
          const message = err.status === 403 ? 'Bạn không có quyền thêm sản phẩm' : err.error?.message || 'Thêm sản phẩm thất bại';
          this.messageService.add({severity: 'error', summary: 'Lỗi', detail: message});
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else if (this.mode === 'edit') {
      this.apiService.updateProduct(product, this.uploadedImages, this.isPrimaryFlags).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Cập nhật sản phẩm thành công',
            life: 5000,
            styleClass: 'custom-success-toast'
          });
          this.router.navigate(['/admin/product-management']);
        },
        error: (err) => {
          console.error('Lỗi cập nhật sản phẩm:', err);
          const message = err.status === 403 ? 'Bạn không có quyền cập nhật' : err.error?.message || 'Cập nhật sản phẩm thất bại';
          this.messageService.add({severity: 'error', summary: 'Lỗi', detail: message});
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/product-management']);
  }
}
