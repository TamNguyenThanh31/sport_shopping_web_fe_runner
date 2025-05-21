import {Component, OnInit} from '@angular/core';
import {Address} from "../../../../../shared/models/address.model";
import {AddressService} from "../../../services/address.service";
import {AuthService} from "../../../../../core/services/auth.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {MessagesModule} from "primeng/messages";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TableModule} from "primeng/table";
import {AddressFormComponent} from "../address-form/address-form.component";

@Component({
  selector: 'app-address-management',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    MessagesModule,
    ConfirmDialogModule,
    TableModule,
    AddressFormComponent
  ],
  templateUrl: './address-management.component.html',
  styleUrl: './address-management.component.scss'
})
export class AddressManagementComponent implements OnInit {
  addresses: Address[] = [];
  displayDialog: boolean = false;
  selectedAddress: Address | null = null;
  mode: 'create' | 'edit' | 'view' = 'create';

  constructor(
    private addressService: AddressService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user && user.id) {
        this.loadAddresses();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not authenticated' });
      }
    });
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses;
        console.log('Loaded addresses:', addresses);
      },
      error: (error) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
    });
  }

  showDialog(mode: 'create' | 'edit' | 'view', address?: Address): void {
    this.mode = mode;
    this.selectedAddress = address ? { ...address } : null;
    this.displayDialog = true;
  }

  onSave(address: Address): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not authenticated' });
      return;
    }
    if (this.mode === 'edit' && address.id) {
      this.addressService.updateAddress(address.id, address).subscribe({
        next: (updatedAddress) => {
          this.addresses = this.addresses.map(a => a.id === updatedAddress.id ? updatedAddress : a);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address updated' });
          this.closeDialog();
        },
        error: (error) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
      });
    } else {
      this.addressService.createAddress(address).subscribe({
        next: (newAddress) => {
          this.addresses.push(newAddress);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address created' });
          this.closeDialog();
        },
        error: (error) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
      });
    }
  }

  deleteAddress(id: number): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not authenticated' });
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this address?',
      accept: () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.addresses = this.addresses.filter(a => a.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Address deleted' });
          },
          error: (error) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
        });
      }
    });
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.selectedAddress = null;
    this.mode = 'create';
  }
}
