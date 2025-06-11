import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerDashboardComponent} from "./components/customer-dashboard/customer-dashboard.component";
import {CustomerEditComponent} from "./components/customer-edit/customer-edit.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";
import {CustomerProductComponent} from "./components/customer-product/customer-product.component";
import {AddProductComponent} from "../../common/product/add-product/add-product.component";
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import {CartSidebarComponent} from "./components/cart-sidebar/cart-sidebar.component";
import {PaymentResultComponent} from "./components/payment-result/payment-result.component";
import {CheckOutComponent} from "./components/check-out/check-out.component";
import {OrderComponent} from "./components/order/order.component";
import {StravaComponent} from "./components/strava/strava.component";

const routes: Routes = [
  // { path: '', component: CustomerDashboardComponent },
  { path: '', component: CustomerProductComponent },
  { path: 'edit-customer-profile', component: CustomerEditComponent, canActivate: [AuthGuard] },
  { path: 'detail-product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartSidebarComponent },
  { path: 'checkout', component: CheckOutComponent },
  { path: 'payment-result', component: PaymentResultComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'strava', component: StravaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
