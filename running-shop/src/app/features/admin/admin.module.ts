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
import { ReactiveFormsModule } from '@angular/forms';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {CardModule} from "primeng/card";
import {TooltipModule} from "primeng/tooltip";
import {RippleModule} from "primeng/ripple";
import {PasswordModule} from "primeng/password";
import {SharedModule} from "../../shared/shared.module";

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
  ]
})
export class AdminModule { }
