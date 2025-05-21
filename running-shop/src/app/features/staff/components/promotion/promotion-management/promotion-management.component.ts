import {Component, OnInit} from '@angular/core';
import {ConfirmationService, MessageService} from "primeng/api";
import {Page, Promotion} from "../../../../../shared/models/promotion.model";
import {PromotionService} from "../../../services/promotion.service";
import {AuthService} from "../../../../../core/services/auth.service";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {TableModule} from "primeng/table";
import {DatePipe, DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";
import {PaginatorModule} from "primeng/paginator";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {InputTextModule} from "primeng/inputtext";
import {Ripple} from "primeng/ripple";
import {CheckboxModule} from "primeng/checkbox";
import {FormPromotionComponent} from "../form-promotion/form-promotion.component";
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {TagModule} from "primeng/tag";

@Component({
  selector: 'app-promotion-management',
  standalone: true,
  imports: [
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    DatePipe,
    TooltipModule,
    PaginatorModule,
    ProgressSpinnerModule,
    InputTextModule,
    CheckboxModule,
    DialogModule,
    DecimalPipe,
    FormPromotionComponent,
    ButtonModule,
    NgIf,
    NgForOf,
    TagModule
  ],
  templateUrl: './promotion-management.component.html',
  styleUrl: './promotion-management.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class PromotionManagementComponent implements OnInit {
  promotions: Promotion[] = [];
  totalRecords = 0;
  page = 0;
  rows = 10;
  searchParams: {
    code?: string;
    isActive?: boolean;
    dateFrom?: string;
    dateTo?: string;
  } = {
    code: '',
    isActive: undefined,
    dateFrom: undefined,
    dateTo: undefined
  };
  staffId: number | null = null;
  selectedPromotion: Promotion | null = null;
  displayDialog: boolean = false;
  dialogMode: 'create' | 'edit' | 'view' = 'create';

  constructor(
    private promotionService: PromotionService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && this.authService.isAdminOrStaff()) {
        this.staffId = user.id;
        this.loadPromotions();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Bạn không có quyền truy cập' });
      }
    });
  }

  loadPromotions(): void {
    this.promotionService.searchPromotions({
      ...this.searchParams,
      page: this.page,
      size: this.rows
    }).subscribe({
      next: (page: Page<Promotion>) => {
        this.promotions = page.content;
        this.totalRecords = page.totalElements;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách' })
    });
  }

  onPageChange(event: any): void {
    this.page = event.page;
    this.rows = event.rows;
    this.loadPromotions();
  }

  onSearch(): void {
    this.page = 0;
    this.loadPromotions();
    console.log('Search params before sending:', this.searchParams);
  }

  deletePromotion(id: number): void {
    this.confirmationService.confirm({
      message: 'Bạn có chắc muốn xóa mã giảm giá này?',
      accept: () => {
        if (this.staffId) {
          this.promotionService.deletePromotion(this.staffId, id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa thành công' });
              this.loadPromotions();
            },
            error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa' })
          });
        }
      }
    });
  }

  openDialog(mode: 'create' | 'edit' | 'view', promotion?: Promotion): void {
    this.dialogMode = mode;
    this.selectedPromotion = promotion ? { ...promotion } : null;
    this.displayDialog = true;
  }

  onFormSaved(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: `Mã giảm giá ${this.dialogMode === 'edit' ? 'cập nhật' : 'tạo'} thành công`
    });
    this.loadPromotions();
  }
}
