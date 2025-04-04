import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from "../../core/services/auth.service";
import { SidebarService } from "../sidebar.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
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
