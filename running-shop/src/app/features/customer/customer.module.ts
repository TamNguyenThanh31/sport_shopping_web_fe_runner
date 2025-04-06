import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerComponent } from './customer.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {ToastModule} from "primeng/toast";
import { CustomerEditComponent } from './components/customer-edit/customer-edit.component';


@NgModule({
  declarations: [
    CustomerDashboardComponent,
    CustomerEditComponent,
  ],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
  ]
})
export class CustomerModule { }
