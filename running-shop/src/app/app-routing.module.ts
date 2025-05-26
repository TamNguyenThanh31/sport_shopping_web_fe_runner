import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "./core/guards/auth/auth.guard";
import {RoleGuard} from "./core/guards/role/role.guard";
import {ProfileComponent} from "./shared/profile/profile.component";
import {CustomerProductComponent} from "./features/customer/components/customer-product/customer-product.component";
import {AddProductComponent} from "./common/product/add-product/add-product.component";
import { ProductDetailComponent } from './features/customer/components/product-detail/product-detail.component';
import {
  AddressManagementComponent
} from "./features/customer/components/address/address-management/address-management.component";
import {
  PromotionManagementComponent
} from "./features/staff/components/promotion/promotion-management/promotion-management.component";
import {FormPromotionComponent} from "./features/staff/components/promotion/form-promotion/form-promotion.component";
import {CheckOutComponent} from "./features/customer/components/check-out/check-out.component";
import {PaymentResultComponent} from "./features/customer/components/payment-result/payment-result.component";
import {OrderComponent} from "./features/customer/components/order/order.component";

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
  { path: 'products/detail-product/:id', component: ProductDetailComponent },
  { path: 'addresses', component: AddressManagementComponent },

  { path: 'promotions', component: PromotionManagementComponent, canActivate: [AuthGuard] },
  { path: 'promotions/create', component: FormPromotionComponent, canActivate: [AuthGuard] },
  { path: 'promotions/edit/:id', component: FormPromotionComponent, canActivate: [AuthGuard] },
  { path: 'promotions/view/:id', component: FormPromotionComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/promotions', pathMatch: 'full' },
  { path: 'checkout', component: CheckOutComponent },
  { path: 'payment-result', component: PaymentResultComponent },
  { path: 'orders', component: OrderComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
