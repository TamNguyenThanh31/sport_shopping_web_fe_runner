import { Component, OnInit } from '@angular/core';
import {UserDTO} from "../../../../shared/models/userDTO.model";
import {CustomerService} from "../../customer.service";
import {AuthService} from "../../../../core/services/auth.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.scss']
})
export class CustomerEditComponent implements OnInit {

  user: UserDTO = { id: 0, username: '', email: '', phoneNumber: '', role: 'CUSTOMER', createdAt: '', updatedAt: '' };

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.user = { ...user };
      }
    });
  }

  save(): void {
    this.customerService.updateProfile(this.user).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Profile updated' });
    });
  }

}
