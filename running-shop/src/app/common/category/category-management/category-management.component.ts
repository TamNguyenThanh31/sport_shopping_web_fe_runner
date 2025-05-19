import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Category } from '../../../shared/models/category.model';
import { CategoryService } from '../../service/category.service';
import { ToastModule } from 'primeng/toast'; // Import module Toast
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ButtonModule } from 'primeng/button'; // Import module Button
import { TableModule } from 'primeng/table'; // Import module Table
import { AddCategoryComponent } from '../add-category/add-category.component'; // Import AddCategoryComponent
import { InputTextModule } from 'primeng/inputtext';
import {NgForOf, NgIf} from "@angular/common"; // Import module InputText

@Component({
  selector: 'app-category-management',
  standalone: true, // Khai báo rõ ràng là standalone component
  imports: [
    ToastModule,
    FormsModule,
    ButtonModule,
    TableModule,
    AddCategoryComponent,
    InputTextModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.scss'],
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None // Giữ nguyên nếu bạn muốn áp dụng CSS toàn cục
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category = { name: '' };
  dialogVisible: boolean = false;
  dialogMode: 'add' | 'edit' | 'detail' = 'add';
  searchKeyword: string = '';

  constructor(
    private categoryService: CategoryService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (data) => (this.categories = data),
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh mục' })
    });
  }

  searchCategories() {
    if (this.searchKeyword.trim()) {
      this.categoryService.search(this.searchKeyword).subscribe({
        next: (data) => (this.categories = data),
        error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tìm kiếm danh mục' })
      });
    } else {
      this.loadCategories();
    }
  }

  showDialog(mode: 'add' | 'edit' | 'detail', category?: Category) {
    this.dialogMode = mode;
    this.selectedCategory = category ? { ...category } : { name: '' };
    this.dialogVisible = true;
  }

  handleSave() {
    this.loadCategories();
    this.dialogVisible = false;
  }

  deleteCategory(id?: number) {
    if (!id) {
      this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'ID danh mục không hợp lệ' });
      return;
    }
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.loadCategories();
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Danh mục đã xóa' });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa danh mục' })
    });
  }
}
