import { Component, OnInit } from '@angular/core';
import {UserDTO} from "../../../../shared/models/userDTO.model";
import {AdminService} from "../../admin.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-customer-staff-management',
  templateUrl: './customer-staff-management.component.html',
  styleUrls: ['./customer-staff-management.component.scss']
})
export class CustomerStaffManagementComponent implements OnInit {

  users: UserDTO[] = [];
  type: string = '';
  displayDialog: boolean = false;
  displayDetail: boolean = false;
  selectedUser: UserDTO = {
    id: 0,
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'CUSTOMER', // mặc định, hoặc bạn có thể thay bằng ADMIN / STAFF
    createdAt: '',
    updatedAt: ''
  };
  userDetail: UserDTO | null = null;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.type = this.route.snapshot.data['type'];
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.showDetail(+id);
    } else {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    const serviceCall =
      this.type === 'customer' ? this.adminService.getCustomers() : this.adminService.getStaff();
    serviceCall.subscribe((users) => (this.users = users));
  }

  showDialog(user?: UserDTO): void {
    this.selectedUser = user
      ? { ...user }
      : { id: 0,
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: this.type.toUpperCase() as 'ADMIN' | 'CUSTOMER' | 'STAFF',
        createdAt: '',
        updatedAt: '' };
    this.displayDialog = true;
  }

  saveUser(): void {
    if (!this.selectedUser) return;

    if (this.selectedUser.id) {
      const updateCall =
        this.type === 'customer'
          ? this.adminService.updateCustomer(this.selectedUser.id, this.selectedUser)
          : this.adminService.updateStaff(this.selectedUser.id, this.selectedUser);
      updateCall.subscribe(() => {
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated' });
      });
    } else {
      const createCall =
        this.type === 'customer'
          ? this.adminService.createCustomer(this.selectedUser)
          : this.adminService.createStaff(this.selectedUser);
      createCall.subscribe(() => {
        this.loadUsers();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created' });
      });
    }
    this.displayDialog = false;
  }

  deleteUser(id: number): void {
    const deleteCall =
      this.type === 'customer' ? this.adminService.deleteCustomer(id) : this.adminService.deleteStaff(id);
    deleteCall.subscribe(() => {
      this.loadUsers();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted' });
    });
  }

  showDetail(id: number): void {
    const detailCall =
      this.type === 'customer' ? this.adminService.getCustomerById(id) : this.adminService.getStaffById(id);
    detailCall.subscribe((user) => {
      this.userDetail = user;
      this.displayDetail = true;
    });
  }

  closeDetail(): void {
    this.displayDetail = false;
    this.userDetail = null;
    this.router.navigate([`/admin/${this.type}s`]);
  }

}
