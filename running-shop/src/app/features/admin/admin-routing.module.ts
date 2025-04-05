import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminDashboardComponent} from "./components/admin-dashboard/admin-dashboard.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";
import {
  CustomerStaffManagementComponent
} from "./components/customer-staff-management/customer-staff-management.component";

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'customers', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'staff', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
  { path: 'staff/:id', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
