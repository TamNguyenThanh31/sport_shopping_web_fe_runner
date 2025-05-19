import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import {MenubarModule} from "primeng/menubar";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import {AvatarModule} from "primeng/avatar";
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProfileComponent } from './profile/profile.component';
import {CardModule} from "primeng/card";
import {RippleModule} from "primeng/ripple";
import {DividerModule} from "primeng/divider";
import {ProgressBarModule} from "primeng/progressbar";
import {TimelineModule} from "primeng/timeline";
import { PhonePipe } from './pipes/phone.pipe';
import {Tooltip, TooltipModule} from "primeng/tooltip";
import {RouterLink, RouterLinkActive} from "@angular/router";



@NgModule({
  declarations: [
    SidebarComponent,
    ProfileComponent,
    PhonePipe
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    PhonePipe
  ],
  imports: [
    CommonModule,
    MenubarModule,
    MenuModule,
    ButtonModule,
    AvatarModule,
    PanelMenuModule,
    CardModule,
    RippleModule,
    DividerModule,
    ProgressBarModule,
    TimelineModule,
    TooltipModule,
    RouterLink,
    RouterLinkActive,
    NavbarComponent
  ],
})
export class SharedModule { }
