import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {MessageService} from "primeng/api";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {PromotionService} from "../../../services/promotion.service";
import {AuthService} from "../../../../../core/services/auth.service";
import {ToastModule} from "primeng/toast";
import {NgIf} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {InputTextModule} from "primeng/inputtext";
import {InputNumberModule} from "primeng/inputnumber";
import {Promotion} from "../../../../../shared/models/promotion.model";
import {CheckboxModule} from "primeng/checkbox";

@Component({
  selector: 'app-form-promotion',
  standalone: true,
  imports: [
    ToastModule,
    ReactiveFormsModule,
    NgIf,
    CalendarModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule
  ],
  templateUrl: './form-promotion.component.html',
  styleUrl: './form-promotion.component.scss',
  providers: [MessageService]
})
export class FormPromotionComponent implements OnInit, OnChanges {
  @Input() mode: 'create' | 'edit' | 'view' = 'create';
  @Input() promotion: Promotion | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  form: FormGroup;
  staffId?: number;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private promotionService: PromotionService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      code: ['', Validators.required],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      minimumOrderValue: [0, Validators.min(0)],
      maxUsage: [null, Validators.min(0)],
      startDate: [null],
      endDate: [null],
      isActive: [true]
    }, { validators: this.dateValidator });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && this.authService.isAdminOrStaff()) {
        this.staffId = user.id;
      }
    });
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['promotion'] && !changes['promotion'].firstChange) {
      this.updateForm();
    }
  }

  updateForm(): void {
    if (this.promotion) {
      const patchValue = {
        code: this.promotion.code,
        discountPercentage: this.promotion.discountPercentage,
        minimumOrderValue: this.promotion.minimumOrderValue || 0,
        maxUsage: this.promotion.maxUsage || null,
        isActive: this.promotion.isActive || false,
        startDate: this.promotion.startDate ? new Date(this.promotion.startDate).toISOString().slice(0, 16) : null,
        endDate: this.promotion.endDate ? new Date(this.promotion.endDate).toISOString().slice(0, 16) : null
      };
      this.form.patchValue(patchValue);
    }
    if (this.mode === 'view') {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  dateValidator(form: FormGroup): any {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    return startDate && endDate && new Date(endDate) < new Date(startDate) ? { invalidDates: true } : null;
  }

  save(): void {
    if (this.form.invalid || !this.staffId || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.form.value;
    const promotion: Promotion = {
      ...formValue,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString() : null,
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null
    };

    const request = this.mode === 'edit' && this.promotion?.id
      ? this.promotionService.updatePromotion(this.staffId, this.promotion.id, promotion)
      : this.promotionService.createPromotion(this.staffId, promotion);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: `Mã giảm giá ${this.mode === 'edit' ? 'cập nhật' : 'tạo'} thành công`
        });
        this.saved.emit();
        this.close();
      },
      error: (error) => {
        console.error('Error saving promotion:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: `Không thể ${this.mode === 'edit' ? 'cập nhật' : 'tạo'} mã giảm giá`
        });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  close(): void {
    this.form.reset();
    this.isSubmitting = false;
    this.closed.emit();
  }
}
