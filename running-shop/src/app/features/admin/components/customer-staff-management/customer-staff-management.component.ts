import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDTO } from '../../../../shared/models/userDTO.model';
import { AdminService } from '../../service/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

// Interface for paginated response
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Component({
  selector: 'app-customer-staff-management',
  templateUrl: './customer-staff-management.component.html',
  styleUrls: ['./customer-staff-management.component.scss'],
  providers: [ConfirmationService],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class CustomerStaffManagementComponent implements OnInit {
  users: UserDTO[] = [];
  type: string = '';
  displayDialog: boolean = false;
  displayDetail: boolean = false;
  userForm: FormGroup;
  userDetail: UserDTO | null = null;
  selectedUserId: number | null = null;
  loading: boolean = true;
  first: number = 0; // For paginator
  rows: number = 10; // Rows per page
  totalRecords: number = 0; // Total number of records
  currentPage: number = 0; // Current page number

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.type = this.route.snapshot.data['type'];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.showDetail(+id);
    }
    this.loadUsers();
  }

  loadUsers(page: number = this.currentPage, size: number = this.rows): void {
    this.loading = true;
    const serviceCall = this.type === 'customer'
      ? this.adminService.getCustomers(page, size)
      : this.adminService.getStaff(page, size);

    serviceCall.subscribe({
      next: (pageData: Page<UserDTO>) => {
        this.users = pageData.content;
        this.totalRecords = pageData.totalElements;
        this.currentPage = pageData.number;
        this.rows = pageData.size;
        this.first = this.currentPage * this.rows;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users'
        });
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.currentPage = event.page;
    this.loadUsers(this.currentPage, this.rows);
  }

  showDialog(user?: UserDTO): void {
    this.selectedUserId = user?.id || null;
    this.userForm.reset({
      role: this.type.toUpperCase()
    });

    if (user) {
      this.userForm.patchValue({
        username: user.username,
        email: user.email
      });
      this.userForm.get('password')?.clearValidators();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
    this.displayDialog = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData = {
      username: this.userForm.value.username,
      email: this.userForm.value.email,
      password: this.userForm.value.password || undefined,
      role: this.type.toUpperCase() // CUSTOMER or STAFF
    };

    const saveOperation = this.selectedUserId
      ? (this.type === 'customer'
        ? this.adminService.updateCustomer(this.selectedUserId, userData)
        : this.adminService.updateStaff(this.selectedUserId, userData))
      : (this.type === 'customer'
        ? this.adminService.createCustomer(userData)
        : this.adminService.createStaff(userData));

    saveOperation.subscribe({
      next: () => {
        this.loadUsers();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `User ${this.selectedUserId ? 'updated' : 'created'} successfully`
        });
        this.displayDialog = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.selectedUserId ? 'update' : 'create'} user`
        });
      }
    });
  }

  deleteUser(id: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteCall = this.type === 'customer'
          ? this.adminService.deleteCustomer(id)
          : this.adminService.deleteStaff(id);

        deleteCall.subscribe({
          next: () => {
            this.loadUsers();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user'
            });
          }
        });
      }
    });
  }

  showDetail(id: number): void {
    const detailCall = this.type === 'customer'
      ? this.adminService.getCustomerById(id)
      : this.adminService.getStaffById(id);

    detailCall.subscribe({
      next: (user) => {
        this.userDetail = user;
        this.displayDetail = true;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details'
        });
        this.router.navigate([`/admin/${this.type}s`]);
      }
    });
  }

  closeDetail(): void {
    this.displayDetail = false;
    this.userDetail = null;
    this.router.navigate([`/admin/${this.type}s`]);
  }
}
