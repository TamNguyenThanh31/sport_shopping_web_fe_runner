import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {ToastModule} from "primeng/toast";
import { CustomerEditComponent } from './components/customer-edit/customer-edit.component';
import { CustomerProductComponent } from './components/customer-product/customer-product.component';
import {ListboxModule} from "primeng/listbox";
import {BadgeModule} from "primeng/badge";
import {DropdownModule} from "primeng/dropdown";
import {CardModule} from "primeng/card";
import {MessageService, PrimeIcons} from "primeng/api";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {DataViewModule} from "primeng/dataview";
import {Paginator, PaginatorModule} from "primeng/paginator";
import {FooterComponent} from "../../shared/footer/footer.component";
import {MessagesModule} from "primeng/messages";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TableModule} from "primeng/table";
import {DialogModule} from "primeng/dialog";
import {CheckboxModule} from "primeng/checkbox";
import {AddressFormComponent} from "./components/address/address-form/address-form.component";
import {AddressManagementComponent} from "./components/address/address-management/address-management.component";


@NgModule({
  declarations: [
    CustomerDashboardComponent,
    CustomerEditComponent
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    ListboxModule,
    DataViewModule,
    CardModule,
    BadgeModule,
    DropdownModule,
    ProgressSpinnerModule,
    PaginatorModule,
    FooterComponent,
    MessagesModule,
    ConfirmDialogModule,
    TableModule,
    DialogModule,
    ReactiveFormsModule,
    CheckboxModule,
    AddressFormComponent,
    AddressManagementComponent,
  ],
  providers: [
    MessageService
  ],
})
export class CustomerModule { }
