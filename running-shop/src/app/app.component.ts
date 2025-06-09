import {Component, OnInit} from '@angular/core';
import {SidebarService} from "./shared/sidebar.service";
import {AuthService} from "./core/services/auth.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'running-shop';
  isAdminOrStaff: boolean = false;

  isSidebarCollapsed: boolean = false;

  constructor(private sidebarService: SidebarService, private authService: AuthService) {}

  ngOnInit() {
    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isSidebarCollapsed = isCollapsed;
      console.log('Sidebar collapsed:', isCollapsed);
    });
    this.authService.currentUser$.subscribe(user => {
      this.isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';
    });
  }

}
