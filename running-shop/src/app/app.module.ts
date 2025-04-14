import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './shared/shared.module';
import {TooltipModule} from 'primeng/tooltip';
import {PanelMenuModule} from 'primeng/panelmenu';
import {MessageService} from "primeng/api";
import {AuthInterceptor} from "./core/interceptors/auth.interceptor";
import {ToastModule} from "primeng/toast";
import {DataViewModule} from "primeng/dataview";
import {CardModule} from "primeng/card";
import {ButtonModule} from "primeng/button";
import {ListboxModule} from "primeng/listbox";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {CheckboxModule} from "primeng/checkbox";

import {ApplicationConfig} from '@angular/core';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/lara';
import "primeicons/primeicons.css";


@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent], imports: [BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    TooltipModule,
    SharedModule,
    PanelMenuModule,
    // PrimeNG
    PanelMenuModule,
    DataViewModule,
    CardModule,
    ButtonModule,
    ListboxModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    ToastModule],
  providers: [
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
})
export class AppModule {
}
