import {Component, OnInit, ViewChild} from '@angular/core';
import {Address} from "../../../../../shared/models/address.model";
import {AddressService} from "../../../services/address.service";
import {AuthService} from "../../../../../core/services/auth.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {MessagesModule} from "primeng/messages";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TableModule} from "primeng/table";
import {AddressFormComponent} from "../address-form/address-form.component";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {SplitButtonModule} from "primeng/splitbutton";
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import {Menu, MenuModule} from 'primeng/menu';
import {ToastModule} from "primeng/toast";

@Component({
  selector: 'app-address-management',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    MessagesModule,
    ConfirmDialogModule,
    TableModule,
    AddressFormComponent,
    NgForOf,
    NgClass,
    NgIf,
    SplitButtonModule,
    ToastModule,
    MenuModule
  ],
  templateUrl: './address-management.component.html',
  styleUrl: './address-management.component.scss',
  animations: [
    trigger('fadeInStagger', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class AddressManagementComponent implements OnInit {
  addresses: Address[] = [];
  displayDialog: boolean = false;
  selectedAddress: Address | null = null;
  mode: 'create' | 'edit' | 'view' = 'create';
  selectedMenuItems: any[] = [];
  @ViewChild('menu') menu!: Menu;

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
        this.addresses = addresses.map(address => ({
          ...address,
          menuItems: this.createMenuItems(address)
        }));
      },
      error: (error) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message })
    });
  }

  createMenuItems(address: Address) {
    return [
      {
        label: 'Xem chi tiết',
        icon: 'pi pi-eye',
        command: () => this.showDialog('view', address)
      },
      {
        label: 'Chỉnh sửa',
        icon: 'pi pi-pencil',
        command: () => this.showDialog('edit', address)
      },
      {
        label: 'Xóa',
        icon: 'pi pi-trash',
        command: () => address.id && this.deleteAddress(address.id),
        styleClass: 'p-button-danger'
      }
    ];
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
      message: 'Bạn có chắc chắn muốn xóa địa chỉ này?',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.addressService.deleteAddress(id).subscribe({
          next: () => {
            this.addresses = this.addresses.filter(a => a.id !== id);
            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa địa chỉ' });
          },
          error: (error) => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: error.message })
        });
      }
    });
  }

  setDefault(address: Address): void {
    if (!address.id) return;
    this.addressService.setDefaultAddress(address.id).subscribe({
      next: () => {
        this.addresses = this.addresses.map(a => ({
          ...a,
          isDefault: a.id === address.id
        }));
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã đặt làm mặc định' });
      },
      error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: error.message })
    });
  }

  closeDialog(): void {
    this.displayDialog = false;
    this.selectedAddress = null;
    this.mode = 'create';
  }

  openMenu(event: Event, address: Address) {
    this.selectedMenuItems = this.createMenuItems(address);
    this.menu.toggle(event);
  }
}
