import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserDTO } from '../../../../shared/models/userDTO.model';
import { AdminService } from '../../admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

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
      phoneNumber: ['', Validators.required],
      password: ['', [Validators.minLength(6)]],
      role: [''],
      createdAt: [''],
      updatedAt: ['']
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

  loadUsers(): void {
    this.loading = true;
    const serviceCall = this.type === 'customer'
      ? this.adminService.getCustomers()
      : this.adminService.getStaff();

    serviceCall.subscribe({
      next: (users) => {
        this.users = users;
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

  showDialog(user?: UserDTO): void {
    this.selectedUserId = user?.id || null;
    this.userForm.reset({
      role: this.type.toUpperCase()
    });

    if (user) {
      this.userForm.patchValue({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
      this.userForm.get('password')?.clearValidators();
    } else {
      this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
    this.displayDialog = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData: UserDTO = {
      ...this.userForm.value,
      id: this.selectedUserId || 0
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
