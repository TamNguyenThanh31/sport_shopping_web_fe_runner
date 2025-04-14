import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminDashboardComponent} from "./components/admin-dashboard/admin-dashboard.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";
import {
  CustomerStaffManagementComponent
} from "./components/customer-staff-management/customer-staff-management.component";
import {ProductManagementComponent} from "./components/product-management/product-management.component";
import {AddProductComponent} from "./components/add-product/add-product.component";

const routes: Routes = [
  // { path: '', component: AdminDashboardComponent },
  { path: '', component: ProductManagementComponent },
  { path: 'customers', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'staff', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
  { path: 'staff/:id', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
  { path: 'add-product', component: AddProductComponent },
  { path: 'edit-product/:id', component: AddProductComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
