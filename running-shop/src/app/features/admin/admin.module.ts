import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CustomerStaffManagementComponent } from './components/customer-staff-management/customer-staff-management.component';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {CardModule} from "primeng/card";
import {TooltipModule} from "primeng/tooltip";
import {RippleModule} from "primeng/ripple";
import {PasswordModule} from "primeng/password";
import {SharedModule} from "../../shared/shared.module";
import { ProductManagementComponent } from '../../common/product/product-management/product-management.component';
import {ListboxModule} from "primeng/listbox";
import {BadgeModule} from "primeng/badge";
import {DataViewModule} from "primeng/dataview";
import {DropdownModule} from "primeng/dropdown";
import { AddProductComponent } from '../../common/product/add-product/add-product.component';
import {InputNumberModule} from "primeng/inputnumber";
import {CheckboxModule} from "primeng/checkbox";
import {ProgressSpinner, ProgressSpinnerModule} from "primeng/progressspinner";
import {Paginator, PaginatorModule} from "primeng/paginator";

@NgModule({
  declarations: [
    AdminComponent,
    AdminDashboardComponent,
    CustomerStaffManagementComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    TooltipModule,
    RippleModule,
    PasswordModule,
    SharedModule,
    ListboxModule,
    FormsModule,
    BadgeModule,
    DataViewModule,
    DropdownModule,
    InputNumberModule,
    CheckboxModule,
    ProgressSpinnerModule,
    PaginatorModule,
  ]
})
export class AdminModule { }
