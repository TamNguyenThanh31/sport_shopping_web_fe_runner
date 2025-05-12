import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {Category} from "../../../shared/models/category.model";
import {CategoryService} from "../../service/category.service";
import {MessageService, PrimeTemplate} from "primeng/api";
import {Toast} from "primeng/toast";
import {Dialog} from "primeng/dialog";
import {InputText} from "primeng/inputtext";
import {FormsModule} from "@angular/forms";
import {InputTextarea} from "primeng/inputtextarea";
import {Button} from "primeng/button";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-add-category',
  imports: [
    Toast,
    Dialog,
    InputText,
    FormsModule,
    InputTextarea,
    Button,
    NgIf,
    PrimeTemplate
  ],
  templateUrl: './add-category.component.html',
  styleUrl: './add-category.component.scss',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class AddCategoryComponent {
  @Input() visible: boolean = false;
  @Input() mode: 'add' | 'edit' | 'detail' = 'add';
  @Input() category: Category = { name: '' };
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Category>();

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService
  ) {}

  saveCategory() {
    if (!this.category.name.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tên là bắt buộc' });
      return;
    }

    const action = this.mode === 'edit' && this.category.id
      ? this.categoryService.update(this.category.id, this.category)
      : this.categoryService.create(this.category);

    action.subscribe({
      next: (data) => {
        this.save.emit(data);
        this.close();
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Danh mục ${this.mode === 'add' ? 'đã tạo' : 'đã cập nhật'}` });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể ${this.mode === 'add' ? 'tạo' : 'cập nhật'} danh mục` })
    });
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  get dialogHeader() {
    return this.mode === 'add' ? 'Thêm Danh Mục' : this.mode === 'edit' ? 'Sửa Danh Mục' : 'Chi Tiết Danh Mục';
  }
}
