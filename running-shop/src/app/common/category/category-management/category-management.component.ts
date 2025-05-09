import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MessageService} from "primeng/api";
import {Category} from "../../../shared/models/category.model";
import {CategoryService} from "../../service/category.service";
import {Toast} from "primeng/toast";
import {FormsModule} from "@angular/forms";
import {Button} from "primeng/button";
import {TableModule} from "primeng/table";
import {AddCategoryComponent} from "../add-category/add-category.component";
import {InputText} from "primeng/inputtext";

@Component({
  selector: 'app-category-management',
  imports: [
    Toast,
    FormsModule,
    Button,
    TableModule,
    AddCategoryComponent,
    InputText
  ],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})
export class CategoryManagementComponent implements OnInit{
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
