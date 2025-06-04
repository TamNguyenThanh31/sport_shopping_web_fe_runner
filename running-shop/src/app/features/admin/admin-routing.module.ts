import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminDashboardComponent} from "./components/admin-dashboard/admin-dashboard.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";
import {
  CustomerStaffManagementComponent
} from "./components/customer-staff-management/customer-staff-management.component";
import {ProductManagementComponent} from "../../common/product/product-management/product-management.component";
import {AddProductComponent} from "../../common/product/add-product/add-product.component";
import {AddCategoryComponent} from "../../common/category/add-category/add-category.component";
import {CategoryManagementComponent} from "../../common/category/category-management/category-management.component";
import {ReportDashboardComponent} from "./components/report-dashboard/report-dashboard.component";

const routes: Routes = [
  // { path: '', component: AdminDashboardComponent },
  { path: 'customers', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'customers/:id', component: CustomerStaffManagementComponent, data: { type: 'customer' }, canActivate: [AuthGuard] },
  { path: 'staff', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
  { path: 'staff/:id', component: CustomerStaffManagementComponent, data: { type: 'staff' }, canActivate: [AuthGuard] },
  { path: 'product-management', component: ProductManagementComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'add-product/:id', component: AddProductComponent },
  { path: 'report', component: ReportDashboardComponent,  data: { type: 'report' }, canActivate: [AuthGuard] },

  { path: 'categories', component: CategoryManagementComponent },
  { path: 'categories/add', component: AddCategoryComponent, data: { mode: 'add' } },
  { path: 'categories/edit/:id', component: AddCategoryComponent, data: { mode: 'edit' } },
  { path: 'categories/detail/:id', component: AddCategoryComponent, data: { mode: 'detail' } },
  { path: '', redirectTo: '/categories', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
