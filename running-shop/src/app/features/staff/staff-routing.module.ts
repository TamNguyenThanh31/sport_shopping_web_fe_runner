import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';
import {StaffDashboardComponent} from "./components/staff-dashboard/staff-dashboard.component";
import {PromotionManagementComponent} from "./components/promotion/promotion-management/promotion-management.component";

// const routes: Routes = [{ path: '', component: StaffComponent }];
const routes: Routes = [
  { path: '', component: StaffDashboardComponent },
  { path: 'promotions', component: PromotionManagementComponent },
  { path: 'promotions/create', component: PromotionManagementComponent },
  { path: 'promotions/edit/:id', component: PromotionManagementComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
