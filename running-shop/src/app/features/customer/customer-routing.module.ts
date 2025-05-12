import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerDashboardComponent} from "./components/customer-dashboard/customer-dashboard.component";
import {CustomerEditComponent} from "./components/customer-edit/customer-edit.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";
import {CustomerProductComponent} from "./components/customer-product/customer-product.component";
import {AddProductComponent} from "../../common/product/add-product/add-product.component";
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

const routes: Routes = [
  // { path: '', component: CustomerDashboardComponent },
  { path: '', component: CustomerProductComponent },
  { path: 'edit-customer-profile', component: CustomerEditComponent, canActivate: [AuthGuard] },
  { path: 'detail-product/:id', component: ProductDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
