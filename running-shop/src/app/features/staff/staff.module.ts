import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffComponent } from './staff.component';
import { StaffDashboardComponent } from './components/staff-dashboard/staff-dashboard.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputSwitchModule} from "primeng/inputswitch";
import {ToastModule} from "primeng/toast";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {InputNumberModule} from "primeng/inputnumber";


@NgModule({
  declarations: [
    // StaffComponent,
    StaffDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    InputSwitchModule,
    StaffRoutingModule
  ]
})
export class StaffModule { }
