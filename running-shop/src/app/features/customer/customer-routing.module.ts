import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CustomerDashboardComponent} from "./components/customer-dashboard/customer-dashboard.component";
import {CustomerEditComponent} from "./components/customer-edit/customer-edit.component";
import {AuthGuard} from "../../core/guards/auth/auth.guard";

const routes: Routes = [
  { path: '', component: CustomerDashboardComponent },
  { path: 'edit-customer-profile', component: CustomerEditComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes),],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
