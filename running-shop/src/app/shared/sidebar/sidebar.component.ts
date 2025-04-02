import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";
import {AuthService} from "../../core/services/auth.service";
import {SidebarService} from "../sidebar.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  items: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: ['/admin/dashboard'] },
    { label: 'Manage Users', icon: 'pi pi-users', routerLink: ['/admin/users'] },
    { label: 'Manage Staff', icon: 'pi pi-briefcase', routerLink: ['/admin/staff'] },
    {
      label: 'Statistics',
      icon: 'pi pi-chart-bar',
      items: [
        { label: 'Sales', icon: 'pi pi-dollar', routerLink: ['/admin/statistics/sales'] },
        { label: 'Users', icon: 'pi pi-users', routerLink: ['/admin/statistics/users'] }
      ]
    },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: ['/admin/settings'] }
  ];
  isAdmin: boolean = false;
  isCollapsed: boolean = false;
  @Input() collapsed!: boolean;

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.sidebarService.isCollapsed$.subscribe(isCollapsed => {
      this.isCollapsed = isCollapsed;
    });

    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.role === 'ADMIN';
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarService.toggleSidebar();
  }

}
