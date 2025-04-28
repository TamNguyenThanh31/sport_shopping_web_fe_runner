import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "./core/guards/auth/auth.guard";
import {RoleGuard} from "./core/guards/role/role.guard";
import {ProfileComponent} from "./shared/profile/profile.component";
import {CustomerProductComponent} from "./features/customer/components/customer-product/customer-product.component";

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'customer',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['CUSTOMER'] },
    loadChildren: () => import('./features/customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['ADMIN', 'STAFF'] },
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'staff',
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRole: ['STAFF'] },
    loadChildren: () => import('./features/staff/staff.module').then(m => m.StaffModule)
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  { path: 'profile', component: ProfileComponent },
  { path: 'products', component: CustomerProductComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
