import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StaffComponent } from './staff.component';
import {StaffDashboardComponent} from "./components/staff-dashboard/staff-dashboard.component";

// const routes: Routes = [{ path: '', component: StaffComponent }];
const routes: Routes = [
  { path: '', component: StaffDashboardComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRoutingModule { }
